import { NextResponse, after } from 'next/server'
import { getIntegration } from '@/lib/db/integrations'
import { fetchNotionPage } from '@/lib/integrations/notion'
import { createNote } from '@/lib/db/notes'
import { extractFromNote } from '@/lib/ai/extract'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Notion webhook verification challenge (initial handshake)
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge })
    }

    const integration = await getIntegration('notion')
    if (!integration?.enabled) {
      return NextResponse.json({ error: 'Notion integration not enabled' }, { status: 403 })
    }

    const apiKey = integration.config?.api_key as string | undefined
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key configured' }, { status: 403 })
    }

    // Notion webhook payload: { type: 'page.created' | 'page.updated', entity: { id: string } }
    const eventType: string = body.type ?? ''
    const pageId: string = body.entity?.id ?? body.page?.id ?? ''

    if (!pageId || !eventType.startsWith('page.')) {
      return NextResponse.json({ ok: true })
    }

    // Respond immediately; process in background
    after(async () => {
      try {
        const { title, content, noteType } = await fetchNotionPage(apiKey, pageId)
        const note = await createNote({ raw_content: content, note_type: noteType })
        console.info('[webhook/notion] note created', { noteId: note.id, title, eventType })
        await extractFromNote(note)
      } catch (err) {
        console.error('[webhook/notion] processing failed', { pageId, eventType, err })
      }
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[webhook/notion] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
