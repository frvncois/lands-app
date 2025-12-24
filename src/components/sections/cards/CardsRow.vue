<script setup lang="ts">
/**
 * CARDS ROW VARIANT
 *
 * Cards displayed in alternating rows.
 * Each card is a full-width row with media on one side, content on the other.
 * Alternates: odd cards media-left, even cards media-right.
 * Stacks vertically on mobile.
 *
 * NO buttons - Cards is informational only.
 */

import type { CardsData } from '@/lib/section-registry'
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
  resolveItemTypographyStyles,
} from '@/lib/section-styles'

const props = defineProps<{
  data: CardsData
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

function getSectionStyle(): Record<string, string> {
  return resolveSectionStyles(props.sectionStyles)
}

function getItemContainerStyle(): Record<string, string> {
  return resolveItemContainerStyles(props.itemStyles)
}

function getItemTypographyStyle(): Record<string, string> {
  return resolveItemTypographyStyles(props.itemStyles)
}

/**
 * Get field-specific styles for a repeater item field
 * Resolves styles from fieldStyles using the full path: items.{index}.{fieldKey}
 */
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

function getCardId(card: CardsData['items'][number], fallback: number): string | null {
  if (card?.id) return card.id
  return fallback.toString()
}

function isCardActive(card: CardsData['items'][number], index: number): boolean {
  if (!props.editable) return false
  const cardId = getCardId(card, index)
  if (!cardId) return false
  return (
    props.activeNodeType === 'item' &&
    props.activeFieldKey === 'items' &&
    props.activeItemId === cardId
  )
}

function handleItemClick(e: MouseEvent, card: CardsData['items'][number], index: number) {
  if (!props.editable) return
  e.stopPropagation()
  const cardId = getCardId(card, index)
  if (!cardId) return
  emit('selectField', {
    type: 'item',
    fieldKey: 'items',
    itemId: cardId,
  })
}

// Check if media should be on left (odd index = 0, 2, 4... media on left)
function isMediaLeft(index: number): boolean {
  return index % 2 === 0
}
</script>

<template>
  <section
    class="bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-section)] px-[var(--spacing-container)]"
    :style="getSectionStyle()"
  >
    <div class="max-w-[1200px] mx-auto w-full flex flex-col gap-[var(--spacing-2xl)]">
      <div
        v-for="(card, index) in data.items"
        :key="card.id || index"
        class="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-xl)] items-center"
        :class="[
          editable && 'cursor-pointer transition-all duration-150 rounded-[var(--radius-lg)] select-none',
          editable && !isCardActive(card, index) && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-2',
          editable && isCardActive(card, index) && 'outline outline-2 outline-primary -outline-offset-2',
        ]"
        :style="getItemContainerStyle()"
        @click="handleItemClick($event, card, index)"
      >
        <!-- Media Column -->
        <div :class="[{ 'md:order-2': !isMediaLeft(index) }, editable && 'pointer-events-none select-none']">
          <template v-if="card.media?.src">
            <img
              v-if="card.media.type === 'image'"
              :src="card.media.src"
              :alt="card.media.alt || ''"
              :class="[
                'w-full h-auto rounded-[var(--radius-lg)] object-cover aspect-[4/3]',
                editable && 'pointer-events-none select-none',
              ]"
            />
            <video
              v-else-if="card.media.type === 'video'"
              :src="card.media.src"
              :class="[
                'w-full h-auto rounded-[var(--radius-lg)] object-cover aspect-[4/3]',
                editable && 'pointer-events-none select-none',
              ]"
              autoplay
              muted
              loop
              playsinline
            />
          </template>

          <!-- Placeholder when no media -->
          <div
            v-else
            class="w-full aspect-[4/3] rounded-[var(--radius-lg)] bg-[var(--color-surface)] flex items-center justify-center"
          >
            <span class="text-[var(--color-muted)]">Add media</span>
          </div>
        </div>

        <!-- Content Column (non-editable inline - edit via inspector) -->
        <div
          class="flex flex-col gap-[var(--spacing-md)]"
          :class="[{ 'md:order-1': !isMediaLeft(index) }, editable && 'pointer-events-none select-none']"
        >
          <h3
            v-if="card.headline"
            class="text-[length:var(--text-3xl)] font-bold leading-tight m-0"
            :style="getFieldStyle(index, 'headline', '--font-heading')"
          >{{ card.headline }}</h3>
          <p
            v-if="card.subheadline"
            class="text-[length:var(--text-lg)] text-[var(--color-muted)] m-0"
            :style="getFieldStyle(index, 'subheadline', '--font-body')"
          >{{ card.subheadline }}</p>
          <div
            v-if="card.paragraph"
            class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0 prose prose-sm"
            :style="getFieldStyle(index, 'paragraph', '--font-body')"
            v-html="card.paragraph"
          />
        </div>
      </div>
    </div>
  </section>
</template>
