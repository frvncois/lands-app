<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useLandStore } from '@/stores/land'
import { landService } from '@/services/land.service'

const router = useRouter()
const route = useRoute()
const landStore = useLandStore()
const status = ref<'polling' | 'done' | 'timeout'>('polling')

onMounted(async () => {
  const landId = route.query.land_id as string | undefined
  if (!landId) { router.replace('/dashboard'); return }

  // Poll until plan is updated by webhook (max ~10s)
  for (let i = 0; i < 10; i++) {
    const lands = await landService.getMyLands()
    const land = lands.find(l => l.id === landId)
    if (land?.plan === 'paid') {
      landStore.setLands(lands)
      landStore.setActiveLand(landId)
      status.value = 'done'
      setTimeout(() => router.replace('/dashboard'), 1800)
      return
    }
    await new Promise(r => setTimeout(r, 1000))
  }

  status.value = 'timeout'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white">
    <div class="flex flex-col items-center gap-5 text-center max-w-xs px-6">

      <template v-if="status === 'polling'">
        <div class="h-10 w-10 rounded-full border-2 border-gray-900 border-t-transparent animate-spin" />
        <p class="text-sm text-gray-500">Confirming your subscription…</p>
      </template>

      <template v-else-if="status === 'done'">
        <div class="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircleIcon class="h-7 w-7 text-green-600" />
        </div>
        <div>
          <p class="text-base font-semibold text-gray-900">You're on Pro!</p>
          <p class="text-sm text-gray-400 mt-1">Redirecting you back…</p>
        </div>
      </template>

      <template v-else>
        <p class="text-sm text-gray-500">Your payment was received. It may take a moment to activate.</p>
        <a href="/dashboard" class="text-sm font-medium text-gray-900 underline">Back to dashboard</a>
      </template>

    </div>
  </div>
</template>
