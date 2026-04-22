'use client'
import { useEffect, useState } from 'react'
import { Task, CreateTaskInput } from '@/types'
import { getTasks, createTask } from '@/lib/db/tasks'
import { TaskCard } from '@/components/TaskCard'
import { Button } from '@/components/ui/Button'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    const data = await getTasks()
    setTasks(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    await createTask({ title })
    setTitle('')
    setShowForm(false)
    setCreating(false)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Tasks</h1>
        <Button variant="neon" size="sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? '취소' : '+ 새 Task'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card card--surface p-4 space-y-3">
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task 제목을 입력하세요"
            className="w-full bg-transparent border border-[rgba(65,65,65,0.8)] rounded px-3 py-2 text-sm text-white placeholder:text-[#414141] focus:outline-none focus:border-[#faff69] transition-colors"
          />
          <Button variant="neon" type="submit" disabled={!title.trim() || creating}>
            {creating ? '생성 중...' : '생성'}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="text-[#a0a0a0] text-sm animate-pulse">불러오는 중...</div>
      ) : tasks.length === 0 ? (
        <div className="card card--surface p-8 text-center">
          <p className="text-[#a0a0a0] text-sm">Task가 없습니다. 새 Task를 만들어보세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      )}
    </div>
  )
}
