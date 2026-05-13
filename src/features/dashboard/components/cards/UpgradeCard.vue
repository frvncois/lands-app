<script setup lang="ts">
import { SparklesIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { useAppModals } from '@/features/modals/composables/useAppModals'

const appModals = useAppModals()
</script>

<template>
  <div class="flex-1 shrink-0 card-appear rounded-xl border bg-gray-50 border-gray-200 justify-center p-8 flex flex-col items-center gap-2 text-center" style="animation-delay: 400ms">
    <div class="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center">
      <SparklesIcon class="h-5 w-5 text-gray-100" />
    </div>
    <p class="text-sm font-semibold text-gray-900">Upgrade to Pro</p>
    <div class="flex flex-wrap justify-center gap-1.5">
      <p class="text-xs text-gray-500 leading-relaxed mb-2">Unlimited content, Analtyics, Campaign, Collaborators, Custom domain, and more</p>
    </div>
    <BaseButton variant="solid" size="sm" @click="appModals.openUpgrade()">
      Upgrade Plan
    </BaseButton>
  </div>
</template>
