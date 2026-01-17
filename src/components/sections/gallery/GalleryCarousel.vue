<script setup lang="ts">
/**
 * GALLERY CAROUSEL VARIANT
 *
 * Horizontal scrolling gallery.
 * Slider options (from sectionStyles):
 * - slidesPerView: '1' | '1.5' | '2' | '2.5' | '3' | '3.5' | '4' | '5' | '6'
 * - autoplay: boolean
 * - showArrows: boolean
 *
 * NO captions - media only.
 */

import type { GalleryData } from '@/lib/section-registry'
import type {
  SectionStyleProperties,
  FieldStyles,
  ItemStyleProperties,
  SelectionPayload,
  ActiveNodeType,
} from '@/types/sections'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import EditableText from '../EditableText.vue'
import { resolveSectionStyles, resolveItemContainerStyles, getTextStyle, resolveRepeaterGroupStyles } from '@/lib/section-styles'

const props = defineProps<{
  data: GalleryData
  sectionStyles?: SectionStyleProperties
  fieldStyles?: FieldStyles
  itemStyles?: ItemStyleProperties
  editable?: boolean
  activeField?: string | null
  activeNodeId?: string | null
  activeNodeType?: ActiveNodeType | null
  activeFieldKey?: string | null
  activeItemId?: string | null
  hiddenFields?: string[]
}>()

const repeaterGroupStyles = computed(() => resolveRepeaterGroupStyles(props.sectionStyles, 'items'))
const repeaterGapStyle = computed(() => (
  repeaterGroupStyles.value.spaceBetween !== undefined
    ? { gap: `${repeaterGroupStyles.value.spaceBetween}px` }
    : {}
))

const emit = defineEmits<{
  selectField: [payload: SelectionPayload | string]
  'update': [fieldKey: string, value: unknown]
}>()

// Slider options from sectionStyles
const slidesPerView = () => {
  const value = props.sectionStyles?.slidesPerView
  return typeof value === 'string' ? parseFloat(value) : (value ?? 3)
}
const autoplay = () => (props.sectionStyles?.autoplay as boolean) ?? false
const showArrows = () => (props.sectionStyles?.showArrows as boolean) ?? true
const contentSpacing = computed(() => props.sectionStyles?.gallerySpaceBetween ?? 32)

// Carousel state
const carouselRef = ref<HTMLDivElement | null>(null)
const currentIndex = ref(0)
let autoplayInterval: ReturnType<typeof setInterval> | null = null

// Calculate item width based on slidesPerView
function getItemWidthStyle(): Record<string, string> {
  const perView = slidesPerView()
  const gap = contentSpacing.value
  const width = `calc(${100 / perView}% - ${gap - gap / perView}px)`
  return { width }
}

function scrollToIndex(index: number) {
  if (!carouselRef.value) return
  const items = carouselRef.value.children
  if (items[index]) {
    items[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
    currentIndex.value = index
  }
}

function scrollPrev() {
  const maxIndex = props.data.items.length - 1
  const newIndex = currentIndex.value > 0 ? currentIndex.value - 1 : maxIndex
  scrollToIndex(newIndex)
}

function scrollNext() {
  const maxIndex = props.data.items.length - 1
  const newIndex = currentIndex.value < maxIndex ? currentIndex.value + 1 : 0
  scrollToIndex(newIndex)
}

function startAutoplay() {
  if (autoplayInterval) clearInterval(autoplayInterval)
  if (autoplay() && props.data.items.length > 1) {
    autoplayInterval = setInterval(scrollNext, 4000)
  }
}

function stopAutoplay() {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

onMounted(() => {
  if (autoplay()) startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})

function getSectionStyle(): Record<string, string> {
  return resolveSectionStyles(props.sectionStyles)
}

function getFieldStyle(fieldKey: string, defaultFont: string = '--font-body'): Record<string, string> {
  return getTextStyle(props.fieldStyles, fieldKey, defaultFont)
}

function getItemContainerStyle(): Record<string, string> {
  return resolveItemContainerStyles(props.itemStyles, { groupStyles: repeaterGroupStyles.value })
}

function getItemId(item: GalleryData['items'][number], fallback: number): string | null {
  if (item?.id) return item.id
  return fallback.toString()
}

function isItemActive(item: GalleryData['items'][number], index: number): boolean {
  if (!props.editable) return false
  const itemId = getItemId(item, index)
  if (!itemId) return false
  return (
    props.activeNodeType === 'item' &&
    props.activeFieldKey === 'items' &&
    props.activeItemId === itemId
  )
}

function handleItemClick(e: MouseEvent, item: GalleryData['items'][number], index: number) {
  if (!props.editable) return
  e.stopPropagation()
  e.preventDefault()
  const itemId = getItemId(item, index)
  if (!itemId) return
  emit('selectField', {
    type: 'item',
    fieldKey: 'items',
    itemId,
  })
}
</script>

<template>
  <section
    class="bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-section)] px-[var(--spacing-container)]"
    :style="getSectionStyle()"
    @mouseenter="stopAutoplay"
    @mouseleave="autoplay() && startAutoplay()"
  >
    <div class="max-w-[1200px] mx-auto w-full flex flex-col" :style="{ gap: `${contentSpacing}px` }">
      <div
        v-if="data.headline || data.subheadline || data.paragraph"
        class="text-center flex flex-col gap-[var(--spacing-sm)]"
      >
        <EditableText
          v-if="data.headline"
          tag="h2"
          :value="data.headline"
          field-key="headline"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          class="text-[length:var(--text-3xl)] font-bold leading-tight m-0"
          :style="getFieldStyle('headline', '--font-heading')"
          @selectField="emit('selectField', 'headline')"
          @update="emit('update', 'headline', $event)"
        />
        <EditableText
          v-if="data.subheadline"
          tag="p"
          :value="data.subheadline"
          field-key="subheadline"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          class="text-[length:var(--text-lg)] text-[var(--color-muted)] m-0"
          :style="getFieldStyle('subheadline', '--font-body')"
          @selectField="emit('selectField', 'subheadline')"
          @update="emit('update', 'subheadline', $event)"
        />
        <EditableText
          v-if="data.paragraph"
          tag="div"
          :value="data.paragraph"
          field-key="paragraph"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          :html="true"
          class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0"
          :style="getFieldStyle('paragraph', '--font-body')"
          @selectField="emit('selectField', 'paragraph')"
          @update="emit('update', 'paragraph', $event)"
        />
      </div>
      <div class="relative">
        <!-- Navigation Arrows -->
        <div v-show="showArrows() && data.items.length > 1">
          <button
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-[var(--color-surface)] shadow-md flex items-center justify-center hover:bg-[var(--color-secondary)] transition-colors"
            @click="scrollPrev"
        >
          <i class="lni lni-chevron-left text-lg" />
        </button>
        <button
          class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-[var(--color-surface)] shadow-md flex items-center justify-center hover:bg-[var(--color-secondary)] transition-colors"
          @click="scrollNext"
        >
          <i class="lni lni-chevron-right text-lg" />
        </button>
        </div>

        <!-- Carousel Container -->
        <div
          ref="carouselRef"
          class="flex overflow-x-auto pb-[var(--spacing-md)] snap-x snap-mandatory scrollbar-hide"
          :style="[{ gap: `${contentSpacing}px` }, repeaterGapStyle]"
        >
        <template v-for="(item, index) in data.items" :key="item.id || index">
          <component
            :is="item.link?.url && !editable ? 'a' : 'div'"
            :href="item.link?.url && !editable ? item.link.url : undefined"
            :target="item.link?.url && !editable ? '_blank' : undefined"
            class="flex-shrink-0 aspect-square rounded-[var(--radius-md)] overflow-hidden snap-start"
            :class="[
              editable && 'cursor-pointer transition-all duration-150 select-none',
              editable && !isItemActive(item, index) && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-2',
              editable && isItemActive(item, index) && 'outline outline-2 outline-primary -outline-offset-2',
            ]"
            :style="{ ...getItemContainerStyle(), ...getItemWidthStyle() }"
            @click="handleItemClick($event, item, index)"
          >
            <img
              v-if="item.media.type === 'image'"
              :src="item.media.src || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22%3E%3Crect fill=%22%23374151%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%239CA3AF%22 font-family=%22system-ui%22 font-size=%2216%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo image%3C/text%3E%3C/svg%3E'"
              :alt="item.media.alt || ''"
              :class="[
                'w-full h-full object-cover',
                editable && 'pointer-events-none select-none',
              ]"
            />
            <video
              v-else-if="item.media.type === 'video'"
              :src="item.media.src"
              :class="[
                'w-full h-full object-cover',
                editable && 'pointer-events-none select-none',
              ]"
              autoplay
              muted
              loop
              playsinline
            />
          </component>
        </template>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
