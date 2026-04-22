// User instruction: "ai통해 action item 뽑고 내가 하기 싫어할것 같은 일과 시급도, 중요도, 업무 일정 영향 등을 바탕으로 todo뽑아서 제안해주는거야"
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseAIResponse, buildExtractionPrompt } from '@/lib/ai/extract'

describe('parseAIResponse', () => {
  it('parses valid JSON response into ExtractedItems', () => {
    const raw = JSON.stringify({
      items: [
        {
          title: '분기 보고서 작성',
          description: '3분기 실적 보고서 초안 작성',
          reluctance_score: 8,
          importance: 4,
          estimated_minutes: 120,
          schedule_impact: '이번 주 금요일 임원 보고',
          urgency_hint: 'this_week',
        },
      ],
    })
    const result = parseAIResponse(raw)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('분기 보고서 작성')
    expect(result[0].reluctance_score).toBeGreaterThanOrEqual(0)
    expect(result[0].reluctance_score).toBeLessThanOrEqual(10)
    expect(result[0].importance).toBeGreaterThanOrEqual(1)
    expect(result[0].importance).toBeLessThanOrEqual(5)
  })

  it('clamps reluctance_score to 0-10 range', () => {
    const raw = JSON.stringify({ items: [{ title: 'test', description: '', reluctance_score: 15, importance: 3 }] })
    const result = parseAIResponse(raw)
    expect(result[0].reluctance_score).toBe(10)
  })

  it('clamps importance to 1-5 range', () => {
    const raw = JSON.stringify({ items: [{ title: 'test', description: '', reluctance_score: 5, importance: 0 }] })
    const result = parseAIResponse(raw)
    expect(result[0].importance).toBe(1)
  })

  it('returns empty array for invalid JSON', () => {
    const result = parseAIResponse('not json')
    expect(result).toEqual([])
  })

  it('returns empty array for missing items field', () => {
    const result = parseAIResponse(JSON.stringify({ other: [] }))
    expect(result).toEqual([])
  })
})

describe('buildExtractionPrompt', () => {
  it('includes raw content in prompt', () => {
    const prompt = buildExtractionPrompt('내일 팀장 미팅 준비해야함')
    expect(prompt).toContain('내일 팀장 미팅 준비해야함')
  })

  it('instructs JSON output format', () => {
    const prompt = buildExtractionPrompt('test')
    expect(prompt.toLowerCase()).toContain('json')
  })
})
