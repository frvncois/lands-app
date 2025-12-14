<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { Card, Button, Header, Icon } from '@/components/ui'
import PlanUpgrade from '@/components/modal/PlanUpgrade.vue'
import { planHasFeature } from '@/types/project'
import { useIntegrations } from '@/composables/useIntegrations'
import {
  isOAuthIntegration,
  isWebhookIntegration,
  type IntegrationDefinition,
} from '@/lib/integrations'

const route = useRoute()
const projectsStore = useProjectsStore()

const projectId = computed(() => route.params.projectId as string)

// Use integration composable with current projectId
const {
  isLoading,
  categories,
  connectedIntegrations,
  fetchConnections,
  isConnected,
  initiateOAuth,
  connectWithApiKey,
  connectWebhook,
  disconnect,
} = useIntegrations(projectId.value)

// Plan check
const currentProject = computed(() => projectsStore.getProjectById(projectId.value))
const canUseIntegrations = computed(() => {
  if (!currentProject.value) return false
  return planHasFeature(currentProject.value.plan, 'integrations')
})
const showUpgradeModal = ref(false)

// Modal state
const showConnectModal = ref(false)
const showDisconnectModal = ref(false)
const selectedIntegration = ref<IntegrationDefinition | null>(null)
const configInputs = ref<Record<string, string>>({})
const isSaving = ref(false)

// Fetch connections on mount
onMounted(() => {
  fetchConnections()
})

function openConnectModal(integration: IntegrationDefinition) {
  // For OAuth integrations, redirect directly
  if (isOAuthIntegration(integration.id)) {
    initiateOAuth(integration.id)
    return
  }

  selectedIntegration.value = integration
  // Initialize config inputs
  configInputs.value = {}
  if (integration.configFields) {
    integration.configFields.forEach(field => {
      configInputs.value[field.key] = ''
    })
  }
  showConnectModal.value = true
}

function openDisconnectModal(integration: IntegrationDefinition) {
  selectedIntegration.value = integration
  showDisconnectModal.value = true
}

async function connectIntegration() {
  if (!selectedIntegration.value) return

  // Validate required fields
  const missingFields = (selectedIntegration.value.configFields || [])
    .filter(f => f.required && !configInputs.value[f.key])
  if (missingFields.length > 0) return

  isSaving.value = true
  try {
    let success = false

    if (isWebhookIntegration(selectedIntegration.value.id)) {
      success = await connectWebhook(selectedIntegration.value.id, configInputs.value)
    } else {
      success = await connectWithApiKey(selectedIntegration.value.id, configInputs.value)
    }

    if (success) {
      showConnectModal.value = false
      selectedIntegration.value = null
      configInputs.value = {}
    }
  } finally {
    isSaving.value = false
  }
}

async function disconnectIntegration() {
  if (!selectedIntegration.value) return

  isSaving.value = true
  try {
    const success = await disconnect(selectedIntegration.value.id)
    if (success) {
      showDisconnectModal.value = false
      selectedIntegration.value = null
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="flex-1 h-full overflow-y-auto bg-background">
    <div class="max-w-6xl mx-auto p-8">
      <!-- Upgrade Wall for Free Plan -->
      <div v-if="!canUseIntegrations" class="flex items-center justify-center py-20">
        <div class="text-center max-w-md">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="app-integration" :size="32" class="text-primary" />
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-2">Unlock Integrations</h3>
          <p class="text-sm text-muted-foreground mb-6">
            Upgrade to Pro to connect third-party services and supercharge your project.
          </p>
          <div class="space-y-3 text-left mb-6">
            <div class="flex items-center gap-3 text-sm text-foreground bg-muted/50 rounded-2xl p-3.5">
              <div class="bg-green-500/10 text-green-600 border border-green-500/20 rounded-full p-1">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Email marketing (Mailchimp, ConvertKit, Buttondown)
            </div>
            <div class="flex items-center gap-3 text-sm text-foreground bg-muted/50 rounded-2xl p-3.5">
              <div class="bg-green-500/10 text-green-600 border border-green-500/20 rounded-full p-1">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Payments (Stripe, Gumroad, Lemon Squeezy)
            </div>
            <div class="flex items-center gap-3 text-sm text-foreground bg-muted/50 rounded-2xl p-3.5">
              <div class="bg-green-500/10 text-green-600 border border-green-500/20 rounded-full p-1">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Automation (Zapier, Custom Webhooks)
            </div>
            <div class="flex items-center gap-3 text-sm text-foreground bg-muted/50 rounded-2xl p-3.5">
              <div class="bg-green-500/10 text-green-600 border border-green-500/20 rounded-full p-1">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Form submissions to your integrations
            </div>
          </div>
          <Button size="sm" @click="showUpgradeModal = true">
            Upgrade to Pro - $6/month
          </Button>
        </div>
      </div>

      <!-- Integrations Content (Pro plan) -->
      <template v-else>
        <Header
          title="Integrations"
          description="Connect third-party services to enhance your project."
        />

        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
          <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>

        <template v-else>
          <!-- Connected Integrations -->
          <div v-if="connectedIntegrations.length > 0" class="mb-8">
            <h2 class="text-sm font-medium text-foreground mb-4">Connected</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card
                v-for="{ connection, definition } in connectedIntegrations"
                :key="connection.id"
              >
                <Card.Content class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg v-if="definition.category === 'email'" class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <svg v-else-if="definition.category === 'payment'" class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <svg v-else-if="definition.category === 'analytics'" class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <svg v-else class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                      <div>
                        <p class="text-sm font-medium text-foreground">{{ definition.name }}</p>
                        <div class="flex items-center gap-1.5 mt-0.5">
                          <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          <span class="text-xs text-muted-foreground">
                            {{ connection.accountInfo?.email || connection.accountInfo?.name || 'Connected' }}
                          </span>
                        </div>
                      </div>
                      <button
                        class="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        @click="openDisconnectModal(definition)"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </div>

          <!-- Dynamic Category Sections -->
          <div v-for="cat in categories" :key="cat.category" class="mb-8">
            <div class="flex items-center gap-2 mb-4">
              <svg v-if="cat.category === 'email'" class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <svg v-else-if="cat.category === 'payment'" class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <svg v-else-if="cat.category === 'analytics'" class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <svg v-else class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <h2 class="text-sm font-medium text-foreground">{{ cat.label }}</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card
                v-for="integration in cat.integrations"
                :key="integration.id"
                hoverable
              >
                <Card.Content class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <svg v-if="cat.category === 'email'" class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <svg v-else-if="cat.category === 'payment'" class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <svg v-else-if="cat.category === 'analytics'" class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <svg v-else class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-medium text-foreground">{{ integration.name }}</p>
                      <span v-if="integration.isConnected" class="flex items-center gap-1 text-xs text-green-600">
                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Connected
                      </span>
                    </div>
                    <p class="text-xs text-muted-foreground mt-1 line-clamp-2">{{ integration.description }}</p>
                    <button
                      v-if="!integration.isConnected"
                      class="mt-3 h-7 px-3 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
                      @click="openConnectModal(integration)"
                    >
                      Connect
                    </button>
                    <button
                      v-else
                      class="mt-3 h-7 px-3 border border-border text-xs font-medium rounded-md hover:bg-muted transition-colors"
                      @click="openConnectModal(integration)"
                    >
                      Configure
                    </button>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </div>
        </template>
      </template>
    </div>

    <!-- Connect Modal -->
    <Teleport to="body">
      <div
        v-if="showConnectModal && selectedIntegration"
        class="fixed inset-0 z-[9999] flex items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/50" @click="showConnectModal = false"></div>
        <div class="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg v-if="selectedIntegration.category === 'email'" class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <svg v-else-if="selectedIntegration.category === 'payment'" class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <svg v-else class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-foreground">{{ isConnected(selectedIntegration.id) ? 'Configure' : 'Connect' }} {{ selectedIntegration.name }}</h2>
              <p class="text-xs text-muted-foreground">{{ selectedIntegration.description }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <!-- Dynamic config fields -->
            <div v-for="field in selectedIntegration.configFields || []" :key="field.key" class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">
                {{ field.label }}
                <span v-if="!field.required" class="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                v-model="configInputs[field.key]"
                :type="field.type === 'password' ? 'password' : field.type === 'url' ? 'url' : 'text'"
                class="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                :placeholder="field.placeholder"
              />
              <p v-if="field.helpText" class="text-xs text-muted-foreground">{{ field.helpText }}</p>
            </div>

            <!-- Webhook URL for payment integrations (for receiving webhooks from provider) -->
            <div v-if="selectedIntegration.category === 'payment'" class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">Webhook URL</label>
              <div class="flex gap-2">
                <input
                  type="text"
                  readonly
                  :value="`https://lands.app/api/webhooks/${projectId}/${selectedIntegration.id}`"
                  class="flex-1 h-10 px-3 bg-muted border border-border rounded-md text-sm text-muted-foreground"
                />
                <button class="h-10 px-3 border border-border rounded-md hover:bg-muted transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <p class="text-xs text-muted-foreground">
                Add this URL to your {{ selectedIntegration.name }} webhook settings.
              </p>
            </div>

            <!-- Docs link -->
            <div v-if="selectedIntegration.docsUrl" class="pt-2">
              <a
                :href="selectedIntegration.docsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                View {{ selectedIntegration.name }} documentation
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 mt-6">
            <button
              class="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              @click="showConnectModal = false"
            >
              Cancel
            </button>
            <button
              class="h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              :disabled="isSaving"
              @click="connectIntegration"
            >
              {{ isConnected(selectedIntegration.id) ? 'Save Changes' : 'Connect' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Disconnect Modal -->
    <Teleport to="body">
      <div
        v-if="showDisconnectModal && selectedIntegration"
        class="fixed inset-0 z-[9999] flex items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/50" @click="showDisconnectModal = false"></div>
        <div class="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6">
          <h2 class="text-lg font-semibold text-foreground mb-2">Disconnect {{ selectedIntegration.name }}</h2>
          <p class="text-sm text-muted-foreground mb-4">
            Are you sure you want to disconnect {{ selectedIntegration.name }}? This will remove the integration from your project.
          </p>

          <div class="flex items-center justify-end gap-3 mt-6">
            <button
              class="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              @click="showDisconnectModal = false"
            >
              Cancel
            </button>
            <button
              class="h-9 px-4 bg-destructive text-destructive-foreground text-sm font-medium rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
              :disabled="isSaving"
              @click="disconnectIntegration"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Plan Upgrade Modal -->
    <PlanUpgrade
      v-model:open="showUpgradeModal"
      :project-id="projectId"
    />
  </div>
</template>
