<script setup lang="ts">
/**
 * SUBSCRIBE STACKED VARIANT
 *
 * Centered single-column layout:
 * - Headline
 * - Paragraph (optional)
 * - Form (email input + submit button) as single selectable unit
 *
 * Form is selectable as a whole - button is NOT standalone.
 */

import type { SubscribeData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles } from '@/types/sections'
import EditableText from '../EditableText.vue'
import { resolveSectionStyles, getTextStyle } from '@/lib/section-styles'

const props = defineProps<{
  data: SubscribeData
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

function getSectionStyle(): Record<string, string> {
  return resolveSectionStyles(props.sectionStyles)
}

function getFieldStyle(fieldKey: string, defaultFont: string = '--font-body'): Record<string, string> {
  return getTextStyle(props.fieldStyles, fieldKey, defaultFont)
}

function handleSelectField(fieldKey: string) {
  emit('selectField', fieldKey)
}

function handleUpdate(fieldKey: string, value: unknown) {
  emit('update', fieldKey, value)
}

function handleSubmit(e: Event) {
  e.preventDefault()
  // No-op: backend integration to be added later
}

// Form click handler - selects the form as a single unit
function handleFormClick(e: MouseEvent) {
  if (!props.isEditing) return
  e.stopPropagation()
  emit('selectField', 'form')
}

// Check if form is selected
function isFormSelected(): boolean {
  return props.activeField === 'form' || props.activeField?.startsWith('form.') || false
}
</script>

<template>
  <section
    class="bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-section)] px-[var(--spacing-container)]"
    :style="getSectionStyle()"
  >
    <div class="max-w-[600px] mx-auto w-full text-center flex flex-col items-center gap-[var(--spacing-md)]">
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

      <!-- Email Form - selectable as single unit -->
      <form
        class="w-full mt-[var(--spacing-sm)] flex flex-col sm:flex-row gap-[var(--spacing-sm)] transition-all duration-150 rounded-[var(--btn-radius)]"
        :class="[
          isEditing && 'cursor-pointer',
          isEditing && !isFormSelected() && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
          isEditing && isFormSelected() && 'outline outline-2 outline-primary outline-offset-2',
        ]"
        @submit="handleSubmit"
        @click="handleFormClick"
      >
        <input
          type="email"
          :placeholder="data.form?.placeholder || 'Enter your email'"
          class="flex-1 py-[var(--btn-py)] px-[var(--spacing-md)] bg-[var(--color-surface)] text-[var(--color-fg)] text-[length:var(--text-base)] rounded-[var(--btn-radius)] border border-[var(--color-border)] outline-none transition-colors pointer-events-none"
          :style="{ fontFamily: 'var(--font-body)' }"
          readonly
        />
        <button
          type="submit"
          class="py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[length:var(--text-base)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] transition-opacity whitespace-nowrap pointer-events-none"
          :style="{ fontFamily: 'var(--font-body)' }"
        >{{ data.form?.submitLabel || 'Subscribe' }}</button>
      </form>
    </div>
  </section>
</template>
