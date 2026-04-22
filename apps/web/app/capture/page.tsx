'use client'
// User instruction: "내가 오늘 할일이나 업무 회의록, 업무 내용 등에 대해 이야기하면 해당 내용 바탕으로 todo생성해주는거야"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { NoteType } from '@/types'

const NOTE_TYPES: { value: NoteType; label: string; desc: string }[] = [
  { value: 'memo',    label: '📝 메모',     desc: '할 일, 생각, 계획' },
  { value: 'meeting', label: '🗣 회의록',   desc: '회의 내용, 결정사항' },
  { value: 'idea',    label: '💡 아이디어', desc: '브레인스토밍, 구상' },
]

const PLACEHOLDER = `예시:
• 오늘 팀장한테 3분기 보고서 제출해야 하는데 계속 미루고 있음
• 내일 오전 10시 클라이언트 미팅 전에 제안서 검토 필요
• 서버 배포 QA 아직 못 했고 이번 주 금요일이 데드라인
• 신규 입사자 온보딩 자료 만들어야 하는데 언제할지 모르겠음`

export default function CapturePage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState<NoteType>('memo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, note_type: noteType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '오류가 발생했습니다')
      router.push('/review')
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">할 일 입력</h1>
        <p className="text-sm text-[#a0a0a0] mt-1">
          오늘 할 일, 회의 내용, 업무 메모를 자유롭게 적으면 AI가 Todo를 추출해드립니다
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Note type selector */}
        <div className="flex gap-2">
          {NOTE_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setNoteType(t.value)}
              className={[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors border',
                noteType === t.value
                  ? 'bg-[#faff69] text-[#151515] border-[#faff69]'
                  : 'bg-transparent text-[#a0a0a0] border-[#343434] hover:border-[#a0a0a0]',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Main textarea */}
        <div className="relative">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={12}
            disabled={loading}
            className={[
              'w-full bg-[#141414] border rounded-lg px-4 py-3 text-white text-sm',
              'placeholder:text-[#414141] resize-none leading-relaxed',
              'focus:outline-none focus:ring-1 focus:ring-[#faff69] transition-colors',
              loading ? 'opacity-50 cursor-not-allowed border-[#343434]' : 'border-[#343434] hover:border-[#414141]',
            ].join(' ')}
          />
          <span className="absolute bottom-3 right-3 text-xs text-[#414141]">
            {content.length}자
          </span>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!content.trim() || loading}
          className={[
            'w-full py-3 rounded-lg font-semibold text-sm transition-all',
            !content.trim() || loading
              ? 'bg-[#343434] text-[#414141] cursor-not-allowed'
              : 'bg-[#faff69] text-[#151515] hover:bg-[#f4f692] active:scale-[0.98]',
          ].join(' ')}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-[#414141] border-t-transparent rounded-full animate-spin" />
              AI 분석 중...
            </span>
          ) : (
            'AI로 Todo 추출하기'
          )}
        </button>
      </form>

      <div className="border-t border-[#343434] pt-5">
        <p className="text-xs text-[#414141] leading-relaxed">
          입력한 내용은 원문 그대로 저장됩니다. AI가 실행 항목을 추출하면 Review Queue에서 
          승인/거절할 수 있습니다. 승인한 항목만 Todo로 등록됩니다.
        </p>
      </div>
    </div>
  )
}
