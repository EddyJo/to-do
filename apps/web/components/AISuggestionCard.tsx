'use client'
// User instruction: "내가 하기 싫어할것 같은 일과 시급도, 중요도, 업무 일정 영향 등을 바탕으로 todo뽑아서 제안해주는거야"
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

const urgencyLabel: Record<string, string> = {
  today: '오늘',
  this_week: '이번 주',
  later: '나중에',
}

const urgencyColor: Record<string, string> = {
  today: 'text-[#ef4444]',
  this_week: 'text-[#f59e0b]',
  later: 'text-[#a0a0a0]',
}

function reluctanceDots(score: number) {
  const filled = Math.round(score / 2)
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < filled ? 'text-[#faff69]' : 'text-[#343434]'}>●</span>
  ))
}

interface Props {
  suggestion: AISuggestion
  onApprove: (s: AISuggestion) => void
  onReject: (id: string) => void
  onDefer: (id: string) => void
}

export function AISuggestionCard({ suggestion, onApprove, onReject, onDefer }: Props) {
  const st = suggestion.suggestion_todos?.[0]

  return (
    <Card surface className="border-l-2 border-l-[#faff69]">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="neon">{typeLabel[suggestion.suggestion_type] ?? suggestion.suggestion_type}</Badge>
            {st?.urgency_hint && (
              <span className={`text-xs font-medium ${urgencyColor[st.urgency_hint]}`}>
                {urgencyLabel[st.urgency_hint]}
              </span>
            )}
          </div>

          {/* Title from suggestion_todo */}
          {st && (
            <p className="text-white font-medium mb-1">{st.generated_todo_title}</p>
          )}

          {/* AI reasoning */}
          <p className="text-sm text-[#a0a0a0] leading-relaxed">{suggestion.content}</p>

          {st?.schedule_impact && (
            <p className="text-xs text-[#f59e0b] mt-1">⚠ {st.schedule_impact}</p>
          )}

          {/* Scores row */}
          {st && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#343434]">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#a0a0a0]">회피도</span>
                <span className="text-xs">{reluctanceDots(st.reluctance_score)}</span>
                <span className="text-xs text-[#faff69] font-mono">{st.reluctance_score}/10</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#a0a0a0]">중요도</span>
                <span className="text-xs font-mono text-white">{st.importance}/5</span>
              </div>
              {st.estimated_minutes && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#a0a0a0]">⏱</span>
                  <span className="text-xs text-[#a0a0a0]">{st.estimated_minutes}분</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <Button variant="neon" size="sm" onClick={() => onApprove(suggestion)}>승인 → Backlog</Button>
        <Button variant="ghost" size="sm" onClick={() => onDefer(suggestion.id)}>나중에</Button>
        <Button variant="danger" size="sm" onClick={() => onReject(suggestion.id)}>삭제</Button>
      </div>
    </Card>
  )
}
