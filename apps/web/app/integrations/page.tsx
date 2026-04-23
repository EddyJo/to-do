'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface IntegrationCard {
  id: string
  name: string
  description: string
  href: string
  icon: string
}

const INTEGRATIONS: IntegrationCard[] = [
  {
    id: 'notion',
    name: 'Notion',
    description: '새 페이지가 생성될 때 자동으로 메모 · 회의록 · 아이디어로 가져와요',
    href: '/integrations/notion',
    icon: 'N',
  },
]

interface IntegrationStatus {
  connected: boolean
  last_synced_at: string | null
}

export default function IntegrationsPage() {
  const [statuses, setStatuses] = useState<Record<string, IntegrationStatus>>({})

  useEffect(() => {
    async function fetchStatuses() {
      const results = await Promise.allSettled(
        INTEGRATIONS.map(async i => {
          const res = await fetch(`/api/integrations/${i.id}`)
          const data = res.ok ? await res.json() : { connected: false }
          return { id: i.id, ...data }
        })
      )
      const next: Record<string, IntegrationStatus> = {}
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') next[INTEGRATIONS[idx].id] = r.value
      })
      setStatuses(next)
    }
    fetchStatuses()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '3px' }}>연동</h1>
        <p style={{ fontSize: '12px', color: '#6e6e6e' }}>외부 서비스와 연결해서 자동으로 노트를 가져올 수 있어요</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {INTEGRATIONS.map(integration => {
          const status = statuses[integration.id]
          const connected = status?.connected ?? false

          return (
            <Link key={integration.id} href={integration.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: '16px', background: '#111',
                  border: `1px solid ${connected ? 'rgba(74,158,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = connected ? 'rgba(74,158,255,0.35)' : 'rgba(255,255,255,0.14)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = connected ? 'rgba(74,158,255,0.2)' : 'rgba(255,255,255,0.06)')}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '8px',
                  background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {integration.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{integration.name}</span>
                    {connected && (
                      <span style={{
                        fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '99px',
                        background: 'rgba(74,158,255,0.15)', color: '#4a9eff',
                      }}>
                        연결됨
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: '#6e6e6e', margin: 0, lineHeight: 1.5 }}>
                    {integration.description}
                  </p>
                </div>

                <span style={{ fontSize: '16px', color: '#484848' }}>›</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
