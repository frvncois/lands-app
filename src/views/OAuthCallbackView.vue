<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useIntegrations } from '@/composables/useIntegrations'

const router = useRouter()

const status = ref<'processing' | 'success' | 'error'>('processing')
const errorMessage = ref('')

onMounted(async () => {
  // Get URL params
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')
  const error = params.get('error')

  // Check for OAuth error
  if (error) {
    status.value = 'error'
    errorMessage.value = params.get('error_description') || 'Authorization was denied'
    return
  }

  // Validate required params
  if (!code || !state) {
    status.value = 'error'
    errorMessage.value = 'Missing authorization code or state'
    return
  }

  // Get saved project ID from session storage
  const savedProjectId = sessionStorage.getItem('oauth_project_id')

  if (!savedProjectId) {
    status.value = 'error'
    errorMessage.value = 'Session expired. Please try connecting again.'
    return
  }

  try {
    // Use the integration composable to handle callback
    const { handleOAuthCallback } = useIntegrations(savedProjectId)
    const success = await handleOAuthCallback(code, state)

    if (success) {
      status.value = 'success'
      // Redirect back to integrations page after a short delay
      setTimeout(() => {
        router.push({ name: 'integration', params: { projectId: savedProjectId } })
      }, 1500)
    } else {
      status.value = 'error'
      errorMessage.value = 'Failed to complete the connection'
    }
  } catch (e) {
    status.value = 'error'
    errorMessage.value = e instanceof Error ? e.message : 'An unexpected error occurred'
  }
})

function goToIntegrations() {
  const savedProjectId = sessionStorage.getItem('oauth_project_id')
  if (savedProjectId) {
    router.push({ name: 'integration', params: { projectId: savedProjectId } })
  } else {
    router.push({ name: 'dashboard' })
  }
}
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="max-w-md w-full text-center">
      <!-- Processing -->
      <template v-if="status === 'processing'">
        <div class="w-16 h-16 mx-auto mb-6">
          <div class="w-full h-full border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
        <h1 class="text-xl font-semibold text-foreground mb-2">Connecting...</h1>
        <p class="text-sm text-muted-foreground">
          Please wait while we complete the connection.
        </p>
      </template>

      <!-- Success -->
      <template v-else-if="status === 'success'">
        <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-xl font-semibold text-foreground mb-2">Connected!</h1>
        <p class="text-sm text-muted-foreground">
          Integration connected successfully. Redirecting...
        </p>
      </template>

      <!-- Error -->
      <template v-else-if="status === 'error'">
        <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-xl font-semibold text-foreground mb-2">Connection Failed</h1>
        <p class="text-sm text-muted-foreground mb-6">
          {{ errorMessage }}
        </p>
        <button
          class="h-10 px-6 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          @click="goToIntegrations"
        >
          Back to Integrations
        </button>
      </template>
    </div>
  </div>
</template>
