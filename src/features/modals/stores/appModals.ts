import { ref } from 'vue'
import { defineStore } from 'pinia'

type IntegrationId = 'analytics' | 'campaign' | 'collaborators' | 'sell_monetize'

export const useAppModals = defineStore('appModals', () => {
  const activeModal = ref<'integrations' | 'upgrade' | null>(null)
  const activeIntegration = ref<IntegrationId | null>(null)

  function openIntegrations(integration?: IntegrationId) {
    activeModal.value = 'integrations'
    activeIntegration.value = integration ?? null
  }

  function openUpgrade() {
    activeModal.value = 'upgrade'
    activeIntegration.value = null
  }

  function close() {
    activeModal.value = null
    activeIntegration.value = null
  }

  return { activeModal, activeIntegration, openIntegrations, openUpgrade, close }
})
