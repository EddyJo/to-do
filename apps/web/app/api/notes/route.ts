import { NextResponse } from 'next/server'
import { getNotes } from '@/lib/db/notes'

export async function GET() {
  try {
    const notes = await getNotes()
    return NextResponse.json(notes)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}
