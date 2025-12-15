import { ref, onMounted } from 'vue'
import { useIntegrations } from '@/composables/useIntegrations'
import {
  isOAuthIntegration,
  isWebhookIntegration,
  type IntegrationDefinition,
} from '@/lib/integrations'

// Shared state across all integration sections
export const integrationsState = {
  selected: ref<IntegrationDefinition | null>(null),
  showConnect: ref(false),
  showDisconnect: ref(false),
  configInputs: ref<Record<string, string>>({}),
  isSaving: ref(false),
}

let initialized = false

export function useIntegrationsState(projectId?: string) {
  const api = projectId ? useIntegrations(projectId) : null

  // Initialize on first use with projectId
  if (projectId && api && !initialized) {
    onMounted(() => {
      api.fetchConnections()
    })
    initialized = true
  }

  function openConnect(integration: IntegrationDefinition) {
    // For OAuth integrations, redirect directly
    if (api && isOAuthIntegration(integration.id)) {
      api.initiateOAuth(integration.id)
      return
    }

    integrationsState.selected.value = integration
    // Initialize config inputs
    integrationsState.configInputs.value = {}
    if (integration.configFields) {
      integration.configFields.forEach(field => {
        integrationsState.configInputs.value[field.key] = ''
      })
    }
    integrationsState.showConnect.value = true
  }

  function openDisconnect(integration: IntegrationDefinition) {
    integrationsState.selected.value = integration
    integrationsState.showDisconnect.value = true
  }

  function closeConnect() {
    integrationsState.showConnect.value = false
    integrationsState.selected.value = null
    integrationsState.configInputs.value = {}
  }

  function closeDisconnect() {
    integrationsState.showDisconnect.value = false
    integrationsState.selected.value = null
  }

  async function connectIntegration() {
    if (!api || !integrationsState.selected.value) return

    const integration = integrationsState.selected.value

    // Validate required fields
    const missingFields = (integration.configFields || [])
      .filter(f => f.required && !integrationsState.configInputs.value[f.key])
    if (missingFields.length > 0) return

    integrationsState.isSaving.value = true
    try {
      let success = false

      if (isWebhookIntegration(integration.id)) {
        success = await api.connectWebhook(integration.id, integrationsState.configInputs.value)
      } else {
        success = await api.connectWithApiKey(integration.id, integrationsState.configInputs.value)
      }

      if (success) {
        closeConnect()
      }
    } finally {
      integrationsState.isSaving.value = false
    }
  }

  async function disconnectIntegration() {
    if (!api || !integrationsState.selected.value) return

    integrationsState.isSaving.value = true
    try {
      const success = await api.disconnect(integrationsState.selected.value.id)
      if (success) {
        closeDisconnect()
      }
    } finally {
      integrationsState.isSaving.value = false
    }
  }

  return {
    // API methods (when projectId provided)
    ...(api || {}),
    // Shared state
    selected: integrationsState.selected,
    showConnect: integrationsState.showConnect,
    showDisconnect: integrationsState.showDisconnect,
    configInputs: integrationsState.configInputs,
    isSaving: integrationsState.isSaving,
    // Actions
    openConnect,
    openDisconnect,
    closeConnect,
    closeDisconnect,
    connectIntegration,
    disconnectIntegration,
  }
}

// Reset state (for cleanup)
export function resetIntegrationsState() {
  initialized = false
  integrationsState.selected.value = null
  integrationsState.showConnect.value = false
  integrationsState.showDisconnect.value = false
  integrationsState.configInputs.value = {}
  integrationsState.isSaving.value = false
}
