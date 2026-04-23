import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'neon' | 'ghost' | 'surface' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'surface', size = 'md', className, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed select-none'
    const variants = {
      neon:    'bg-[#faff69] text-[#111] hover:bg-[#eef060]',
      ghost:   'bg-transparent text-[#9a9a9a] border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.18)]',
      surface: 'bg-[#1e1e1e] text-white border border-[rgba(255,255,255,0.08)] hover:bg-[#262626]',
      danger:  'bg-transparent text-[#f87171] border border-[rgba(248,113,113,0.2)] hover:bg-[rgba(248,113,113,0.08)]',
    }
    const sizes = {
      sm: 'text-xs px-3 py-2 rounded min-h-[36px]',
      md: 'text-sm px-4 py-2.5 rounded-md min-h-[44px]',
      lg: 'text-sm px-5 py-3 rounded-md font-semibold min-h-[48px]',
    }
    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
