'use client'
import { AISuggestion } from '@/types'

const urgencyLabel: Record<string, string> = {
  today:     '오늘 안에',
  this_week: '이번 주',
  later:     '나중에',
}
const urgencyColor: Record<string, string> = {
  today:     '#ef4444',
  this_week: '#f59e0b',
  later:     '#6e6e6e',
}

function ReluctanceDots({ score }: { score: number }) {
  const filled = Math.round(score / 2)
  return (
    <span style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: i < filled ? '#faff69' : '#2a2a2a',
          display: 'inline-block',
        }} />
      ))}
    </span>
  )
}

interface Props {
  suggestion: AISuggestion
  onApprove: (s: AISuggestion) => void
  onReject: (id: string) => void
  onDefer: (id: string) => void
}

export function AISuggestionCard({ suggestion, onApprove, onReject, onDefer }: Props) {
  const st = suggestion.suggestion_todos?.[0]
  const urgency = st?.urgency_hint
  const accentColor = urgency ? urgencyColor[urgency] : 'rgba(250,255,105,0.4)'

  return (
    <div style={{
      background: '#111',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* urgency accent bar */}
      <div style={{ height: '2px', background: accentColor, opacity: 0.8 }} />

      {/* content */}
      <div style={{ padding: '16px 16px 14px' }}>
        {urgency && (
          <span style={{
            display: 'inline-block', marginBottom: '10px',
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em',
            color: urgencyColor[urgency],
            background: `${urgencyColor[urgency]}18`,
            padding: '3px 8px', borderRadius: '99px',
          }}>
            {urgencyLabel[urgency]}
          </span>
        )}

        <p style={{
          fontSize: '15px', fontWeight: 500, color: '#f0f0f0',
          lineHeight: 1.55, margin: 0, wordBreak: 'keep-all',
          marginBottom: st ? '12px' : '0',
        }}>
          {st?.generated_todo_title ?? suggestion.content}
        </p>

        {st && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#555' }}>하기 싫음</span>
              <ReluctanceDots score={st.reluctance_score} />
            </div>
            <span style={{ color: '#2a2a2a', fontSize: '10px' }}>|</span>
            <span style={{ fontSize: '11px', color: '#555' }}>
              중요도 <span style={{ color: '#9a9a9a', fontWeight: 600 }}>{st.importance}</span>/5
            </span>
            {st.estimated_minutes && (
              <>
                <span style={{ color: '#2a2a2a', fontSize: '10px' }}>|</span>
                <span style={{ fontSize: '11px', color: '#555' }}>{st.estimated_minutes}분</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* actions */}
      <div style={{
        display: 'flex', gap: '8px', padding: '0 16px 16px',
        alignItems: 'center',
      }}>
        <button
          onClick={() => onApprove(suggestion)}
          style={{
            flex: 1, padding: '11px 0', borderRadius: '8px',
            background: '#faff69', color: '#111',
            fontSize: '13px', fontWeight: 700, border: 'none',
            cursor: 'pointer', letterSpacing: '0.02em',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          할게요
        </button>
        <button
          onClick={() => onDefer(suggestion.id)}
          style={{
            padding: '11px 16px', borderRadius: '8px',
            background: 'transparent', color: '#6e6e6e',
            fontSize: '13px', fontWeight: 500,
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#6e6e6e'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          나중에
        </button>
        <button
          onClick={() => onReject(suggestion.id)}
          style={{
            padding: '11px 14px', borderRadius: '8px',
            background: 'transparent', color: '#484848',
            fontSize: '13px', fontWeight: 500,
            border: '1px solid rgba(255,255,255,0.05)',
            cursor: 'pointer', transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#484848' }}
        >
          아니에요
        </button>
      </div>
    </div>
  )
}
