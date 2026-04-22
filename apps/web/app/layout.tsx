import type { Metadata } from 'next'
import { Inter, Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import Link from 'next/link'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-kr',
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Do It First — 가장 하기 싫은 일부터',
  description: '회피하던 일을 오늘 가장 먼저. 메모에서 실행 항목 자동 추출.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKr.variable}`}>
      <body>
        <Providers>
          <div className="min-h-screen bg-black">
            <nav className="border-b border-[#343434] px-6 py-4 flex items-center justify-between">
              <Link href="/" className="font-bold text-[#faff69] text-lg tracking-tight">
                Do It First
              </Link>
              <div className="flex items-center gap-6 text-sm text-[#a0a0a0]">
                <Link href="/tasks" className="hover:text-white transition-colors">Tasks</Link>
                <Link href="/review" className="hover:text-white transition-colors">Review Queue</Link>
              </div>
            </nav>
            <main className="max-w-2xl mx-auto px-6 py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
