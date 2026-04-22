// User instruction: "내가 오늘 할일이나 업무 회의록, 업무 내용 등에 대해 이야기하면 해당 내용 바탕으로 todo생성해주는거고"
import { NextResponse, after } from 'next/server'
import { createNote } from '@/lib/db/notes'
import { extractFromNote } from '@/lib/ai/extract'
import type { NoteType } from '@/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { content, note_type = 'memo', task_id } = body as { content: string; note_type?: NoteType; task_id?: string }

    if (!content?.trim()) {
      return NextResponse.json({ error: '내용을 입력해주세요' }, { status: 400 })
    }

    const note = await createNote({ raw_content: content.trim(), note_type, task_id })

    // AI extraction runs after response is sent — user gets immediate feedback
    after(async () => {
      try {
        await extractFromNote(note)
      } catch (err) {
        console.error('[capture] AI extraction failed:', err)
      }
    })

    return NextResponse.json({ note }, { status: 202 })
  } catch (err) {
    console.error('[capture] error:', err)
    return NextResponse.json({ error: '저장 중 오류가 발생했습니다' }, { status: 500 })
  }
}
