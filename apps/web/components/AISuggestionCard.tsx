'use client'
import { AISuggestion } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

const typeLabel: Record<string, string> = {
  action_item: '액션 아이템',
  todo: 'Todo 후보',
  follow_up: '확인 필요',
  decision: '의사결정 필요',
}

interface AISuggestionCardProps {
  suggestion: AISuggestion
  onApprove: (s: AISuggestion) => void
  onReject: (id: string) => void
  onDefer: (id: string) => void
}

export function AISuggestionCard({ suggestion, onApprove, onReject, onDefer }: AISuggestionCardProps) {
  return (
    <Card surface className="border-l-2 border-l-[#faff69]">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="neon">{typeLabel[suggestion.suggestion_type] ?? suggestion.suggestion_type}</Badge>
            {suggestion.note && (
              <span className="text-xs text-[#a0a0a0] line-clamp-1">{suggestion.note.raw_content.slice(0, 40)}…</span>
            )}
          </div>
          <p className="text-sm text-white leading-relaxed">{suggestion.content}</p>
          {suggestion.suggestion_todos?.map(st => (
            <div key={st.id} className="mt-2 pl-3 border-l border-[#343434]">
              <p className="text-xs text-[#faff69]">Todo: {st.generated_todo_title}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-[#343434]">
        <Button variant="neon" size="sm" onClick={() => onApprove(suggestion)}>승인</Button>
        <Button variant="ghost" size="sm" onClick={() => onDefer(suggestion.id)}>나중에</Button>
        <Button variant="danger" size="sm" onClick={() => onReject(suggestion.id)}>삭제</Button>
      </div>
    </Card>
  )
}
