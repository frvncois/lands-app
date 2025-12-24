<script setup lang="ts">
/**
 * CARDS CAROUSEL VARIANT
 *
 * Horizontal scrolling cards.
 * Layout options (carousel-only):
 * - slidesPerView: '1' | '2' | '3'
 * - autoplay: boolean
 * - showArrows: boolean
 *
 * NO buttons - Cards is informational only.
 */

import type { CardsData } from '@/lib/section-registry'
import type { SectionStyleProperties, ItemStyleProperties, FieldStyles } from '@/types/sections'
import { ref, onMounted, onUnmounted } from 'vue'
import { resolveSectionStyles } from '@/lib/section-styles'

const props = defineProps<{
  data: CardsData
  sectionStyles?: SectionStyleProperties
  itemStyles?: ItemStyleProperties
  fieldStyles?: FieldStyles
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

// Calculate card width based on slidesPerView
function getCardWidthClass(): string {
  switch (slidesPerView()) {
    case '1': return 'w-full'
    case '2': return 'w-[calc(50%-var(--spacing-lg)/2)]'
    default: return 'w-[calc(33.333%-var(--spacing-lg)*2/3)]'
  }
}

function scrollToIndex(index: number) {
  if (!carouselRef.value) return
  const cards = carouselRef.value.children
  if (cards[index]) {
    cards[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
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

function getItemStyle(): Record<string, string> {
  const styles = props.itemStyles
  const result: Record<string, string> = {}

  if (!styles) return result

  if (styles.backgroundColor) result.backgroundColor = styles.backgroundColor
  if (styles.borderRadius !== undefined) result.borderRadius = `${styles.borderRadius}px`
  return result
}

function getItemTextStyle(): Record<string, string> {
  const styles = props.itemStyles
  const result: Record<string, string> = { fontFamily: 'var(--font-body)' }

  if (!styles) return result

  if (styles.fontSize) result.fontSize = `${styles.fontSize}px`
  if (styles.lineHeight) result.lineHeight = String(styles.lineHeight)
  if (styles.color) result.color = styles.color
  if (styles.spacingX) result.paddingLeft = result.paddingRight = `${styles.spacingX}px`
  if (styles.spacingY) result.paddingTop = result.paddingBottom = `${styles.spacingY}px`
  return result
}

/**
 * Get field-specific styles for a repeater item field
 * Resolves styles from fieldStyles using the full path: items.{index}.{fieldKey}
 */
function getFieldStyle(index: number, fieldKey: string, defaultFont: string = '--font-body'): Record<string, string> {
  const fieldPath = `items.${index}.${fieldKey}`
  const styles = props.fieldStyles?.[fieldPath]
  const result: Record<string, string> = { fontFamily: `var(${defaultFont})` }

  if (!styles) return result

  if (styles.fontSize) result.fontSize = `${styles.fontSize}px`
  if (styles.lineHeight) result.lineHeight = String(styles.lineHeight)
  if (styles.color) result.color = styles.color
  if (styles.spacingY !== undefined) result.marginTop = result.marginBottom = `${styles.spacingY}px`
  if (styles.spacingX !== undefined) result.marginLeft = result.marginRight = `${styles.spacingX}px`
  return result
}

function handleItemClick(e: MouseEvent, index: number) {
  if (!props.editable) return
  e.stopPropagation()
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
        class="flex gap-[var(--spacing-lg)] overflow-x-auto pb-[var(--spacing-md)] snap-x snap-mandatory scrollbar-hide"
      >
        <div
          v-for="(card, index) in data.items"
          :key="index"
          class="flex-shrink-0 flex flex-col gap-[var(--spacing-sm)] bg-[var(--color-surface)] rounded-[var(--radius-lg)] overflow-hidden snap-start"
          :class="[
            getCardWidthClass(),
            editable && 'cursor-pointer transition-all duration-150',
            editable && activeField !== `items.${index}` && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-2',
            editable && activeField === `items.${index}` && 'outline outline-2 outline-primary -outline-offset-2',
          ]"
          :style="getItemStyle()"
          @click="handleItemClick($event, index)"
        >
          <!-- Media (Image or Video) -->
          <template v-if="card.media?.src">
            <img
              v-if="card.media.type === 'image'"
              :src="card.media.src"
              :alt="card.media.alt || ''"
              class="w-full aspect-video object-cover"
            />
            <video
              v-else-if="card.media.type === 'video'"
              :src="card.media.src"
              class="w-full aspect-video object-cover"
              autoplay
              muted
              loop
              playsinline
            />
          </template>

          <!-- Content (non-editable inline - edit via inspector) -->
          <div class="p-[var(--spacing-md)] flex flex-col gap-[var(--spacing-xs)]" :style="getItemTextStyle()">
            <h3
              v-if="card.headline"
              class="text-[length:var(--text-xl)] font-semibold m-0"
              :style="getFieldStyle(index, 'headline', '--font-heading')"
            >{{ card.headline }}</h3>
            <p
              v-if="card.subheadline"
              class="text-[length:var(--text-sm)] text-[var(--color-muted)] m-0"
              :style="getFieldStyle(index, 'subheadline', '--font-body')"
            >{{ card.subheadline }}</p>
            <div
              v-if="card.paragraph"
              class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0"
              :style="getFieldStyle(index, 'paragraph', '--font-body')"
              v-html="card.paragraph"
            />
          </div>
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
