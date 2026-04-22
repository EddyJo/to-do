import { createClient } from '@supabase/supabase-js'

// Server-side client — used in Server Components and API routes
export function createServerClient() {
  // Strip accidental /rest/v1 suffix — the client appends it internally
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/rest\/v1\/?$/, '')
  return createClient(
    url,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}
