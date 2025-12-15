<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { SectionBlock, VideoSettings, ViewportSize } from '@/types/editor'
import { useEditorStore } from '@/stores/editor'
import { useBlockStyles } from '../composables/useBlockStyles'
import Icon from '@/components/ui/Icon.vue'

/**
 * VideoBlock - Renders a video element with placeholder for empty state
 * Supports autoplay, loop, muted, and controls settings
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const editorStore = useEditorStore()
const blockRef = toRef(props, 'block')
const viewportRef = computed(() => editorStore.viewport as ViewportSize)

// Use composable for video-specific styles
const { getVideoStyles } = useBlockStyles(blockRef, { viewport: viewportRef })

const settings = computed(() => props.block.settings as VideoSettings)
</script>

<template>
  <div class="flex justify-center" :style="styles">
    <video
      v-if="settings?.src"
      :src="settings.src"
      :autoplay="settings.autoplay"
      :loop="settings.loop"
      :muted="settings.muted"
      :controls="settings.controls"
      class="max-w-full"
      :style="getVideoStyles()"
    />
    <div
      v-else
      class="w-full h-48 bg-muted/50 rounded-lg flex items-center justify-center"
    >
      <Icon name="play" class="text-4xl text-muted-foreground" />
    </div>
  </div>
</template>
