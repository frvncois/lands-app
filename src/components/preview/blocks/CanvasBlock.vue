<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { SectionBlock, SectionBlockType, CanvasSettings, CanvasChildPosition } from '@/types/designer'
import type { ListPresetType } from '@/lib/list-presets'
import { BackgroundMedia } from './index'
import SidebarBlockPicker from '@/components/builder/SidebarBlockPicker.vue'
import { useDesignerStore } from '@/stores/designer'

// Use async component to avoid circular dependency
const PreviewSection = defineAsyncComponent(() => import('../PreviewSection.vue'))

/**
 * CanvasBlock - Renders children with absolute positioning
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
  isDropTarget: boolean
}>()

const emit = defineEmits<{
  (e: 'dragEnter', event: DragEvent): void
  (e: 'dragOver', event: DragEvent): void
  (e: 'dragLeave', event: DragEvent): void
  (e: 'drop', event: DragEvent): void
  (e: 'addBlock', type: SectionBlockType): void
  (e: 'addListPreset', type: ListPresetType): void
}>()

const designerStore = useDesignerStore()

const settings = computed(() => props.block.settings as CanvasSettings)

// Find content image source for content-aware background
const contentImageSrc = computed(() => {
  const sourceId = settings.value?.backgroundContentSource
  if (!sourceId) return undefined

  function findImageById(block: SectionBlock): string | undefined {
    if (block.id === sourceId && block.type === 'image') {
      const imgSettings = block.settings as { src?: string }
      return imgSettings.src
    }
    if (block.children) {
      for (const child of block.children) {
        const found = findImageById(child)
        if (found) return found
      }
    }
    return undefined
  }

  return findImageById(props.block)
})

// Get position for a canvas child based on current viewport
function getCanvasChildPos(childId: string): CanvasChildPosition {
  const defaultPos: CanvasChildPosition = { x: 10, y: 10, width: undefined, zIndex: 1 }
  const viewport = designerStore.viewport
  const positions = settings.value?.childPositions
  if (!positions) return defaultPos

  // Fall back through viewports: mobile -> tablet -> desktop
  if (viewport === 'mobile') {
    return positions.mobile?.[childId] || positions.tablet?.[childId] || positions.desktop?.[childId] || defaultPos
  }
  if (viewport === 'tablet') {
    return positions.tablet?.[childId] || positions.desktop?.[childId] || defaultPos
  }
  return positions.desktop?.[childId] || defaultPos
}
</script>

<template>
  <div
    :data-block-id="block.id"
    class="relative"
    :style="{
      ...styles,
      minHeight: styles.minHeight || '400px',
      backgroundColor: settings?.backgroundType && settings.backgroundType !== 'color' ? undefined : styles.backgroundColor,
    }"
    @dragenter="emit('dragEnter', $event)"
    @dragover="emit('dragOver', $event)"
    @dragleave="emit('dragLeave', $event)"
    @drop="emit('drop', $event)"
  >
    <!-- Background Media -->
    <BackgroundMedia
      :type="settings?.backgroundType"
      :image="settings?.backgroundImage"
      :video="settings?.backgroundVideo"
      :image-opacity="settings?.backgroundImageOpacity"
      :image-blur="settings?.backgroundImageBlur"
      :image-saturation="settings?.backgroundImageSaturation"
      :image-overlay="settings?.backgroundImageOverlay"
      :image-overlay-opacity="settings?.backgroundImageOverlayOpacity"
      :content-image-src="contentImageSrc"
      :content-blur="settings?.backgroundContentBlur"
      :content-saturation="settings?.backgroundContentSaturation"
      :content-scale="settings?.backgroundContentScale"
    />

    <!-- Children with absolute positioning -->
    <template v-if="block.children && block.children.length > 0">
      <div
        v-for="(child, childIndex) in block.children"
        :key="child.id"
        class="absolute"
        :style="{
          left: `${getCanvasChildPos(child.id).x}%`,
          top: `${getCanvasChildPos(child.id).y}%`,
          width: getCanvasChildPos(child.id).width ? `${getCanvasChildPos(child.id).width}%` : 'auto',
          zIndex: getCanvasChildPos(child.id).zIndex || childIndex + 1,
        }"
      >
        <PreviewSection
          :block="child"
          :index="childIndex"
          :total="(block.children || []).length"
        />
      </div>
    </template>

    <!-- Empty State -->
    <div
      v-else
      class="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground border-1 border-dashed border-border/50 m-4"
    >
      <SidebarBlockPicker
        mode="nested"
        trigger-label="Add content"
        @select="(type: string) => emit('addBlock', type as SectionBlockType)"
        @select-list-preset="(type: ListPresetType) => emit('addListPreset', type)"
      />
    </div>
  </div>
</template>
