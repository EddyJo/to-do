import { supabase } from '@/lib/supabase/client'
import type { Todo, CreateTodoInput } from '@/types'

// avoidance_score = importance * 2 + reluctance_score + snoozed_count * 0.5
function calcAvoidanceScore(importance: number, reluctance: number, snoozed = 0) {
  return importance * 2 + reluctance + snoozed * 0.5
}

export async function getTodos(filters?: { status?: string; task_id?: string }): Promise<Todo[]> {
  let query = supabase.from('todos').select('*, task:tasks(id,title)')
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.task_id) query = query.eq('task_id', filters.task_id)
  const { data, error } = await query.order('avoidance_score', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getTopAvoidedTodo(): Promise<Todo | null> {
  const { data, error } = await supabase
    .from('todos')
    .select('*, task:tasks(id,title)')
    .eq('status', 'pending')
    .order('avoidance_score', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const importance = input.importance ?? 3
  const reluctance = input.reluctance_score ?? 5
  const avoidance_score = calcAvoidanceScore(importance, reluctance)
  const { data, error } = await supabase
    .from('todos')
    .insert({
      ...input,
      importance,
      reluctance_score: reluctance,
      avoidance_score,
      status: 'pending',
      source: 'manual',
      snoozed_count: 0,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTodo(id: string, input: Partial<Todo>): Promise<Todo> {
  const updates: Partial<Todo> & { updated_at: string } = { ...input, updated_at: new Date().toISOString() }
  if (input.importance !== undefined || input.reluctance_score !== undefined) {
    const current = await getTodoById(id)
    updates.avoidance_score = calcAvoidanceScore(
      input.importance ?? current?.importance ?? 3,
      input.reluctance_score ?? current?.reluctance_score ?? 5,
      current?.snoozed_count ?? 0,
    )
  }
  const { data, error } = await supabase.from('todos').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function getTodoById(id: string): Promise<Todo | null> {
  const { data, error } = await supabase.from('todos').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function snoozeTodo(id: string): Promise<Todo> {
  const current = await getTodoById(id)
  if (!current) throw new Error('Todo not found')
  const snoozed_count = current.snoozed_count + 1
  return updateTodo(id, { status: 'snoozed', snoozed_count, avoidance_score: calcAvoidanceScore(current.importance, current.reluctance_score, snoozed_count) })
}
