'use client'
import { useEffect, useState } from 'react'
import { AISuggestion } from '@/types'
import { AISuggestionCard } from '@/components/AISuggestionCard'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/ui/Toast'

export default function ReviewPage() {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast, showToast, dismissToast } = useToast()

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/suggestions')
      if (!res.ok) throw new Error('fetch failed')
      setSuggestions(await res.json())
    } catch {
      setError('제안을 불러오지 못했어요')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleApprove(s: AISuggestion) {
    setSuggestions(p => p.filter(x => x.id !== s.id))
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id }),
      })
      if (!res.ok) throw new Error('approve failed')
      showToast('할 일에 추가했어요 ✓')
    } catch { load() }
  }

  async function handleReject(id: string) {
    setSuggestions(p => p.filter(x => x.id !== id))
    try {
      await fetch('/api/suggestions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'rejected' }),
      })
    } catch { load() }
  }

  async function handleDefer(id: string) {
    setSuggestions(p => p.filter(x => x.id !== id))
    try {
      await fetch('/api/suggestions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'deferred' }),
      })
      showToast('나중에 다시 볼게요')
    } catch { load() }
  }

  async function handleRejectAll() {
    const ids = suggestions.map(s => s.id)
    setSuggestions([])
    try {
      await Promise.all(ids.map(id =>
        fetch('/api/suggestions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'rejected' }),
        })
      ))
    } catch { load() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '3px' }}>AI가 꺼낸 것들</h1>
          <p style={{ fontSize: '12px', color: '#6e6e6e' }}>맞는 것만 골라서 등록하면 돼요</p>
        </div>
        {suggestions.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleRejectAll}>전부 넘기기</Button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: '80px', background: '#161616', borderRadius: '6px', opacity: 0.5 }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
          <p style={{ fontSize: '13px', color: '#f87171', marginBottom: '14px' }}>{error}</p>
          <Button variant="ghost" size="sm" onClick={load}>다시 시도</Button>
        </div>
      ) : suggestions.length === 0 ? (
        <div style={{ padding: '52px 24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
          <p style={{ fontSize: '20px', marginBottom: '10px' }}>✦</p>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '6px' }}>확인할 제안이 없어요</p>
          <p style={{ fontSize: '12px', color: '#6e6e6e', lineHeight: 1.7, marginBottom: '20px' }}>
            방금 기록했다면 AI가 아직 분석 중일 수 있어요.<br />잠시 후 새로고침해보세요.
          </p>
          <Button variant="ghost" size="sm" onClick={load}>새로고침</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {suggestions.map(s => (
            <AISuggestionCard key={s.id} suggestion={s} onApprove={handleApprove} onReject={handleReject} onDefer={handleDefer} />
          ))}
        </div>
      )}

      {toast && <Toast message={toast} onDismiss={dismissToast} />}
    </div>
  )
}
