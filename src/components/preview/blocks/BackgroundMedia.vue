<script setup lang="ts">
/**
 * BackgroundMedia - Reusable background image/video component
 * Used by container, grid, stack, canvas blocks
 */
const props = defineProps<{
  type?: 'color' | 'image' | 'video' | 'gradient'
  // Image/video source
  image?: string
  video?: string
  // Image effects
  imageOpacity?: number
  imageBlur?: number
  imageSaturation?: number
  // Overlay
  imageOverlay?: string
  imageOverlayOpacity?: number
}>()
</script>

<template>
  <!-- Background Image with effects -->
  <div
    v-if="type === 'image' && props.image"
    class="absolute inset-0 bg-cover bg-center pointer-events-none"
    :style="{
      backgroundImage: `url(${props.image})`,
      opacity: (props.imageOpacity ?? 100) / 100,
      filter: `blur(${props.imageBlur ?? 0}px) saturate(${props.imageSaturation ?? 100}%)`,
    }"
  />

  <!-- Background Image Overlay -->
  <div
    v-if="type === 'image' && props.image && props.imageOverlay"
    class="absolute inset-0 pointer-events-none"
    :style="{
      backgroundColor: props.imageOverlay,
      opacity: (props.imageOverlayOpacity ?? 50) / 100,
    }"
  />

  <!-- Background Video -->
  <video
    v-else-if="type === 'video' && props.video"
    class="absolute inset-0 w-full h-full object-cover pointer-events-none"
    :src="props.video"
    :style="{
      opacity: (props.imageOpacity ?? 100) / 100,
      filter: `blur(${props.imageBlur ?? 0}px) saturate(${props.imageSaturation ?? 100}%)`,
    }"
    autoplay
    loop
    muted
    playsinline
  />
</template>
