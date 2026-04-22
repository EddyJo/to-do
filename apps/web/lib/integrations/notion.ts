import type { NoteType } from '@/types'

const NOTION_VERSION = '2022-06-28'

function notionHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  }
}

export async function validateNotionKey(apiKey: string): Promise<boolean> {
  const res = await fetch('https://api.notion.com/v1/users/me', {
    headers: notionHeaders(apiKey),
  })
  return res.ok
}

export async function fetchNotionPage(
  apiKey: string,
  pageId: string,
): Promise<{ title: string; content: string; noteType: NoteType }> {
  const headers = notionHeaders(apiKey)
  const cleanId = pageId.replace(/-/g, '')

  const [pageRes, blocksRes] = await Promise.all([
    fetch(`https://api.notion.com/v1/pages/${cleanId}`, { headers }),
    fetch(`https://api.notion.com/v1/blocks/${cleanId}/children?page_size=100`, { headers }),
  ])

  if (!pageRes.ok) throw new Error(`Notion page fetch failed: ${pageRes.status}`)
  if (!blocksRes.ok) throw new Error(`Notion blocks fetch failed: ${blocksRes.status}`)

  const page = await pageRes.json()
  const { results: blocks } = await blocksRes.json()

  const title = extractTitle(page.properties)
  const noteType = inferNoteType(title, page.properties)
  const body = blocksToText(blocks)
  const content = [title, '', body].filter(Boolean).join('\n').trim()

  return { title, content, noteType }
}

function extractTitle(properties: Record<string, any>): string {
  for (const prop of Object.values(properties ?? {})) {
    if ((prop as any).type === 'title') {
      return (prop as any).title?.[0]?.plain_text ?? 'Untitled'
    }
  }
  return 'Untitled'
}

function inferNoteType(title: string, properties: Record<string, any>): NoteType {
  // Check explicit Type/Category property first
  const typeProp =
    properties?.['Type'] ?? properties?.['종류'] ?? properties?.['Category'] ?? properties?.['유형']
  const typeVal = (typeProp?.select?.name ?? '').toLowerCase()
  if (typeVal.includes('meeting') || typeVal.includes('회의') || typeVal.includes('미팅')) return 'meeting'
  if (typeVal.includes('idea') || typeVal.includes('아이디어')) return 'idea'

  // Fall back to title keyword detection
  const lower = title.toLowerCase()
  if (lower.includes('회의') || lower.includes('meeting') || lower.includes('미팅')) return 'meeting'
  if (lower.includes('아이디어') || lower.includes('idea')) return 'idea'

  return 'memo'
}

function blocksToText(blocks: any[]): string {
  return blocks
    .map(block => extractBlockText(block))
    .filter(Boolean)
    .join('\n')
}

function extractBlockText(block: any): string {
  const type: string = block.type
  const content = block[type]
  if (!content?.rich_text) return ''

  const text = content.rich_text.map((rt: any) => rt.plain_text).join('')
  if (!text.trim()) return ''

  switch (type) {
    case 'heading_1': return `# ${text}`
    case 'heading_2': return `## ${text}`
    case 'heading_3': return `### ${text}`
    case 'bulleted_list_item': return `• ${text}`
    case 'numbered_list_item': return `- ${text}`
    case 'to_do': return `[${content.checked ? 'x' : ' '}] ${text}`
    case 'quote': return `> ${text}`
    case 'callout': return `💡 ${text}`
    default: return text
  }
}
