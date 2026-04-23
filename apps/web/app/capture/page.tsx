'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { NoteType } from '@/types'

const NOTE_TYPES: { value: NoteType; label: string }[] = [
  { value: 'memo',    label: '메모' },
  { value: 'meeting', label: '회의록' },
  { value: 'idea',    label: '아이디어' },
]

const PLACEHOLDER = `오늘 팀장한테 보고서 제출해야 하는데 계속 미루고 있음
내일 오전 클라이언트 미팅 전에 제안서 검토 필요
서버 배포 QA 아직 못 했고 이번 주 금요일이 데드라인
신규 입사자 온보딩 자료, 언제 만들지 모르겠음`

export default function CapturePage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState<NoteType>('memo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(el.scrollHeight, 180) + 'px'
  }

  useEffect(() => { autoResize() }, [content])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, note_type: noteType }),
      })
      const data = await res.json()
      if (!res.ok && res.status !== 202) throw new Error(data.error ?? '잠깐 문제가 생겼어요. 다시 시도해볼까요?')
      router.push('/review')
    } catch (err) {
      setError(err instanceof Error ? err.message : '잠깐 문제가 생겼어요. 다시 시도해볼까요?')
      setLoading(false)
    }
  }

  const canSubmit = content.trim().length > 0 && !loading

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>오늘 뭐가 있었나요</h1>
        <p style={{ fontSize: '13px', color: '#6e6e6e', lineHeight: 1.6 }}>
          머릿속에 맴도는 것, 미뤄온 것 — 다 꺼내봐요.<br/>
          AI가 할 일을 정리해줄게요.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Note type selector */}
        <div style={{
          display: 'flex', gap: '6px', padding: '4px',
          background: '#1a1a1a', borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {NOTE_TYPES.map(t => (
            <button
              key={t.value} type="button"
              onClick={() => setNoteType(t.value)}
              style={{
                flex: 1, fontSize: '13px', padding: '9px 0',
                borderRadius: '6px', border: 'none',
                background: noteType === t.value ? '#2e2e2e' : 'transparent',
                color: noteType === t.value ? '#fff' : '#6e6e6e',
                cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'inherit',
                fontWeight: noteType === t.value ? 600 : 400,
                minHeight: '44px',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={PLACEHOLDER}
            disabled={loading}
            style={{
              width: '100%', minHeight: '180px',
              background: '#111', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '14px',
              color: '#e8e8e8', fontSize: '15px', lineHeight: 1.8,
              resize: 'none', outline: 'none', fontFamily: 'inherit',
              opacity: loading ? 0.5 : 1,
              overflowY: 'hidden',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          />
          {content.length > 0 && (
            <span style={{ position: 'absolute', bottom: '10px', right: '12px', fontSize: '11px', color: '#484848', pointerEvents: 'none' }}>
              {content.length}
            </span>
          )}
        </div>

        {error && (
          <p style={{ fontSize: '13px', color: '#f87171', padding: '10px 12px', background: 'rgba(248,113,113,0.07)', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.15)' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: '0 16px', height: '52px',
            borderRadius: '10px', border: 'none',
            fontSize: '15px', fontWeight: 700,
            background: canSubmit ? '#faff69' : '#1a1a1a',
            color: canSubmit ? '#111' : '#484848',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            touchAction: 'manipulation',
          }}
        >
          {loading ? (
            <>
              <span style={{ width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#555', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
              저장하는 중…
            </>
          ) : '할 일 꺼내기'}
        </button>
      </form>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <p style={{ fontSize: '12px', color: '#484848', lineHeight: 1.8, paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        적은 내용은 원문 그대로 보관돼요. AI가 할 일을 꺼내면 하나씩 확인 후 등록할 수 있어요.
      </p>
    </div>
  )
}
