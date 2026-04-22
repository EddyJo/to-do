'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { NoteType } from '@/types'

const noteTypes: { value: NoteType; label: string }[] = [
  { value: 'memo', label: '📝 메모' },
  { value: 'meeting', label: '🗣️ 회의록' },
  { value: 'idea', label: '💡 아이디어' },
]

interface NoteEditorProps {
  taskId?: string
  onSubmit: (content: string, type: NoteType) => Promise<void>
  isLoading?: boolean
}

export function NoteEditor({ taskId, onSubmit, isLoading }: NoteEditorProps) {
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState<NoteType>('memo')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    await onSubmit(content, noteType)
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        {noteTypes.map(t => (
          <button key={t.value} type="button"
            onClick={() => setNoteType(t.value)}
            className={`text-xs px-3 py-1.5 rounded border transition-all ${
              noteType === t.value
                ? 'bg-[#161600] text-[#faff69] border-[#4f5100]'
                : 'bg-transparent text-[#a0a0a0] border-[rgba(65,65,65,0.8)] hover:border-[#a0a0a0]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="회의 내용, 아이디어, 고민 등을 자유롭게 적어주세요. AI가 실행 항목을 추출해드립니다."
        rows={6}
        className="w-full bg-[#141414] border border-[rgba(65,65,65,0.8)] rounded-lg p-3 text-sm text-white placeholder:text-[#414141] resize-none focus:outline-none focus:border-[#faff69] transition-colors"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#a0a0a0]">{content.length}자 · AI가 자동으로 분석합니다</span>
        <Button variant="neon" type="submit" disabled={!content.trim() || isLoading}>
          {isLoading ? '분석 중...' : '저장 및 AI 분석'}
        </Button>
      </div>
    </form>
  )
}
