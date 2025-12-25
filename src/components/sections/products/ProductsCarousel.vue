<script setup lang="ts">
/**
 * PRODUCTS CAROUSEL VARIANT
 *
 * Horizontal scrolling products.
 * Layout options (carousel-only):
 * - slidesPerView: '1' | '2' | '3'
 * - autoplay: boolean
 * - showArrows: boolean
 *
 * Item-only selection - no inline editing.
 */

import { ref, onMounted, onUnmounted } from 'vue'
import type { ProductsData, ProductItem } from '@/lib/section-registry'
import type {
  SectionStyleProperties,
  ItemStyleProperties,
  FieldStyles,
  SelectionPayload,
  ActiveNodeType,
} from '@/types/sections'
import {
  resolveSectionStyles,
  resolveItemContainerStyles,
  resolveItemPaddingStyles,
  resolveItemTypographyStyles,
  buttonStyleToCss,
  resolveFieldStyles,
} from '@/lib/section-styles'

const props = defineProps<{
  data: ProductsData
  sectionStyles?: SectionStyleProperties
  itemStyles?: ItemStyleProperties
  fieldStyles?: FieldStyles
  editable?: boolean
  activeNodeId?: string | null
  activeNodeType?: ActiveNodeType | null
  activeFieldKey?: string | null
  activeItemId?: string | null
  hiddenFields?: string[]
}>()

const emit = defineEmits<{
  selectField: [payload: SelectionPayload]
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

// Track selected variant index per product
const selectedVariants = ref<Record<string, number>>({})

function getSelectedVariantIndex(product: ProductItem, index: number): number {
  const productId = getProductId(product, index)
  return selectedVariants.value[productId ?? index] ?? 0
}

function setSelectedVariant(product: ProductItem, index: number, variantIndex: number) {
  const productId = getProductId(product, index)
  selectedVariants.value[productId ?? index] = variantIndex
}

function getActiveVariant(product: ProductItem, index: number) {
  const variants = product.variants ?? []
  if (variants.length === 0) return null
  const selectedIndex = getSelectedVariantIndex(product, index)
  return variants[selectedIndex] ?? variants[0]
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

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
  return resolveItemContainerStyles(props.itemStyles, { includePadding: false })
}

function getItemContentStyle(): Record<string, string> {
  return resolveItemPaddingStyles(props.itemStyles)
}

function getItemTypographyStyle(): Record<string, string> {
  return resolveItemTypographyStyles(props.itemStyles)
}

function getFieldStyle(index: number, fieldKey: string, defaultFont: string = '--font-body'): Record<string, string> {
  const fieldPath = `items.${index}.${fieldKey}`
  const styles = props.fieldStyles?.[fieldPath]
  const result: Record<string, string> = {
    fontFamily: `var(${defaultFont})`,
    ...getItemTypographyStyle(),
  }

  if (!styles) return result

  if (styles.fontSize) result.fontSize = `${styles.fontSize}px`
  if (styles.lineHeight) result.lineHeight = String(styles.lineHeight)
  if (styles.color) result.color = styles.color
  if (styles.spacingY !== undefined) result.marginTop = result.marginBottom = `${styles.spacingY}px`
  if (styles.spacingX !== undefined) result.marginLeft = result.marginRight = `${styles.spacingX}px`
  return result
}

function getButtonStyle(index: number): Record<string, string> {
  const fieldPath = `items.${index}.ctaLabel`
  const styles = resolveFieldStyles(props.fieldStyles, fieldPath)
  return buttonStyleToCss(styles, '--font-body')
}

function getProductId(product: ProductItem, fallback: number): string | null {
  if (product?.id) return product.id
  return fallback.toString()
}

function isProductActive(product: ProductItem, index: number): boolean {
  if (!props.editable) return false
  const productId = getProductId(product, index)
  if (!productId) return false
  return (
    props.activeNodeType === 'item' &&
    props.activeFieldKey === 'items' &&
    props.activeItemId === productId
  )
}

function handleItemClick(e: MouseEvent, product: ProductItem, index: number) {
  if (!props.editable) return
  e.stopPropagation()
  const productId = getProductId(product, index)
  if (!productId) return
  emit('selectField', {
    type: 'item',
    fieldKey: 'items',
    itemId: productId,
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
          v-for="(product, index) in data.items"
          :key="product.id || index"
          class="flex-shrink-0 flex flex-col bg-[var(--color-surface)] rounded-[var(--radius-lg)] overflow-hidden snap-start"
          :class="[
            getCardWidthClass(),
            editable && 'cursor-pointer transition-all duration-150 select-none',
            editable && !isProductActive(product, index) && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-2',
            editable && isProductActive(product, index) && 'outline outline-2 outline-primary -outline-offset-2',
          ]"
          :style="getItemStyle()"
          @click="handleItemClick($event, product, index)"
        >
          <!-- Product Image -->
          <div
            v-if="product.image?.src"
            :class="editable && 'pointer-events-none select-none'"
          >
            <img
              :src="product.image.src"
              :alt="product.image.alt || product.heading"
              class="w-full aspect-square object-cover"
            />
          </div>
          <div
            v-else
            class="w-full aspect-square bg-[var(--color-secondary)] flex items-center justify-center"
            :class="editable && 'pointer-events-none select-none'"
          >
            <span class="text-[var(--color-muted)]">Add image</span>
          </div>

          <!-- Content -->
          <div
            class="p-[var(--spacing-md)] flex flex-col gap-[var(--spacing-xs)] flex-1"
            :class="editable && 'pointer-events-none select-none'"
            :style="getItemContentStyle()"
          >
            <h3
              v-if="product.heading"
              class="text-[length:var(--text-xl)] font-semibold m-0"
              :style="getFieldStyle(index, 'heading', '--font-heading')"
            >{{ product.heading }}</h3>
            <p
              v-if="product.subheading"
              class="text-[length:var(--text-sm)] text-[var(--color-muted)] m-0"
              :style="getFieldStyle(index, 'subheading', '--font-body')"
            >{{ product.subheading }}</p>
            <div
              v-if="product.description"
              class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0"
              :style="getFieldStyle(index, 'description', '--font-body')"
              v-html="product.description"
            />

            <!-- Variant Selector -->
            <div v-if="product.variants && product.variants.length > 1" class="mt-[var(--spacing-sm)]">
              <select
                class="w-full px-[var(--spacing-sm)] py-[var(--spacing-xs)] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-fg)] text-[length:var(--text-sm)]"
                :value="getSelectedVariantIndex(product, index)"
                @change="setSelectedVariant(product, index, Number(($event.target as HTMLSelectElement).value))"
                @click.stop
              >
                <option
                  v-for="(variant, vIndex) in product.variants"
                  :key="variant.id || vIndex"
                  :value="vIndex"
                >
                  {{ variant.label }}
                </option>
              </select>
            </div>

            <!-- Price -->
            <div class="mt-auto pt-[var(--spacing-sm)]">
              <template v-if="getActiveVariant(product, index)">
                <div class="flex items-baseline gap-[var(--spacing-xs)]">
                  <span class="text-[length:var(--text-xl)] font-bold text-[var(--color-fg)]">
                    {{ formatPrice(getActiveVariant(product, index)!.price) }}
                  </span>
                  <span
                    v-if="getActiveVariant(product, index)!.compareAtPrice"
                    class="text-[length:var(--text-sm)] text-[var(--color-muted)] line-through"
                  >
                    {{ formatPrice(getActiveVariant(product, index)!.compareAtPrice!) }}
                  </span>
                </div>
              </template>
            </div>

            <!-- Buy Button -->
            <a
              v-if="product.ctaLabel && product.ctaUrl"
              :href="product.ctaUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-[var(--spacing-sm)] inline-flex items-center justify-center px-[var(--btn-px)] py-[var(--btn-py)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] rounded-[var(--btn-radius)] font-[var(--btn-weight)] text-[length:var(--text-base)] hover:opacity-90 transition-opacity no-underline"
              :style="getButtonStyle(index)"
              @click.stop
            >
              {{ product.ctaLabel }}
            </a>
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
