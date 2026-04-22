'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { NoteType } from '@/types'

const NOTE_TYPES: { value: NoteType; label: string }[] = [
  { value: 'memo',    label: '메모' },
  { value: 'meeting', label: '회의록' },
  { value: 'idea',    label: '아이디어' },
]

const PLACEHOLDER = `오늘 팀장한테 3분기 보고서 제출해야 하는데 계속 미루고 있음
내일 오전 10시 클라이언트 미팅 전에 제안서 검토 필요
서버 배포 QA 아직 못 했고 이번 주 금요일이 데드라인
신규 입사자 온보딩 자료 만들어야 하는데 언제할지 모르겠음`

export default function CapturePage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState<NoteType>('memo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      if (!res.ok) throw new Error(data.error ?? '오류가 발생했습니다')
      router.push('/review')
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
      setLoading(false)
    }
  }

  const canSubmit = content.trim().length > 0 && !loading

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>할 일 입력</h1>
        <p style={{ fontSize: '12px', color: '#6e6e6e', lineHeight: 1.5 }}>
          오늘 할 일, 회의 내용, 업무 메모를 자유롭게 적으면 AI가 Todo를 추출합니다
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

        {/* Type tabs */}
        <div style={{
          display: 'inline-flex', gap: '2px', padding: '3px',
          background: '#1a1a1a', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)',
          alignSelf: 'flex-start',
        }}>
          {NOTE_TYPES.map(t => (
            <button
              key={t.value} type="button" onClick={() => setNoteType(t.value)}
              style={{
                fontSize: '12px', padding: '4px 12px', borderRadius: '4px', border: 'none',
                background: noteType === t.value ? '#2a2a2a' : 'transparent',
                color: noteType === t.value ? '#fff' : '#6e6e6e',
                cursor: 'pointer', transition: 'all 0.12s',
                fontFamily: 'inherit', fontWeight: noteType === t.value ? 500 : 400,
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Textarea */}
        <div style={{ position: 'relative' }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={9}
            disabled={loading}
            style={{
              width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px', padding: '12px 14px',
              color: '#e8e8e8', fontSize: '13px', lineHeight: 1.75, resize: 'vertical',
              outline: 'none', fontFamily: 'inherit', opacity: loading ? 0.5 : 1,
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          />
          {content.length > 0 && (
            <span style={{
              position: 'absolute', bottom: '8px', right: '10px',
              fontSize: '10px', color: '#484848', pointerEvents: 'none',
            }}>{content.length}</span>
          )}
        </div>

        {error && (
          <p style={{ fontSize: '12px', color: '#f87171', padding: '7px 10px', background: 'rgba(248,113,113,0.07)', borderRadius: '4px', border: '1px solid rgba(248,113,113,0.15)' }}>
            {error}
          </p>
        )}

        <button
          type="submit" disabled={!canSubmit}
          style={{
            padding: '10px', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: 600,
            background: canSubmit ? '#faff69' : '#1a1a1a',
            color: canSubmit ? '#111' : '#484848',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          {loading ? (
            <>
              <span style={{ width: '11px', height: '11px', border: '1.5px solid rgba(0,0,0,0.25)', borderTopColor: '#555', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
              AI 분석 중…
            </>
          ) : 'AI로 Todo 추출'}
        </button>
      </form>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <p style={{ fontSize: '11px', color: '#484848', lineHeight: 1.7, paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        입력 내용은 원문 그대로 저장됩니다. AI가 실행 항목을 추출하면 검토 후 승인한 항목만 Todo로 등록됩니다.
      </p>
    </div>
  )
}
