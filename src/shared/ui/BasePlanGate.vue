<script setup lang="ts">
import { LockClosedIcon } from '@heroicons/vue/24/outline'
import BaseButton from './BaseButton.vue'
import { useAppModals } from '@/features/modals/composables/useAppModals'

defineProps<{
  title: string
  description: string
}>()

const appModals = useAppModals()
</script>

<template>
  <div class="flex flex-col items-center gap-3 py-8 px-4 text-center">
    <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
      <LockClosedIcon class="h-4 w-4 text-gray-900" />
    </div>
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-gray-900">{{ title }}</p>
      <p class="text-xs text-gray-400 leading-relaxed">{{ description }}</p>
    </div>
    <BaseButton variant="solid" size="sm" @click="appModals.openUpgrade()">
      Upgrade — $10/mo
    </BaseButton>
  </div>
</template>
