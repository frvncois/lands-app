import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useLandStore } from '@/features/lands/stores/land'
import type { CampaignIntegration } from '@/features/integrations/types/campaign'

export const useCampaignStore = defineStore('campaign', () => {
  const landStore = useLandStore()

  const integration = computed<CampaignIntegration | null>(
    () => landStore.activeLand?.campaign_integration ?? null,
  )

  const isConnected = computed(() => !!integration.value)
  const provider = computed(() => integration.value?.provider ?? null)

  function setIntegration(data: CampaignIntegration) {
    const id = landStore.activeLandId
    if (!id) return
    landStore.updateLand(id, { campaign_integration: data })
  }

  function clearIntegration() {
    const id = landStore.activeLandId
    if (!id) return
    landStore.updateLand(id, { campaign_integration: null })
  }

  return { integration, isConnected, provider, setIntegration, clearIntegration }
})
