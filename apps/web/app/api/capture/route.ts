// User instruction: "오늘할일에 아무것도 안뜨는데 원인이 뭐야? 해결해봐"
import { NextResponse, after } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { extractFromNote } from '@/lib/ai/extract'
import type { NoteType } from '@/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { content, note_type = 'memo', task_id } = body as { content: string; note_type?: NoteType; task_id?: string }

    if (!content?.trim()) {
      return NextResponse.json({ error: '내용을 입력해주세요' }, { status: 400 })
    }

    // Use server client (service role key bypasses RLS)
    const supabase = createServerClient()

    console.log('[capture] inserting note, url:', process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 40))

    const { data: note, error: noteErr } = await supabase
      .from('notes')
      .insert({ raw_content: content.trim(), note_type, ...(task_id ? { task_id } : {}) })
      .select()
      .single()

    if (noteErr) {
      console.error('[capture] notes insert failed:', JSON.stringify(noteErr))
      return NextResponse.json({ error: '저장 중 오류: ' + noteErr.message, code: noteErr.code }, { status: 500 })
    }

    after(async () => {
      try {
        await extractFromNote(note)
      } catch (err) {
        console.error('[capture] AI extraction failed:', err)
      }
    })

    return NextResponse.json({ note }, { status: 202 })
  } catch (err) {
    console.error('[capture] unexpected error:', err)
    return NextResponse.json({ error: '저장 중 오류가 발생했습니다' }, { status: 500 })
  }
}
