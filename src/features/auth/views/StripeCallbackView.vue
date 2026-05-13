<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { stripeService } from '@/features/integrations/services/stripe.service'
import { landService } from '@/features/lands/services/land.service'
import { useLandStore } from '@/features/lands/stores/land'

const router = useRouter()
const landStore = useLandStore()
const error = ref<string | null>(null)

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const landId = params.get('state')
  const errorParam = params.get('error_description') ?? params.get('error')

  if (errorParam) {
    error.value = errorParam
    return
  }
  if (!code || !landId) {
    error.value = 'Missing authorization code or land ID'
    return
  }

  try {
    await stripeService.handleCallback(code, landId)
    const lands = await landService.getMyLands()
    landStore.setLands(lands)
    if (landId) landStore.setActiveLand(landId)
    router.replace('/dashboard?stripe=connected')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to connect Stripe'
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center space-y-3 max-w-sm px-4">
      <template v-if="error">
        <p class="text-sm font-medium text-red-600">{{ error }}</p>
<a href="/dashboard" class="text-sm text-gray-500 underline">Back to dashboard</a>
      </template>
      <template v-else>
        <div class="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p class="text-sm text-gray-500">Connecting Stripe…</p>
      </template>
    </div>
  </div>
</template>
