import type { CampaignIntegration } from '@/types/campaign'

/**
 * Persists a campaign integration for the given land.
 * In production this would PATCH the lands table in Supabase.
 */
async function saveCampaignIntegration(
  _landId: string,
  _integration: CampaignIntegration,
): Promise<void> {
  // TODO: await supabase.from('lands').update({ campaign_integration: integration }).eq('id', landId)
  return Promise.resolve()
}

/**
 * Removes the campaign integration for the given land.
 */
async function removeCampaignIntegration(_landId: string): Promise<void> {
  // TODO: await supabase.from('lands').update({ campaign_integration: null }).eq('id', landId)
  return Promise.resolve()
}

export const integrationService = { saveCampaignIntegration, removeCampaignIntegration }
