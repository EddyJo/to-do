'use client'
// User instruction: "그전까지는 backlog인거지. 수동으로 우선순위 조정해서 다시 뽑는 기능은 있어야돼"
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { getTodos, updateTodo } from '@/lib/db/todos'
import { TodoCard } from '@/components/TodoCard'
import type { Todo } from '@/types'

const TODAY_COUNT = 5

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [prioritizing, setPrioritizing] = useState(false)
  const [lastPrioritized, setLastPrioritized] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTodos({ status: 'pending' })
      setTodos(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handlePrioritize() {
    setPrioritizing(true)
    try {
      const res = await fetch('/api/prioritize', { method: 'POST' })
      const data = await res.json()
      if (data.todos) setTodos(data.todos)
      setLastPrioritized(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
    } finally {
      setPrioritizing(false)
    }
  }

  async function handleStart(id: string) {
    await updateTodo(id, { status: 'in_progress' })
    load()
  }

  async function handleDone(id: string) {
    await updateTodo(id, { status: 'done' })
    load()
  }

  async function handleSnooze(id: string) {
    const { snoozeTodo } = await import('@/lib/db/todos')
    await snoozeTodo(id)
    load()
  }

  const todayList = todos.slice(0, TODAY_COUNT)
  const backlog = todos.slice(TODAY_COUNT)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">오늘 할 일</h1>
          <p className="text-xs text-[#a0a0a0] mt-0.5">회피도 기반 우선순위 — 가장 하기 싫은 것부터</p>
        </div>
        <div className="flex items-center gap-3">
          {lastPrioritized && (
            <span className="text-xs text-[#414141]">{lastPrioritized} 재계산됨</span>
          )}
          <button
            onClick={handlePrioritize}
            disabled={prioritizing}
            className="text-xs px-3 py-1.5 border border-[#343434] rounded text-[#a0a0a0] hover:border-[#faff69] hover:text-[#faff69] transition-colors disabled:opacity-40"
          >
            {prioritizing ? '계산 중...' : '⟳ 우선순위 재계산'}
          </button>
          <Link
            href="/capture"
            className="text-xs px-3 py-1.5 bg-[#faff69] text-[#151515] rounded font-semibold hover:bg-[#f4f692] transition-colors"
          >
            + 입력
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-[#141414] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : todos.length === 0 ? (
        <div className="card card--surface p-12 text-center">
          <p className="text-3xl mb-3">✦</p>
          <p className="text-white font-semibold mb-1">할 일이 없습니다</p>
          <p className="text-sm text-[#a0a0a0] mb-4">업무 내용이나 메모를 입력하면 AI가 Todo를 만들어드립니다</p>
          <Link
            href="/capture"
            className="inline-block px-5 py-2 bg-[#faff69] text-[#151515] rounded font-semibold text-sm hover:bg-[#f4f692] transition-colors"
          >
            할 일 입력하기
          </Link>
        </div>
      ) : (
        <>
          {/* Today's list */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-white">오늘 목록</h2>
              <span className="text-xs text-[#414141] bg-[#141414] px-2 py-0.5 rounded-full">
                {todayList.length}개
              </span>
              {todayList.length > 0 && (
                <span className="text-xs text-[#faff69] ml-1">← 지금 당장 해야 할 것들</span>
              )}
            </div>
            <div className="space-y-2">
              {todayList.map((todo, i) => (
                <div key={todo.id} className="relative">
                  {i === 0 && (
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-10 bg-[#faff69] rounded-r" />
                  )}
                  <TodoCard
                    todo={todo}
                    featured={i === 0}
                    onStart={handleStart}
                    onDone={handleDone}
                    onSnooze={handleSnooze}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Backlog */}
          {backlog.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-[#a0a0a0]">Backlog</h2>
                <span className="text-xs text-[#414141] bg-[#141414] px-2 py-0.5 rounded-full">
                  {backlog.length}개
                </span>
                <span className="text-xs text-[#414141]">— 내일 아침 우선순위 조정 후 반영</span>
              </div>
              <div className="space-y-2 opacity-60">
                {backlog.map(todo => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onSnooze={handleSnooze}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
