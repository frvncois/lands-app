<script setup lang="ts">
/**
 * HEADER SECTION (Global)
 *
 * Variants (EXACTLY 2):
 * - default: Logo + title left, link right
 * - centered: Everything centered
 *
 * Style options:
 * - sticky: boolean (default true) - makes header sticky
 * - spaceBetween: gap between logo and title (pixels)
 */

import type { HeaderData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles } from '@/types/sections'
import EditableText from './EditableText.vue'
import { resolveSectionStyles, getTextStyle, getButtonStyle as getButtonStyleUtil, getImageStyle } from '@/lib/section-styles'

const props = defineProps<{
  data: HeaderData
  variant: string
  sectionStyles?: SectionStyleProperties
  fieldStyles?: FieldStyles
  isEditing?: boolean
  editable?: boolean
  activeField?: string | null
  hiddenFields?: string[]
}>()

const emit = defineEmits<{
  selectField: [fieldKey: string]
  'update': [fieldKey: string, value: unknown]
}>()

function getHeaderStyle(): Record<string, string> {
  const space = props.sectionStyles?.spaceBetween ?? 8
  return {
    ...resolveSectionStyles(props.sectionStyles),
    '--header-gap': `${space}px`,
  }
}

function getLogoStyle(): Record<string, string> {
  return getImageStyle(props.fieldStyles, 'logo.src')
}

function getTitleStyle(): Record<string, string> {
  return getTextStyle(props.fieldStyles, 'title', '--font-heading')
}

function getLinkStyle(): Record<string, string> {
  return getButtonStyleUtil(props.fieldStyles, 'link')
}

function handleSelectField(fieldKey: string) {
  emit('selectField', fieldKey)
}

function handleUpdate(fieldKey: string, value: unknown) {
  emit('update', fieldKey, value)
}

function handleLogoClick(e: MouseEvent) {
  if (!props.editable) return
  e.preventDefault()
  e.stopPropagation()
  emit('selectField', 'logo.src')
}

function handleLinkClick(e: MouseEvent) {
  if (!props.editable) return
  e.preventDefault()
  e.stopPropagation()
  emit('selectField', 'link')
}
</script>

<template>
  <header
    class="bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-md)] px-[var(--spacing-container)]"
    :style="getHeaderStyle()"
  >
    <!-- Default variant: Logo + title left, subtitle center, link right -->
    <div
      v-if="variant === 'default'"
      class="max-w-[1200px] mx-auto w-full flex items-center justify-between gap-[var(--spacing-md)]"
    >
      <!-- Logo + Title -->
      <div class="flex items-center gap-[var(--header-gap)]">
        <!-- Logo (with placeholder in edit mode - persists even when unselected) -->
        <div
          v-if="(data.logo?.src || isEditing) && !hiddenFields?.includes('logo.src')"
          :class="[
            editable && 'cursor-pointer transition-all duration-150',
            editable && activeField !== 'logo.src' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
            editable && activeField === 'logo.src' && 'outline outline-2 outline-primary outline-offset-2',
          ]"
          @click="handleLogoClick"
        >
          <img
            v-if="data.logo?.src"
            :src="data.logo.src"
            :alt="data.logo.alt || ''"
            class="max-h-10 w-auto object-contain"
            :style="getLogoStyle()"
          />
          <div
            v-else
            class="h-10 w-24 bg-[var(--color-secondary)] rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--color-muted)] text-[length:var(--text-xs)]"
          >
            Logo
          </div>
        </div>
        <EditableText
          v-if="data.title"
          tag="span"
          :value="data.title"
          field-key="title"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          class="font-semibold text-[length:var(--text-lg)]"
          :style="getTitleStyle()"
          @selectField="handleSelectField"
          @update="handleUpdate"
        />
      </div>

      <!-- Link -->
      <a
        v-if="data.link?.label && !hiddenFields?.includes('link')"
        :href="editable ? '#' : (data.link.url || '#')"
        class="inline-flex items-center justify-center py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[length:var(--text-sm)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:opacity-90 transition-opacity"
        :class="[
          editable && 'cursor-pointer',
          editable && activeField !== 'link' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
          editable && activeField === 'link' && 'outline outline-2 outline-primary outline-offset-2',
        ]"
        :style="getLinkStyle()"
        @click="handleLinkClick"
      >{{ data.link.label }}</a>
    </div>

    <!-- Centered variant: Everything centered -->
    <div
      v-else
      class="max-w-[1200px] mx-auto w-full flex flex-col items-center gap-[var(--spacing-sm)]"
    >
      <!-- Logo + Title -->
      <div class="flex flex-row items-center gap-[var(--header-gap)]">
        <!-- Logo (with placeholder in edit mode - persists even when unselected) -->
        <div
          v-if="(data.logo?.src || isEditing) && !hiddenFields?.includes('logo.src')"
          :class="[
            editable && 'cursor-pointer transition-all duration-150',
            editable && activeField !== 'logo.src' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
            editable && activeField === 'logo.src' && 'outline outline-2 outline-primary outline-offset-2',
          ]"
          @click="handleLogoClick"
        >
          <img
            v-if="data.logo?.src"
            :src="data.logo.src"
            :alt="data.logo.alt || ''"
            class="max-h-10 w-auto object-contain"
            :style="getLogoStyle()"
          />
          <div
            v-else
            class="h-10 w-24 bg-[var(--color-secondary)] rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--color-muted)] text-[length:var(--text-xs)]"
          >
            Logo
          </div>
        </div>

        <!-- Title -->
        <EditableText
          v-if="data.title"
          tag="span"
          :value="data.title"
          field-key="title"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          class="font-semibold text-[length:var(--text-lg)] text-center"
          :style="getTitleStyle()"
          @selectField="handleSelectField"
          @update="handleUpdate"
        />
      </div>
    </div>
  </header>
</template>
