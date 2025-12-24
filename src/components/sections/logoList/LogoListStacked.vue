<script setup lang="ts">
/**
 * LOGO LIST - STACKED VARIANT
 *
 * Vertical single-column layout with optional header.
 * Content (headline/subheadline/paragraph) above logos.
 * Logos stacked vertically with centered alignment.
 *
 * Item styles:
 * - width: logo width in px
 * - blackAndWhite: grayscale filter
 * - opacity: 0-1 opacity value
 */

import { computed } from 'vue'
import type { LogoListData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles, ItemStyleProperties } from '@/types/sections'
import EditableText from '../EditableText.vue'
import { resolveSectionStyles, getTextStyle } from '@/lib/section-styles'

const props = defineProps<{
  data: LogoListData
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

function getFieldStyle(fieldKey: string, defaultFont: string = '--font-body'): Record<string, string> {
  return getTextStyle(props.fieldStyles, fieldKey, defaultFont)
}

/**
 * Get styles for logo images
 * Applied directly to <img> element
 */
const logoStyle = computed<Record<string, string>>(() => {
  const styles = props.itemStyles
  const result: Record<string, string> = {}

  // Width (with auto height to maintain aspect ratio)
  if (styles?.width !== undefined) {
    result.width = `${styles.width}px`
    result.height = 'auto'
  } else {
    // Default width
    result.width = 'auto'
    result.height = '48px'
  }

  // Build filter string
  const filters: string[] = []
  if (styles?.blackAndWhite) {
    filters.push('grayscale(100%)')
  }
  if (filters.length > 0) {
    result.filter = filters.join(' ')
  }

  // Opacity
  if (styles?.opacity !== undefined) {
    result.opacity = String(styles.opacity)
  }

  return result
})

function handleSelectField(fieldKey: string) {
  emit('selectField', fieldKey)
}

function handleUpdate(fieldKey: string, value: unknown) {
  emit('update', fieldKey, value)
}

function handleItemClick(e: MouseEvent, index: number) {
  if (!props.editable) return
  e.preventDefault()
  e.stopPropagation()
  emit('selectField', `items.${index}`)
}
</script>

<template>
  <section
    class="bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-section)] px-[var(--spacing-container)]"
    :style="getSectionStyle()"
  >
    <div class="max-w-[600px] mx-auto w-full flex flex-col gap-[var(--spacing-lg)]">
      <!-- Content Header -->
      <div
        v-if="data.headline || data.subheadline || data.paragraph"
        class="text-center flex flex-col gap-[var(--spacing-sm)]"
      >
        <EditableText
          v-if="data.headline"
          tag="h2"
          :value="data.headline"
          field-key="headline"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          class="text-[length:var(--text-xl)] font-semibold leading-tight m-0"
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
      </div>

      <!-- Logos Stacked -->
      <div class="flex flex-col items-center gap-[var(--spacing-lg)]">
        <template v-for="(item, index) in data.items" :key="index">
          <component
            :is="item.link?.url && !editable ? 'a' : 'div'"
            :href="item.link?.url && !editable ? item.link.url : undefined"
            :class="[
              editable && 'cursor-pointer transition-all duration-150',
              editable && activeField !== `items.${index}` && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
              editable && activeField === `items.${index}` && 'outline outline-2 outline-primary outline-offset-2',
            ]"
            @click="handleItemClick($event, index)"
          >
            <img
              v-if="item.image?.src"
              :src="item.image.src"
              :alt="item.image.alt || ''"
              class="object-contain"
              :style="logoStyle"
            />
            <div
              v-else
              class="h-12 w-32 bg-[var(--color-secondary)] rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--color-muted)] text-[length:var(--text-xs)]"
            >
              Logo
            </div>
          </component>
        </template>
      </div>
    </div>
  </section>
</template>
