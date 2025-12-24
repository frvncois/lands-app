<script setup lang="ts">
/**
 * LINKS GRID VARIANT
 *
 * Displays section headline + paragraph at the top.
 * Links displayed in a responsive grid below.
 *
 * Grid rules (FIXED):
 * - Desktop: 3 columns
 * - Tablet: 2 columns
 * - Mobile: 1 column
 *
 * NO layout options exposed.
 */

import type { LinksData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles, ItemStyleProperties } from '@/types/sections'
import EditableText from '../EditableText.vue'
import { resolveSectionStyles, getTextStyle, getImageStyle } from '@/lib/section-styles'

const props = defineProps<{
  data: LinksData
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

function getSectionStyle(): Record<string, string> {
  return resolveSectionStyles(props.sectionStyles)
}

function getHeaderFieldStyle(fieldKey: string, defaultFont: string = '--font-body'): Record<string, string> {
  return getTextStyle(props.fieldStyles, fieldKey, defaultFont)
}

/**
 * Get shared styles for repeater item containers
 * Applied to each item wrapper - shared across all items
 */
function getItemContainerStyle(): Record<string, string> {
  const styles = props.itemStyles
  if (!styles) return {}

  const result: Record<string, string> = {}
  if (styles.fontSize) result.fontSize = `${styles.fontSize}px`
  if (styles.backgroundColor) result.backgroundColor = styles.backgroundColor
  if (styles.borderRadius !== undefined) result.borderRadius = `${styles.borderRadius}px`
  if (styles.spacingX !== undefined) result.paddingLeft = result.paddingRight = `${styles.spacingX}px`
  if (styles.spacingY !== undefined) result.paddingTop = result.paddingBottom = `${styles.spacingY}px`
  return result
}

function handleItemClick(e: MouseEvent, index: number) {
  if (!props.editable) return
  e.preventDefault()
  e.stopPropagation()
  emit('selectField', `items.${index}`)
}

function handleSelectField(fieldKey: string) {
  emit('selectField', fieldKey)
}

function handleUpdate(fieldKey: string, value: unknown) {
  emit('update', fieldKey, value)
}
</script>

<template>
  <section
    class="bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-section)] px-[var(--spacing-container)]"
    :style="getSectionStyle()"
  >
    <div class="max-w-[1200px] mx-auto w-full">
      <!-- Section Header -->
      <div
        v-if="data.headline || data.paragraph"
        class="text-center mb-[var(--spacing-2xl)]"
      >
        <EditableText
          v-if="data.headline"
          tag="h2"
          :value="data.headline"
          field-key="headline"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          class="text-[length:var(--text-3xl)] font-bold leading-tight m-0 mb-[var(--spacing-md)]"
          :style="getHeaderFieldStyle('headline', '--font-heading')"
          @selectField="handleSelectField"
          @update="handleUpdate"
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
          class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0 max-w-[600px] mx-auto"
          :style="getHeaderFieldStyle('paragraph', '--font-body')"
          @selectField="handleSelectField"
          @update="handleUpdate"
        />
      </div>

      <!-- Links Grid (item-only selection - edit via inspector) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]">
        <a
          v-for="(link, index) in data.items"
          :key="index"
          :href="editable ? '#' : (link.url || '#')"
          class="block p-[var(--spacing-lg)] bg-[var(--color-surface)] rounded-[var(--radius-lg)] hover:bg-[var(--color-secondary)] transition-colors"
          :class="[
            editable && 'cursor-pointer transition-all duration-150',
            editable && activeField !== `items.${index}` && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-2',
            editable && activeField === `items.${index}` && 'outline outline-2 outline-primary -outline-offset-2',
          ]"
          :style="getItemContainerStyle()"
          @click="handleItemClick($event, index)"
        >
          <img
            v-if="link.image?.src"
            :src="link.image.src"
            :alt="link.image.alt || ''"
            class="w-full h-auto rounded-[var(--radius-md)] mb-[var(--spacing-sm)] object-cover aspect-video"
          />
          <span
            class="block text-[length:var(--text-lg)] font-semibold mb-[var(--spacing-xs)]"
            :style="{ fontFamily: 'var(--font-heading)' }"
          >{{ link.label }}</span>
          <span
            v-if="link.description"
            class="block text-[length:var(--text-sm)] text-[var(--color-muted)]"
            :style="{ fontFamily: 'var(--font-body)' }"
          >{{ link.description }}</span>
        </a>
      </div>
    </div>
  </section>
</template>
