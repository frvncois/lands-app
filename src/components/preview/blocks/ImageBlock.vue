<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { SectionBlock, ImageSettings, ViewportSize } from '@/types/editor'
import { useEditorStore } from '@/stores/editor'
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

const editorStore = useEditorStore()
const blockRef = toRef(props, 'block')
const viewportRef = computed(() => editorStore.viewport as ViewportSize)

// Use composable for image-specific styles
const { getImageStyles } = useBlockStyles(blockRef, { viewport: viewportRef })

const settings = computed(() => props.block.settings as ImageSettings)

// Translation-aware alt text
const displayAlt = computed(() => {
  if (!settings.value) return ''
  const lang = editorStore.currentLanguage
  if (lang) {
    const langTranslations = editorStore.translations.languages[lang]
    const translated = langTranslations?.blocks[props.block.id]?.alt
    if (translated !== undefined) return translated
  }
  return settings.value.alt
})
</script>

<template>
  <div class="flex justify-center" :style="styles">
    <img
      v-if="settings?.src"
      :src="settings.src"
      :alt="displayAlt || ''"
      class="max-w-full h-auto"
      :style="getImageStyles()"
    />
    <div
      v-else
      class="w-full h-48 bg-muted/50 rounded-lg flex items-center justify-center"
    >
      <Icon name="content-image" class="text-4xl text-muted-foreground" />
    </div>
  </div>
</template>
