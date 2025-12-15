<script setup lang="ts">
/**
 * BackgroundMedia - Reusable background image/video component
 * Used by container, grid, stack, canvas blocks
 */
defineProps<{
  type?: 'color' | 'image' | 'video' | 'gradient'
  src?: string
  opacity?: number
  blur?: number
  saturation?: number
}>()
</script>

<template>
  <!-- Background Image with effects -->
  <div
    v-if="type === 'image' && src"
    class="absolute inset-0 bg-cover bg-center pointer-events-none"
    :style="{
      backgroundImage: `url(${src})`,
      opacity: (opacity ?? 100) / 100,
      filter: `blur(${blur ?? 0}px) saturate(${saturation ?? 100}%)`,
    }"
  />

  <!-- Background Video -->
  <video
    v-else-if="type === 'video' && src"
    class="absolute inset-0 w-full h-full object-cover pointer-events-none"
    :src="src"
    :style="{
      opacity: (opacity ?? 100) / 100,
      filter: `blur(${blur ?? 0}px) saturate(${saturation ?? 100}%)`,
    }"
    autoplay
    loop
    muted
    playsinline
  />
</template>
