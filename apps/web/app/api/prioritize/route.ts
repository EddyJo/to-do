// User instruction: "우선 순위 조정은 매일 아침에만 돌게 해주고, 수동으로 우선순위 조정해서 다시 뽑는 기능은 있어야돼"
import { NextResponse } from 'next/server'
import { prioritizeBacklog } from '@/lib/db/todos'

// Called by Vercel cron every morning (0 0 * * *) and manual trigger
export async function POST() {
  try {
    const todos = await prioritizeBacklog()
    return NextResponse.json({ ok: true, count: todos.length, todos })
  } catch (err) {
    console.error('[prioritize] error:', err)
    return NextResponse.json({ error: '우선순위 재계산 중 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
