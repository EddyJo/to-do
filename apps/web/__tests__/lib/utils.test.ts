import { describe, it, expect } from 'vitest'
import { reluctanceColor, reluctanceLabel, statusLabel, formatDate } from '@/lib/utils'

describe('reluctanceColor', () => {
  it('returns low class for score 0-3', () => {
    expect(reluctanceColor(0)).toBe('reluctance-low')
    expect(reluctanceColor(3)).toBe('reluctance-low')
  })
  it('returns mid class for score 4-6', () => {
    expect(reluctanceColor(4)).toBe('reluctance-mid')
    expect(reluctanceColor(6)).toBe('reluctance-mid')
  })
  it('returns high class for score 7-8', () => {
    expect(reluctanceColor(7)).toBe('reluctance-high')
    expect(reluctanceColor(8)).toBe('reluctance-high')
  })
  it('returns max class for score 9-10', () => {
    expect(reluctanceColor(9)).toBe('reluctance-max')
    expect(reluctanceColor(10)).toBe('reluctance-max')
  })
})

describe('reluctanceLabel', () => {
  it('returns friendly label for low scores', () => {
    expect(reluctanceLabel(1)).toBe('가볍게 할 수 있어요')
  })
  it('returns strong label for max score', () => {
    expect(reluctanceLabel(10)).toBe('정말 하기 싫어요')
  })
})

describe('statusLabel', () => {
  it('maps all known statuses', () => {
    expect(statusLabel('pending')).toBe('대기')
    expect(statusLabel('in_progress')).toBe('진행중')
    expect(statusLabel('done')).toBe('완료')
    expect(statusLabel('snoozed')).toBe('미룸')
  })
  it('returns raw value for unknown status', () => {
    expect(statusLabel('unknown')).toBe('unknown')
  })
})

describe('formatDate', () => {
  it('formats ISO date to Korean short format', () => {
    const result = formatDate('2026-04-22T00:00:00.000Z')
    expect(result).toMatch(/4월|Apr/)
  })
})
