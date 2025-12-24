<script setup lang="ts">
/**
 * GALLERY CAROUSEL VARIANT
 *
 * Horizontal scrolling gallery.
 * Layout options (carousel-only):
 * - slidesPerView: '1' | '2' | '3'
 * - autoplay: boolean
 * - showArrows: boolean
 *
 * NO captions - media only.
 */

import type { GalleryData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles, ItemStyleProperties } from '@/types/sections'
import { ref, onMounted, onUnmounted } from 'vue'
import { resolveSectionStyles } from '@/lib/section-styles'

const props = defineProps<{
  data: GalleryData
  sectionStyles?: SectionStyleProperties
  fieldStyles?: FieldStyles
  itemStyles?: ItemStyleProperties
  editable?: boolean
  activeField?: string | null
  hiddenFields?: string[]
}>()

const emit = defineEmits<{
  selectField: [fieldKey: string]
  'update': [fieldKey: string, value: unknown]
}>()

// Layout options
const slidesPerView = () => props.data.layout?.slidesPerView ?? '3'
const autoplay = () => props.data.layout?.autoplay ?? false
const showArrows = () => props.data.layout?.showArrows ?? true

// Carousel state
const carouselRef = ref<HTMLDivElement | null>(null)
const currentIndex = ref(0)
let autoplayInterval: ReturnType<typeof setInterval> | null = null

// Calculate item width based on slidesPerView
function getItemWidthClass(): string {
  switch (slidesPerView()) {
    case '1': return 'w-full'
    case '2': return 'w-[calc(50%-var(--spacing-md)/2)]'
    default: return 'w-[calc(33.333%-var(--spacing-md)*2/3)]'
  }
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

function getItemContainerStyle(): Record<string, string> {
  const styles = props.itemStyles
  if (!styles) return {}

  const result: Record<string, string> = {}
  if (styles.borderRadius !== undefined) result.borderRadius = `${styles.borderRadius}px`
  return result
}

function handleItemClick(e: MouseEvent, index: number) {
  if (!props.editable) return
  e.stopPropagation()
  e.preventDefault()
  emit('selectField', `items.${index}`)
}
</script>

<template>
  <section
    class="bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-section)] px-[var(--spacing-container)]"
    :style="getSectionStyle()"
    @mouseenter="stopAutoplay"
    @mouseleave="autoplay() && startAutoplay()"
  >
    <div class="max-w-[1200px] mx-auto w-full relative">
      <!-- Navigation Arrows -->
      <template v-if="showArrows() && data.items.length > 1">
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
      </template>

      <!-- Carousel Container -->
      <div
        ref="carouselRef"
        class="flex gap-[var(--spacing-md)] overflow-x-auto pb-[var(--spacing-md)] snap-x snap-mandatory scrollbar-hide"
      >
        <template v-for="(item, index) in data.items" :key="index">
          <component
            :is="item.link?.url && !editable ? 'a' : 'div'"
            :href="item.link?.url && !editable ? item.link.url : undefined"
            :target="item.link?.url && !editable ? (item.link.target || '_self') : undefined"
            class="flex-shrink-0 aspect-square rounded-[var(--radius-md)] overflow-hidden snap-start"
            :class="[
              getItemWidthClass(),
              editable && 'cursor-pointer transition-all duration-150',
              editable && activeField !== `items.${index}` && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-2',
              editable && activeField === `items.${index}` && 'outline outline-2 outline-primary -outline-offset-2',
            ]"
            :style="getItemContainerStyle()"
            @click="handleItemClick($event, index)"
          >
            <img
              v-if="item.media.type === 'image'"
              :src="item.media.src || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22%3E%3Crect fill=%22%23374151%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%239CA3AF%22 font-family=%22system-ui%22 font-size=%2216%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo image%3C/text%3E%3C/svg%3E'"
              :alt="item.media.alt || ''"
              class="w-full h-full object-cover"
            />
            <video
              v-else-if="item.media.type === 'video'"
              :src="item.media.src"
              class="w-full h-full object-cover"
              autoplay
              muted
              loop
              playsinline
            />
          </component>
        </template>
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
