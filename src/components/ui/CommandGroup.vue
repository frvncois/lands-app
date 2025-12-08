<script setup lang="ts">
interface Props {
  heading?: string
}

defineProps<Props>()
</script>

<template>
  <div class="mb-2 last:mb-0">
    <p v-if="heading" class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
      {{ heading }}
    </p>
    <div class="space-y-0.5">
      <slot />
    </div>
  </div>
</template>
