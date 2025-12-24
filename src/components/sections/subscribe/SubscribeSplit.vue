<script setup lang="ts">
/**
 * SUBSCRIBE SPLIT VARIANT
 *
 * Two-column layout (desktop):
 *
 * Style options (from sectionStyles):
 * - splitLayout: 'content-form' | 'form-content'
 *
 * content-form: Content | Form
 * form-content: Form | Content
 *
 * Mobile stacks vertically (content first).
 *
 * Form is selectable as a whole - button is NOT standalone.
 */

import { computed } from 'vue'
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

// Style options from sectionStyles
const splitLayout = computed(() => {
  const styles = props.sectionStyles as Record<string, unknown> | undefined
  return (styles?.splitLayout as string) || 'content-form'
})

// Column order based on splitLayout
const contentOrder = computed(() => {
  return splitLayout.value === 'form-content' ? 'md:order-2' : 'md:order-1'
})

const formOrder = computed(() => {
  return splitLayout.value === 'form-content' ? 'md:order-1' : 'md:order-2'
})

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
    <div class="max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-xl)] items-center">
      <!-- Content Column -->
      <div
        class="flex flex-col gap-[var(--spacing-md)] order-1"
        :class="contentOrder"
      >
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
          class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0 prose prose-sm"
          :style="getFieldStyle('paragraph', '--font-body')"
          @selectField="handleSelectField"
          @update="handleUpdate"
        />
      </div>

      <!-- Form Column - selectable as single unit -->
      <div
        class="order-2"
        :class="formOrder"
      >
        <form
          class="flex flex-col gap-[var(--spacing-sm)] transition-all duration-150 rounded-[var(--radius-lg)]"
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
            class="w-full py-[var(--btn-py)] px-[var(--spacing-md)] bg-[var(--color-surface)] text-[var(--color-fg)] text-[length:var(--text-base)] rounded-[var(--btn-radius)] border border-[var(--color-border)] outline-none transition-colors pointer-events-none"
            :style="{ fontFamily: 'var(--font-body)' }"
            readonly
          />
          <button
            type="submit"
            class="w-full py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[length:var(--text-base)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] transition-opacity pointer-events-none"
            :style="{ fontFamily: 'var(--font-body)' }"
          >{{ data.form?.submitLabel || 'Subscribe' }}</button>
        </form>
      </div>
    </div>
  </section>
</template>
