<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from 'vue'
import type { SectionBlock, SectionBlockType, StackSettings, StackStyles } from '@/types/editor'
import { BackgroundMedia } from './index'
import SidebarBlockPicker from '@/components/builder/SidebarBlockPicker.vue'

// Use async component to avoid circular dependency
const PreviewSection = defineAsyncComponent(() => import('../PreviewSection.vue'))

/**
 * StackBlock - Renders a flex container with vertical/horizontal stacking
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

const settings = computed(() => props.block.settings as StackSettings)
const stackStyles = computed(() => props.block.styles as StackStyles)

const isHorizontal = computed(() => stackStyles.value?.flexDirection === 'row')

// Dynamic HTML tag (defaults to 'div')
const htmlTag = computed(() => settings.value?.htmlTag || 'div')

// Check if child has absolute or fixed positioning
function isChildAbsoluteOrFixed(child: SectionBlock): boolean {
  const childStyles = child.styles as Record<string, unknown>
  const position = childStyles?.position as string
  return position === 'absolute' || position === 'fixed'
}

// Get flex styles for a child block based on its flexMode and flexValue
function getChildFlexStyles(child: SectionBlock): Record<string, string> {
  // Absolute/fixed positioned elements don't participate in flex layout
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
</script>

<template>
  <component
    :is="htmlTag"
    class="relative flex flex-1 min-h-0 transition-colors"
    :class="isDropTarget ? 'ring-2 ring-primary ring-dashed bg-primary/5' : ''"
    :style="{
      ...styles,
      flexDirection: stackStyles?.flexDirection || styles.flexDirection || 'column',
      justifyContent: stackStyles?.justifyContent || styles.justifyContent || 'flex-start',
      alignItems: stackStyles?.alignItems || styles.alignItems || 'stretch',
      gap: stackStyles?.gap || styles.gap || '16px',
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
    />

    <!-- Children -->
    <template v-if="block.children && block.children.length > 0">
      <div
        v-for="(child, childIndex) in block.children"
        :key="child.id"
        class="z-10 flex flex-col min-h-0"
        :class="{ 'relative': !isChildAbsoluteOrFixed(child) }"
        :style="getChildFlexStyles(child)"
        @dragover="emit('childDragOver', childIndex, $event)"
        @dragleave="emit('childDragLeave')"
      >
        <!-- Drop indicator -->
        <div
          v-if="childDropIndex === childIndex"
          :class="isHorizontal
            ? 'absolute -left-2 top-0 bottom-0 w-1 bg-primary rounded-full z-10'
            : 'absolute left-0 right-0 -top-2 h-1 bg-primary rounded-full z-10'"
        />
        <PreviewSection
          :block="child"
          :index="childIndex"
          :total="block.children.length"
        />
        <!-- Drop indicator after last child -->
        <div
          v-if="childDropIndex === block.children.length && childIndex === block.children.length - 1"
          :class="isHorizontal
            ? 'absolute -right-2 top-0 bottom-0 w-1 bg-primary rounded-full z-10'
            : 'absolute left-0 right-0 -bottom-2 h-1 bg-primary rounded-full z-10'"
        />
      </div>
    </template>

    <!-- Empty State -->
    <div
      v-else
      class="relative z-30 flex-1 flex flex-col items-center justify-center py-8 text-muted-foreground border-1 border-dashed border-border/50"
    >
      <SidebarBlockPicker
        mode="nested"
        trigger-label="Add content"
        @select="(type: string) => emit('addBlock', type as SectionBlockType)"
      />
    </div>
  </component>
</template>
