<script setup lang="ts">
/**
 * CARDS GRID VARIANT
 *
 * Fixed responsive grid layout:
 * - Desktop: 3 columns
 * - Tablet: 2 columns
 * - Mobile: 1 column
 *
 * NO buttons - Cards is informational only.
 */

import type { CardsData } from '@/lib/section-registry'
import type { SectionStyleProperties, ItemStyleProperties, FieldStyles } from '@/types/sections'
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
  >
    <div class="max-w-[1200px] mx-auto w-full">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-lg)]">
        <div
          v-for="(card, index) in data.items"
          :key="index"
          class="flex flex-col gap-[var(--spacing-sm)] bg-[var(--color-surface)] rounded-[var(--radius-lg)] overflow-hidden"
          :class="[
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
