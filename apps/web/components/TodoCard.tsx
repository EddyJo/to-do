'use client'
import { Todo } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn, reluctanceColor, reluctanceLabel, statusLabel } from '@/lib/utils'

interface TodoCardProps {
  todo: Todo
  featured?: boolean
  onStart?: (id: string) => void
  onSnooze?: (id: string) => void
  onDone?: (id: string) => void
}

export function TodoCard({ todo, featured, onStart, onSnooze, onDone }: TodoCardProps) {
  const isUrgent = todo.reluctance_score >= 7

  return (
    <Card featured={featured} surface className={cn('transition-all', featured && 'border-[#faff69]')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {featured && (
              <Badge variant="neon">오늘 가장 먼저</Badge>
            )}
            {todo.task && (
              <span className="text-xs text-[#a0a0a0]">{todo.task.title}</span>
            )}
            <Badge variant={todo.status === 'in_progress' ? 'success' : 'default'}>
              {statusLabel(todo.status)}
            </Badge>
          </div>
          <p className={cn('font-semibold text-base leading-snug', featured ? 'text-[#faff69]' : 'text-white')}>
            {todo.title}
          </p>
          {todo.description && (
            <p className="text-sm text-[#a0a0a0] mt-1 line-clamp-2">{todo.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={cn('text-xs', reluctanceColor(todo.reluctance_score))}>
              😤 {reluctanceLabel(todo.reluctance_score)}
            </span>
            {todo.estimated_minutes && (
              <span className="text-xs text-[#a0a0a0]">⏱ {todo.estimated_minutes}분</span>
            )}
            {isUrgent && (
              <span className="text-xs text-[#faff69]">⚡ 오래 미뤄왔어요</span>
            )}
          </div>
        </div>

        {/* Reluctance score dial */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold"
          style={{ borderColor: todo.reluctance_score >= 7 ? '#faff69' : todo.reluctance_score >= 5 ? '#f59e0b' : '#414141' }}>
          {todo.reluctance_score}
        </div>
      </div>

      {todo.status !== 'done' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-[#343434]">
          {todo.status === 'pending' && onStart && (
            <Button variant="neon" size="sm" onClick={() => onStart(todo.id)}>
              {featured ? '10분만 시작하기 →' : '시작'}
            </Button>
          )}
          {todo.status === 'in_progress' && onDone && (
            <Button variant="neon" size="sm" onClick={() => onDone(todo.id)}>완료</Button>
          )}
          {onSnooze && (
            <Button variant="ghost" size="sm" onClick={() => onSnooze(todo.id)}>나중에</Button>
          )}
        </div>
      )}
    </Card>
  )
}
