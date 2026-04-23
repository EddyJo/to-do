import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

function calcAvoidanceScore(importance: number, reluctance: number) {
  return importance * 2 + reluctance
}

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('ai_suggestions')
      .select('*, note:notes(id, raw_content, task_id, note_type), suggestion_todos(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[api/suggestions] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { id } = await req.json() as { id: string }
    const supabase = createServerClient()

    const { data: suggestion, error: fetchErr } = await supabase
      .from('ai_suggestions')
      .select('*, note:notes(id, raw_content, task_id, note_type), suggestion_todos(*)')
      .eq('id', id)
      .single()
    if (fetchErr || !suggestion) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await supabase
      .from('ai_suggestions')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', id)

    let todo = null
    const st = suggestion.suggestion_todos?.[0]
    if (st) {
      const importance = st.importance ?? 3
      const reluctance = st.reluctance_score ?? 5
      const { data: created, error: todoErr } = await supabase
        .from('todos')
        .insert({
          title: st.generated_todo_title,
          description: st.generated_todo_description ?? null,
          task_id: suggestion.note?.task_id ?? null,
          source: 'ai-extracted',
          importance,
          reluctance_score: reluctance,
          avoidance_score: calcAvoidanceScore(importance, reluctance),
          status: 'pending',
          snoozed_count: 0,
        })
        .select()
        .single()
      if (todoErr) throw todoErr
      todo = created
      await supabase.from('suggestion_todos').update({ approved_yn: true }).eq('id', st.id)
    }

    return NextResponse.json({ ok: true, todo })
  } catch (err) {
    console.error('[api/suggestions] POST error:', err)
    return NextResponse.json({ error: 'Approve failed' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json() as { id: string; status: string }
    const supabase = createServerClient()
    const { error } = await supabase
      .from('ai_suggestions')
      .update({
        status,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
      })
      .eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/suggestions] PATCH error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
