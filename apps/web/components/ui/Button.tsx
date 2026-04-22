import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'neon' | 'ghost' | 'surface' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'surface', size = 'md', className, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-semibold rounded transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed'
    const variants = {
      neon: 'bg-[#faff69] text-[#151515] hover:bg-[#f4f692] border border-[#faff69]',
      ghost: 'bg-transparent text-white border border-[#4f5100] hover:bg-[#3a3a3a]',
      surface: 'bg-[#141414] text-white border border-[rgba(65,65,65,0.8)] hover:bg-[#3a3a3a]',
      danger: 'bg-transparent text-red-400 border border-red-800 hover:bg-red-950',
    }
    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3 gap-2',
    }
    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
