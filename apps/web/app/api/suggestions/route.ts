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
    if (fetchErr || !suggestion) {
      console.error('[api/suggestions] fetch error:', fetchErr)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Mark suggestion as approved
    const { error: approveErr } = await supabase
      .from('ai_suggestions')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', id)
    if (approveErr) throw approveErr

    // Build todo fields — prefer suggestion_todos data, fall back to suggestion.content
    const st = suggestion.suggestion_todos?.[0]
    const title = st?.generated_todo_title ?? suggestion.content
    const description = st?.generated_todo_description ?? null
    const importance = st?.importance ?? 3
    const reluctance = st?.reluctance_score ?? 5
    const estimated_minutes = st?.estimated_minutes ?? null
    const task_id = suggestion.note?.task_id ?? null

    if (!title) {
      console.error('[api/suggestions] no title to create todo from', { id })
      return NextResponse.json({ ok: true, todo: null })
    }

    const { data: todo, error: todoErr } = await supabase
      .from('todos')
      .insert({
        title,
        description,
        task_id,
        source: 'ai-extracted',
        importance,
        reluctance_score: reluctance,
        avoidance_score: calcAvoidanceScore(importance, reluctance),
        status: 'pending',
        snoozed_count: 0,
      })
      .select()
      .single()

    if (todoErr) {
      console.error('[api/suggestions] todo insert error:', todoErr)
      throw todoErr
    }

    if (st) {
      await supabase.from('suggestion_todos').update({ approved_yn: true }).eq('id', st.id)
    }

    console.info('[api/suggestions] approved', { suggestionId: id, todoId: todo?.id, title })
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
