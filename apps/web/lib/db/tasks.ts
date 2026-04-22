import { supabase } from '@/lib/supabase/client'
import type { Task, CreateTaskInput } from '@/types'

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, todos(count)')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getTask(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, todos(*), notes(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...input, status: 'active', priority: input.priority ?? 3 })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTask(id: string, input: Partial<CreateTaskInput & { status: string }>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}
