'use client'
import { Todo } from '@/types'
import { Button } from '@/components/ui/Button'
import { reluctanceColor } from '@/lib/utils'

interface TodoCardProps {
  todo: Todo
  featured?: boolean
  onStart?: (id: string) => void
  onSnooze?: (id: string) => void
  onDone?: (id: string) => void
}

export function TodoCard({ todo, featured, onStart, onSnooze, onDone }: TodoCardProps) {
  return (
    <div style={{
      padding: featured ? '14px 16px' : '10px 14px',
      borderRadius: '6px',
      border: featured ? '1px solid rgba(250,255,105,0.25)' : '1px solid var(--color-border)',
      background: featured ? 'rgba(250,255,105,0.03)' : 'var(--color-surface)',
      transition: 'border-color 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>

        {/* Score indicator */}
        <div style={{
          flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)',
          background: 'var(--color-black)',
          border: `1.5px solid ${
            todo.reluctance_score >= 8 ? 'rgba(250,255,105,0.6)' :
            todo.reluctance_score >= 6 ? 'rgba(245,158,11,0.5)' :
            todo.reluctance_score >= 4 ? 'rgba(239,68,68,0.4)' :
            'rgba(255,255,255,0.1)'
          }`,
          color: todo.reluctance_score >= 8 ? 'var(--color-neon-volt)' :
                 todo.reluctance_score >= 6 ? '#f59e0b' :
                 todo.reluctance_score >= 4 ? '#ef4444' : 'var(--color-gray-400)',
        }}>
          {todo.reluctance_score}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
            {featured && (
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-neon-volt)', textTransform: 'uppercase' }}>
                1순위
              </span>
            )}
            {todo.source === 'ai-extracted' && (
              <span style={{ fontSize: '10px', color: 'var(--color-gray-500)' }}>AI</span>
            )}
          </div>

          <p style={{
            fontSize: featured ? '14px' : '13px',
            fontWeight: featured ? 500 : 400,
            color: 'var(--color-white)',
            lineHeight: 1.4,
            wordBreak: 'keep-all',
          }}>
            {todo.title}
          </p>

          {todo.description && (
            <p style={{ fontSize: '12px', color: 'var(--color-gray-400)', marginTop: '3px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {todo.description}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: reluctanceColorHex(todo.reluctance_score) }}>
              {reluctanceText(todo.reluctance_score)}
            </span>
            {todo.estimated_minutes && (
              <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>
                {todo.estimated_minutes}분
              </span>
            )}
            {todo.snoozed_count > 0 && (
              <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>
                {todo.snoozed_count}번 넘겼어요
              </span>
            )}
          </div>
        </div>
      </div>

      {todo.status !== 'done' && (onStart || onDone || onSnooze) && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
          {todo.status === 'pending' && onStart && (
            <Button variant="neon" size="sm" onClick={() => onStart(todo.id)}>
              {featured ? '지금 할게요' : '시작할게요'}
            </Button>
          )}
          {todo.status === 'in_progress' && onDone && (
            <Button variant="neon" size="sm" onClick={() => onDone(todo.id)}>완료</Button>
          )}
          {onSnooze && (
            <Button variant="ghost" size="sm" onClick={() => onSnooze(todo.id)}>미루기</Button>
          )}
        </div>
      )}
    </div>
  )
}

function reluctanceText(score: number): string {
  if (score >= 8) return '정말 하기 싫음'
  if (score >= 6) return '좀 하기 싫음'
  if (score >= 4) return '살짝 귀찮음'
  return '할 만해요'
}

function reluctanceColorHex(score: number): string {
  if (score >= 8) return 'var(--color-neon-volt)'
  if (score >= 6) return '#f59e0b'
  if (score >= 4) return '#ef4444'
  return 'var(--color-gray-500)'
}
