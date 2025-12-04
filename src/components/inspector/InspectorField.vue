<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div class="space-y-1.5">
    <label class="text-xs font-medium text-muted-foreground">{{ label }}</label>
    <slot />
  </div>
</template>
