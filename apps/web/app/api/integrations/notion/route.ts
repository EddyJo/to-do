import { NextResponse } from 'next/server'
import { getIntegration, upsertIntegration } from '@/lib/db/integrations'
import { validateNotionKey } from '@/lib/integrations/notion'

export async function GET() {
  try {
    const integration = await getIntegration('notion')
    if (!integration) return NextResponse.json({ connected: false })

    const apiKey = integration.config?.api_key as string | undefined
    return NextResponse.json({
      connected: integration.enabled,
      enabled: integration.enabled,
      last_synced_at: integration.last_synced_at,
      api_key_hint: apiKey ? `${apiKey.slice(0, 8)}…` : null,
    })
  } catch (err) {
    console.error('[integrations/notion] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch integration' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { api_key, enabled = true } = body as { api_key?: string; enabled?: boolean }

    const existing = await getIntegration('notion')

    // If only toggling enabled state (no new key), use existing key
    const resolvedKey = api_key ?? (existing?.config?.api_key as string | undefined)

    if (!resolvedKey) {
      return NextResponse.json({ error: 'API 키를 입력해주세요' }, { status: 400 })
    }

    if (api_key) {
      const valid = await validateNotionKey(api_key)
      if (!valid) {
        return NextResponse.json({ error: '유효하지 않은 Notion API 키예요' }, { status: 422 })
      }
    }

    await upsertIntegration('notion', enabled, { ...existing?.config, api_key: resolvedKey })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[integrations/notion] POST error:', err)
    return NextResponse.json({ error: '저장 중 오류가 발생했습니다' }, { status: 500 })
  }
}
