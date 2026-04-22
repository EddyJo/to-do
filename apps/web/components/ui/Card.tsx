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
      'card p-4',
      surface && 'card--surface',
      featured && 'card--neon',
      className,
    )}>
      {children}
    </div>
  )
}
