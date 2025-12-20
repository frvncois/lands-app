<script setup lang="ts">
/**
 * BackgroundMedia - Reusable background image/video component
 * Used by container, grid, stack, canvas blocks
 */
const props = defineProps<{
  type?: 'color' | 'image' | 'video' | 'gradient' | 'content'
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
  // Content-aware background
  contentImageSrc?: string
  contentBlur?: number
  contentSaturation?: number
  contentScale?: number
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
    draggable="false"
  />

  <!-- Content-aware Background (Spotify-style blur) -->
  <div
    v-else-if="type === 'content' && props.contentImageSrc"
    class="absolute inset-0 overflow-hidden pointer-events-none"
  >
    <img
      :src="props.contentImageSrc"
      class="absolute inset-0 w-full h-full object-cover"
      :style="{
        filter: `blur(${props.contentBlur ?? 40}px) saturate(${(props.contentSaturation ?? 150) / 100})`,
        transform: `scale(${(props.contentScale ?? 120) / 100})`,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }"
      draggable="false"
    />
  </div>
</template>
