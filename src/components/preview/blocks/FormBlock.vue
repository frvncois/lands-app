<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { SectionBlock, SectionBlockType, FormSettings, FormStyles } from '@/types/designer'
import { BackgroundMedia } from './index'
import SidebarBlockPicker from '@/components/builder/SidebarBlockPicker.vue'
import { formChildBlockTypes } from '@/lib/designer-utils'

// Use async component to avoid circular dependency
const PreviewSection = defineAsyncComponent(() => import('../PreviewSection.vue'))

/**
 * FormBlock - Renders a form container with vertical stacking
 * Form elements (inputs, textareas, etc.) can only exist inside this block
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
  isDropTarget: boolean
  childDropIndex: number | null
}>()

const emit = defineEmits<{
  (e: 'dragEnter', event: DragEvent): void
  (e: 'dragOver', event: DragEvent): void
  (e: 'dragLeave', event: DragEvent): void
  (e: 'drop', event: DragEvent): void
  (e: 'childDragOver', index: number, event: DragEvent): void
  (e: 'childDragLeave'): void
  (e: 'addBlock', type: SectionBlockType): void
}>()

const settings = computed(() => props.block.settings as FormSettings)
const formStyles = computed(() => props.block.styles as FormStyles)

// Check if child has absolute or fixed positioning
function isChildAbsoluteOrFixed(child: SectionBlock): boolean {
  const childStyles = child.styles as Record<string, unknown>
  const position = childStyles?.position as string
  return position === 'absolute' || position === 'fixed'
}

// Get flex styles for a child block
function getChildFlexStyles(child: SectionBlock): Record<string, string> {
  if (isChildAbsoluteOrFixed(child)) {
    return {}
  }

  const childSettings = child.settings as Record<string, unknown>
  const flexMode = childSettings.flexMode as string || 'auto'
  const flexValue = childSettings.flexValue as string || '1'

  const styles: Record<string, string> = {}

  switch (flexMode) {
    case 'grow':
      styles.flexGrow = flexValue
      styles.flexShrink = '0'
      styles.flexBasis = '0%'
      break
    case 'shrink':
      styles.flexGrow = '0'
      styles.flexShrink = flexValue
      styles.flexBasis = 'auto'
      break
    case 'auto':
    default:
      styles.flex = '0 0 auto'
      break
  }

  return styles
}

// Form-specific block types for the picker
const formBlockTypes = [...formChildBlockTypes, 'container', 'stack', 'grid', 'text', 'heading']
</script>

<template>
  <form
    class="relative flex flex-1 min-h-0"
    :style="{
      ...styles,
      flexDirection: formStyles?.flexDirection || styles.flexDirection || 'column',
      justifyContent: formStyles?.justifyContent || styles.justifyContent || 'flex-start',
      alignItems: formStyles?.alignItems || styles.alignItems || 'stretch',
      gap: formStyles?.gap || styles.gap || '16px',
      backgroundColor: settings?.backgroundType && settings.backgroundType !== 'color' ? undefined : styles.backgroundColor,
    }"
    :action="settings?.action"
    :method="settings?.method || 'POST'"
    @submit.prevent
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
    />

    <!-- Children -->
    <template v-if="block.children && block.children.length > 0">
      <template v-for="(child, childIndex) in block.children" :key="child.id">
        <div
          class="z-10 flex flex-col min-h-0"
          :class="{ 'relative': !isChildAbsoluteOrFixed(child) }"
          :style="getChildFlexStyles(child)"
          @dragover="emit('childDragOver', childIndex, $event)"
          @dragleave="emit('childDragLeave')"
        >
          <PreviewSection
            :block="child"
            :index="childIndex"
            :total="block.children.length"
          />
        </div>
      </template>
    </template>

    <!-- Empty State -->
    <div
      v-else
      class="relative z-30 flex-1 flex flex-col items-center justify-center py-8 text-muted-foreground border-1 border-dashed border-border/50"
    >
      <SidebarBlockPicker
        mode="nested"
        trigger-label="Add form field"
        :allowed-types="formBlockTypes"
        @select="(type: string) => emit('addBlock', type as SectionBlockType)"
      />
    </div>
  </form>
</template>
