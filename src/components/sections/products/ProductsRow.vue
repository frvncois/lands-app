<script setup lang="ts">
/**
 * PRODUCTS ROW VARIANT
 *
 * Products displayed in alternating rows.
 * Each product is a full-width row with image on one side, content on the other.
 * Alternates: odd products image-left, even products image-right.
 * Stacks vertically on mobile.
 *
 * SHARED STYLES: All products use the same visual system from sectionStyles.
 * Product items only contain CONTENT (text, media, variants, pricing).
 * Item-only selection - no inline editing.
 */

import { ref, computed, withDefaults } from 'vue'
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

const props = withDefaults(defineProps<{
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
  showHeaderBlock?: boolean
  standalone?: boolean
}>(), {
  showHeaderBlock: true,
  standalone: true,
})

const emit = defineEmits<{
  selectField: [payload: SelectionPayload | string]
  'update': [fieldKey: string, value: unknown]
}>()

// Track selected variant index per product
const selectedVariants = ref<Record<string, number>>({})

const repeaterGroupStyles = computed(() => resolveRepeaterGroupStyles(props.sectionStyles, 'items'))
const spaceBetween = computed(() => repeaterGroupStyles.value.spaceBetween ?? props.sectionStyles?.spaceBetween ?? 16)
const showHeaderBlock = computed(() => props.showHeaderBlock !== false)
const isStandalone = computed(() => props.standalone !== false)

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

function getSectionStyle(): Record<string, string> {
  return isStandalone.value ? resolveSectionStyles(props.sectionStyles) : {}
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

function isImageLeft(index: number): boolean {
  return index % 2 === 0
}

function handleHeaderSelect(fieldKey: string) {
  emit('selectField', fieldKey)
}

function handleUpdate(fieldKey: string, value: unknown) {
  emit('update', fieldKey, value)
}
</script>

<template>
  <component
    :is="isStandalone ? 'section' : 'div'"
    class="bg-[var(--color-bg)] text-[var(--color-fg)]"
    :class="isStandalone ? 'py-[var(--spacing-section)] px-[var(--spacing-container)]' : ''"
    :style="getSectionStyle()"
  >
    <div
      :class="[
        'flex flex-col w-full',
        isStandalone ? 'max-w-[1200px] mx-auto' : '',
      ]"
      :style="{ gap: `${spaceBetween}px` }"
    >
      <SectionHeaderBlock
        v-if="showHeaderBlock"
        :headline="data.headline"
        :subheadline="data.subheadline"
        :paragraph="data.paragraph"
        :field-styles="fieldStyles"
        :editable="editable"
        :active-field="activeFieldKey"
        :hidden-fields="hiddenFields"
        @selectField="handleHeaderSelect"
        @update="handleUpdate"
      />
      <div class="flex flex-col w-full" :style="{ gap: `${spaceBetween}px` }">
        <div
          v-for="(product, index) in data.items"
          :key="product.id || index"
          class="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-xl)] items-center"
          :class="[
            editable && 'cursor-pointer transition-all duration-150 rounded-[var(--radius-lg)] select-none',
            editable && !isProductActive(product, index) && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-2',
            editable && isProductActive(product, index) && 'outline outline-2 outline-primary -outline-offset-2',
          ]"
          :style="sharedContainerStyle"
          @click="handleItemClick($event, product, index)"
        >
        <!-- Image Column -->
        <div :class="[{ 'md:order-2': !isImageLeft(index) }, editable && 'pointer-events-none select-none']">
          <template v-if="product.image?.src">
            <img
              :src="product.image.src"
              :alt="product.image.alt || product.heading"
              class="w-full h-auto rounded-[var(--radius-lg)] object-cover"
              :style="{ ...sharedMediaStyle, aspectRatio: mediaAspectRatio }"
            />
          </template>

          <!-- Placeholder when no image -->
          <div
            v-else
            class="w-full rounded-[var(--radius-lg)] bg-[var(--color-surface)] flex items-center justify-center"
            :style="{ aspectRatio: mediaAspectRatio }"
          >
            <span class="text-[var(--color-muted)]">Add image</span>
          </div>
        </div>

        <!-- Content Column -->
        <div
          class="flex flex-col"
          :class="[{ 'md:order-1': !isImageLeft(index) }, editable && 'pointer-events-none select-none']"
          :style="{ gap: sharedInnerGap }"
        >
          <h3
            v-if="product.heading"
            class="text-[length:var(--text-3xl)] font-bold leading-tight m-0"
            :style="sharedHeadlineStyle"
          >{{ product.heading }}</h3>
          <p
            v-if="product.subheading"
            class="text-[length:var(--text-lg)] text-[var(--color-muted)] m-0"
            :style="sharedSubheadlineStyle"
          >{{ product.subheading }}</p>
          <div
            v-if="product.description"
            class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0 prose prose-sm"
            :style="sharedParagraphStyle"
            v-html="product.description"
          />

          <!-- Variant Selector -->
          <div v-if="product.variants && product.variants.length > 1">
            <select
              class="px-[var(--spacing-md)] py-[var(--spacing-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-fg)] text-[length:var(--text-base)]"
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
          <div v-if="getActiveVariant(product, index)">
            <div class="flex items-baseline gap-[var(--spacing-sm)]">
              <span class="text-[length:var(--text-2xl)] font-bold text-[var(--color-fg)]">
                {{ formatPrice(getActiveVariant(product, index)!.price) }}
              </span>
              <span
                v-if="getActiveVariant(product, index)!.compareAtPrice"
                class="text-[length:var(--text-lg)] text-[var(--color-muted)] line-through"
              >
                {{ formatPrice(getActiveVariant(product, index)!.compareAtPrice!) }}
              </span>
            </div>
          </div>

          <!-- Buy Button -->
          <div>
            <a
              v-if="product.ctaLabel && product.ctaUrl"
              :href="product.ctaUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center font-medium hover:opacity-90 transition-opacity no-underline"
              :style="sharedButtonStyle"
              @click.stop
            >
              {{ product.ctaLabel }}
            </a>
          </div>
        </div>
      </div>
    </div>
    </div>
  </component>
</template>
