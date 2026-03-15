import { ref } from 'vue'
import { defineStore } from 'pinia'

type IntegrationId = 'analytics' | 'campaign' | 'collaborators' | 'sell_monetize'
type DashboardDetail = 'analytics' | 'orders' | 'sell' | 'campaign' | 'monetize'

export const useAppModals = defineStore('appModals', () => {
  const activeModal = ref<'integrations' | null>(null)
  const activeIntegration = ref<IntegrationId | null>(null)
  const dashboardDetail = ref<DashboardDetail | null>(null)
  const publishTrigger = ref(0)

  function openIntegrations(integration?: IntegrationId) {
    activeModal.value = 'integrations'
    activeIntegration.value = integration ?? null
  }

  function openDashboardDetail(detail: DashboardDetail) {
    dashboardDetail.value = detail
    activeModal.value = null
    activeIntegration.value = null
  }

  function close() {
    activeModal.value = null
    activeIntegration.value = null
  }

  return { activeModal, activeIntegration, dashboardDetail, publishTrigger, openIntegrations, openDashboardDetail, close }
})
