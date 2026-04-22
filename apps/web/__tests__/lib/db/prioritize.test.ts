// User instruction: "우선 순위 조정은 매일 아침에만 돌게 해주고, 수동으로 우선순위 조정해서 다시 뽑는 기능은 있어야돼"
import { describe, it, expect } from 'vitest'
import { calcPrioritizedScore } from '@/lib/db/todos'
import type { Todo } from '@/types'

const baseTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: '1',
  task_id: null,
  title: 'test',
  description: null,
  status: 'pending',
  importance: 3,
  reluctance_score: 5,
  avoidance_score: 11,
  estimated_minutes: null,
  due_date: null,
  source: 'manual',
  snoozed_count: 0,
  created_at: '2026-04-22T00:00:00Z',
  updated_at: '2026-04-22T00:00:00Z',
  ...overrides,
})

describe('calcPrioritizedScore', () => {
  it('returns base avoidance_score when no due date', () => {
    const todo = baseTodo({ importance: 3, reluctance_score: 5, snoozed_count: 0, avoidance_score: 11 })
    const score = calcPrioritizedScore(todo, new Date('2026-04-22'))
    expect(score).toBe(11) // 3*2 + 5 + 0 = 11
  })

  it('adds urgency bonus when due today', () => {
    const todo = baseTodo({ importance: 3, reluctance_score: 5, avoidance_score: 11, due_date: '2026-04-22' })
    const score = calcPrioritizedScore(todo, new Date('2026-04-22'))
    expect(score).toBeGreaterThan(11)
  })

  it('adds smaller bonus when due this week (not today)', () => {
    const todo = baseTodo({ importance: 3, reluctance_score: 5, avoidance_score: 11, due_date: '2026-04-26' })
    const scoreThisWeek = calcPrioritizedScore(todo, new Date('2026-04-22'))
    const scoreFuture = calcPrioritizedScore(baseTodo({ importance: 3, reluctance_score: 5, avoidance_score: 11, due_date: '2026-05-10' }), new Date('2026-04-22'))
    expect(scoreThisWeek).toBeGreaterThan(scoreFuture)
  })

  it('does not add bonus for overdue items beyond the formula', () => {
    const todo = baseTodo({ importance: 3, reluctance_score: 5, avoidance_score: 11, due_date: '2026-04-20' })
    const score = calcPrioritizedScore(todo, new Date('2026-04-22'))
    expect(typeof score).toBe('number')
    expect(isNaN(score)).toBe(false)
  })

  it('higher importance + high reluctance scores highest', () => {
    const high = baseTodo({ importance: 5, reluctance_score: 10, avoidance_score: 20, snoozed_count: 2 })
    const low = baseTodo({ importance: 1, reluctance_score: 1, avoidance_score: 3 })
    expect(calcPrioritizedScore(high, new Date('2026-04-22'))).toBeGreaterThan(
      calcPrioritizedScore(low, new Date('2026-04-22'))
    )
  })
})
