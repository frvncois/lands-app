import { supabase } from '@/lib/supabase'
import type { CampaignIntegration, CampaignProviderType } from '@/types/campaign'

export interface ProviderList {
  id: string
  name: string
}

/**
 * Persists a campaign integration for the given land.
 * In production this would PATCH the lands table in Supabase.
 */
async function saveCampaignIntegration(
  landId: string,
  integration: CampaignIntegration,
): Promise<void> {
  // TODO: await supabase.from('lands').update({ campaign_integration: integration }).eq('id', landId)
  if (import.meta.env.DEV) {
    console.warn('[integrationService] saveCampaignIntegration is a stub — not persisted to DB', { landId, integration })
  }
}

/**
 * Removes the campaign integration for the given land.
 */
async function removeCampaignIntegration(landId: string): Promise<void> {
  // TODO: await supabase.from('lands').update({ campaign_integration: null }).eq('id', landId)
  if (import.meta.env.DEV) {
    console.warn('[integrationService] removeCampaignIntegration is a stub — not persisted to DB', { landId })
  }
}

async function fetchProviderLists(provider: CampaignProviderType, apiKey: string): Promise<ProviderList[]> {
  const { data, error } = await supabase.functions.invoke('fetch-campaign-lists', {
    body: { provider, api_key: apiKey },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return (data?.lists ?? []) as ProviderList[]
}

export const integrationService = { saveCampaignIntegration, removeCampaignIntegration, fetchProviderLists }
