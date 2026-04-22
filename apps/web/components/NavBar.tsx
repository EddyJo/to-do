'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/capture', label: '기록' },
  { href: '/',        label: '오늘' },
  { href: '/review',  label: '제안' },
  { href: '/notes',   label: '노트' },
]

export function NavBar() {
  const pathname = usePathname()
  return (
    <header style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="w-full max-w-2xl mx-auto px-5 h-12 flex items-center justify-between">
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--color-neon-volt)', letterSpacing: '0.02em' }}>
          do-it-first
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {NAV_ITEMS.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link key={href} href={href} style={{
                fontSize: '13px', padding: '4px 10px', borderRadius: '4px',
                color: active ? 'var(--color-white)' : 'var(--color-gray-400)',
                backgroundColor: active ? 'var(--color-surface)' : 'transparent',
                transition: 'color 0.15s, background-color 0.15s',
              }}>
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
