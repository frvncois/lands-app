<script setup lang="ts">
import { SparklesIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAppModals } from '@/stores/appModals'

defineProps<{
  variant: 'full' | 'compact'
}>()

const appModals = useAppModals()
</script>

<template>
  <div v-if="variant === 'full'" class="rounded-xl border border-gray-200 px-4 py-4 flex flex-col flex-1 justify-center items-center gap-4 text-center">
    <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
      <SparklesIcon class="h-5 w-5 text-gray-700" />
    </div>
    <p class="text-sm font-semibold text-gray-900">Upgrade to Pro</p>
    <div class="flex flex-wrap justify-center gap-1.5">
      <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">Marketing</span>
      <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">Custom Domain</span>
      <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">Unlimited</span>
    </div>
    <BaseButton size="sm" variant="solid" class="w-full justify-center" @click="appModals.openUpgrade()">Upgrade — $10/mo</BaseButton>
  </div>

  <div v-else class="rounded-xl border border-gray-200 p-3 flex flex-col gap-3 text-center items-center">
    <p class="text-xs text-gray-500 leading-relaxed">You've reached the section limit. Upgrade to Pro for unlimited sections.</p>
    <BaseButton size="sm" variant="solid" class="w-full justify-center" @click="appModals.openUpgrade()">Upgrade to Pro</BaseButton>
  </div>
</template>
