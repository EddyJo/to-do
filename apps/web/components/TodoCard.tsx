'use client'
import { Todo } from '@/types'

interface TodoCardProps {
  todo: Todo
  featured?: boolean
  onStart?: (id: string) => void
  onSnooze?: (id: string) => void
  onDone?: (id: string) => void
}

function ReluctanceDots({ score }: { score: number }) {
  const filled = Math.round(score / 2)
  return (
    <span style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: i < filled ? 'rgba(250,255,105,0.7)' : '#2a2a2a',
          display: 'inline-block', flexShrink: 0,
        }} />
      ))}
    </span>
  )
}

export function TodoCard({ todo, featured, onStart, onSnooze, onDone }: TodoCardProps) {
  const inProgress = todo.status === 'in_progress'

  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: '10px',
      border: featured
        ? '1px solid rgba(250,255,105,0.2)'
        : '1px solid rgba(255,255,255,0.06)',
      borderLeft: featured ? '2px solid rgba(250,255,105,0.5)' : undefined,
      background: featured ? 'rgba(250,255,105,0.02)' : '#111',
    }}>
      {/* 상단 메타 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        {featured && (
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#faff69', textTransform: 'uppercase' }}>
            1순위
          </span>
        )}
        {inProgress && (
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#4a9eff', letterSpacing: '0.06em' }}>진행중</span>
        )}
        {todo.source === 'ai-extracted' && (
          <span style={{ fontSize: '10px', color: '#484848' }}>AI</span>
        )}
        {todo.snoozed_count > 0 && (
          <span style={{ fontSize: '10px', color: '#484848' }}>{todo.snoozed_count}번 미룸</span>
        )}
      </div>

      {/* 제목 */}
      <p style={{
        fontSize: '14px',
        fontWeight: featured ? 500 : 400,
        color: '#f0f0f0',
        lineHeight: 1.55,
        margin: '0 0 12px',
        wordBreak: 'keep-all',
      }}>
        {todo.title}
      </p>

      {/* 하단: 귀찮음 점수 + 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ReluctanceDots score={todo.reluctance_score} />

        <div style={{ flex: 1 }} />

        {onSnooze && !inProgress && (
          <button
            onClick={() => onSnooze(todo.id)}
            style={{
              padding: '7px 12px', borderRadius: '6px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
              color: '#6e6e6e', fontSize: '12px', cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#aaa')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6e6e6e')}
          >
            미루기
          </button>
        )}

        {inProgress && onDone && (
          <button
            onClick={() => onDone(todo.id)}
            style={{
              padding: '7px 16px', borderRadius: '6px',
              background: '#4ade80', border: 'none',
              color: '#111', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
            }}
          >
            완료
          </button>
        )}

        {!inProgress && onStart && (
          <button
            onClick={() => onStart(todo.id)}
            style={{
              padding: '7px 16px', borderRadius: '6px',
              background: featured ? '#faff69' : 'rgba(255,255,255,0.08)',
              border: 'none',
              color: featured ? '#111' : '#d0d0d0',
              fontSize: '12px', fontWeight: featured ? 700 : 500,
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            시작할게요
          </button>
        )}
      </div>
    </div>
  )
}
