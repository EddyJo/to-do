'use client'
import Link from 'next/link'
import { Task } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate, statusLabel } from '@/lib/utils'

interface TaskCardProps { task: Task }

export function TaskCard({ task }: TaskCardProps) {
  const todoCount = task.todos?.length ?? 0
  const doneCount = task.todos?.filter(t => t.status === 'done').length ?? 0

  return (
    <Link href={`/tasks/${task.id}`}>
      <Card surface className="hover:border-[#3a3a3a] transition-all cursor-pointer group">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white group-hover:text-[#faff69] transition-colors leading-snug">
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-[#a0a0a0] mt-1 line-clamp-1">{task.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <Badge>{statusLabel(task.status)}</Badge>
              {todoCount > 0 && (
                <span className="text-xs text-[#a0a0a0]">{doneCount}/{todoCount} 완료</span>
              )}
              {task.due_date && (
                <span className="text-xs text-[#a0a0a0]">~{formatDate(task.due_date)}</span>
              )}
            </div>
          </div>
          {todoCount > 0 && (
            <div className="flex-shrink-0 text-right">
              <div className="text-xs text-[#a0a0a0] mb-1">{Math.round(doneCount / todoCount * 100)}%</div>
              <div className="w-16 h-1 bg-[#343434] rounded-full">
                <div className="h-1 bg-[#faff69] rounded-full transition-all"
                  style={{ width: `${Math.round(doneCount / todoCount * 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
