import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'neon' | 'warning' | 'danger' | 'success'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'text-[#6e6e6e] border border-[rgba(255,255,255,0.07)]',
    neon:    'text-[#d4d955] border border-[rgba(250,255,105,0.2)]',
    warning: 'text-[#f59e0b] border border-[rgba(245,158,11,0.2)]',
    danger:  'text-[#f87171] border border-[rgba(248,113,113,0.2)]',
    success: 'text-[#4ade80] border border-[rgba(74,222,128,0.2)]',
  }
  return (
    <span className={cn(
      'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium tracking-wide',
      variants[variant], className
    )}>
      {children}
    </span>
  )
}
