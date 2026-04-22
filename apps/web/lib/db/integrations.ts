import { createServerClient } from '@/lib/supabase/server'

export interface Integration {
  id: string
  enabled: boolean
  config: Record<string, unknown>
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

export async function getIntegration(id: string): Promise<Integration | null> {
  const supabase = createServerClient()
  const { data } = await supabase.from('integrations').select('*').eq('id', id).single()
  return data ?? null
}

export async function upsertIntegration(
  id: string,
  enabled: boolean,
  config: Record<string, unknown>,
): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('integrations')
    .upsert({ id, enabled, config, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function getAllIntegrations(): Promise<Integration[]> {
  const supabase = createServerClient()
  const { data } = await supabase.from('integrations').select('*')
  return data ?? []
}
