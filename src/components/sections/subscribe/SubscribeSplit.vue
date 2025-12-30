<script setup lang="ts">
/**
 * SUBSCRIBE SPLIT VARIANT
 *
 * Two-column layout (desktop):
 *
 * Style options (from sectionStyles):
 * - splitLayout: 'title-content' | 'content-title'
 *
 * title-content: Headline/Subheadline/Paragraph | Form
 * content-title: Form | Headline/Subheadline/Paragraph
 *
 * Mobile stacks vertically (title first).
 */

import { computed } from 'vue'
import type { SubscribeData } from '@/lib/section-registry'
import type {
  SectionStyleProperties,
  FieldStyles,
  ItemStyleProperties,
  SelectionPayload,
  ActiveNodeType,
} from '@/types/sections'
import EditableText from '../EditableText.vue'
import {
  resolveSectionStyles,
  getTextStyle,
  getButtonStyle,
  resolveSharedFormInputStyles,
} from '@/lib/section-styles'

const props = defineProps<{
  data: SubscribeData
  sectionStyles?: SectionStyleProperties
  fieldStyles?: FieldStyles
  itemStyles?: ItemStyleProperties
  editable?: boolean
  activeField?: string | null
  activeNodeId?: string | null
  activeNodeType?: ActiveNodeType | null
  activeFieldKey?: string | null
  activeItemId?: string | null
  hiddenFields?: string[]
}>()

const emit = defineEmits<{
  selectField: [payload: SelectionPayload | string]
  'update': [fieldKey: string, value: unknown]
}>()

// Style options from sectionStyles
const splitLayout = computed(() => {
  const styles = props.sectionStyles as Record<string, unknown> | undefined
  return (styles?.splitLayout as string) || 'title-content'
})

// Column order based on splitLayout
const titleOrder = computed(() => {
  return splitLayout.value === 'content-title' ? 'md:order-2' : 'md:order-1'
})

const contentOrder = computed(() => {
  return splitLayout.value === 'content-title' ? 'md:order-1' : 'md:order-2'
})

function getSectionStyle(): Record<string, string> {
  return resolveSectionStyles(props.sectionStyles)
}

function getFormInputStyle(): Record<string, string> {
  return resolveSharedFormInputStyles(props.sectionStyles)
}

function getHeaderFieldStyle(fieldKey: string, defaultFont: string = '--font-body'): Record<string, string> {
  return getTextStyle(props.fieldStyles, fieldKey, defaultFont)
}

function getSubmitButtonStyle(): Record<string, string> {
  return getButtonStyle(props.fieldStyles, 'submitButton')
}

function handleSelectField(fieldKey: string) {
  emit('selectField', fieldKey)
}

function handleUpdate(fieldKey: string, value: unknown) {
  emit('update', fieldKey, value)
}

function handleButtonClick(e: MouseEvent, fieldKey: string) {
  if (!props.editable) return
  e.preventDefault()
  e.stopPropagation()
  emit('selectField', fieldKey)
}

function isFieldHidden(fieldKey: string): boolean {
  return props.hiddenFields?.includes(fieldKey) ?? false
}
</script>

<template>
  <section
    class="bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-section)] px-[var(--spacing-container)]"
    :style="getSectionStyle()"
  >
    <div class="max-w-7xl mx-auto w-full">
      <div class="grid md:grid-cols-2 gap-[var(--spacing-2xl)] items-center">
        <!-- Title Column -->
        <div :class="titleOrder">
          <div class="space-y-[var(--spacing-md)]">
            <!-- Headline -->
            <EditableText
              v-if="data.headline"
              tag="h2"
              :value="data.headline"
              field-key="headline"
              :editable="editable"
              :active-field="activeField"
              :hidden-fields="hiddenFields"
              class="text-[length:var(--text-3xl)] font-bold leading-tight m-0"
              :style="getHeaderFieldStyle('headline', '--font-heading')"
              @selectField="handleSelectField"
              @update="handleUpdate"
            />

            <!-- Subheadline -->
            <EditableText
              v-if="data.subheadline"
              tag="p"
              :value="data.subheadline"
              field-key="subheadline"
              :editable="editable"
              :active-field="activeField"
              :hidden-fields="hiddenFields"
              class="text-[length:var(--text-lg)] text-[var(--color-muted)] m-0"
              :style="getHeaderFieldStyle('subheadline', '--font-body')"
              @selectField="handleSelectField"
              @update="handleUpdate"
            />

            <!-- Paragraph -->
            <EditableText
              v-if="data.paragraph && !isFieldHidden('paragraph')"
              tag="p"
              :value="data.paragraph"
              field-key="paragraph"
              :editable="editable"
              :active-field="activeField"
              :hidden-fields="hiddenFields"
              class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0"
              :style="getHeaderFieldStyle('paragraph', '--font-body')"
              @selectField="handleSelectField"
              @update="handleUpdate"
            />
          </div>
        </div>

        <!-- Form Column -->
        <div :class="contentOrder">
          <form
            class="flex flex-col sm:flex-row gap-[var(--spacing-sm)] items-stretch"
            @submit.prevent
          >
            <!-- Email Input -->
            <input
              type="email"
              :placeholder="data.emailPlaceholder || 'Enter your email'"
              class="flex-1 px-[var(--spacing-md)] py-[var(--spacing-sm)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-fg)] text-[length:var(--text-base)] font-[var(--font-body)] outline-none focus:border-[var(--color-primary)] transition-colors"
              :style="getFormInputStyle()"
              :disabled="!editable"
            >

            <!-- Submit Button -->
            <a
              v-if="data.submitButton && !isFieldHidden('submitButton')"
              :href="editable ? undefined : data.submitButton.url"
              class="inline-flex items-center justify-center px-[var(--spacing-lg)] py-[var(--spacing-sm)] rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[length:var(--text-base)] font-medium font-[var(--font-body)] no-underline whitespace-nowrap transition-colors hover:opacity-90 cursor-pointer"
              :class="{ 'pointer-events-none': editable }"
              :style="getSubmitButtonStyle()"
              @click="handleButtonClick($event, 'submitButton')"
            >
              {{ data.submitButton.label || 'Subscribe' }}
            </a>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
