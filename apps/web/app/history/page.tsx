'use client'
import { useEffect, useState, useCallback } from 'react'

interface DoneTodo {
  id: string
  title: string
  reluctance_score: number
  source: string
  updated_at: string
}

interface Group {
  label: string
  todos: DoneTodo[]
}

// KST 기준 날짜 문자열 (YYYY-MM-DD)
function kstDateStr(isoStr: string): string {
  const d = new Date(new Date(isoStr).getTime() + 9 * 60 * 60 * 1000)
  return d.toISOString().slice(0, 10)
}

function kstTodayStr(): string {
  return kstDateStr(new Date().toISOString())
}

function kstYesterdayStr(): string {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000)
  return kstDateStr(d.toISOString())
}

function kstTimeStr(isoStr: string): string {
  const d = new Date(new Date(isoStr).getTime() + 9 * 60 * 60 * 1000)
  const h = d.getUTCHours().toString().padStart(2, '0')
  const m = d.getUTCMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function groupByDate(todos: DoneTodo[]): Group[] {
  const today = kstTodayStr()
  const yesterday = kstYesterdayStr()
  const map = new Map<string, DoneTodo[]>()

  for (const t of todos) {
    const key = kstDateStr(t.updated_at)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  }

  const groups: Group[] = []
  for (const [date, items] of map) {
    let label: string
    if (date === today) label = '오늘'
    else if (date === yesterday) label = '어제'
    else {
      // "4월 20일" 형식
      const [, m, d] = date.split('-')
      label = `${parseInt(m)}월 ${parseInt(d)}일`
    }
    groups.push({ label, todos: items })
  }
  return groups
}

function reluctanceColor(score: number): string {
  if (score >= 8) return '#faff69'
  if (score >= 6) return '#f59e0b'
  if (score >= 4) return '#ef4444'
  return '#484848'
}

export default function HistoryPage() {
  const [todos, setTodos] = useState<DoneTodo[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const LIMIT = 40

  const loadInitial = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/todos/history?limit=${LIMIT}&offset=0`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setTodos(data.todos ?? [])
      setTotal(data.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : '불러오기 실패')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadInitial() }, [loadInitial])

  async function loadMore() {
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/todos/history?limit=${LIMIT}&offset=${todos.length}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTodos(prev => [...prev, ...(data.todos ?? [])])
    } finally {
      setLoadingMore(false)
    }
  }

  const groups = groupByDate(todos)
  const hasMore = todos.length < total

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '19px', fontWeight: 600, color: '#fff', marginBottom: '3px' }}>완료 기록</h1>
        <p style={{ fontSize: '12px', color: '#6e6e6e' }}>
          {loading ? '불러오는 중…' : `총 ${total}개 완료했어요`}
        </p>
      </div>

      {/* Stats strip */}
      {!loading && total > 0 && (
        <div style={{
          display: 'flex', gap: '1px',
          borderRadius: '8px', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          {[
            { label: '전체', value: total },
            { label: '오늘', value: todos.filter(t => kstDateStr(t.updated_at) === kstTodayStr()).length },
            { label: '이번 주', value: todos.filter(t => {
              const d = new Date(t.updated_at)
              return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000
            }).length },
          ].map(({ label, value }) => (
            <div key={label} style={{
              flex: 1, padding: '12px 8px', background: '#111',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#faff69', fontFamily: 'var(--font-mono)' }}>{value}</span>
              <span style={{ fontSize: '10px', color: '#6e6e6e' }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ fontSize: '13px', color: '#f87171', padding: '10px 12px', background: 'rgba(248,113,113,0.07)', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.15)' }}>
          {error}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: '56px', background: '#161616', borderRadius: '10px', opacity: 0.5 - i * 0.08 }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && total === 0 && (
        <div style={{ padding: '52px 24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
          <p style={{ fontSize: '24px', marginBottom: '10px' }}>✓</p>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '6px' }}>아직 완료한 게 없어요</p>
          <p style={{ fontSize: '12px', color: '#6e6e6e', lineHeight: 1.7 }}>
            할 일을 완료하면 여기에 기록돼요.
          </p>
        </div>
      )}

      {/* Grouped list */}
      {!loading && groups.map(group => (
        <section key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6e6e6e', letterSpacing: '0.06em' }}>
              {group.label}
            </span>
            <span style={{ fontSize: '11px', color: '#484848' }}>{group.todos.length}개</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {group.todos.map(todo => (
              <div key={todo.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px',
                borderRadius: '10px',
                background: '#111',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                {/* Done circle */}
                <div style={{
                  flexShrink: 0, width: '24px', height: '24px',
                  borderRadius: '50%', background: 'rgba(74,222,128,0.15)',
                  border: '1.5px solid rgba(74,222,128,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5L4.5 8 9 3" stroke="#4ade80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Title */}
                <p style={{
                  flex: 1, fontSize: '14px', color: '#9a9a9a',
                  lineHeight: 1.4, wordBreak: 'keep-all',
                  textDecoration: 'line-through',
                  textDecorationColor: 'rgba(255,255,255,0.15)',
                }}>
                  {todo.title}
                </p>

                {/* Right: score + time */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: reluctanceColor(todo.reluctance_score), fontFamily: 'var(--font-mono)' }}>
                    {todo.reluctance_score}
                  </span>
                  <span style={{ fontSize: '10px', color: '#484848' }}>
                    {kstTimeStr(todo.updated_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Load more */}
      {hasMore && !loading && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          style={{
            width: '100%', padding: '12px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            color: '#6e6e6e', fontSize: '13px',
            cursor: loadingMore ? 'default' : 'pointer',
            opacity: loadingMore ? 0.5 : 1,
            touchAction: 'manipulation',
          }}
        >
          {loadingMore ? '불러오는 중…' : `더 보기 (${total - todos.length}개 남음)`}
        </button>
      )}

    </div>
  )
}
