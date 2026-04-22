'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Task, Todo, CreateTodoInput } from '@/types'
import { getTask } from '@/lib/db/tasks'
import { createTodo, updateTodo, snoozeTodo } from '@/lib/db/todos'
import { createNote } from '@/lib/db/notes'
import { extractFromNote } from '@/lib/ai/extract'
import { TodoCard } from '@/components/TodoCard'
import { NoteEditor } from '@/components/NoteEditor'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { NoteType } from '@/types'
import { formatDate } from '@/lib/utils'

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingTodo, setAddingTodo] = useState(false)
  const [todoTitle, setTodoTitle] = useState('')
  const [reluctance, setReluctance] = useState(5)
  const [savingNote, setSavingNote] = useState(false)
  const [tab, setTab] = useState<'todos' | 'notes'>('todos')

  async function load() {
    setLoading(true)
    const data = await getTask(id)
    setTask(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault()
    if (!todoTitle.trim()) return
    await createTodo({ title: todoTitle, task_id: id, reluctance_score: reluctance })
    setTodoTitle('')
    setReluctance(5)
    setAddingTodo(false)
    load()
  }

  async function handleNoteSubmit(content: string, type: NoteType) {
    setSavingNote(true)
    const note = await createNote({ task_id: id, note_type: type, raw_content: content })
    await extractFromNote(note)
    setSavingNote(false)
    load()
  }

  if (loading) return <div className="text-[#a0a0a0] text-sm animate-pulse">불러오는 중...</div>
  if (!task) return <div className="text-[#a0a0a0]">Task를 찾을 수 없습니다.</div>

  const todos = (task.todos ?? []).filter(t => t.status !== 'done')
  const doneTodos = (task.todos ?? []).filter(t => t.status === 'done')

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <button onClick={() => router.back()} className="text-xs text-[#a0a0a0] hover:text-white mb-2 block">← 뒤로</button>
          <h1 className="text-2xl font-bold text-white">{task.title}</h1>
          {task.description && <p className="text-sm text-[#a0a0a0] mt-1">{task.description}</p>}
          <div className="flex gap-2 mt-2">
            <Badge>{task.status}</Badge>
            {task.due_date && <Badge variant="warning">~{formatDate(task.due_date)}</Badge>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#343434]">
        {(['todos', 'notes'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t ? 'text-[#faff69] border-[#faff69]' : 'text-[#a0a0a0] border-transparent hover:text-white'
            }`}>
            {t === 'todos' ? `Todos (${(task.todos ?? []).length})` : `Notes (${(task.notes ?? []).length})`}
          </button>
        ))}
      </div>

      {tab === 'todos' && (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setAddingTodo(v => !v)}>
            {addingTodo ? '취소' : '+ Todo 추가'}
          </Button>

          {addingTodo && (
            <form onSubmit={handleAddTodo} className="card card--surface p-4 space-y-3">
              <input
                autoFocus value={todoTitle} onChange={e => setTodoTitle(e.target.value)}
                placeholder="Todo 제목"
                className="w-full bg-transparent border border-[rgba(65,65,65,0.8)] rounded px-3 py-2 text-sm text-white placeholder:text-[#414141] focus:outline-none focus:border-[#faff69]"
              />
              <div>
                <p className="text-xs text-[#a0a0a0] mb-2">하기 싫음 정도: <span className="text-[#faff69]">{reluctance}</span>/10</p>
                <input type="range" min={0} max={10} step={1} value={reluctance}
                  onChange={e => setReluctance(Number(e.target.value))}
                  className="w-full accent-[#faff69]" />
              </div>
              <Button variant="neon" type="submit" size="sm">추가</Button>
            </form>
          )}

          <div className="space-y-3">
            {todos.map(todo => (
              <TodoCard key={todo.id} todo={todo}
                onStart={async id => { await updateTodo(id, { status: 'in_progress' }); load() }}
                onDone={async id => { await updateTodo(id, { status: 'done' }); load() }}
                onSnooze={async id => { await snoozeTodo(id); load() }}
              />
            ))}
          </div>

          {doneTodos.length > 0 && (
            <div className="opacity-50 space-y-2">
              <p className="text-xs text-[#a0a0a0] uppercase tracking-widest">완료됨</p>
              {doneTodos.map(todo => <TodoCard key={todo.id} todo={todo} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-6">
          <NoteEditor taskId={id} onSubmit={handleNoteSubmit} isLoading={savingNote} />
          <div className="space-y-3">
            {(task.notes ?? []).map(note => (
              <div key={note.id} className="card card--surface p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{note.note_type}</Badge>
                  <span className="text-xs text-[#a0a0a0]">{formatDate(note.created_at)}</span>
                </div>
                <p className="text-sm text-white whitespace-pre-wrap">{note.raw_content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
