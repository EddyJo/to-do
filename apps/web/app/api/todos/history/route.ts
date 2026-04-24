import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? 40), 100)
  const offset = Number(searchParams.get('offset') ?? 0)

  try {
    const supabase = createServerClient()
    const { data, error, count } = await supabase
      .from('todos')
      .select('id, title, reluctance_score, avoidance_score, source, updated_at', { count: 'exact' })
      .eq('status', 'done')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ todos: data ?? [], total: count ?? 0, offset, limit })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
