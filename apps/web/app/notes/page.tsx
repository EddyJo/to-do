'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Note, NoteType } from '@/types'

const TYPE_LABELS: Record<NoteType | 'all', string> = {
  all: '전체',
  memo: '메모',
  meeting: '회의록',
  idea: '아이디어',
}

const TYPE_COLORS: Record<NoteType, string> = {
  memo: '#6e6e6e',
  meeting: '#4a9eff',
  idea: '#faff69',
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<NoteType | 'all'>('all')

  useEffect(() => {
    fetch('/api/notes')
      .then(r => r.json())
      .then(data => {
        const notes = Array.isArray(data) ? data : []
        notes.forEach(n => {
          if (Array.isArray(n.ai_summary)) n.ai_summary = n.ai_summary[0] ?? null
        })
        setNotes(notes)
        setLoading(false)
      })
  }, [])

  const filtered = filter === 'all' ? notes : notes.filter(n => n.note_type === filter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '3px' }}>기록 보관함</h1>
        <p style={{ fontSize: '12px', color: '#6e6e6e' }}>메모, 회의록, 아이디어를 모아서 볼 수 있어요</p>
      </div>

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {(['all', 'memo', 'meeting', 'idea'] as const).map(t => {
          const count = t === 'all' ? notes.length : notes.filter(n => n.note_type === t).length
          return (
            <button key={t} onClick={() => setFilter(t)} style={{
              fontSize: '12px', padding: '4px 12px', borderRadius: '99px',
              border: '1px solid',
              borderColor: filter === t ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
              background: filter === t ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: filter === t ? '#fff' : '#6e6e6e',
              cursor: 'pointer',
            }}>
              {TYPE_LABELS[t]}{count > 0 && <span style={{ marginLeft: '4px', opacity: 0.5 }}>{count}</span>}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: '80px', background: '#161616', borderRadius: '6px', opacity: 0.5 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '52px 24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
          <p style={{ fontSize: '20px', marginBottom: '10px' }}>☁︎</p>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '6px' }}>
            {filter === 'all' ? '아직 기록이 없어요' : `${TYPE_LABELS[filter]} 기록이 없어요`}
          </p>
          <p style={{ fontSize: '12px', color: '#6e6e6e', marginBottom: '24px', lineHeight: 1.7 }}>
            기록 페이지에서 생각을 꺼내보세요
          </p>
          <Link href="/capture" style={{ display: 'inline-block', fontSize: '13px', padding: '9px 22px', background: '#faff69', color: '#111', borderRadius: '4px', fontWeight: 600 }}>
            기록하러 가기
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filtered.map(note => (
            <Link key={note.id} href={`/notes/${note.id}`} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: '14px 16px', background: '#111',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '6px', cursor: 'pointer', transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em',
                    padding: '2px 6px', borderRadius: '3px',
                    background: `${TYPE_COLORS[note.note_type]}22`,
                    color: TYPE_COLORS[note.note_type],
                  }}>
                    {TYPE_LABELS[note.note_type]}
                  </span>
                  <span style={{ fontSize: '11px', color: '#484848' }}>{formatDate(note.created_at)}</span>
                  {note.ai_summary && (
                    <span style={{ fontSize: '10px', color: '#484848', marginLeft: 'auto' }}>AI 분석됨</span>
                  )}
                </div>
                <p style={{
                  fontSize: '13px', color: '#d0d0d0', lineHeight: 1.5, margin: 0,
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {note.raw_content}
                </p>
                {note.ai_summary?.short_summary && (
                  <p style={{ fontSize: '11px', color: '#6e6e6e', marginTop: '6px' }}>
                    {note.ai_summary.short_summary}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
