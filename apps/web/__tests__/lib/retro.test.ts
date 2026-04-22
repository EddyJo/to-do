// User: "하루가 시작할때 아침 8시 이후 첫 접속시에 어제 todo list 처리한 내용들에 대한 회고 내용이 ai생성을 통해 나왔으면 좋겠어"
import { describe, it, expect } from 'vitest'
import { shouldShowRetro, buildRetroPrompt, parseRetroResponse } from '@/lib/retro/utils'

describe('shouldShowRetro', () => {
  it('returns true after 8 AM and not seen today', () => {
    const now = new Date('2026-04-22T09:00:00')
    expect(shouldShowRetro(now, null)).toBe(true)
  })

  it('returns false before 8 AM', () => {
    const now = new Date('2026-04-22T07:59:00')
    expect(shouldShowRetro(now, null)).toBe(false)
  })

  it('returns false if already seen today', () => {
    const now = new Date('2026-04-22T09:00:00')
    expect(shouldShowRetro(now, '2026-04-22')).toBe(false)
  })

  it('returns true after 8 AM if last seen yesterday', () => {
    const now = new Date('2026-04-22T09:00:00')
    expect(shouldShowRetro(now, '2026-04-21')).toBe(true)
  })

  it('returns true at exactly 8 AM', () => {
    const now = new Date('2026-04-22T08:00:00')
    expect(shouldShowRetro(now, null)).toBe(true)
  })
})

describe('buildRetroPrompt', () => {
  it('includes completed todo titles', () => {
    const prompt = buildRetroPrompt(['보고서 작성', '미팅 준비'], [])
    expect(prompt).toContain('보고서 작성')
    expect(prompt).toContain('미팅 준비')
  })

  it('includes pending todo titles', () => {
    const prompt = buildRetroPrompt([], ['QA 테스트', '온보딩 자료'])
    expect(prompt).toContain('QA 테스트')
    expect(prompt).toContain('온보딩 자료')
  })

  it('signals zero completion when nothing done', () => {
    const prompt = buildRetroPrompt([], ['할 일 A'])
    expect(prompt.toLowerCase()).toMatch(/0|없음|아무것도/)
  })
})

describe('parseRetroResponse', () => {
  it('parses valid JSON response', () => {
    const raw = JSON.stringify({
      mood: 'encouraging',
      message: '어제 정말 잘 해냈어요! 오늘도 이어가봐요.',
      highlight: '작은 완주가 쌓입니다',
    })
    const result = parseRetroResponse(raw)
    expect(result).not.toBeNull()
    expect(result!.mood).toBe('encouraging')
    expect(result!.highlight).toBe('작은 완주가 쌓입니다')
  })

  it('handles markdown-wrapped JSON', () => {
    const raw = '```json\n{"mood":"concern","message":"리스크가 있어요","highlight":"오늘은 꼭"}\n```'
    const result = parseRetroResponse(raw)
    expect(result).not.toBeNull()
    expect(result!.mood).toBe('concern')
  })

  it('returns null for invalid JSON', () => {
    expect(parseRetroResponse('not json at all')).toBeNull()
  })

  it('clamps mood to valid values', () => {
    const raw = JSON.stringify({ mood: 'unknown', message: 'test', highlight: 'hi' })
    const result = parseRetroResponse(raw)
    expect(['encouraging', 'mixed', 'concern']).toContain(result!.mood)
  })
})
