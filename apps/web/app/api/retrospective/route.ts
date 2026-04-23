import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildRetroPrompt, parseRetroResponse } from '@/lib/retro/utils'
import { createServerClient } from '@/lib/supabase/server'

function getClient() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
}

function kstDayBounds(daysAgo: number) {
  const now = new Date()
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const kstDate = kstNow.toISOString().slice(0, 10)
  const base = new Date(`${kstDate}T00:00:00+09:00`)
  base.setDate(base.getDate() - daysAgo)
  const end = new Date(base)
  end.setDate(end.getDate() + 1)
  return { dayStart: base.toISOString(), dayEnd: end.toISOString() }
}

async function getYesterdayTodos() {
  const supabase = createServerClient()
  const { dayStart, dayEnd } = kstDayBounds(1)

  // 완료: 어제 done 처리된 것
  const { data: done } = await supabase
    .from('todos')
    .select('title')
    .eq('status', 'done')
    .gte('updated_at', dayStart)
    .lte('updated_at', dayEnd)

  // 미완료: 어제 이전에 만들어졌는데 아직 pending/snoozed인 것
  const { data: pending } = await supabase
    .from('todos')
    .select('title, reluctance_score, importance')
    .in('status', ['pending', 'snoozed'])
    .lt('created_at', dayStart)
    .order('avoidance_score', { ascending: false })
    .limit(5)

  return {
    completed: (done ?? []).map(t => t.title),
    pending: (pending ?? []).map(t => t.title),
  }
}

export async function POST() {
  try {
    const { completed, pending } = await getYesterdayTodos()

    // DB 없어도 작동: 데이터 없으면 "아무것도 안 함"으로 처리
    const prompt = buildRetroPrompt(completed, pending)

    const model = getClient().getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const retro = parseRetroResponse(text)

    if (!retro) {
      return NextResponse.json({ mood: 'mixed', message: '어제 하루를 돌아보세요. 오늘은 어떤 것부터 시작할까요?', highlight: '오늘이 기회예요' })
    }

    return NextResponse.json({ ...retro, completedCount: completed.length, pendingCount: pending.length })
  } catch (err) {
    console.error('[retrospective]', err)
    return NextResponse.json({ error: '회고를 불러오지 못했어요' }, { status: 500 })
  }
}
