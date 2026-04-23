'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { TodoCard } from '@/components/TodoCard'
import { DailyQuote } from '@/components/DailyQuote'
import { MorningRetro } from '@/components/MorningRetro'
import { Toast, useToast } from '@/components/ui/Toast'
import type { Todo } from '@/types'

const TODAY_COUNT = 5

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [prioritizing, setPrioritizing] = useState(false)
  const [lastPrioritized, setLastPrioritized] = useState<string | null>(null)
  const { toast, showToast, dismissToast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/todos')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setTodos(Array.isArray(data) ? data : [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setTodos([])
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
    } finally { setPrioritizing(false) }
  }

  async function handleStart(id: string) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, status: 'in_progress' as const } : t))
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' }),
      })
    } catch { load() }
  }

  async function handleDone(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id))
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' }),
      })
      showToast('잘 해냈어요 ✓')
    } catch { load() }
  }

  async function handleSnooze(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id))
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'snooze' }),
      })
      showToast('미뤘어요. 내일 다시 볼게요')
    } catch { load() }
  }

  const todayList = todos.slice(0, TODAY_COUNT)
  const backlog   = todos.slice(TODAY_COUNT)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '19px', fontWeight: 600, color: '#fff', marginBottom: '3px' }}>오늘 마주할 것들</h1>
          <p style={{ fontSize: '12px', color: '#6e6e6e' }}>가장 오래 외면해온 것이 맨 위에 있어요</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {lastPrioritized && (
            <span style={{ fontSize: '11px', color: '#484848' }}>{lastPrioritized} 정렬됨</span>
          )}
          <button
            onClick={handlePrioritize} disabled={prioritizing}
            style={{ fontSize: '13px', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#6e6e6e', cursor: 'pointer', opacity: prioritizing ? 0.4 : 1, transition: 'opacity 0.15s', minHeight: '40px', touchAction: 'manipulation' }}
          >
            {prioritizing ? '정렬 중…' : '다시 정렬'}
          </button>
        </div>
      </div>

      <MorningRetro />
      <DailyQuote />

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p style={{ fontSize: '12px', color: '#f87171', marginBottom: '4px', fontWeight: 500 }}>데이터를 불러오지 못했어요</p>
          <p style={{ fontSize: '11px', color: '#9a4040', fontFamily: 'monospace' }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: '80px', background: '#161616', borderRadius: '6px', opacity: 0.5 }} />
          ))}
        </div>
      ) : !error && todos.length === 0 ? (
        <div style={{ padding: '52px 24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
          <p style={{ fontSize: '20px', marginBottom: '10px' }}>☁︎</p>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '6px' }}>아직 아무것도 없어요</p>
          <p style={{ fontSize: '12px', color: '#6e6e6e', marginBottom: '24px', lineHeight: 1.7 }}>
            오늘 머릿속에 맴도는 것들을 꺼내보세요.<br/>AI가 할 일로 정리해드릴게요.
          </p>
          <Link href="/capture" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '14px', padding: '12px 24px', background: '#faff69', color: '#111', borderRadius: '6px', fontWeight: 700, touchAction: 'manipulation' }}>
            지금 꺼내기
          </Link>
        </div>
      ) : (
        <>
          <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6e6e6e' }}>지금 할 것</span>
              <span style={{ fontSize: '11px', color: '#484848' }}>{todayList.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {todayList.map((todo, i) => (
                <TodoCard key={todo.id} todo={todo} featured={i === 0} onStart={handleStart} onDone={handleDone} onSnooze={handleSnooze} />
              ))}
            </div>
          </section>

          {backlog.length > 0 && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#484848' }}>내일 이후</span>
                <span style={{ fontSize: '11px', color: '#484848' }}>{backlog.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: 0.5 }}>
                {backlog.map(todo => (
                  <TodoCard key={todo.id} todo={todo} onSnooze={handleSnooze} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {toast && <Toast message={toast} onDismiss={dismissToast} />}
    </div>
  )
}
