<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { SectionBlock, SectionBlockType, ContainerSettings, ContainerStyles } from '@/types/editor'
import { BackgroundMedia } from './index'
import SidebarBlockPicker from '@/components/builder/SidebarBlockPicker.vue'

// Use async component to avoid circular dependency
const PreviewSection = defineAsyncComponent(() => import('../PreviewSection.vue'))

/**
 * ContainerBlock - Renders a flex container with children
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
  isDropTarget: boolean
  childDropIndex: number | null
}>()

const emit = defineEmits<{
  dragEnter: [event: DragEvent]
  dragOver: [event: DragEvent]
  dragLeave: [event: DragEvent]
  drop: [event: DragEvent]
  childDragOver: [index: number, event: DragEvent]
  childDragLeave: []
  addBlock: [type: SectionBlockType]
}>()

const settings = computed(() => props.block.settings as ContainerSettings)
const containerStyles = computed(() => props.block.styles as ContainerStyles)

// Dynamic HTML tag (defaults to 'section' for container)
const htmlTag = computed(() => settings.value?.htmlTag || 'section')

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
      flexDirection: containerStyles?.flexDirection || styles.flexDirection || 'column',
      justifyContent: containerStyles?.justifyContent || styles.justifyContent || 'flex-start',
      alignItems: containerStyles?.alignItems || styles.alignItems || 'stretch',
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
      <template v-for="(child, childIndex) in block.children" :key="child.id">
        <!-- Drop indicator before this child -->
        <div
          v-if="childDropIndex === childIndex"
          class="absolute left-0 right-0 h-1 bg-primary rounded-full z-10 -translate-y-2"
          :style="{ top: `${childIndex * 100 / block.children.length}%` }"
        />
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
      <!-- Drop indicator after last child -->
      <div
        v-if="childDropIndex === block.children.length"
        class="h-1 bg-primary rounded-full"
      />
    </template>

    <!-- Empty State -->
    <div
      v-else
      class="relative z-30 flex-1 flex flex-col items-center justify-center py-12 text-muted-foreground border-1 border-dashed border-border/50"
    >
      <SidebarBlockPicker
        mode="nested"
        trigger-label="Add content"
        @select="(type: string) => emit('addBlock', type as SectionBlockType)"
      />
    </div>
  </component>
</template>
