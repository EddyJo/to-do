import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// KST(UTC+9) 기준 오늘 자정 UTC 타임스탬프
function kstTodayStartUTC(): string {
  const now = new Date()
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const kstDate = kstNow.toISOString().slice(0, 10) // YYYY-MM-DD in KST
  return new Date(`${kstDate}T00:00:00+09:00`).toISOString()
}

export async function GET() {
  try {
    const supabase = createServerClient()
    const todayKST = kstTodayStartUTC()

    const [pendingRes, snoozedRes] = await Promise.all([
      supabase
        .from('todos')
        .select('*, task:tasks(id,title)')
        .eq('status', 'pending')
        .order('avoidance_score', { ascending: false }),
      // 오늘 전에 미룬 항목 → 오늘 다시 표시
      supabase
        .from('todos')
        .select('*, task:tasks(id,title)')
        .eq('status', 'snoozed')
        .lt('updated_at', todayKST)
        .order('avoidance_score', { ascending: false }),
    ])

    if (pendingRes.error) throw pendingRes.error

    const todos = [
      ...(pendingRes.data ?? []),
      ...(snoozedRes.data ?? []),
    ].sort((a, b) => (b.avoidance_score ?? 0) - (a.avoidance_score ?? 0))

    return NextResponse.json(todos)
  } catch (err) {
    console.error('[api/todos] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 })
  }
}
