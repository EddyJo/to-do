import { describe, it, expect } from 'vitest'

// avoidance_score 계산 로직 단위 테스트
// formula: importance * 2 + reluctance_score + snoozed_count * 0.5
function calcAvoidanceScore(importance: number, reluctance: number, snoozed = 0) {
  return importance * 2 + reluctance + snoozed * 0.5
}

describe('avoidance score calculation', () => {
  it('highest importance + max reluctance = highest score', () => {
    const high = calcAvoidanceScore(5, 10, 0)
    const low = calcAvoidanceScore(1, 0, 0)
    expect(high).toBeGreaterThan(low)
  })

  it('snoozed count increases avoidance score', () => {
    const base = calcAvoidanceScore(3, 5, 0)
    const snoozed = calcAvoidanceScore(3, 5, 4)
    expect(snoozed).toBeGreaterThan(base)
  })

  it('formula is correct', () => {
    // importance=3, reluctance=7, snoozed=2 → 3*2 + 7 + 2*0.5 = 14
    expect(calcAvoidanceScore(3, 7, 2)).toBe(14)
  })

  it('zero values produce minimum score', () => {
    expect(calcAvoidanceScore(0, 0, 0)).toBe(0)
  })
})
