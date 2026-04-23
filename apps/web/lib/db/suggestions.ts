// User instruction: "tc로 확인하고 그다음 로컬에서 확인하고 그다음 서버에 배포해"
import { createServerClient } from '@/lib/supabase/server'
import type { AISuggestion, SuggestionStatus, Todo } from '@/types'
import { createTodo } from '@/lib/db/todos'

export async function getPendingSuggestions(): Promise<AISuggestion[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('ai_suggestions')
    .select('*, note:notes(id, raw_content, task_id, note_type), suggestion_todos(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function updateSuggestionStatus(
  id: string,
  status: SuggestionStatus,
): Promise<AISuggestion> {
  const supabase = createServerClient()
  const updates: Partial<AISuggestion> = {
    status,
    approved_at: status === 'approved' ? new Date().toISOString() : null,
  }
  const { data, error } = await supabase
    .from('ai_suggestions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function approveSuggestion(suggestion: AISuggestion): Promise<Todo | null> {
  await updateSuggestionStatus(suggestion.id, 'approved')
  if (!suggestion.suggestion_todos?.length) return null
  const st = suggestion.suggestion_todos[0]
  if (!st) return null
  const todo = await createTodo({
    title: st.generated_todo_title,
    description: st.generated_todo_description ?? undefined,
    task_id: suggestion.note?.task_id ?? undefined,
    source: 'ai-extracted',
  } as Parameters<typeof createTodo>[0])
  const supabase = createServerClient()
  await supabase.from('suggestion_todos').update({ approved_yn: true }).eq('id', st.id)
  return todo
}
