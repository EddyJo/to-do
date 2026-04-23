import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServerClient()

  const { data: approved, error } = await supabase
    .from('ai_suggestions')
    .select('*, suggestion_todos(*)')
    .eq('status', 'approved')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const created: unknown[] = []
  const skipped: unknown[] = []

  for (const s of approved ?? []) {
    const st = (s.suggestion_todos as any[])?.[0]
    const title = st?.generated_todo_title ?? s.content
    if (!title) { skipped.push({ id: s.id, reason: 'no title' }); continue }

    const importance = st?.importance ?? 3
    const reluctance = st?.reluctance_score ?? 5

    const { data: todo, error: insertErr } = await supabase
      .from('todos')
      .insert({
        title,
        source: 'ai-extracted',
        importance,
        reluctance_score: reluctance,
        avoidance_score: importance * 2 + reluctance,
        status: 'pending',
        snoozed_count: 0,
      })
      .select()
      .single()

    if (insertErr) {
      skipped.push({ id: s.id, title, error: insertErr.message })
    } else {
      created.push({ suggestionId: s.id, todoId: todo?.id, title })
    }
  }

  return NextResponse.json({
    repaired: created.length,
    skipped: skipped.length,
    created,
    skipped,
  })
}
