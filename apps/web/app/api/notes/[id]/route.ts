import { NextResponse } from 'next/server'
import { getNote } from '@/lib/db/notes'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const note = await getNote(params.id)
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(note)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 })
  }
}
