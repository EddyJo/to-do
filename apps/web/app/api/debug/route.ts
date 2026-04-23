import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  // ?repair=1 → run repair and return result
  if (searchParams.get('repair') === '1') {
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
        .insert({ title, source: 'ai-extracted', importance, reluctance_score: reluctance, avoidance_score: importance * 2 + reluctance, status: 'pending', snoozed_count: 0 })
        .select().single()
      if (insertErr) skipped.push({ id: s.id, title, error: insertErr.message })
      else created.push({ suggestionId: s.id, todoId: todo.id, title })
    }
    return NextResponse.json({ repaired: created.length, skipped: skipped.length, details: { created, skipped } })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const results: Record<string, unknown> = {
    supabase_url: url ? `${url.slice(0, 40)}...` : 'NOT SET',
    anon_key_set: !!anonKey,
    service_role_key_set: !!serviceKey,
    gemini_key_set: !!process.env.GEMINI_API_KEY,
  }

  // Test with service role (bypasses RLS)
  const serverClient = createServerClient()
  const tables = ['todos', 'ai_suggestions', 'suggestion_todos', 'notes', 'ai_summaries']
  results['service_role_tests'] = {}
  for (const table of tables) {
    const { data, error } = await serverClient.from(table).select('id').limit(5)
    ;(results['service_role_tests'] as Record<string, unknown>)[table] =
      error ? `ERROR: ${error.code} — ${error.message}` : `OK (${data?.length ?? 0} rows)`
  }

  // Test with anon key (subject to RLS)
  if (url && anonKey) {
    const anonClient = createClient(url, anonKey)
    results['anon_key_tests'] = {}
    for (const table of tables) {
      const { data, error } = await anonClient.from(table).select('id').limit(1)
      ;(results['anon_key_tests'] as Record<string, unknown>)[table] =
        error ? `BLOCKED: ${error.code} — ${error.message}` : `OK (${data?.length ?? 0} rows)`
    }
  }

  // Show recent todos (service role)
  const { data: todos } = await serverClient
    .from('todos')
    .select('id, title, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  results['recent_todos'] = todos ?? []

  // Show recent suggestions (service role)
  const { data: suggestions } = await serverClient
    .from('ai_suggestions')
    .select('id, status, content, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  results['recent_suggestions'] = suggestions ?? []

  return NextResponse.json(results, { status: 200 })
}

// POST /api/debug — approved 상태인데 todo가 없는 suggestion들을 복구
export async function POST() {
  const supabase = createServerClient()

  const { data: approved, error } = await supabase
    .from('ai_suggestions')
    .select('*, suggestion_todos(*)')
    .eq('status', 'approved')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const created: unknown[] = []
  const skipped: unknown[] = []

  for (const s of approved ?? []) {
    const st = s.suggestion_todos?.[0]
    const title = st?.generated_todo_title ?? s.content
    if (!title) { skipped.push({ id: s.id, reason: 'no title' }); continue }

    const importance = st?.importance ?? 3
    const reluctance = st?.reluctance_score ?? 5

    const { data: todo, error: insertErr } = await supabase
      .from('todos')
      .insert({
        title,
        description: st?.generated_todo_description ?? null,
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
      created.push({ suggestionId: s.id, todoId: todo.id, title })
    }
  }

  return NextResponse.json({ repaired: created.length, skipped: skipped.length, details: { created, skipped } })
}
