'use client'
import { useEffect, useState } from 'react'
import { Todo, AISuggestion } from '@/types'
import { getTopAvoidedTodo, getTodos, updateTodo, snoozeTodo } from '@/lib/db/todos'
import { getPendingSuggestions, approveSuggestion, updateSuggestionStatus } from '@/lib/db/suggestions'
import { TodoCard } from '@/components/TodoCard'
import { AISuggestionCard } from '@/components/AISuggestionCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function HomePage() {
  const [topTodo, setTopTodo] = useState<Todo | null>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const [top, all, sug] = await Promise.all([
        getTopAvoidedTodo(),
        getTodos({ status: 'pending' }),
        getPendingSuggestions(),
      ])
      setTopTodo(top)
      setTodos(all.filter(t => t.id !== top?.id).slice(0, 5))
      setSuggestions(sug.slice(0, 3))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleStart(id: string) {
    await updateTodo(id, { status: 'in_progress' })
    load()
  }

  async function handleDone(id: string) {
    await updateTodo(id, { status: 'done' })
    load()
  }

  async function handleSnooze(id: string) {
    await snoozeTodo(id)
    load()
  }

  async function handleApprove(s: AISuggestion) {
    await approveSuggestion(s)
    load()
  }

  async function handleReject(id: string) {
    await updateSuggestionStatus(id, 'rejected')
    setSuggestions(p => p.filter(s => s.id !== id))
  }

  async function handleDefer(id: string) {
    await updateSuggestionStatus(id, 'deferred')
    setSuggestions(p => p.filter(s => s.id !== id))
  }

  if (loading) {
    return <div className="text-[#a0a0a0] text-sm animate-pulse">불러오는 중...</div>
  }

  return (
    <div className="space-y-10">
      {/* Hero — 오늘 가장 먼저 */}
      <section>
        <p className="text-xs text-[#a0a0a0] uppercase tracking-widest mb-3 font-semibold">
          오늘 가장 먼저 해야 할 일
        </p>
        {topTodo ? (
          <TodoCard
            todo={topTodo}
            featured
            onStart={handleStart}
            onSnooze={handleSnooze}
            onDone={handleDone}
          />
        ) : (
          <div className="card card--surface p-8 text-center">
            <p className="text-[#a0a0a0] text-sm mb-4">오늘의 Todo가 없습니다</p>
            <Link href="/tasks">
              <Button variant="neon">Todo 추가하기</Button>
            </Link>
          </div>
        )}
      </section>

      {/* 오늘의 나머지 */}
      {todos.length > 0 && (
        <section>
          <p className="text-xs text-[#a0a0a0] uppercase tracking-widest mb-3 font-semibold">
            오늘의 나머지
          </p>
          <div className="space-y-3">
            {todos.map(todo => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onStart={handleStart}
                onSnooze={handleSnooze}
                onDone={handleDone}
              />
            ))}
          </div>
        </section>
      )}

      {/* AI 제안 검토 */}
      {suggestions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#a0a0a0] uppercase tracking-widest font-semibold">
              AI 제안 검토 ({suggestions.length})
            </p>
            <Link href="/review" className="text-xs text-[#faff69] hover:underline">전체 보기</Link>
          </div>
          <div className="space-y-3">
            {suggestions.map(s => (
              <AISuggestionCard
                key={s.id}
                suggestion={s}
                onApprove={handleApprove}
                onReject={handleReject}
                onDefer={handleDefer}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
