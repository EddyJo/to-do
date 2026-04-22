import { createServerClient } from '@/lib/supabase/server'
import type { Note, CreateNoteInput } from '@/types'

const supabase = createServerClient()

export async function getNotes(task_id?: string): Promise<Note[]> {
  let query = supabase
    .from('notes')
    .select('*, ai_summary:ai_summaries(*), ai_suggestions(*)')
    .order('created_at', { ascending: false })
  if (task_id) query = query.eq('task_id', task_id)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getNote(id: string): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .select('*, task:tasks(*), ai_summary:ai_summaries(*), ai_suggestions(*, suggestion_todos(*))')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
}
