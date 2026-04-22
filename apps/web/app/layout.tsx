import type { Metadata } from 'next'
import { Inter, Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { NavBar } from '@/components/NavBar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const notoSansKr = Noto_Sans_KR({ subsets: ['latin'], variable: '--font-kr', weight: ['400', '500', '700'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Do It First',
  description: '가장 하기 싫은 일부터. 메모에서 실행 항목 자동 추출.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKr.variable}`}>
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-black)' }}>
            <NavBar />
            <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
