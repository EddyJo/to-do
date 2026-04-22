// User instruction: "gemini로 바꿔줘"
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createServerClient } from '@/lib/supabase/server'
import type { Note, AISummary, AISuggestion } from '@/types'

export interface ExtractedItem {
  title: string
  description: string
  reluctance_score: number
  importance: number
  estimated_minutes: number | null
  schedule_impact: string | null
  urgency_hint: 'today' | 'this_week' | 'later'
}

export interface AIExtractionResult {
  summary: AISummary
  suggestions: AISuggestion[]
}

export function buildExtractionPrompt(rawContent: string): string {
  return `당신은 업무 텍스트를 분석하여 실행 가능한 할 일 목록을 추출하는 생산성 AI입니다.

다음 텍스트에서 모든 실행 항목(action item)을 추출하고 각 항목에 대해 아래 JSON 형식으로 응답하세요.

채점 기준:
- reluctance_score (0-10): 바쁜 직장인이 이 일을 얼마나 미룰 것인가 (10=가장 회피)
  높은 점수: 복잡함, 불쾌함, 모호함, 갈등 소지, 인지 부하 높음
- importance (1-5): 안 하면 얼마나 큰 문제가 생기는가 (5=치명적)
- urgency_hint: "today" | "this_week" | "later"
- estimated_minutes: 예상 소요 시간 (분), 모르면 null
- schedule_impact: 마감일이나 다른 사람에게 미치는 영향 (없으면 null)

반드시 유효한 JSON만 반환하고 다른 텍스트는 포함하지 마세요:
{
  "items": [
    {
      "title": "구체적인 할 일 제목",
      "description": "무엇을 해야 하는지 간략 설명",
      "reluctance_score": 7,
      "importance": 4,
      "estimated_minutes": 60,
      "schedule_impact": "이번 주 금요일 발표에 영향",
      "urgency_hint": "this_week"
    }
  ]
}

분석할 텍스트:
${rawContent}`
}

export function parseAIResponse(raw: string): ExtractedItem[] {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed?.items)) return []
    return parsed.items.map((item: Partial<ExtractedItem>) => ({
      title: String(item.title ?? ''),
      description: String(item.description ?? ''),
      reluctance_score: Math.min(10, Math.max(0, Number(item.reluctance_score ?? 5))),
      importance: Math.min(5, Math.max(1, Number(item.importance ?? 3))),
      estimated_minutes: item.estimated_minutes != null ? Number(item.estimated_minutes) : null,
      schedule_impact: item.schedule_impact ?? null,
      urgency_hint: (['today', 'this_week', 'later'].includes(item.urgency_hint as string)
        ? item.urgency_hint
        : 'later') as ExtractedItem['urgency_hint'],
    }))
  } catch {
    return []
  }
}

let _client: GoogleGenerativeAI | null = null
function getClient(): GoogleGenerativeAI {
  if (!_client) _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
  return _client
}

export async function extractActionItems(rawContent: string): Promise<ExtractedItem[]> {
  const model = getClient().getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
  const result = await model.generateContent(buildExtractionPrompt(rawContent))
  const text = result.response.text()
  return parseAIResponse(text)
}

export async function extractFromNote(note: Note): Promise<AIExtractionResult> {
  const supabase = createServerClient()
  const items = await extractActionItems(note.raw_content)

  const summaryPayload = {
    note_id: note.id,
    short_summary: `AI 분석 완료 — ${items.length}개 항목 추출`,
    key_points: items.slice(0, 3).map(i => i.title),
    follow_up_questions: [],
    decision_points: [],
  }

  const { data: summary, error: summaryErr } = await supabase
    .from('ai_summaries')
    .insert(summaryPayload)
    .select()
    .single()
  if (summaryErr) throw summaryErr

  const suggestionRows = items.map(item => ({
    note_id: note.id,
    suggestion_type: 'action_item' as const,
    content: item.description,
    status: 'pending' as const,
  }))

  const { data: suggestions, error: suggestionsErr } = await supabase
    .from('ai_suggestions')
    .insert(suggestionRows)
    .select()
  if (suggestionsErr) throw suggestionsErr

  const suggestionList = suggestions ?? []

  const todoRows = items.map((item, i) => ({
    suggestion_id: suggestionList[i]?.id,
    generated_todo_title: item.title,
    generated_todo_description: item.description,
    approved_yn: false,
    reluctance_score: item.reluctance_score,
    importance: item.importance,
    estimated_minutes: item.estimated_minutes,
    schedule_impact: item.schedule_impact,
    urgency_hint: item.urgency_hint,
  })).filter(r => r.suggestion_id)

  if (todoRows.length > 0) {
    await supabase.from('suggestion_todos').insert(todoRows)
  }

  return { summary, suggestions: suggestionList }
}
