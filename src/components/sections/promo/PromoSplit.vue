<script setup lang="ts">
/**
 * PROMO SPLIT VARIANT
 *
 * Two-column layout (desktop): Content | Image
 * NO layout options - always Content on left, Image on right.
 * Mobile stacks vertically (content first, then image).
 * Smart background support with configurable opacity.
 *
 * Background color applies to SECTION (full width).
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

// Media styles - ONLY borderRadius (default to theme radius-lg equivalent ~16px)
const mediaStyle = computed(() => {
  const styles = props.fieldStyles?.['image.src']
  const borderRadius = styles?.borderRadius ?? 16
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

// Section style - backgroundColor goes to section (full width)
function getSectionStyle(): Record<string, string> {
  return resolveSectionStyles(props.sectionStyles)
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

    <!-- Grid: Content | Image (fixed order, no options) -->
    <div class="relative z-10 max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-2xl)] items-center">
      <!-- Content Column (always first on desktop) -->
      <div
        class="flex flex-col order-1 md:order-1"
        :style="contentGapStyle"
      >
        <!-- Text Stack: Headline + Subheadline -->
        <div class="flex flex-col gap-[var(--spacing-sm)]">
          <EditableText
            tag="h2"
            :value="data.headline"
            field-key="headline"
            :editable="editable"
            :active-field="activeField"
            :hidden-fields="hiddenFields"
            class="text-[length:var(--text-3xl)] font-bold leading-tight m-0"
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
            class="text-[length:var(--text-lg)] text-[var(--color-muted)] m-0"
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
          class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0"
          :style="getFieldStyle('paragraph', '--font-body')"
          @selectField="handleSelectField"
          @update="handleUpdate"
        />

        <!-- Links (flex-col) - ALL open in new tab -->
        <div
          v-if="data.links?.length"
          class="flex flex-col gap-[var(--spacing-sm)]"
        >
          <a
            v-for="(link, index) in data.links"
            :key="index"
            v-show="!isFieldHidden(`links.${index}`)"
            :href="editable ? '#' : (link.url || '#')"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[length:var(--text-sm)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:opacity-90 transition-opacity w-fit"
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

      <!-- Image Column (always second on desktop) -->
      <div
        v-if="!isFieldHidden('image.src')"
        class="order-2 md:order-2"
      >
        <div
          class="w-full"
          :class="[
            isEditing && 'cursor-pointer',
            isEditing && activeField !== 'image.src' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
            isEditing && activeField === 'image.src' && 'outline outline-2 outline-primary outline-offset-2',
          ]"
          :style="mediaStyle"
          @click.stop="isEditing && handleImageClick($event)"
        >
          <img
            v-if="data.image?.src"
            :src="data.image.src"
            :alt="data.image.alt || ''"
            class="w-full aspect-square object-cover"
            :style="mediaStyle"
          />
          <MediaPlaceholder
            v-else
            :show="true"
            class="w-full aspect-square"
            :style="mediaStyle"
          />
        </div>
      </div>
    </div>
  </section>
</template>
