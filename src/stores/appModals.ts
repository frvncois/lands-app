import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useDashboardDetail } from '@/composables/useDashboardDetail'

type IntegrationId = 'analytics' | 'campaign' | 'collaborators' | 'sell_monetize'

export const useAppModals = defineStore('appModals', () => {
  const activeModal = ref<'integrations' | 'upgrade' | null>(null)
  const activeIntegration = ref<IntegrationId | null>(null)

  function openIntegrations(integration?: IntegrationId) {
    activeModal.value = 'integrations'
    activeIntegration.value = integration ?? null
  }

  function openDashboardDetail(detail: Parameters<ReturnType<typeof useDashboardDetail>['openDetail']>[0]) {
    useDashboardDetail().openDetail(detail)
    activeModal.value = null
    activeIntegration.value = null
  }

  function openUpgrade() {
    activeModal.value = 'upgrade'
    activeIntegration.value = null
  }

  function close() {
    activeModal.value = null
    activeIntegration.value = null
  }

  return { activeModal, activeIntegration, openIntegrations, openDashboardDetail, openUpgrade, close }
})
