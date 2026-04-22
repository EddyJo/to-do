import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  featured?: boolean
  surface?: boolean
}

export function Card({ children, className, featured, surface }: CardProps) {
  return (
    <div className={cn(
      'p-4 rounded-md border',
      surface ? 'bg-[#111]' : 'bg-[#0d0d0d]',
      featured ? 'border-[rgba(250,255,105,0.3)]' : 'border-[rgba(255,255,255,0.07)]',
      className,
    )}>
      {children}
    </div>
  )
}
