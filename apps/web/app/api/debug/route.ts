import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const results: Record<string, unknown> = {
    supabase_url: url ? `${url.slice(0, 40)}...` : 'NOT SET',
    anon_key_set: !!anonKey,
    service_role_key_set: !!serviceKey,
    gemini_key_set: !!process.env.GEMINI_API_KEY,
  }

  // Test with service role (bypasses RLS)
  const serverClient = createServerClient()
  const tables = ['todos', 'ai_suggestions', 'suggestion_todos', 'notes', 'ai_summaries']
  results['service_role_tests'] = {}
  for (const table of tables) {
    const { data, error } = await serverClient.from(table).select('id').limit(5)
    ;(results['service_role_tests'] as Record<string, unknown>)[table] =
      error ? `ERROR: ${error.code} — ${error.message}` : `OK (${data?.length ?? 0} rows)`
  }

  // Test with anon key (subject to RLS)
  if (url && anonKey) {
    const anonClient = createClient(url, anonKey)
    results['anon_key_tests'] = {}
    for (const table of tables) {
      const { data, error } = await anonClient.from(table).select('id').limit(1)
      ;(results['anon_key_tests'] as Record<string, unknown>)[table] =
        error ? `BLOCKED: ${error.code} — ${error.message}` : `OK (${data?.length ?? 0} rows)`
    }
  }

  // Show recent todos (service role)
  const { data: todos } = await serverClient
    .from('todos')
    .select('id, title, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  results['recent_todos'] = todos ?? []

  // Show recent suggestions (service role)
  const { data: suggestions } = await serverClient
    .from('ai_suggestions')
    .select('id, status, content, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  results['recent_suggestions'] = suggestions ?? []

  return NextResponse.json(results, { status: 200 })
}
