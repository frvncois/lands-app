<script setup lang="ts">
import { THEME_OPTIONS } from '@/lib/assistant/flows'

const emit = defineEmits<{
  select: [themeId: string]
}>()

function handleSelect(themeId: string) {
  emit('select', themeId)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-2">
    <button
      v-for="theme in THEME_OPTIONS"
      :key="theme.id"
      class="w-full text-left border border-border rounded-lg p-3 hover:border-primary transition-colors"
      @click="handleSelect(theme.id)"
    >
      <div class="font-medium text-sm">{{ theme.label }}</div>
      <div class="text-xs text-muted-foreground mt-1">{{ theme.description }}</div>
    </button>
  </div>
</template>
