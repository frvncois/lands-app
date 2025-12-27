<script setup lang="ts">
import { Icon } from '@/components/ui'

defineProps<{
  options: { id: string; label: string; icon?: string }[]
}>()

const emit = defineEmits<{
  select: [optionId: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <button
      v-for="option in options"
      :key="option.id"
      class="w-full flex items-center gap-3 px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg text-left transition-colors"
      @click="emit('select', option.id)"
    >
      <Icon v-if="option.icon" :name="option.icon" :size="16" class="shrink-0" />
      <span class="text-sm">{{ option.label }}</span>
    </button>
  </div>
</template>
