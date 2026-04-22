export type TaskStatus = 'active' | 'completed' | 'archived'
export type TodoStatus = 'pending' | 'in_progress' | 'done' | 'snoozed'
export type TodoSource = 'manual' | 'ai-extracted' | 'memo'
export type NoteType = 'meeting' | 'idea' | 'memo'
export type SuggestionStatus = 'pending' | 'approved' | 'rejected' | 'deferred'
export type SuggestionType = 'action_item' | 'todo' | 'follow_up' | 'decision'
export type UrgencyHint = 'today' | 'this_week' | 'later'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  due_date: string | null
  priority: number
  created_at: string
  updated_at: string
  todos?: Todo[]
  notes?: Note[]
}

export interface Todo {
  id: string
  task_id: string | null
  title: string
  description: string | null
  status: TodoStatus
  importance: number
  reluctance_score: number
  avoidance_score: number
  estimated_minutes: number | null
  due_date: string | null
  source: TodoSource
  snoozed_count: number
  created_at: string
  updated_at: string
  task?: Task
}

export interface Note {
  id: string
  task_id: string | null
  note_type: NoteType
  raw_content: string
  created_at: string
  task?: Task
  ai_summary?: AISummary
  ai_suggestions?: AISuggestion[]
}

export interface AISummary {
  id: string
  note_id: string
  short_summary: string
  key_points: string[]
  follow_up_questions: string[]
  decision_points: string[]
  created_at: string
}

export interface AISuggestion {
  id: string
  note_id: string
  suggestion_type: SuggestionType
  content: string
  status: SuggestionStatus
  approved_at: string | null
  created_at: string
  note?: Note
  suggestion_todos?: SuggestionTodo[]
}

export interface SuggestionTodo {
  id: string
  suggestion_id: string
  generated_todo_title: string
  generated_todo_description: string | null
  approved_yn: boolean
  reluctance_score: number
  importance: number
  estimated_minutes: number | null
  schedule_impact: string | null
  urgency_hint: UrgencyHint | null
}

export interface CreateTaskInput {
  title: string
  description?: string
  due_date?: string
  priority?: number
}

export interface CreateTodoInput {
  title: string
  task_id?: string
  description?: string
  importance?: number
  reluctance_score?: number
  estimated_minutes?: number
  due_date?: string
  source?: TodoSource
}

export interface CreateNoteInput {
  task_id?: string
  note_type: NoteType
  raw_content: string
}
