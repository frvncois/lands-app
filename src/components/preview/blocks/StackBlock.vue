<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from 'vue'
import type { SectionBlock, SectionBlockType, StackSettings, StackStyles } from '@/types/designer'
import type { ListPresetType } from '@/lib/list-presets'
import { BackgroundMedia } from './index'
import SidebarBlockPicker from '@/components/builder/SidebarBlockPicker.vue'
import { useDesignerStore } from '@/stores/designer'

// Use async component to avoid circular dependency
const PreviewSection = defineAsyncComponent(() => import('../PreviewSection.vue'))

const designerStore = useDesignerStore()

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
  (e: 'addListPreset', type: ListPresetType): void
}>()

const settings = computed(() => props.block.settings as StackSettings)
const stackStyles = computed(() => props.block.styles as StackStyles)

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

const isHorizontal = computed(() => stackStyles.value?.flexDirection === 'row')

// Check if this block is an accordion item (to hide content when preview state is 'closed')
const isAccordionItem = computed(() => {
  return props.block.name?.toLowerCase().includes('accordion item')
})

// Get the preview state for accordion items (from editor store, not saved)
const accordionPreviewState = computed(() => {
  return designerStore.getAccordionPreviewState(props.block.id)
})

// Check if a child should be visible (handles accordion content visibility)
function isChildVisible(child: SectionBlock, index: number): boolean {
  // If this is an accordion item and preview state is 'closed', hide the content (second child)
  if (isAccordionItem.value && accordionPreviewState.value === 'closed') {
    // Accordion structure: [Header (index 0), Content (index 1)]
    // Hide the content when closed
    return index === 0 || !child.name?.toLowerCase().includes('accordion content')
  }
  return true
}

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

  // Check if child has an explicit width - if so, don't let wrapper grow
  const childStylesObj = child.styles as Record<string, unknown> | undefined
  const desktopStyles = childStylesObj?.desktop as Record<string, unknown> | undefined
  const tabletStyles = childStylesObj?.tablet as Record<string, unknown> | undefined
  const mobileStyles = childStylesObj?.mobile as Record<string, unknown> | undefined

  let childWidth: string | undefined
  if (designerStore.viewport === 'mobile') {
    childWidth = (mobileStyles?.width ?? tabletStyles?.width ?? desktopStyles?.width) as string | undefined
  } else if (designerStore.viewport === 'tablet') {
    childWidth = (tabletStyles?.width ?? desktopStyles?.width) as string | undefined
  } else {
    childWidth = desktopStyles?.width as string | undefined
  }

  const hasExplicitWidth = childWidth && childWidth !== '100%' && childWidth !== 'auto'

  // If child has explicit width, wrapper should not grow - let the inner element's width work
  if (hasExplicitWidth) {
    return { flex: '0 0 auto' }
  }

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
    class="relative flex min-h-0"
    :class="{ 'flex-1': !styles.height, 'overflow-hidden': styles.height }"
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
      :content-image-src="contentImageSrc"
      :content-blur="settings?.backgroundContentBlur"
      :content-saturation="settings?.backgroundContentSaturation"
      :content-scale="settings?.backgroundContentScale"
    />

    <!-- Children -->
    <template v-if="block.children && block.children.length > 0">
      <template v-for="(child, childIndex) in block.children" :key="child.id">
        <div
          v-if="isChildVisible(child, childIndex)"
          class="z-10 flex flex-col min-h-0 min-w-0"
          :class="{
            'relative': !isChildAbsoluteOrFixed(child),
            'h-full': (child.styles as Record<string, unknown>)?.height === '100%' || (child.styles as Record<string, unknown>)?.desktop?.height === '100%'
          }"
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
        trigger-label="Add content"
        @select="(type: string) => emit('addBlock', type as SectionBlockType)"
        @select-list-preset="(type: ListPresetType) => emit('addListPreset', type)"
      />
    </div>
  </component>
</template>
