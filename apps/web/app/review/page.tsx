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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Review Queue</h1>
          <p className="text-sm text-[#a0a0a0] mt-1">AI가 추출한 항목을 검토하고 승인하세요</p>
        </div>
        {suggestions.length > 0 && (
          <Button variant="danger" size="sm" onClick={handleRejectAll}>전체 삭제</Button>
        )}
      </div>

      {loading ? (
        <div className="text-[#a0a0a0] text-sm animate-pulse">불러오는 중...</div>
      ) : suggestions.length === 0 ? (
        <div className="card card--surface p-12 text-center">
          <p className="text-4xl mb-4">✓</p>
          <p className="text-white font-semibold mb-1">모두 처리했습니다</p>
          <p className="text-sm text-[#a0a0a0]">새로운 AI 제안이 생기면 여기에 나타납니다</p>
        </div>
      ) : (
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
      )}
    </div>
  )
}
