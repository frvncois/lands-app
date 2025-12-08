<script setup lang="ts">
interface Props {
  title?: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex items-center gap-2">
    <span v-if="title" class="text-sm font-medium text-foreground truncate">
      {{ title }}
    </span>
    <slot />
  </div>
</template>
