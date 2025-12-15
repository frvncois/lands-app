<script setup lang="ts">
/**
 * DropIndicator - Shows where dropped item will be placed
 * Used by container, grid, stack blocks
 */
defineProps<{
  visible: boolean
  horizontal?: boolean
  position: number | null
}>()
</script>

<template>
  <div
    v-if="visible && position !== null"
    class="absolute bg-primary rounded-full z-10 pointer-events-none"
    :class="horizontal ? 'h-1 top-0 bottom-0' : 'w-1 left-0 right-0'"
    :style="{
      [horizontal ? 'left' : 'top']: `${position}px`,
      transform: horizontal ? 'translateX(-50%)' : 'translateY(-50%)',
    }"
  />
</template>
