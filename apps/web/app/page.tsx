'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { getTodos, updateTodo, snoozeTodo } from '@/lib/db/todos'
import { TodoCard } from '@/components/TodoCard'
import { DailyQuote } from '@/components/DailyQuote'
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

  async function handleStart(id: string) { await updateTodo(id, { status: 'in_progress' }); load() }
  async function handleDone(id: string)  { await updateTodo(id, { status: 'done' }); load() }
  async function handleSnooze(id: string){ await snoozeTodo(id); load() }

  const todayList = todos.slice(0, TODAY_COUNT)
  const backlog   = todos.slice(TODAY_COUNT)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-white)', marginBottom: '2px' }}>오늘 할 일</h1>
          <p style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>회피도 기반 · 가장 미뤄온 것부터</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {lastPrioritized && (
            <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>{lastPrioritized}</span>
          )}
          <button
            onClick={handlePrioritize}
            disabled={prioritizing}
            style={{
              fontSize: '12px', padding: '5px 10px', borderRadius: '4px',
              border: '1px solid var(--color-border)', background: 'transparent',
              color: 'var(--color-gray-400)', cursor: 'pointer', transition: 'all 0.15s',
              opacity: prioritizing ? 0.4 : 1,
            }}
          >
            {prioritizing ? '계산 중…' : '재계산'}
          </button>
          <Link
            href="/capture"
            style={{
              fontSize: '12px', padding: '5px 12px', borderRadius: '4px',
              background: 'var(--color-neon-volt)', color: '#111',
              fontWeight: 600, whiteSpace: 'nowrap',
            }}
          >
            + 새 입력
          </Link>
        </div>
      </div>

      <DailyQuote />

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: '72px', background: 'var(--color-surface)', borderRadius: '6px', opacity: 0.5 }} />
          ))}
        </div>
      ) : todos.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'var(--color-gray-500)', textTransform: 'uppercase', marginBottom: '12px' }}>
            할 일 없음
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-400)', marginBottom: '20px', lineHeight: 1.6 }}>
            업무 내용이나 메모를 입력하면<br/>AI가 Todo를 추출해드립니다
          </p>
          <Link
            href="/capture"
            style={{
              display: 'inline-block', fontSize: '13px', padding: '8px 20px',
              background: 'var(--color-neon-volt)', color: '#111',
              borderRadius: '4px', fontWeight: 600,
            }}
          >
            입력 시작
          </Link>
        </div>
      ) : (
        <>
          {/* Today */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-gray-500)' }}>
                Today
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-gray-600)' }}>{todayList.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {todayList.map((todo, i) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  featured={i === 0}
                  onStart={handleStart}
                  onDone={handleDone}
                  onSnooze={handleSnooze}
                />
              ))}
            </div>
          </section>

          {/* Backlog */}
          {backlog.length > 0 && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-gray-600)' }}>
                  Backlog
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-gray-600)' }}>{backlog.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', opacity: 0.55 }}>
                {backlog.map(todo => (
                  <TodoCard key={todo.id} todo={todo} onSnooze={handleSnooze} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
