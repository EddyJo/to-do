import type { Note, AISummary, AISuggestion } from '@/types'
import { supabase } from '@/lib/supabase/client'

export interface AIExtractionResult {
  summary: AISummary
  suggestions: AISuggestion[]
}

// Stub: replace with actual AI call (Claude API / OpenAI) when ready
export async function extractFromNote(note: Note): Promise<AIExtractionResult> {
  const summaryPayload = {
    note_id: note.id,
    short_summary: `[AI 분석 대기중] ${note.raw_content.slice(0, 80)}...`,
    key_points: ['AI 연동 후 자동 생성됩니다'],
    follow_up_questions: [],
    decision_points: [],
  }

  const { data: summary, error: summaryErr } = await supabase
    .from('ai_summaries')
    .insert(summaryPayload)
    .select()
    .single()
  if (summaryErr) throw summaryErr

  const suggestionPayload = {
    note_id: note.id,
    suggestion_type: 'action_item' as const,
    content: 'AI 연동 후 Action Item이 자동 추출됩니다',
    status: 'pending' as const,
  }

  const { data: suggestions, error: suggestionsErr } = await supabase
    .from('ai_suggestions')
    .insert([suggestionPayload])
    .select()
  if (suggestionsErr) throw suggestionsErr

  return { summary, suggestions: suggestions ?? [] }
}
