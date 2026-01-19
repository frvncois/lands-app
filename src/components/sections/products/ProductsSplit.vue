<script setup lang="ts">
/**
 * PRODUCTS SPLIT VARIANT
 *
 * Split layout with header on one side and products on the other.
 * Products are ALWAYS displayed as a horizontal row on desktop.
 * Stacks vertically on mobile.
 *
 * SHARED STYLES: All products use the same visual system from sectionStyles.
 * Product items only contain CONTENT (text, media, variants, pricing).
 */

import { ref, computed } from 'vue'
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
  resolveRepeaterGroupStyles,
  resolveSharedProductContainerStyles,
  resolveSharedProductInnerGap,
  resolveSharedProductMediaStyles,
  resolveSharedProductTextStyles,
  resolveSharedProductButtonStyles,
  getProductMediaAspectRatio,
} from '@/lib/section-styles'
import SectionHeaderBlock from '@/components/sections/shared/SectionHeaderBlock.vue'

const props = defineProps<{
  data: ProductsData
  sectionStyles?: SectionStyleProperties
  itemStyles?: ItemStyleProperties
  fieldStyles?: FieldStyles
  editable?: boolean
  hiddenFields?: string[]
  activeNodeId?: string | null
  activeNodeType?: ActiveNodeType | null
  activeFieldKey?: string | null
  activeItemId?: string | null
}>()

const emit = defineEmits<{
  selectField: [payload: SelectionPayload | string]
  'update': [fieldKey: string, value: unknown]
}>()

// Track selected variant index per product
const selectedVariants = ref<Record<string, number>>({})

// SPACING MODEL:
// 1. Section Space Between = gap between header block and products content
// 2. Products List Space Between = gap between product items
const repeaterGroupStyles = computed(() => resolveRepeaterGroupStyles(props.sectionStyles, 'items'))
const sectionSpaceBetween = computed(() => props.sectionStyles?.spaceBetween ?? 32)
const productsListSpaceBetween = computed(() => repeaterGroupStyles.value.spaceBetween ?? 16)

const hasHeaderContent = computed(() => {
  return Boolean(props.data.headline || props.data.subheadline || props.data.paragraph)
})

function getSectionStyle(): Record<string, string> {
  return resolveSectionStyles(props.sectionStyles)
}

function handleHeaderSelect(fieldKey: string) {
  emit('selectField', fieldKey)
}

function handleUpdate(fieldKey: string, value: unknown) {
  emit('update', fieldKey, value)
}

// SHARED STYLES - All products use the same visual styling from sectionStyles
const sharedContainerStyle = computed(() => resolveSharedProductContainerStyles(props.sectionStyles))
const sharedInnerGap = computed(() => resolveSharedProductInnerGap(props.sectionStyles))
const sharedMediaStyle = computed(() => resolveSharedProductMediaStyles(props.sectionStyles))
const sharedHeadlineStyle = computed(() => resolveSharedProductTextStyles(props.sectionStyles, 'Headline', '--font-heading'))
const sharedSubheadlineStyle = computed(() => resolveSharedProductTextStyles(props.sectionStyles, 'Subheadline', '--font-body'))
const sharedParagraphStyle = computed(() => resolveSharedProductTextStyles(props.sectionStyles, 'Paragraph', '--font-body'))
const sharedButtonStyle = computed(() => resolveSharedProductButtonStyles(props.sectionStyles))

// Media aspect ratio for images
const mediaAspectRatio = computed(() => {
  const styles = props.sectionStyles as Record<string, unknown> | undefined
  return getProductMediaAspectRatio(styles?.productMediaAspect as 'square' | 'portrait' | 'paysage' | undefined)
})

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
  >
    <div
      class="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row md:items-start"
      :style="{ gap: `${sectionSpaceBetween}px` }"
    >
      <!-- Header Column -->
      <div
        v-if="hasHeaderContent"
        class="md:w-1/3 md:flex-shrink-0"
      >
        <SectionHeaderBlock
          :headline="data.headline"
          :subheadline="data.subheadline"
          :paragraph="data.paragraph"
          :field-styles="fieldStyles"
          :editable="editable"
          :active-field="activeFieldKey"
          :hidden-fields="hiddenFields"
          @select-field="handleHeaderSelect"
          @update="handleUpdate"
        />
      </div>

      <!-- Products Row Container -->
      <div
        :class="[
          'flex flex-col md:flex-row flex-1',
          hasHeaderContent ? 'md:w-2/3' : 'w-full',
        ]"
        :style="{ gap: `${productsListSpaceBetween}px` }"
      >
        <div
          v-for="(product, index) in data.items"
          :key="product.id || index"
          class="flex-1 flex flex-col bg-[var(--color-surface)] rounded-[var(--radius-lg)] overflow-hidden"
          :class="[
            editable && 'cursor-pointer transition-all duration-150 select-none',
            editable && !isProductActive(product, index) && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-2',
            editable && isProductActive(product, index) && 'outline outline-2 outline-primary -outline-offset-2',
          ]"
          :style="sharedContainerStyle"
          @click="handleItemClick($event, product, index)"
        >
          <!-- Product Image -->
          <div
            v-if="product.image?.src"
            class="w-full overflow-hidden"
            :style="sharedMediaStyle"
          >
            <img
              :src="product.image.src"
              :alt="product.image.alt || product.heading"
              :class="[
                'w-full h-full object-cover',
                editable && 'pointer-events-none select-none',
              ]"
              :style="{ aspectRatio: mediaAspectRatio }"
            />
          </div>
          <div
            v-else
            class="w-full bg-[var(--color-secondary)] flex items-center justify-center"
            :class="editable && 'pointer-events-none select-none'"
            :style="{ aspectRatio: mediaAspectRatio }"
          >
            <span class="text-[var(--color-muted)]">Add image</span>
          </div>

          <!-- Content (non-editable inline - edit via inspector) -->
          <div
            class="p-[var(--spacing-md)] flex flex-col flex-1"
            :class="editable && 'pointer-events-none select-none'"
            :style="{ gap: sharedInnerGap }"
          >
            <h3
              v-if="product.heading"
              class="text-[length:var(--text-xl)] font-semibold m-0"
              :style="sharedHeadlineStyle"
            >
              {{ product.heading }}
            </h3>
            <p
              v-if="product.subheading"
              class="text-[length:var(--text-sm)] text-[var(--color-muted)] m-0"
              :style="sharedSubheadlineStyle"
            >
              {{ product.subheading }}
            </p>
            <div
              v-if="product.description"
              class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0"
              :style="sharedParagraphStyle"
              v-html="product.description"
            />

            <!-- Variant Selector -->
            <div
              v-if="product.variants && product.variants.length > 1"
              class="mt-[var(--spacing-sm)]"
            >
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
              <div
                v-if="getActiveVariant(product, index)"
                class="flex items-baseline gap-[var(--spacing-xs)]"
              >
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
            </div>

            <!-- Buy Button -->
            <a
              v-if="product.ctaLabel && product.ctaUrl"
              :href="product.ctaUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-[var(--spacing-sm)] inline-flex items-center justify-center font-medium hover:opacity-90 transition-opacity no-underline"
              :style="sharedButtonStyle"
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
