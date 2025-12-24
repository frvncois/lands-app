<script setup lang="ts">
/**
 * PROMO CARD VARIANT
 *
 * Card-style layout with all content in a bordered/elevated container.
 * Centered with smaller max-width for compact presentation.
 * Smart background support with configurable opacity.
 *
 * Background color applies to CARD CONTAINER ONLY (not section).
 * All links open in new tab (_blank).
 * Media styles: only borderRadius.
 */

import { computed } from 'vue'
import type { PromoData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles, ItemStyleProperties } from '@/types/sections'
import EditableText from '../EditableText.vue'
import MediaPlaceholder from '../MediaPlaceholder.vue'
import { resolveSectionStyles, getTextStyle } from '@/lib/section-styles'

const props = defineProps<{
  data: PromoData
  sectionStyles?: SectionStyleProperties
  fieldStyles?: FieldStyles
  itemStyles?: ItemStyleProperties
  isEditing?: boolean
  editable?: boolean
  activeField?: string | null
  activeItemIndex?: number | null
  hiddenFields?: string[]
  spaceBetween: number
  smartBackground: boolean
  smartBackgroundOpacity: number
}>()

const emit = defineEmits<{
  selectField: [fieldKey: string]
  'update': [fieldKey: string, value: unknown]
}>()

// Content gap style using spaceBetween
const contentGapStyle = computed(() => ({
  gap: `${props.spaceBetween}px`
}))

// Media styles - ONLY borderRadius (default to 0 for card since it's inside overflow-hidden container)
const mediaStyle = computed(() => {
  const styles = props.fieldStyles?.['image.src']
  const borderRadius = styles?.borderRadius ?? 0
  return {
    borderRadius: `${borderRadius}px`
  }
})

// Check if smart background should be shown
const showSmartBackground = computed(() => {
  return props.smartBackground && props.data.image?.src
})

// Smart background style with configurable opacity
const smartBackgroundStyle = computed(() => ({
  filter: 'blur(40px)',
  transform: 'scale(1.2)',
  opacity: props.smartBackgroundOpacity
}))

// Card container background color (from section styles)
const cardBackgroundColor = computed(() => {
  return props.sectionStyles?.backgroundColor
})

// Section style WITHOUT backgroundColor (goes to section wrapper, not card)
function getSectionStyle(): Record<string, string> {
  const styles = resolveSectionStyles(props.sectionStyles)
  // Remove backgroundColor - it goes to card container only
  delete styles.backgroundColor
  return styles
}

function getFieldStyle(fieldKey: string, defaultFont: string = '--font-body'): Record<string, string> {
  return getTextStyle(props.fieldStyles, fieldKey, defaultFont)
}

// Get button/link styles from fieldStyles for specific link index
function getLinkStyle(index: number): Record<string, string> {
  const fieldKey = `links.${index}`
  const styles = props.fieldStyles?.[fieldKey]
  if (!styles) return {}

  const result: Record<string, string> = {}
  if (styles.fontSize) result.fontSize = `${styles.fontSize}px`
  if (styles.backgroundColor) result.backgroundColor = styles.backgroundColor
  if (styles.color) result.color = styles.color
  if (styles.borderRadius !== undefined) result.borderRadius = `${styles.borderRadius}px`
  if (styles.spacingX !== undefined) {
    result.paddingLeft = `${styles.spacingX}px`
    result.paddingRight = `${styles.spacingX}px`
  }
  if (styles.spacingY !== undefined) {
    result.paddingTop = `${styles.spacingY}px`
    result.paddingBottom = `${styles.spacingY}px`
  }
  if (styles.borderWidth !== undefined && styles.borderWidth > 0) {
    result.borderWidth = `${styles.borderWidth}px`
    result.borderStyle = 'solid'
    result.borderColor = styles.borderColor || 'var(--color-border)'
  }

  return result
}

function handleSelectField(fieldKey: string) {
  emit('selectField', fieldKey)
}

function handleUpdate(fieldKey: string, value: unknown) {
  emit('update', fieldKey, value)
}

function handleLinkClick(e: MouseEvent, index: number) {
  if (!props.isEditing) return
  e.preventDefault()
  e.stopPropagation()
  emit('selectField', `links.${index}`)
}

function handleImageClick(e: MouseEvent) {
  if (!props.isEditing) return
  e.stopPropagation()
  emit('selectField', 'image.src')
}

function isFieldHidden(fieldKey: string): boolean {
  return props.hiddenFields?.includes(fieldKey) ?? false
}

// Check if a specific link is selected
function isLinkSelected(index: number): boolean {
  return props.activeField === 'links' && props.activeItemIndex === index
}
</script>

<template>
  <section
    class="relative bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-section)] px-[var(--spacing-container)] overflow-hidden"
    :style="getSectionStyle()"
  >
    <!-- Smart Background Layer -->
    <div
      v-if="showSmartBackground"
      class="absolute inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    >
      <img
        :src="data.image?.src"
        alt=""
        class="absolute inset-0 w-full h-full object-cover"
        :style="smartBackgroundStyle"
      />
    </div>

    <div class="relative z-10 max-w-[480px] mx-auto w-full">
      <!-- Card Container - backgroundColor applies HERE -->
      <div
        class="rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-border)]"
        :style="{ backgroundColor: cardBackgroundColor || 'var(--color-surface)' }"
      >
        <!-- Image -->
        <div
          v-if="!isFieldHidden('image.src')"
          class="w-full"
          :class="[
            isEditing && 'cursor-pointer',
            isEditing && activeField !== 'image.src' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-2',
            isEditing && activeField === 'image.src' && 'outline outline-2 outline-primary -outline-offset-2',
          ]"
          @click.stop="isEditing && handleImageClick($event)"
        >
          <img
            v-if="data.image?.src"
            :src="data.image.src"
            :alt="data.image.alt || ''"
            class="w-full aspect-[4/3] object-cover"
            :style="mediaStyle"
          />
          <MediaPlaceholder
            v-else
            :show="true"
            class="w-full aspect-[4/3]"
          />
        </div>

        <!-- Content -->
        <div
          class="p-[var(--spacing-lg)] flex flex-col items-center text-center"
          :style="contentGapStyle"
        >
          <!-- Text Stack: Headline + Subheadline -->
          <div class="flex flex-col gap-[var(--spacing-xs)]">
            <EditableText
              tag="h2"
              :value="data.headline"
              field-key="headline"
              :editable="editable"
              :active-field="activeField"
              :hidden-fields="hiddenFields"
              class="text-[length:var(--text-2xl)] font-bold leading-tight m-0"
              :style="getFieldStyle('headline', '--font-heading')"
              @selectField="handleSelectField"
              @update="handleUpdate"
            />

            <EditableText
              v-if="data.subheadline"
              tag="p"
              :value="data.subheadline"
              field-key="subheadline"
              :editable="editable"
              :active-field="activeField"
              :hidden-fields="hiddenFields"
              class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0"
              :style="getFieldStyle('subheadline', '--font-body')"
              @selectField="handleSelectField"
              @update="handleUpdate"
            />
          </div>

          <!-- Paragraph -->
          <EditableText
            v-if="data.paragraph"
            tag="div"
            :value="data.paragraph"
            field-key="paragraph"
            :editable="editable"
            :active-field="activeField"
            :hidden-fields="hiddenFields"
            :html="true"
            class="text-[length:var(--text-sm)] text-[var(--color-muted)] m-0"
            :style="getFieldStyle('paragraph', '--font-body')"
            @selectField="handleSelectField"
            @update="handleUpdate"
          />

          <!-- Links (flex-col) - ALL open in new tab -->
          <div
            v-if="data.links?.length"
            class="flex flex-col items-center gap-[var(--spacing-sm)] w-full"
          >
            <a
              v-for="(link, index) in data.links"
              :key="index"
              v-show="!isFieldHidden(`links.${index}`)"
              :href="editable ? '#' : (link.url || '#')"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[length:var(--text-sm)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:opacity-90 transition-opacity"
              :class="[
                isEditing && 'cursor-pointer',
                isEditing && !isLinkSelected(index) && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
                isEditing && isLinkSelected(index) && 'outline outline-2 outline-primary outline-offset-2',
              ]"
              :style="getLinkStyle(index)"
              @click="handleLinkClick($event, index)"
            >{{ link.label }}</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
