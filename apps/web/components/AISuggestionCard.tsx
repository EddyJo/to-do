'use client'
import { AISuggestion } from '@/types'
import { Button } from '@/components/ui/Button'

const urgencyLabel: Record<string, string> = {
  today:     '오늘 안에',
  this_week: '이번 주',
  later:     '언젠가',
}
const urgencyColor: Record<string, string> = {
  today:     '#ef4444',
  this_week: '#f59e0b',
  later:     '#6e6e6e',
}

function dots(score: number) {
  const filled = Math.round(score / 2)
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < filled ? '#faff69' : '#2a2a2a', fontSize: '9px' }}>●</span>
  ))
}

interface Props {
  suggestion: AISuggestion
  onApprove: (s: AISuggestion) => void
  onReject: (id: string) => void
  onDefer: (id: string) => void
}

export function AISuggestionCard({ suggestion, onApprove, onReject, onDefer }: Props) {
  const st = suggestion.suggestion_todos?.[0]
  return (
    <div style={{ padding: '14px 16px', background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderLeft: '2px solid rgba(250,255,105,0.3)', borderRadius: '6px' }}>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          {st?.urgency_hint && (
            <span style={{ fontSize: '11px', fontWeight: 500, color: urgencyColor[st.urgency_hint] }}>
              {urgencyLabel[st.urgency_hint]}
            </span>
          )}
          {st?.schedule_impact && (
            <span style={{ fontSize: '11px', color: '#f59e0b' }}>· {st.schedule_impact}</span>
          )}
        </div>

        <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '4px', lineHeight: 1.4, wordBreak: 'keep-all' }}>
          {st?.generated_todo_title ?? suggestion.content}
        </p>

        {st && suggestion.content && (
          <p style={{ fontSize: '12px', color: '#6e6e6e', lineHeight: 1.5 }}>{suggestion.content}</p>
        )}

        {st && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: '#6e6e6e' }}>하기 싫음</span>
              <span style={{ display: 'flex', gap: '2px' }}>{dots(st.reluctance_score)}</span>
              <span style={{ fontSize: '11px', color: '#faff69', fontFamily: 'monospace' }}>{st.reluctance_score}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: '#6e6e6e' }}>중요도</span>
              <span style={{ fontSize: '11px', color: '#9a9a9a', fontFamily: 'monospace' }}>{st.importance}/5</span>
            </div>
            {st.estimated_minutes && (
              <span style={{ fontSize: '11px', color: '#6e6e6e' }}>{st.estimated_minutes}분 예상</span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '6px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Button variant="neon" size="sm" onClick={() => onApprove(suggestion)}>할게요</Button>
        <Button variant="ghost" size="sm" onClick={() => onDefer(suggestion.id)}>나중에</Button>
        <Button variant="danger" size="sm" onClick={() => onReject(suggestion.id)}>아니에요</Button>
      </div>
    </div>
  )
}
