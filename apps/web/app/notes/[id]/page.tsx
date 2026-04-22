'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { Note, NoteType, SuggestionStatus } from '@/types'

const TYPE_LABELS: Record<NoteType, string> = {
  memo: '메모',
  meeting: '회의록',
  idea: '아이디어',
}

const TYPE_COLORS: Record<NoteType, string> = {
  memo: '#6e6e6e',
  meeting: '#4a9eff',
  idea: '#faff69',
}

const STATUS_LABELS: Record<SuggestionStatus, string> = {
  pending: '검토 중',
  approved: '등록됨',
  rejected: '넘김',
  deferred: '나중에',
}

const STATUS_COLORS: Record<SuggestionStatus, string> = {
  pending: '#6e6e6e',
  approved: '#4caf50',
  rejected: '#484848',
  deferred: '#ff9800',
}

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/notes/${id}`, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error('not found')
        return r.json()
      })
      .then(data => {
        if (Array.isArray(data.ai_summary)) data.ai_summary = data.ai_summary[0] ?? null
        setNote(data)
        setLoading(false)
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        setError('노트를 불러오지 못했어요')
        setLoading(false)
      })
    return () => controller.abort()
  }, [id])

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    router.replace('/notes')
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ height: '80px', background: '#161616', borderRadius: '6px', opacity: 0.5 }} />
      ))}
    </div>
  )

  if (error || !note) return (
    <div style={{ padding: '52px 24px', textAlign: 'center' }}>
      <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '14px' }}>
        {error ?? '노트를 찾을 수 없어요'}
      </p>
      <Button variant="ghost" size="sm" onClick={() => router.back()}>← 뒤로</Button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <button
            onClick={() => router.back()}
            style={{ fontSize: '12px', color: '#6e6e6e', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            ← 뒤로
          </button>

          {/* 인라인 삭제 확인 */}
          {confirmDelete ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#9a9a9a' }}>정말 삭제할까요?</span>
              <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? '삭제 중…' : '삭제'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>취소</Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>삭제</Button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em',
            padding: '3px 8px', borderRadius: '3px',
            background: `${TYPE_COLORS[note.note_type]}22`,
            color: TYPE_COLORS[note.note_type],
          }}>
            {TYPE_LABELS[note.note_type]}
          </span>
          <span style={{ fontSize: '12px', color: '#484848' }}>{formatDate(note.created_at)}</span>
        </div>
      </div>

      <div style={{ padding: '16px', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#484848', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>원본</p>
        <p style={{ fontSize: '14px', color: '#d0d0d0', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>
          {note.raw_content}
        </p>
      </div>

      {note.ai_summary && (
        <div style={{ padding: '16px', background: '#111', border: '1px solid rgba(250,255,105,0.12)', borderRadius: '6px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#faff69', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px', opacity: 0.7 }}>AI 요약</p>
          <p style={{ fontSize: '13px', color: '#d0d0d0', lineHeight: 1.6, margin: 0 }}>
            {note.ai_summary.short_summary}
          </p>
          {note.ai_summary.key_points?.length > 0 && (
            <ul style={{ margin: '10px 0 0', padding: '0 0 0 16px' }}>
              {note.ai_summary.key_points.map((pt, i) => (
                <li key={i} style={{ fontSize: '12px', color: '#a0a0a0', lineHeight: 1.7 }}>{pt}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {note.ai_suggestions && note.ai_suggestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#484848', letterSpacing: '0.08em', textTransform: 'uppercase' }}>추출된 할 일</p>
          {note.ai_suggestions.map(s => (
            <div key={s.id} style={{
              padding: '12px 14px', background: '#111',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
            }}>
              <p style={{
                fontSize: '13px', color: s.status === 'rejected' ? '#484848' : '#d0d0d0',
                lineHeight: 1.5, margin: 0, flex: 1,
              }}>
                {s.suggestion_todos?.[0]?.generated_todo_title ?? s.content}
              </p>
              <span style={{
                fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '3px', flexShrink: 0,
                background: `${STATUS_COLORS[s.status]}22`,
                color: STATUS_COLORS[s.status],
              }}>
                {STATUS_LABELS[s.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
