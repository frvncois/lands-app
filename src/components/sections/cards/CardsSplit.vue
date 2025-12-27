<script setup lang="ts">
/**
 * CARDS SPLIT VARIANT
 *
 * Split layout with header on one side and cards on the other.
 * Cards are ALWAYS displayed as a horizontal row on desktop.
 * Stacks vertically on mobile.
 *
 * SHARED STYLES: All cards use the same visual system from sectionStyles.
 * Card items only contain CONTENT (text, media, button data).
 */

import { computed } from 'vue'
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
  resolveRepeaterGroupStyles,
  resolveSharedCardContainerStyles,
  resolveSharedCardInnerGap,
  resolveSharedCardMediaStyles,
  resolveSharedCardTextStyles,
  resolveSharedCardButtonStyles,
} from '@/lib/section-styles'
import SectionHeaderBlock from '@/components/sections/shared/SectionHeaderBlock.vue'

const props = defineProps<{
  data: CardsData
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

// SPACING MODEL:
// 1. Section Space Between = gap between header block and cards content
// 2. Cards List Space Between = gap between card items
const repeaterGroupStyles = computed(() => resolveRepeaterGroupStyles(props.sectionStyles, 'items'))
const sectionSpaceBetween = computed(() => props.sectionStyles?.spaceBetween ?? 32)
const cardsListSpaceBetween = computed(() => repeaterGroupStyles.value.spaceBetween ?? 16)

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

// SHARED STYLES - All cards use the same visual styling from sectionStyles
const sharedContainerStyle = computed(() => resolveSharedCardContainerStyles(props.sectionStyles))
const sharedInnerGap = computed(() => resolveSharedCardInnerGap(props.sectionStyles))
const sharedMediaStyle = computed(() => resolveSharedCardMediaStyles(props.sectionStyles))
const sharedHeadlineStyle = computed(() => resolveSharedCardTextStyles(props.sectionStyles, 'Headline', '--font-heading'))
const sharedSubheadlineStyle = computed(() => resolveSharedCardTextStyles(props.sectionStyles, 'Subheadline', '--font-body'))
const sharedParagraphStyle = computed(() => resolveSharedCardTextStyles(props.sectionStyles, 'Paragraph', '--font-body'))
const sharedButtonStyle = computed(() => resolveSharedCardButtonStyles(props.sectionStyles))

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
      <div v-if="hasHeaderContent" class="md:w-1/3 md:flex-shrink-0">
        <SectionHeaderBlock
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
      </div>

      <!-- Cards Row Container -->
      <div
        :class="[
          'flex flex-col flex-1',
          hasHeaderContent ? 'md:w-2/3' : 'w-full',
        ]"
        :style="{ gap: `${cardsListSpaceBetween}px` }"
      >
        <div
          v-for="(card, index) in data.items"
          :key="card.id || index"
          class="flex-1 flex flex-col bg-[var(--color-surface)] rounded-[var(--radius-lg)] overflow-hidden"
          :class="[
            editable && 'cursor-pointer transition-all duration-150 select-none',
            editable && !isCardActive(card, index) && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-2',
            editable && isCardActive(card, index) && 'outline outline-2 outline-primary -outline-offset-2',
          ]"
          :style="sharedContainerStyle"
          @click="handleItemClick($event, card, index)"
        >
          <!-- Media (Image or Video) -->
          <template v-if="card.media?.src">
            <div
              class="w-full overflow-hidden"
              :style="sharedMediaStyle"
            >
              <img
                v-if="card.media.type === 'image'"
                :src="card.media.src"
                :alt="card.media.alt || ''"
                :class="[
                  'w-full h-full object-cover',
                  editable && 'pointer-events-none select-none',
                ]"
                :style="{ aspectRatio: sharedMediaStyle.aspectRatio || '16 / 9' }"
              />
              <video
                v-else-if="card.media.type === 'video'"
                :src="card.media.src"
                :class="[
                  'w-full h-full object-cover',
                  editable && 'pointer-events-none select-none',
                ]"
                :style="{ aspectRatio: sharedMediaStyle.aspectRatio || '16 / 9' }"
                autoplay
                muted
                loop
                playsinline
              />
            </div>
          </template>

          <!-- Content (non-editable inline - edit via inspector) -->
          <div
            class="p-[var(--spacing-md)] flex flex-col"
            :class="editable && 'pointer-events-none select-none'"
            :style="{ gap: sharedInnerGap }"
          >
            <h3
              v-if="card.headline"
              class="text-[length:var(--text-xl)] font-semibold m-0"
              :style="sharedHeadlineStyle"
            >{{ card.headline }}</h3>
            <p
              v-if="card.subheadline"
              class="text-[length:var(--text-sm)] text-[var(--color-muted)] m-0"
              :style="sharedSubheadlineStyle"
            >{{ card.subheadline }}</p>
            <div
              v-if="card.paragraph"
              class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0"
              :style="sharedParagraphStyle"
              v-html="card.paragraph"
            />
            <a
              v-if="card.buttonLabel && card.buttonUrl"
              :href="card.buttonUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-[var(--spacing-sm)] inline-flex items-center justify-center font-medium hover:opacity-90 transition-opacity no-underline"
              :style="sharedButtonStyle"
            >
              {{ card.buttonLabel }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
