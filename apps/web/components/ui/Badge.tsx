import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'neon' | 'warning' | 'danger' | 'success'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-[#141414] text-[#a0a0a0] border border-[rgba(65,65,65,0.8)]',
    neon: 'bg-[#161600] text-[#faff69] border border-[#4f5100]',
    warning: 'bg-amber-950 text-amber-400 border border-amber-800',
    danger: 'bg-red-950 text-red-400 border border-red-800',
    success: 'bg-green-950 text-green-400 border border-green-800',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
