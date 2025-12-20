<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { SectionBlock, ImageSettings, ImageStyles, ViewportSize } from '@/types/designer'
import { useDesignerStore } from '@/stores/designer'
import { useBlockStyles } from '../composables/useBlockStyles'
import Icon from '@/components/ui/Icon.vue'

/**
 * ImageBlock - Renders an image with placeholder for empty state
 * Supports translations for alt text
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const designerStore = useDesignerStore()
const blockRef = toRef(props, 'block')
const viewportRef = computed(() => designerStore.viewport as ViewportSize)

// Use composable for image-specific styles
const { getImageStyles } = useBlockStyles(blockRef, { viewport: viewportRef })

const settings = computed(() => props.block.settings as ImageSettings)
const imageStyles = computed(() => props.block.styles as ImageStyles)

// Check if image has absolute or fixed positioning
const isAbsoluteOrFixed = computed(() => {
  const position = imageStyles.value?.position
  return position === 'absolute' || position === 'fixed'
})

// Check if image has explicit dimensions set (height or aspect ratio)
const hasExplicitDimensions = computed(() => {
  const s = imageStyles.value
  return !!(s?.height || s?.aspectRatio)
})

// Build CSS filter string from adjustment values
const filterStyle = computed(() => {
  const filters: string[] = []
  const s = imageStyles.value

  if (s?.brightness !== undefined && s.brightness !== 100) {
    filters.push(`brightness(${s.brightness / 100})`)
  }
  if (s?.contrast !== undefined && s.contrast !== 100) {
    filters.push(`contrast(${s.contrast / 100})`)
  }
  if (s?.saturation !== undefined && s.saturation !== 100) {
    filters.push(`saturate(${s.saturation / 100})`)
  }
  if (s?.hue !== undefined && s.hue !== 0) {
    filters.push(`hue-rotate(${s.hue}deg)`)
  }
  if (s?.grayscale !== undefined && s.grayscale !== 0) {
    filters.push(`grayscale(${s.grayscale / 100})`)
  }

  return filters.length > 0 ? filters.join(' ') : undefined
})

// Translation-aware alt text
const displayAlt = computed(() => {
  if (!settings.value) return ''
  const lang = designerStore.currentLanguage
  if (lang) {
    const langTranslations = designerStore.translations.languages[lang]
    const translated = langTranslations?.blocks[props.block.id]?.alt
    if (translated !== undefined) return translated
  }
  return settings.value.alt
})
</script>

<template>
  <!-- Absolute/Fixed positioned image - simpler structure -->
  <div v-if="isAbsoluteOrFixed && settings?.src" class="relative w-full h-full" :style="styles">
    <img
      :src="settings.src"
      :alt="displayAlt || ''"
      class="w-full h-full block"
      draggable="false"
      :style="{ ...getImageStyles(), filter: filterStyle }"
    />
    <!-- Image Overlay -->
    <div
      v-if="settings.overlay"
      class="absolute inset-0 pointer-events-none"
      :style="{
        backgroundColor: settings.overlay,
        opacity: (settings.overlayOpacity ?? 50) / 100,
        borderRadius: getImageStyles().borderRadius || '0',
      }"
    />
  </div>

  <!-- Normal positioned image - centered layout -->
  <div
    v-else-if="settings?.src"
    class="flex justify-center"
    :class="{ 'h-full': hasExplicitDimensions }"
    :style="styles"
  >
    <div class="relative" :class="{ 'w-full h-full': hasExplicitDimensions, 'inline-block': !hasExplicitDimensions }">
      <img
        :src="settings.src"
        :alt="displayAlt || ''"
        class="block"
        :class="hasExplicitDimensions ? 'w-full h-full' : 'max-w-full h-auto'"
        draggable="false"
        :style="{ ...getImageStyles(), filter: filterStyle }"
      />
      <!-- Image Overlay -->
      <div
        v-if="settings.overlay"
        class="absolute inset-0 pointer-events-none"
        :style="{
          backgroundColor: settings.overlay,
          opacity: (settings.overlayOpacity ?? 50) / 100,
          borderRadius: getImageStyles().borderRadius || '0',
        }"
      />
    </div>
  </div>

  <!-- Empty state -->
  <div
    v-else
    class="flex justify-center"
    :style="styles"
  >
    <div class="w-full h-48 bg-muted/50 rounded-lg flex items-center justify-center">
      <Icon name="content-image" class="text-4xl text-muted-foreground" />
    </div>
  </div>
</template>
