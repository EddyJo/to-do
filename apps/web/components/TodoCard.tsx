'use client'
import { useState, useRef } from 'react'
import { Todo } from '@/types'

interface TodoCardProps {
  todo: Todo
  featured?: boolean
  onStart?: (id: string) => void
  onSnooze?: (id: string) => void
  onDone?: (id: string) => void
}

export function TodoCard({ todo, featured, onStart, onSnooze, onDone }: TodoCardProps) {
  const [swipeX, setSwipeX] = useState(0)
  const [checking, setChecking] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isDragging = useRef(false)
  const isScrolling = useRef<boolean | null>(null)

  const inProgress = todo.status === 'in_progress'
  const SNOOZE_TRIGGER = 80

  function handleCheck() {
    if (checking) return
    setChecking(true)
    setTimeout(() => onDone?.(todo.id), 280)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isDragging.current = true
    isScrolling.current = null
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!isDragging.current || !onSnooze) return
    const dx = touchStartX.current - e.touches[0].clientX
    const dy = Math.abs(touchStartY.current - e.touches[0].clientY)

    // Determine if vertical scroll or horizontal swipe on first movement
    if (isScrolling.current === null) {
      isScrolling.current = dy > Math.abs(dx)
    }
    if (isScrolling.current) return

    e.preventDefault()
    if (dx > 0) {
      setSwipeX(Math.min(dx, 96))
    } else {
      setSwipeX(0)
    }
  }

  function handleTouchEnd() {
    isDragging.current = false
    if (!isScrolling.current && swipeX >= SNOOZE_TRIGGER && onSnooze) {
      setSwipeX(96)
      setTimeout(() => {
        onSnooze(todo.id)
        setSwipeX(0)
      }, 120)
    } else {
      setSwipeX(0)
    }
    isScrolling.current = null
  }

  const snoozeProgress = Math.min(swipeX / SNOOZE_TRIGGER, 1)

  return (
    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>

      {/* Snooze layer behind card */}
      {onSnooze && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          paddingRight: '20px',
          background: `rgba(80,80,80,${0.08 + snoozeProgress * 0.15})`,
          borderRadius: '12px',
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            opacity: snoozeProgress,
            transform: `scale(${0.7 + snoozeProgress * 0.3})`,
            transition: swipeX === 0 ? 'opacity 0.2s, transform 0.2s' : 'none',
          }}>
            <span style={{ fontSize: '18px' }}>💤</span>
            <span style={{ fontSize: '10px', color: '#9a9a9a', fontWeight: 500 }}>미루기</span>
          </div>
        </div>
      )}

      {/* Sliding card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'flex', alignItems: 'center', gap: '13px',
          padding: featured ? '15px 14px' : '12px 14px',
          borderRadius: '12px',
          border: featured
            ? '1px solid rgba(250,255,105,0.22)'
            : '1px solid rgba(255,255,255,0.07)',
          background: featured ? 'rgba(250,255,105,0.03)' : '#111',
          transform: `translateX(-${swipeX}px)`,
          transition: swipeX === 0 && !isDragging.current ? 'transform 0.25s cubic-bezier(.25,.46,.45,.94), opacity 0.25s' : 'none',
          opacity: checking ? 0 : 1,
          willChange: 'transform',
          touchAction: 'pan-y',
          userSelect: 'none',
        }}
      >
        {/* Check circle */}
        <button
          onClick={handleCheck}
          style={{
            flexShrink: 0,
            width: '28px', height: '28px',
            borderRadius: '50%',
            border: checking
              ? 'none'
              : inProgress
                ? '2px solid #4a9eff'
                : featured
                  ? '2px solid rgba(250,255,105,0.55)'
                  : '1.5px solid rgba(255,255,255,0.22)',
            background: checking
              ? '#4ade80'
              : inProgress
                ? 'rgba(74,158,255,0.08)'
                : 'transparent',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            touchAction: 'manipulation',
            transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
            transform: checking ? 'scale(1.1)' : 'scale(1)',
            padding: 0,
          }}
        >
          {(inProgress || checking) && (
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M2.5 6.5L5 9 10.5 3.5"
                stroke={checking ? '#111' : '#4a9eff'}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {/* Text content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Badge row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '1px', flexWrap: 'wrap' }}>
            {featured && (
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: '#faff69', textTransform: 'uppercase' }}>
                1순위
              </span>
            )}
            {inProgress && (
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#4a9eff', letterSpacing: '0.05em' }}>진행중</span>
            )}
            {todo.source === 'ai-extracted' && (
              <span style={{ fontSize: '9px', color: '#484848' }}>AI</span>
            )}
            {todo.snoozed_count > 0 && (
              <span style={{ fontSize: '9px', color: '#484848' }}>{todo.snoozed_count}번 넘겼어요</span>
            )}
          </div>

          {/* Title */}
          <p style={{
            fontSize: featured ? '15px' : '14px',
            fontWeight: featured ? 500 : 400,
            color: checking ? '#484848' : '#f0f0f0',
            lineHeight: 1.4,
            wordBreak: 'keep-all',
            textDecoration: checking ? 'line-through' : 'none',
            transition: 'color 0.15s',
          }}>
            {todo.title}
          </p>

          {/* Reluctance + meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', color: reluctanceColor(todo.reluctance_score) }}>
              {reluctanceText(todo.reluctance_score)}
            </span>
            {todo.estimated_minutes && (
              <span style={{ fontSize: '11px', color: '#484848' }}>약 {todo.estimated_minutes}분</span>
            )}
          </div>
        </div>

        {/* Reluctance score pill */}
        <div style={{
          flexShrink: 0,
          width: '26px', height: '26px',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)',
          border: `1.5px solid ${
            todo.reluctance_score >= 8 ? 'rgba(250,255,105,0.5)' :
            todo.reluctance_score >= 6 ? 'rgba(245,158,11,0.45)' :
            todo.reluctance_score >= 4 ? 'rgba(239,68,68,0.35)' :
            'rgba(255,255,255,0.1)'
          }`,
          color: todo.reluctance_score >= 8 ? '#faff69' :
                 todo.reluctance_score >= 6 ? '#f59e0b' :
                 todo.reluctance_score >= 4 ? '#ef4444' : '#484848',
        }}>
          {todo.reluctance_score}
        </div>
      </div>
    </div>
  )
}

function reluctanceText(score: number): string {
  if (score >= 8) return '정말 하기 싫음'
  if (score >= 6) return '좀 하기 싫음'
  if (score >= 4) return '살짝 귀찮음'
  return '할 만해요'
}

function reluctanceColor(score: number): string {
  if (score >= 8) return 'var(--color-neon-volt)'
  if (score >= 6) return '#f59e0b'
  if (score >= 4) return '#ef4444'
  return '#6e6e6e'
}
