import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServerClient()

  // 1. 중복 todo 제거 (같은 title에서 최신 것만 남기고 나머지 삭제)
  const { data: allTodos } = await supabase
    .from('todos')
    .select('id, title, created_at')
    .order('created_at', { ascending: true })

  const seen = new Map<string, string>()
  const toDelete: string[] = []
  for (const t of allTodos ?? []) {
    const key = t.title?.trim()
    if (!key) continue
    if (seen.has(key)) {
      toDelete.push(t.id) // 나중에 생긴 중복 삭제
    } else {
      seen.set(key, t.id)
    }
  }
  if (toDelete.length > 0) {
    await supabase.from('todos').delete().in('id', toDelete)
  }

  // 2. approved 제안 중 todo 없는 것 생성
  const { data: approved, error } = await supabase
    .from('ai_suggestions')
    .select('*, suggestion_todos(*)')
    .eq('status', 'approved')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 현재 존재하는 todo 제목 목록
  const { data: existingTodos } = await supabase.from('todos').select('title')
  const existingTitles = new Set((existingTodos ?? []).map((t: any) => t.title?.trim()))

  const created: unknown[] = []
  const skipped: unknown[] = []

  for (const s of approved ?? []) {
    const st = (s.suggestion_todos as any[])?.[0]
    const title = st?.generated_todo_title ?? s.content
    if (!title) { skipped.push({ id: s.id, reason: 'no title' }); continue }
    if (existingTitles.has(title.trim())) { skipped.push({ id: s.id, reason: 'already exists' }); continue }

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

    if (insertErr) skipped.push({ id: s.id, title, error: insertErr.message })
    else { created.push({ todoId: todo?.id, title }); existingTitles.add(title.trim()) }
  }

  return NextResponse.json({
    removed_duplicates: toDelete.length,
    repaired: created.length,
    skipped: skipped.length,
  })
}
