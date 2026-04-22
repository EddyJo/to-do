// User instruction: "내가 오늘 할일이나 업무 회의록, 업무 내용 등에 대해 이야기하면 해당 내용 바탕으로 todo생성해주는거고"
import { NextResponse } from 'next/server'
import { createNote } from '@/lib/db/notes'
import { extractFromNote } from '@/lib/ai/extract'
import type { NoteType } from '@/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { content, note_type = 'memo' } = body as { content: string; note_type?: NoteType }

    if (!content?.trim()) {
      return NextResponse.json({ error: '내용을 입력해주세요' }, { status: 400 })
    }

    const note = await createNote({ raw_content: content.trim(), note_type })
    const result = await extractFromNote(note)

    return NextResponse.json({
      note,
      suggestions: result.suggestions,
      summary: result.summary,
    })
  } catch (err) {
    console.error('[capture] error:', err)
    return NextResponse.json({ error: 'AI 분석 중 오류가 발생했습니다' }, { status: 500 })
  }
}
