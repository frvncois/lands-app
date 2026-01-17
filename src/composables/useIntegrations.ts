/**
 * Integration Composable
 *
 * Manages integration connections for a project.
 * Handles OAuth flows, API key validation, and connection state.
 */

import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/stores/toast'
import {
  getIntegration,
  getIntegrationCategories,
  isOAuthIntegration,
  type IntegrationConnection,
  type IntegrationDefinition,
  type ConnectedAccountInfo,
} from '@/lib/integrations'

// Store connections in memory (refreshed on project load)
const connections = ref<Map<string, IntegrationConnection[]>>(new Map())
const isLoading = ref(false)

export function useIntegrations(projectId: string) {
  const toast = useToast()

  // Get connections for this project
  const projectConnections = computed(() => {
    return connections.value.get(projectId) || []
  })

  // Get all categories with connection status
  const categories = computed(() => {
    const cats = getIntegrationCategories()
    return cats.map(cat => ({
      ...cat,
      integrations: cat.integrations.map(integration => ({
        ...integration,
        connection: getConnection(integration.id),
        isConnected: isConnected(integration.id),
      })),
    }))
  })

  // Check if a specific integration is connected
  function isConnected(integrationId: string): boolean {
    return projectConnections.value.some(
      c => c.providerId === integrationId && c.isConnected
    )
  }

  // Get connection for a specific integration
  function getConnection(integrationId: string): IntegrationConnection | undefined {
    return projectConnections.value.find(c => c.providerId === integrationId)
  }

  // Get all connected integrations
  const connectedIntegrations = computed(() => {
    return projectConnections.value
      .filter(c => c.isConnected)
      .map(c => ({
        connection: c,
        definition: getIntegration(c.providerId),
      }))
      .filter(c => c.definition !== undefined) as {
        connection: IntegrationConnection
        definition: IntegrationDefinition
      }[]
  })

  // Fetch connections from database
  async function fetchConnections() {
    isLoading.value = true
    try {
      const { data, error } = await supabase
        .from('integration_connections')
        .select('id, project_id, provider_id, is_connected, connected_at, account_info, settings')
        .eq('project_id', projectId)

      if (error) throw error

      const mapped: IntegrationConnection[] = (data || []).map(row => ({
        id: row.id,
        projectId: row.project_id,
        providerId: row.provider_id,
        isConnected: row.is_connected,
        connectedAt: row.connected_at ?? undefined,
        accountInfo: row.account_info as unknown as ConnectedAccountInfo | undefined,
        settings: (row.settings as Record<string, string>) || {},
      }))

      connections.value.set(projectId, mapped)
    } catch (e) {
      // Silently fail - integrations feature not fully set up yet
      connections.value.set(projectId, [])
    } finally {
      isLoading.value = false
    }
  }

  // Initiate OAuth connection
  async function initiateOAuth(integrationId: string) {
    const integration = getIntegration(integrationId)
    if (!integration || !isOAuthIntegration(integrationId)) {
      toast.error('This integration does not support OAuth')
      return
    }

    toast.info('Coming soon! OAuth integrations will be available shortly.')
  }

  // Handle OAuth callback (called from callback page)
  async function handleOAuthCallback(code: string, state: string): Promise<boolean> {
    const savedState = sessionStorage.getItem('oauth_state')
    const savedProjectId = sessionStorage.getItem('oauth_project_id')
    const savedIntegrationId = sessionStorage.getItem('oauth_integration_id')

    // Clear session storage
    sessionStorage.removeItem('oauth_state')
    sessionStorage.removeItem('oauth_project_id')
    sessionStorage.removeItem('oauth_integration_id')

    // Verify state
    if (state !== savedState) {
      toast.error('Invalid OAuth state. Please try again.')
      return false
    }

    try {
      // Exchange code for tokens via edge function
      const { data, error } = await supabase.functions.invoke('integration-oauth', {
        body: {
          action: 'callback',
          code,
          integrationId: savedIntegrationId,
          projectId: savedProjectId,
        },
      })

      if (error) throw error

      // Refresh connections
      await fetchConnections()
      toast.success('Integration connected successfully!')
      return true
    } catch (e) {
      console.error('OAuth callback failed:', e)
      toast.error('Failed to complete connection. Please try again.')
      return false
    }
  }

  // Connect with API key
  async function connectWithApiKey(
    integrationId: string,
    _config: Record<string, string>
  ): Promise<boolean> {
    const integration = getIntegration(integrationId)
    if (!integration) {
      toast.error('Integration not found')
      return false
    }

    toast.info('Coming soon! This integration will be available shortly.')
    return false
  }

  // Connect webhook integration
  async function connectWebhook(
    _integrationId: string,
    _config: Record<string, string>
  ): Promise<boolean> {
    toast.info('Coming soon! Webhook integrations will be available shortly.')
    return false
  }

  // Update integration settings (non-secret config)
  async function updateSettings(
    integrationId: string,
    settings: Record<string, string>
  ): Promise<boolean> {
    const connection = getConnection(integrationId)
    if (!connection) {
      toast.error('Integration not connected')
      return false
    }

    try {
      const { error } = await supabase
        .from('integration_connections')
        .update({
          settings: { ...connection.settings, ...settings },
        })
        .eq('id', connection.id)

      if (error) throw error

      // Update local state
      const projectConns = connections.value.get(projectId) || []
      const idx = projectConns.findIndex(c => c.id === connection.id)
      const existingConn = projectConns[idx]
      if (idx !== -1 && existingConn) {
        projectConns[idx] = {
          ...existingConn,
          settings: { ...existingConn.settings, ...settings },
        }
        connections.value.set(projectId, projectConns)
      }

      toast.success('Settings updated')
      return true
    } catch (e) {
      console.error('Failed to update settings:', e)
      toast.error('Failed to save settings')
      return false
    }
  }

  // Disconnect integration
  async function disconnect(integrationId: string): Promise<boolean> {
    const connection = getConnection(integrationId)
    if (!connection) return true

    try {
      // Call edge function to revoke tokens if OAuth
      if (isOAuthIntegration(integrationId)) {
        await supabase.functions.invoke('integration-oauth', {
          body: {
            action: 'disconnect',
            integrationId,
            projectId,
          },
        })
      }

      // Delete from database
      const { error } = await supabase
        .from('integration_connections')
        .delete()
        .eq('id', connection.id)

      if (error) throw error

      // Update local state
      const projectConns = connections.value.get(projectId) || []
      connections.value.set(
        projectId,
        projectConns.filter(c => c.id !== connection.id)
      )

      toast.success('Integration disconnected')
      return true
    } catch (e) {
      console.error('Failed to disconnect:', e)
      toast.error('Failed to disconnect integration')
      return false
    }
  }

  return {
    // State
    isLoading,
    projectConnections,
    categories,
    connectedIntegrations,

    // Methods
    fetchConnections,
    isConnected,
    getConnection,
    initiateOAuth,
    handleOAuthCallback,
    connectWithApiKey,
    connectWebhook,
    updateSettings,
    disconnect,
  }
}
