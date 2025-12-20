<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from 'vue'
import type { SectionBlock, SectionBlockType, GridSettings, GridStyles } from '@/types/designer'
import type { ListPresetType } from '@/lib/list-presets'
import { useDesignerStore } from '@/stores/designer'
import { BackgroundMedia } from './index'
import SidebarBlockPicker from '@/components/builder/SidebarBlockPicker.vue'

// Use async component to avoid circular dependency
const PreviewSection = defineAsyncComponent(() => import('../PreviewSection.vue'))

/**
 * GridBlock - Renders a CSS grid layout
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
  isDropTarget: boolean
  childDropIndex: number | null
  isSelected: boolean
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

const designerStore = useDesignerStore()

const settings = computed(() => props.block.settings as GridSettings)
const gridStyles = computed(() => props.block.styles as GridStyles)

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

// Dynamic HTML tag (defaults to 'div')
const htmlTag = computed(() => settings.value?.htmlTag || 'div')

// ============================================
// GRID LAYOUT
// ============================================

// Compute grid template columns with custom widths support
const gridTemplateColumns = computed(() => {
  if (!settings.value) return 'repeat(2, minmax(0, 1fr))'
  const columns = settings.value.columns || 2
  const customWidths = settings.value.columnWidths

  if (customWidths && customWidths.length === columns) {
    return customWidths.map(w => `${w}fr`).join(' ')
  }
  return `repeat(${columns}, minmax(0, 1fr))`
})

// Check if child has absolute or fixed positioning
function isChildAbsoluteOrFixed(child: SectionBlock): boolean {
  const childStyles = child.styles as Record<string, unknown>
  const position = childStyles?.position as string
  return position === 'absolute' || position === 'fixed'
}

// Get grid item styles for a child block
function getGridItemStyles(child: SectionBlock): Record<string, string> {
  const childSettings = child.settings as Record<string, unknown>
  const styles: Record<string, string> = {}

  const colSpan = parseInt(String(childSettings.gridColumnSpan || 1), 10)
  if (!isNaN(colSpan) && colSpan > 1) {
    styles['grid-column'] = `span ${colSpan}`
  }

  const rowSpan = parseInt(String(childSettings.gridRowSpan || 1), 10)
  if (!isNaN(rowSpan) && rowSpan > 1) {
    styles['grid-row'] = `span ${rowSpan}`
  }

  return styles
}

// ============================================
// COLUMN RESIZE
// ============================================
const isResizingColumn = ref(false)
const resizeColumnIndex = ref<number | null>(null)
const resizeStartX = ref(0)
const resizeStartWidths = ref<number[]>([])

function handleColumnResizeStart(columnIndex: number, event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()

  if (!settings.value) return

  isResizingColumn.value = true
  resizeColumnIndex.value = columnIndex
  resizeStartX.value = event.clientX

  const columns = settings.value.columns || 2
  const currentWidths = settings.value.columnWidths || Array(columns).fill(1)
  resizeStartWidths.value = [...currentWidths]

  document.addEventListener('mousemove', handleColumnResizeMove)
  document.addEventListener('mouseup', handleColumnResizeEnd)
}

function handleColumnResizeMove(event: MouseEvent) {
  if (!isResizingColumn.value || resizeColumnIndex.value === null || !settings.value) return

  const deltaX = event.clientX - resizeStartX.value
  const gridElement = document.querySelector(`[data-block-id="${props.block.id}"]`) as HTMLElement
  if (!gridElement) return

  const gridWidth = gridElement.offsetWidth
  const totalFr = resizeStartWidths.value.reduce((a, b) => a + b, 0)
  const frToPixels = gridWidth / totalFr
  const deltaFr = deltaX / frToPixels

  const newWidths = [...resizeStartWidths.value]
  const colIndex = resizeColumnIndex.value

  const leftWidth = newWidths[colIndex]
  const rightWidth = newWidths[colIndex + 1]

  if (leftWidth === undefined || rightWidth === undefined) return

  const newLeftWidth = Math.max(0.5, leftWidth + deltaFr)
  const newRightWidth = Math.max(0.5, rightWidth - deltaFr)

  newWidths[colIndex] = Math.round(newLeftWidth * 10) / 10
  newWidths[colIndex + 1] = Math.round(newRightWidth * 10) / 10

  designerStore.updateBlockSettings(props.block.id, { columnWidths: newWidths })
}

function handleColumnResizeEnd() {
  isResizingColumn.value = false
  resizeColumnIndex.value = null
  document.removeEventListener('mousemove', handleColumnResizeMove)
  document.removeEventListener('mouseup', handleColumnResizeEnd)
}

function getColumnResizeHandlePosition(columnIndex: number): string {
  if (!settings.value) return '50%'

  const columns = settings.value.columns || 2
  const customWidths = settings.value.columnWidths || Array(columns).fill(1)
  const totalFr = customWidths.reduce((a, b) => a + b, 0)

  let sumFr = 0
  for (let i = 0; i <= columnIndex; i++) {
    sumFr += customWidths[i] || 1
  }

  const gap = parseFloat(settings.value.gap || '16')
  const gapCount = columnIndex + 1
  const percentPosition = (sumFr / totalFr) * 100

  return `calc(${percentPosition}% + ${gapCount * gap - gap / 2}px)`
}

</script>

<template>
  <!-- GRID -->
  <div
    class="relative"
    :style="{
      width: styles.width,
      marginTop: styles.marginTop,
      marginRight: styles.marginRight,
      marginBottom: styles.marginBottom,
      marginLeft: styles.marginLeft,
    }"
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

    <!-- Grid container -->
    <component
      :is="htmlTag"
      :data-block-id="block.id"
      class="relative z-10 grid"
      :style="{
        ...styles,
        marginTop: undefined,
        marginRight: undefined,
        marginBottom: undefined,
        marginLeft: undefined,
        gridTemplateColumns,
        'grid-auto-rows': 'minmax(auto)',
        gap: gridStyles?.gap || '16px',
        justifyItems: gridStyles?.justifyItems || 'flex-start',
        alignItems: gridStyles?.alignItems || 'flex-start',
        backgroundColor: settings?.backgroundType && settings.backgroundType !== 'color' ? undefined : styles.backgroundColor
      }"
      @dragenter="emit('dragEnter', $event)"
      @dragover="emit('dragOver', $event)"
      @dragleave="emit('dragLeave', $event)"
      @drop="emit('drop', $event)"
    >
      <template v-if="block.children && block.children.length > 0">
        <div
          v-for="(child, childIndex) in block.children"
          :key="child.id"
          class="min-w-0"
          :class="{ 'relative': !isChildAbsoluteOrFixed(child) }"
          :style="getGridItemStyles(child)"
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
      <template v-else>
        <div
          class="flex flex-col items-center justify-center py-8 text-muted-foreground border-1 border-dashed border-border/50"
          :style="{ gridColumn: `span ${settings?.columns || 2}` }"
        >
          <SidebarBlockPicker
            mode="nested"
            trigger-label="Add content"
            @select="(type: string) => emit('addBlock', type as SectionBlockType)"
            @select-list-preset="(type: ListPresetType) => emit('addListPreset', type)"
          />
        </div>
      </template>
    </component>

    <!-- Column resize handles (only when selected) -->
    <template v-if="isSelected && (settings?.columns || 2) > 1">
      <div
        v-for="i in ((settings?.columns || 2) - 1)"
        :key="`resize-${i}`"
        class="absolute top-0 bottom-0 w-4 -ml-2 cursor-col-resize z-30 group flex items-center justify-center"
        :style="{ left: getColumnResizeHandlePosition(i - 1) }"
        @mousedown="handleColumnResizeStart(i - 1, $event)"
      >
        <div class="w-1 h-8 rounded-full bg-primary/0 group-hover:bg-primary/60 transition-colors"></div>
      </div>
    </template>
  </div>
</template>
