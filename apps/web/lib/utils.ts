import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function reluctanceColor(score: number): string {
  if (score <= 3) return 'reluctance-low'
  if (score <= 6) return 'reluctance-mid'
  if (score <= 8) return 'reluctance-high'
  return 'reluctance-max'
}

export function reluctanceLabel(score: number): string {
  if (score <= 2) return '가볍게 할 수 있어요'
  if (score <= 4) return '조금 귀찮아요'
  if (score <= 6) return '하기 싫어요'
  if (score <= 8) return '많이 피하고 싶어요'
  return '정말 하기 싫어요'
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: '대기',
    in_progress: '진행중',
    done: '완료',
    snoozed: '미룸',
    active: '진행중',
    completed: '완료',
    archived: '보관',
  }
  return map[status] ?? status
}
