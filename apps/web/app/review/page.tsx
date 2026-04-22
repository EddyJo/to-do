'use client'
import { useEffect, useState } from 'react'
import { AISuggestion } from '@/types'
import { getPendingSuggestions, approveSuggestion, updateSuggestionStatus } from '@/lib/db/suggestions'
import { AISuggestionCard } from '@/components/AISuggestionCard'
import { Button } from '@/components/ui/Button'

export default function ReviewPage() {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const data = await getPendingSuggestions()
    setSuggestions(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleApprove(s: AISuggestion) {
    await approveSuggestion(s)
    setSuggestions(p => p.filter(x => x.id !== s.id))
  }
  async function handleReject(id: string) {
    await updateSuggestionStatus(id, 'rejected')
    setSuggestions(p => p.filter(x => x.id !== id))
  }
  async function handleDefer(id: string) {
    await updateSuggestionStatus(id, 'deferred')
    setSuggestions(p => p.filter(x => x.id !== id))
  }
  async function handleRejectAll() {
    await Promise.all(suggestions.map(s => updateSuggestionStatus(s.id, 'rejected')))
    setSuggestions([])
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
      ) : suggestions.length === 0 ? (
        <div style={{ padding: '52px 24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
          <p style={{ fontSize: '20px', marginBottom: '10px' }}>✦</p>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '6px' }}>다 확인했어요</p>
          <p style={{ fontSize: '12px', color: '#6e6e6e', lineHeight: 1.7 }}>새로 기록하면 AI가 또 꺼내드릴게요</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {suggestions.map(s => (
            <AISuggestionCard key={s.id} suggestion={s} onApprove={handleApprove} onReject={handleReject} onDefer={handleDefer} />
          ))}
        </div>
      )}
    </div>
  )
}
