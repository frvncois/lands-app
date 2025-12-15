<script setup lang="ts">
import { computed, ref, defineAsyncComponent, onUnmounted } from 'vue'
import type { SectionBlock, SectionBlockType, GridSettings, GridStyles } from '@/types/editor'
import { sectionBlockIcons, blocksByCategory } from '@/lib/editor-utils'
import { useEditorStore } from '@/stores/editor'
import { BackgroundMedia } from './index'
import Button from '@/components/ui/Button.vue'
import Dropdown from '@/components/ui/Dropdown.vue'
import DropdownItem from '@/components/ui/DropdownItem.vue'
import Icon from '@/components/ui/Icon.vue'

// Use async component to avoid circular dependency
const PreviewSection = defineAsyncComponent(() => import('../PreviewSection.vue'))

/**
 * GridBlock - Renders a CSS grid or slider/carousel
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
}>()

const editorStore = useEditorStore()

const settings = computed(() => props.block.settings as GridSettings)
const gridStyles = computed(() => props.block.styles as GridStyles)
const isSliderMode = computed(() => settings.value?.isSlider)

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

  editorStore.updateBlockSettings(props.block.id, { columnWidths: newWidths })
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

// ============================================
// SLIDER CONTROLS
// ============================================
const sliderRef = ref<HTMLElement | null>(null)
const sliderCurrentIndex = ref(0)
const sliderIsPaused = ref(false)
let autoplayInterval: ReturnType<typeof setInterval> | null = null

function handleSliderPrev() {
  if (!sliderRef.value || !settings.value) return

  const slidesPerView = settings.value.slidesPerView || 1
  const gap = parseFloat(settings.value.gap || '16')
  const childCount = props.block.children?.length || 1
  const slideWidth = (sliderRef.value.scrollWidth - (childCount - 1) * gap) / childCount

  const newIdx = settings.value.loop
    ? (sliderCurrentIndex.value - 1 + childCount - slidesPerView + 1) % (childCount - slidesPerView + 1)
    : Math.max(0, sliderCurrentIndex.value - 1)

  sliderCurrentIndex.value = newIdx
  sliderRef.value.scrollTo({ left: newIdx * (slideWidth + gap), behavior: 'smooth' })
}

function handleSliderNext() {
  if (!sliderRef.value || !settings.value) return

  const slidesPerView = settings.value.slidesPerView || 1
  const gap = parseFloat(settings.value.gap || '16')
  const childCount = props.block.children?.length || 1
  const slideWidth = (sliderRef.value.scrollWidth - (childCount - 1) * gap) / childCount
  const maxIdx = childCount - slidesPerView

  const newIdx = settings.value.loop
    ? (sliderCurrentIndex.value + 1) % (maxIdx + 1)
    : Math.min(maxIdx, sliderCurrentIndex.value + 1)

  sliderCurrentIndex.value = newIdx
  sliderRef.value.scrollTo({ left: newIdx * (slideWidth + gap), behavior: 'smooth' })
}

function handleSliderGoTo(index: number) {
  if (!sliderRef.value || !settings.value) return

  const gap = parseFloat(settings.value.gap || '16')
  const childCount = props.block.children?.length || 1
  const slideWidth = (sliderRef.value.scrollWidth - (childCount - 1) * gap) / childCount

  sliderCurrentIndex.value = index
  sliderRef.value.scrollTo({ left: index * (slideWidth + gap), behavior: 'smooth' })
}

function startAutoplay() {
  if (!settings.value?.autoplay) return
  stopAutoplay()

  autoplayInterval = setInterval(() => {
    if (!sliderIsPaused.value) {
      handleSliderNext()
    }
  }, settings.value.autoplayInterval || 5000)
}

function stopAutoplay() {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

function handleSliderMouseEnter() {
  sliderIsPaused.value = true
}

function handleSliderMouseLeave() {
  sliderIsPaused.value = false
}

const dotCount = computed(() => {
  const slidesPerView = settings.value?.slidesPerView || 1
  const childCount = props.block.children?.length || 0
  return Math.ceil(childCount - slidesPerView + 1)
})

const showNavigation = computed(() => {
  const slidesPerView = settings.value?.slidesPerView || 1
  return (props.block.children?.length || 0) > slidesPerView
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<template>
  <!-- SLIDER MODE -->
  <div
    v-if="isSliderMode"
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
    />

    <!-- Slider container -->
    <div
      ref="sliderRef"
      :data-block-id="block.id"
      class="relative z-10 flex overflow-x-auto snap-x snap-mandatory scroll-smooth transition-colors scrollbar-hide"
      :class="isDropTarget ? 'ring-2 ring-primary ring-dashed bg-primary/5' : ''"
      :style="{
        ...styles,
        marginTop: undefined,
        marginRight: undefined,
        marginBottom: undefined,
        marginLeft: undefined,
        gap: gridStyles?.gap || '16px',
        backgroundColor: settings?.backgroundType && settings.backgroundType !== 'color' ? undefined : styles.backgroundColor
      }"
      @dragenter="emit('dragEnter', $event)"
      @dragover="emit('dragOver', $event)"
      @dragleave="emit('dragLeave', $event)"
      @drop="emit('drop', $event)"
      @mouseenter="handleSliderMouseEnter"
      @mouseleave="handleSliderMouseLeave"
    >
      <template v-if="block.children && block.children.length > 0">
        <div
          v-for="(child, childIndex) in block.children"
          :key="child.id"
          class="relative flex-shrink-0 snap-start"
          :style="{
            width: `calc((100% - ${(settings.slidesPerView || 1) - 1} * ${gridStyles?.gap || '16px'}) / ${settings.slidesPerView || 1})`,
          }"
          @dragover="emit('childDragOver', childIndex, $event)"
          @dragleave="emit('childDragLeave')"
        >
          <!-- Drop indicator (left edge for slider) -->
          <div
            v-if="childDropIndex === childIndex"
            class="absolute -left-2 top-0 bottom-0 w-1 bg-primary rounded-full z-10"
          />
          <PreviewSection
            :block="child"
            :index="childIndex"
            :total="block.children.length"
          />
          <!-- Drop indicator after last child -->
          <div
            v-if="childDropIndex === block.children.length && childIndex === block.children.length - 1"
            class="absolute -right-2 top-0 bottom-0 w-1 bg-primary rounded-full z-10"
          />
        </div>
      </template>
      <template v-else>
        <div class="flex-1 flex flex-col items-center justify-center py-8 text-muted-foreground border-1 border-dashed border-border/50">
          <Dropdown align="left" width="min-w-48" :close-on-click="true">
            <template #trigger="{ toggle }">
              <Button variant="dotted" size="sm" @click.stop="toggle">
                <Icon name="plus" :size="12" />
                Add content
              </Button>
            </template>
            <div class="py-1 font-sans">
              <p class="px-3 py-1.5 text-xs font-medium text-muted-foreground">Content</p>
              <DropdownItem
                v-for="type in (blocksByCategory.content as SectionBlockType[])"
                :key="type"
                :icon="sectionBlockIcons[type]"
                @click="emit('addBlock', type)"
              >
                {{ type.charAt(0).toUpperCase() + type.slice(1) }}
              </DropdownItem>
            </div>
          </Dropdown>
        </div>
      </template>
    </div>

    <!-- Slider Navigation Arrows -->
    <template v-if="settings?.showArrows && showNavigation">
      <button
        type="button"
        class="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 hover:bg-background border border-border shadow-sm flex items-center justify-center transition-colors"
        @click="handleSliderPrev"
      >
        <Icon name="chevron-left" class="text-lg" />
      </button>
      <button
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 hover:bg-background border border-border shadow-sm flex items-center justify-center transition-colors"
        @click="handleSliderNext"
      >
        <Icon name="chevron-right" class="text-lg" />
      </button>
    </template>

    <!-- Slider Dots -->
    <div
      v-if="settings?.showDots && showNavigation"
      class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2"
    >
      <button
        v-for="(_, dotIndex) in dotCount"
        :key="dotIndex"
        type="button"
        class="w-2 h-2 rounded-full transition-colors"
        :class="sliderCurrentIndex === dotIndex ? 'bg-primary' : 'bg-primary/30 hover:bg-primary/50'"
        @click="handleSliderGoTo(dotIndex)"
      />
    </div>
  </div>

  <!-- REGULAR GRID MODE -->
  <div
    v-else
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
    />

    <!-- Grid container -->
    <div
      :data-block-id="block.id"
      class="relative z-10 grid transition-colors"
      :class="isDropTarget ? 'ring-2 ring-primary ring-dashed bg-primary/5' : ''"
      :style="{
        ...styles,
        marginTop: undefined,
        marginRight: undefined,
        marginBottom: undefined,
        marginLeft: undefined,
        gridTemplateColumns,
        'grid-auto-rows': 'minmax(80px, auto)',
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
          class="relative min-w-0"
          :style="getGridItemStyles(child)"
          @dragover="emit('childDragOver', childIndex, $event)"
          @dragleave="emit('childDragLeave')"
        >
          <!-- Drop indicator (left edge for grid) -->
          <div
            v-if="childDropIndex === childIndex"
            class="absolute -left-2 top-0 bottom-0 w-1 bg-primary rounded-full z-10"
          />
          <PreviewSection
            :block="child"
            :index="childIndex"
            :total="block.children.length"
          />
          <!-- Drop indicator after last child -->
          <div
            v-if="childDropIndex === block.children.length && childIndex === block.children.length - 1"
            class="absolute -right-2 top-0 bottom-0 w-1 bg-primary rounded-full z-10"
          />
        </div>
      </template>
      <template v-else>
        <div
          class="flex flex-col items-center justify-center py-8 text-muted-foreground border-1 border-dashed border-border/50"
          :style="{ gridColumn: `span ${settings?.columns || 2}` }"
        >
          <Dropdown align="left" width="min-w-48" :close-on-click="true">
            <template #trigger="{ toggle }">
              <Button variant="dotted" size="sm" @click.stop="toggle">
                <Icon name="plus" :size="12" />
                Add content
              </Button>
            </template>
            <div class="py-1 font-sans">
              <p class="px-3 py-1.5 text-xs font-medium text-muted-foreground">Content</p>
              <DropdownItem
                v-for="type in (blocksByCategory.content as SectionBlockType[])"
                :key="type"
                :icon="sectionBlockIcons[type]"
                @click="emit('addBlock', type)"
              >
                {{ type.charAt(0).toUpperCase() + type.slice(1) }}
              </DropdownItem>
            </div>
          </Dropdown>
        </div>
      </template>
    </div>

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
