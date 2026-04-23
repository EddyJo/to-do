// User instruction: "오늘할일에 아무것도 안뜨는데 원인이 뭐야? 해결해봐"
import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/client'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const results: Record<string, unknown> = {
    supabase_url: url ? `${url.slice(0, 40)}...` : 'NOT SET',
    anon_key_set: !!key,
    gemini_key_set: !!process.env.GEMINI_API_KEY,
  }

  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase env vars not set', ...results })
  }

  const tables = ['notes', 'todos', 'ai_summaries', 'ai_suggestions', 'suggestion_todos']
  const supabase = getSupabaseClient()

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1)
      results[table] = error ? `ERROR: ${error.code} — ${error.message}` : 'OK'
    } catch (e) {
      results[table] = `EXCEPTION: ${String(e)}`
    }
  }

  return NextResponse.json(results)
}
