'use client'
import { useEffect, useState } from 'react'
import { shouldShowRetro, RetroMood } from '@/lib/retro/utils'

const STORAGE_KEY = 'retro_seen_date'

const MOOD_CONFIG: Record<RetroMood, { color: string; borderColor: string; icon: string }> = {
  encouraging: { color: '#4ade80', borderColor: 'rgba(74,222,128,0.25)', icon: '✦' },
  mixed:       { color: '#f59e0b', borderColor: 'rgba(245,158,11,0.25)',  icon: '◎' },
  concern:     { color: '#f87171', borderColor: 'rgba(248,113,113,0.25)', icon: '△' },
}

interface RetroData {
  mood: RetroMood
  message: string
  highlight: string
  completedCount?: number
  pendingCount?: number
}

export function MorningRetro() {
  const [retro, setRetro] = useState<RetroData | null>(null)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY)
    if (!shouldShowRetro(new Date(), lastSeen)) return

    setLoading(true)
    fetch('/api/retrospective', { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setRetro(data)
          setVisible(true)
        }
      })
      .catch(() => {/* 실패하면 조용히 무시 */})
      .finally(() => setLoading(false))
  }, [])

  function dismiss() {
    const todayStr = new Date().toISOString().slice(0, 10)
    localStorage.setItem(STORAGE_KEY, todayStr)
    setVisible(false)
  }

  if (loading) {
    return (
      <div style={{ padding: '14px 16px', background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ width: '10px', height: '10px', border: '1.5px solid rgba(255,255,255,0.1)', borderTopColor: '#6e6e6e', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: '#6e6e6e' }}>어제 하루를 돌아보는 중…</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (!visible || !retro) return null

  const cfg = MOOD_CONFIG[retro.mood]

  return (
    <div style={{
      padding: '16px 18px',
      background: '#0d0d0d',
      border: `1px solid ${cfg.borderColor}`,
      borderLeft: `3px solid ${cfg.color}`,
      borderRadius: '8px',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: cfg.color, fontSize: '13px' }}>{cfg.icon}</span>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6e6e6e' }}>
            어제 회고
          </span>
          {retro.completedCount !== undefined && (
            <span style={{ fontSize: '11px', color: '#484848' }}>
              · {retro.completedCount}개 완료 / {retro.pendingCount}개 미완료
            </span>
          )}
        </div>
        <button
          onClick={dismiss}
          style={{ background: 'none', border: 'none', color: '#484848', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0 0 0 8px', flexShrink: 0 }}
          aria-label="닫기"
        >×</button>
      </div>

      {/* Highlight */}
      <p style={{ fontSize: '15px', fontWeight: 600, color: cfg.color, marginBottom: '8px', lineHeight: 1.3, wordBreak: 'keep-all' }}>
        {retro.highlight}
      </p>

      {/* Message */}
      <p style={{ fontSize: '13px', color: '#9a9a9a', lineHeight: 1.7, wordBreak: 'keep-all' }}>
        {retro.message}
      </p>
    </div>
  )
}
