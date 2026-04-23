// User instruction: "tc로 확인하고 그다음 로컬에서 확인하고 그다음 서버에 배포해"
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock next/navigation
vi.mock('next/navigation', () => ({ usePathname: () => '/review', useRouter: () => ({}) }))

describe('ReviewPage — suggestions fetch', () => {
  beforeEach(() => { mockFetch.mockReset() })

  it('shows suggestions when API returns array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        {
          id: 'sug-1',
          content: '보고서 작성',
          status: 'pending',
          suggestion_todos: [{
            id: 'st-1',
            generated_todo_title: '주간 보고서 작성',
            generated_todo_description: '이번 주 성과 정리',
            reluctance_score: 7,
            importance: 4,
            estimated_minutes: 60,
            urgency_hint: 'today',
            approved_yn: false,
          }],
        },
      ]),
    })

    const { default: ReviewPage } = await import('@/app/review/page')
    render(<ReviewPage />)

    await waitFor(() => {
      expect(screen.getByText('주간 보고서 작성')).toBeInTheDocument()
    })
    expect(screen.getByText('할게요')).toBeInTheDocument()
    expect(screen.getByText('오늘 안에')).toBeInTheDocument()
  })

  it('shows empty state when API returns empty array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([]),
    })

    const { default: ReviewPage } = await import('@/app/review/page')
    render(<ReviewPage />)

    await waitFor(() => {
      expect(screen.getByText('확인할 제안이 없어요')).toBeInTheDocument()
    })
  })

  it('shows error state when API returns non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Failed' }),
    })

    const { default: ReviewPage } = await import('@/app/review/page')
    render(<ReviewPage />)

    await waitFor(() => {
      expect(screen.getByText('제안을 불러오지 못했어요')).toBeInTheDocument()
    })
  })

  it('does NOT crash when API returns error object instead of array', async () => {
    // Bug case: API returns { error: '...' } but page does setSuggestions(data) without Array check
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: 'some server error' }),
    })

    const { default: ReviewPage } = await import('@/app/review/page')
    // Should not throw
    expect(() => render(<ReviewPage />)).not.toThrow()

    await waitFor(() => {
      // Should show empty or error, not crash
      expect(screen.queryByText('할게요')).not.toBeInTheDocument()
    })
  })

  it('shows suggestion content as fallback when no suggestion_todos', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        {
          id: 'sug-2',
          content: '팀 미팅 준비',
          status: 'pending',
          suggestion_todos: [],
        },
      ]),
    })

    const { default: ReviewPage } = await import('@/app/review/page')
    render(<ReviewPage />)

    await waitFor(() => {
      expect(screen.getByText('팀 미팅 준비')).toBeInTheDocument()
    })
  })
})
