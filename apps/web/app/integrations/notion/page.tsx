'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/ui/Toast'

interface NotionStatus {
  connected: boolean
  enabled: boolean
  api_key_hint: string | null
  last_synced_at: string | null
}

const WEBHOOK_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/notion`
    : '/api/webhooks/notion'

export default function NotionIntegrationPage() {
  const router = useRouter()
  const { toast, showToast, dismissToast } = useToast()

  const [status, setStatus] = useState<NotionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  async function loadStatus() {
    setLoading(true)
    try {
      const res = await fetch('/api/integrations/notion')
      if (res.ok) setStatus(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStatus() }, [])

  async function handleSave() {
    if (!apiKey.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/integrations/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error ?? '저장 실패')
      } else {
        setApiKey('')
        showToast('Notion이 연결됐어요 ✓')
        await loadStatus()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle() {
    if (!status) return
    const next = !status.enabled
    setSaving(true)
    try {
      const res = await fetch('/api/integrations/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      })
      if (res.ok) {
        setStatus(s => s ? { ...s, enabled: next, connected: next } : s)
        showToast(next ? '연동을 다시 시작해요' : '연동을 일시정지했어요')
      }
    } finally {
      setSaving(false)
    }
  }

  async function copyWebhook() {
    try {
      await navigator.clipboard.writeText(WEBHOOK_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('복사 실패 — 직접 선택해서 복사해주세요')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => router.back()}
          style={{ fontSize: '12px', color: '#6e6e6e', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          ← 뒤로
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '10px',
          background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', fontWeight: 700, color: '#fff',
        }}>
          N
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>Notion</h1>
          <p style={{ fontSize: '12px', color: '#6e6e6e' }}>
            {loading ? '…' : status?.connected ? '연결됨' : '연결 안 됨'}
          </p>
        </div>
        {status?.connected && (
          <div style={{ marginLeft: 'auto' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              disabled={saving}
            >
              {status.enabled ? '일시정지' : '다시 시작'}
            </Button>
          </div>
        )}
      </div>

      {/* API Key section */}
      <div style={{ padding: '16px', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
            {status?.connected ? 'API 키 변경' : 'Notion API 키'}
          </p>
          {status?.api_key_hint && (
            <p style={{ fontSize: '11px', color: '#484848', marginBottom: '8px' }}>
              현재: {status.api_key_hint}
            </p>
          )}
          <p style={{ fontSize: '11px', color: '#6e6e6e', lineHeight: 1.6 }}>
            Notion 설정 → 내 연결 → 새 API 통합에서 Internal Integration Token을 발급받으세요.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="password"
            placeholder="secret_xxxxxxxxxxxxxxxx"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            style={{
              flex: 1, padding: '9px 12px', fontSize: '13px',
              background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px', color: '#fff', outline: 'none',
              fontFamily: 'monospace',
            }}
          />
          <Button onClick={handleSave} disabled={saving || !apiKey.trim()} size="sm">
            {saving ? '확인 중…' : '저장'}
          </Button>
        </div>
      </div>

      {/* Webhook URL section */}
      <div style={{ padding: '16px', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Webhook URL</p>
          <p style={{ fontSize: '11px', color: '#6e6e6e', lineHeight: 1.6 }}>
            Notion의 통합 설정에서 이 URL을 Webhook 주소로 입력하세요. 새 페이지가 생성될 때 자동으로 노트가 추가돼요.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <code style={{
            flex: 1, padding: '9px 12px', fontSize: '11px',
            background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '4px', color: '#9a9a9a',
            overflowX: 'auto', whiteSpace: 'nowrap',
          }}>
            {WEBHOOK_URL}
          </code>
          <Button variant="ghost" size="sm" onClick={copyWebhook}>
            {copied ? '복사됨 ✓' : '복사'}
          </Button>
        </div>
      </div>

      {/* Setup guide */}
      <div style={{ padding: '16px', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>설정 방법</p>
        <ol style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            'notion.so → 설정 → 연결 → 새 통합을 만들거나 기존 통합 선택',
            '통합에서 Internal Integration Token 복사 → 위 API 키 입력란에 붙여넣기',
            '연동할 Notion 페이지에서 ••• → 연결 → 해당 통합 추가',
            '통합 설정에서 위 Webhook URL 등록',
            '이후 해당 페이지에 새 하위 페이지가 생성되면 자동으로 노트로 저장돼요',
          ].map((step, i) => (
            <li key={i} style={{ fontSize: '12px', color: '#6e6e6e', lineHeight: 1.6 }}>{step}</li>
          ))}
        </ol>
      </div>

      {toast && <Toast message={toast} onDismiss={dismissToast} />}
    </div>
  )
}
