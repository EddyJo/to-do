import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

function calcAvoidanceScore(importance: number, reluctance: number, snoozed = 0) {
  return importance * 2 + reluctance + snoozed * 0.5
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action, ...fields } = body as { action?: string; [key: string]: unknown }

    const supabase = createServerClient()

    if (action === 'snooze') {
      const { data: current } = await supabase.from('todos').select('*').eq('id', id).single()
      if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      const snoozed_count = (current.snoozed_count ?? 0) + 1
      const { data, error } = await supabase
        .from('todos')
        .update({
          status: 'snoozed',
          snoozed_count,
          avoidance_score: calcAvoidanceScore(current.importance, current.reluctance_score, snoozed_count),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return NextResponse.json(data)
    }

    // Generic field update (status, etc.)
    const updates: Record<string, unknown> = { ...fields, updated_at: new Date().toISOString() }

    if (fields.importance !== undefined || fields.reluctance_score !== undefined) {
      const { data: current } = await supabase.from('todos').select('*').eq('id', id).single()
      updates.avoidance_score = calcAvoidanceScore(
        (fields.importance as number) ?? current?.importance ?? 3,
        (fields.reluctance_score as number) ?? current?.reluctance_score ?? 5,
        current?.snoozed_count ?? 0,
      )
    }

    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/todos/[id]] PATCH error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
