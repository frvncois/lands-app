<script setup lang="ts">
/**
 * CONTACT STACKED VARIANT
 *
 * Displays headline + subheadline + paragraphs at the top.
 * Form fields + submit button in the middle.
 * Social links at the bottom.
 *
 * Simple vertical layout.
 * Mobile and desktop behave the same.
 */

import { computed } from 'vue'
import type { ContactData } from '@/lib/section-registry'
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
  resolveRepeaterGroupStyles,
  resolveSharedLinkContainerStyles,
  resolveSharedLinkTextStyles,
  resolveSharedFormInputStyles,
} from '@/lib/section-styles'

const props = defineProps<{
  data: ContactData
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

const formFieldsGroupStyles = computed(() => resolveRepeaterGroupStyles(props.sectionStyles, 'formFields'))
const formFieldsGapStyle = computed(() => (
  formFieldsGroupStyles.value.spaceBetween !== undefined
    ? { gap: `${formFieldsGroupStyles.value.spaceBetween}px` }
    : {}
))

const socialLinksGroupStyles = computed(() => resolveRepeaterGroupStyles(props.sectionStyles, 'socialLinks'))
const socialLinksGapStyle = computed(() => (
  socialLinksGroupStyles.value.spaceBetween !== undefined
    ? { gap: `${socialLinksGroupStyles.value.spaceBetween}px` }
    : {}
))

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

function getSocialLinkContainerStyle(): Record<string, string> {
  return resolveSharedLinkContainerStyles(props.sectionStyles)
}

function getSocialLinkLabelStyle(): Record<string, string> {
  return resolveSharedLinkTextStyles(props.sectionStyles, 'Label', '--font-body')
}

function getSocialLinkDescriptionStyle(): Record<string, string> {
  return resolveSharedLinkTextStyles(props.sectionStyles, 'Description', '--font-body')
}

function getLinkId(link: ContactData['socialLinks'][number], fallback: number): string | null {
  if (link?.id) return link.id
  return fallback.toString()
}

function isLinkActive(link: ContactData['socialLinks'][number], index: number): boolean {
  if (!props.editable) return false
  const linkId = getLinkId(link, index)
  if (!linkId) return false
  return (
    props.activeNodeType === 'item' &&
    props.activeFieldKey === 'socialLinks' &&
    props.activeItemId === linkId
  )
}

function handleSocialLinkClick(e: MouseEvent, link: ContactData['socialLinks'][number], index: number) {
  if (!props.editable) return
  e.preventDefault()
  e.stopPropagation()
  const linkId = getLinkId(link, index)
  if (!linkId) return
  emit('selectField', {
    type: 'item',
    fieldKey: 'socialLinks',
    itemId: linkId,
  })
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
    <div class="max-w-[600px] mx-auto w-full">
      <!-- Section Header -->
      <div
        v-if="data.headline || data.subheadline"
        class="text-center mb-[var(--spacing-xl)]"
      >
        <EditableText
          v-if="data.headline"
          tag="h2"
          :value="data.headline"
          field-key="headline"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          class="text-[length:var(--text-3xl)] font-bold leading-tight m-0 mb-[var(--spacing-sm)]"
          :style="getHeaderFieldStyle('headline', '--font-heading')"
          @select-field="handleSelectField"
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
          :style="getHeaderFieldStyle('subheadline', '--font-body')"
          @select-field="handleSelectField"
          @update="handleUpdate"
        />
      </div>

      <!-- Paragraph Block (Email, Phone, Address) -->
      <div
        v-if="data.paragraphs && data.paragraphs.length === 3"
        class="flex flex-col gap-[var(--spacing-sm)] mb-[var(--spacing-xl)] text-center"
      >
        <EditableText
          v-for="(paragraph, index) in data.paragraphs"
          :key="`paragraph-${index}`"
          tag="p"
          :value="paragraph"
          :field-key="`paragraphs.${index}`"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          class="text-[length:var(--text-base)] m-0"
          :style="getHeaderFieldStyle(`paragraphs.${index}`, '--font-body')"
          @select-field="handleSelectField"
          @update="handleUpdate"
        />
      </div>

      <!-- Form -->
      <form
        class="flex flex-col mb-[var(--spacing-xl)]"
        :style="formFieldsGapStyle"
        @submit.prevent
      >
        <template
          v-for="(field, index) in data.formFields"
          :key="field.id || index"
        >
          <!-- Text Input -->
          <input
            v-if="field.type === 'text'"
            type="text"
            :placeholder="field.label"
            class="w-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            :style="getFormInputStyle()"
          />

          <!-- Email Input -->
          <input
            v-else-if="field.type === 'email'"
            type="email"
            :placeholder="field.label"
            class="w-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            :style="getFormInputStyle()"
          />

          <!-- Phone Input -->
          <input
            v-else-if="field.type === 'phone'"
            type="tel"
            :placeholder="field.label"
            class="w-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            :style="getFormInputStyle()"
          />

          <!-- DateTime Picker -->
          <input
            v-else-if="field.type === 'datetime'"
            type="datetime-local"
            :placeholder="field.label"
            class="w-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            :style="getFormInputStyle()"
          />

          <!-- Select Dropdown -->
          <select
            v-else-if="field.type === 'select'"
            class="w-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            :style="getFormInputStyle()"
          >
            <option
              value=""
              disabled
              selected
            >
              {{ field.label }}
            </option>
            <option
              v-for="(option, optIndex) in field.options"
              :key="optIndex"
              :value="option"
            >
              {{ option }}
            </option>
          </select>

          <!-- Checkbox Select -->
          <div
            v-else-if="field.type === 'checkbox'"
            class="flex flex-col gap-[var(--spacing-xs)]"
          >
            <label
              v-for="(option, optIndex) in field.options"
              :key="optIndex"
              class="flex items-center gap-[var(--spacing-sm)] text-[length:var(--text-base)]"
            >
              <input
                type="checkbox"
                :value="option"
                class="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <span>{{ option }}</span>
            </label>
          </div>

          <!-- Radio Input -->
          <div
            v-else-if="field.type === 'radio'"
            class="flex flex-col gap-[var(--spacing-xs)]"
          >
            <label
              v-for="(option, optIndex) in field.options"
              :key="optIndex"
              class="flex items-center gap-[var(--spacing-sm)] text-[length:var(--text-base)]"
            >
              <input
                type="radio"
                :name="`radio-${index}`"
                :value="option"
                class="w-4 h-4 border-[var(--color-border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <span>{{ option }}</span>
            </label>
          </div>

          <!-- Textarea -->
          <textarea
            v-else-if="field.type === 'textarea'"
            :placeholder="field.label"
            rows="4"
            class="w-full resize-y focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            :style="getFormInputStyle()"
          />
        </template>

        <!-- Submit Button (Fixed, Cannot be deleted) -->
        <a
          v-if="data.submitButton?.label && !isFieldHidden('submitButton')"
          :href="editable ? '#' : (data.submitButton.url || '#')"
          class="inline-flex items-center justify-center py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[length:var(--text-base)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:opacity-90 transition-opacity"
          :class="[
            editable && 'cursor-pointer transition-all duration-150',
            editable && activeField === 'submitButton' && 'outline outline-2 outline-primary -outline-offset-2',
          ]"
          :style="getSubmitButtonStyle()"
          @click="handleButtonClick($event, 'submitButton')"
        >{{ data.submitButton.label }}</a>
      </form>

      <!-- Social Links -->
      <div
        v-if="data.socialLinks && data.socialLinks.length > 0"
        class="flex flex-col gap-[var(--spacing-sm)]"
        :style="socialLinksGapStyle"
      >
        <a
          v-for="(link, index) in data.socialLinks"
          :key="link.id || index"
          :href="editable ? '#' : (link.url || '#')"
          class="flex items-center gap-[var(--spacing-md)] p-[var(--spacing-md)] bg-[var(--color-surface)] rounded-[var(--radius-md)] hover:bg-[var(--color-secondary)] transition-colors group"
          :class="[
            editable && 'cursor-pointer transition-all duration-150 select-none',
            editable && !isLinkActive(link, index) && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-2',
            editable && isLinkActive(link, index) && 'outline outline-2 outline-primary -outline-offset-2',
          ]"
          :style="getSocialLinkContainerStyle()"
          @click="handleSocialLinkClick($event, link, index)"
        >
          <img
            v-if="link.image?.src"
            :src="link.image.src"
            :alt="link.image.alt || ''"
            :class="[
              'w-10 h-10 rounded-[var(--radius-sm)] object-cover flex-shrink-0',
              editable && 'pointer-events-none select-none',
            ]"
          />
          <div
            class="flex flex-col gap-[var(--spacing-xs)] min-w-0 flex-1"
            :class="editable && 'pointer-events-none select-none'"
          >
            <span
              class="text-[length:var(--text-base)] font-medium"
              :class="editable && 'pointer-events-none select-none'"
              :style="getSocialLinkLabelStyle()"
            >{{ link.label }}</span>
            <span
              v-if="link.description"
              class="text-[length:var(--text-sm)] text-[var(--color-muted)]"
              :class="editable && 'pointer-events-none select-none'"
              :style="getSocialLinkDescriptionStyle()"
            >{{ link.description }}</span>
          </div>
          <i
            class="lni lni-arrow-right text-[var(--color-muted)] group-hover:text-[var(--color-fg)] transition-colors flex-shrink-0 ml-[var(--spacing-md)]"
            :class="editable && 'pointer-events-none select-none'"
          />
        </a>
      </div>
    </div>
  </section>
</template>
