<script setup lang="ts">
defineProps<{
  label: string
  horizontal?: boolean
}>()
</script>

<template>
  <div v-if="horizontal" class="h-8 flex items-center justify-between gap-2">
    <label class="text-xs font-medium text-muted-foreground">{{ label }}</label>
    <slot />
  </div>
  <div v-else class="space-y-1.5">
    <label class="text-xs font-medium text-muted-foreground">{{ label }}</label>
    <slot />
  </div>
</template>
