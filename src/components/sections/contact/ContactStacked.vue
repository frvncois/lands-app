<script setup lang="ts">
/**
 * CONTACT STACKED VARIANT
 *
 * Single-column layout:
 * - Headline + paragraph at top (centered)
 * - Contact info + socials below (centered)
 * - Form at the bottom (if present)
 *
 * Same on all breakpoints.
 * NO submission logic - form does nothing.
 *
 * Selectable elements:
 * - Email, Phone, Address (individual text fields)
 * - Social links (repeater items)
 * - Form (as a node - selects form.fields)
 * - Form fields (repeater items)
 */

import type { ContactData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles, ItemStyleProperties } from '@/types/sections'
import EditableText from '../EditableText.vue'
import { resolveSectionStyles, getTextStyle } from '@/lib/section-styles'

const props = defineProps<{
  data: ContactData
  sectionStyles?: SectionStyleProperties
  fieldStyles?: FieldStyles
  itemStyles?: ItemStyleProperties
  isEditing?: boolean
  editable?: boolean
  activeField?: string | null
  activeItemIndex?: number | null
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
 * Get shared styles for social link items
 */
function getItemContainerStyle(): Record<string, string> {
  const styles = props.itemStyles
  if (!styles) return {}

  const result: Record<string, string> = {}
  if (styles.fontSize) result.fontSize = `${styles.fontSize}px`
  if (styles.backgroundColor) result.backgroundColor = styles.backgroundColor
  if (styles.borderRadius !== undefined) result.borderRadius = `${styles.borderRadius}px`
  return result
}

/**
 * Get form input styles
 */
function getFormInputStyle(): Record<string, string> {
  const styles = props.sectionStyles?.formInput as Record<string, unknown> | undefined
  if (!styles) return { fontFamily: 'var(--font-body)' }

  const result: Record<string, string> = { fontFamily: 'var(--font-body)' }
  if (styles.backgroundColor) result.backgroundColor = String(styles.backgroundColor)
  if (styles.color) result.color = String(styles.color)
  if (styles.borderColor) result.borderColor = String(styles.borderColor)
  if (styles.borderRadius !== undefined) result.borderRadius = `${styles.borderRadius}px`
  if (styles.fontSize) result.fontSize = `${styles.fontSize}px`
  if (styles.padding !== undefined) result.padding = `${styles.padding}px`
  return result
}

/**
 * Get form button styles
 */
function getFormButtonStyle(): Record<string, string> {
  const styles = props.sectionStyles?.formButton as Record<string, unknown> | undefined
  if (!styles) return { fontFamily: 'var(--font-body)' }

  const result: Record<string, string> = { fontFamily: 'var(--font-body)' }
  if (styles.backgroundColor) result.backgroundColor = String(styles.backgroundColor)
  if (styles.color) result.color = String(styles.color)
  if (styles.borderRadius !== undefined) result.borderRadius = `${styles.borderRadius}px`
  return result
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

// Contact info click handlers
function handlePhoneClick(e: MouseEvent) {
  if (!props.isEditing) return
  e.preventDefault()
  e.stopPropagation()
  emit('selectField', 'contactInfo.phone')
}

function handleEmailClick(e: MouseEvent) {
  if (!props.isEditing) return
  e.preventDefault()
  e.stopPropagation()
  emit('selectField', 'contactInfo.email')
}

function handleAddressClick(e: MouseEvent) {
  if (!props.isEditing) return
  e.preventDefault()
  e.stopPropagation()
  emit('selectField', 'contactInfo.address')
}

// Social link click handler
function handleSocialClick(e: MouseEvent, index: number) {
  if (!props.isEditing) return
  e.preventDefault()
  e.stopPropagation()
  emit('selectField', `socials.${index}`)
}

// Form click handler (selects the form as a whole)
function handleFormClick(e: MouseEvent) {
  if (!props.isEditing) return
  // Only trigger if clicking on form background, not on fields
  if ((e.target as HTMLElement).closest('input, textarea, button')) return
  e.stopPropagation()
  emit('selectField', 'form.fields')
}

// Form field click handler
function handleFieldClick(e: MouseEvent, index: number) {
  if (!props.isEditing) return
  e.preventDefault()
  e.stopPropagation()
  emit('selectField', `form.fields.${index}`)
}

// Form button click handler (selects form, not standalone button)
function handleFormButtonClick(e: MouseEvent) {
  if (!props.isEditing) return
  e.preventDefault()
  e.stopPropagation()
  // Selecting form.submitLabel opens form inspector
  emit('selectField', 'form.submitLabel')
}

const hasContactInfo = () => {
  const info = props.data.contactInfo
  return info?.phone || info?.email || info?.address
}

// Check if a specific contact field is selected
function isContactFieldSelected(fieldKey: string): boolean {
  return props.activeField === fieldKey
}

// Check if a specific social is selected
function isSocialSelected(index: number): boolean {
  return props.activeField === 'socials' && props.activeItemIndex === index
}

// Check if form is selected (any form-related field)
function isFormSelected(): boolean {
  return props.activeField === 'form.fields' || props.activeField === 'form.submitLabel'
}

// Check if a specific form field is selected
function isFormFieldSelected(index: number): boolean {
  return props.activeField === 'form.fields' && props.activeItemIndex === index
}
</script>

<template>
  <section
    class="bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-section)] px-[var(--spacing-container)]"
    :style="getSectionStyle()"
  >
    <div class="max-w-[800px] mx-auto w-full flex flex-col gap-[var(--spacing-xl)]">
      <!-- Header -->
      <div class="text-center">
        <EditableText
          tag="h2"
          :value="data.headline"
          field-key="headline"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          class="text-[length:var(--text-3xl)] font-bold leading-tight m-0 mb-[var(--spacing-md)]"
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
          class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0 max-w-[600px] mx-auto"
          :style="getFieldStyle('paragraph', '--font-body')"
          @selectField="handleSelectField"
          @update="handleUpdate"
        />
      </div>

      <!-- Contact Info + Socials -->
      <div v-if="hasContactInfo() || data.socials?.length" class="flex flex-col items-center gap-[var(--spacing-md)]">
        <!-- Contact Info - each item selectable -->
        <div v-if="hasContactInfo()" class="flex flex-wrap justify-center gap-[var(--spacing-lg)] text-[length:var(--text-base)]">
          <div
            v-if="data.contactInfo?.phone"
            class="flex items-center gap-[var(--spacing-xs)] transition-all duration-150"
            :class="[
              isEditing && 'cursor-pointer',
              isEditing && !isContactFieldSelected('contactInfo.phone') && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2 rounded',
              isEditing && isContactFieldSelected('contactInfo.phone') && 'outline outline-2 outline-primary outline-offset-2 rounded',
            ]"
            @click="handlePhoneClick"
          >
            <i class="lni lni-phone text-[var(--color-muted)]" />
            <span>{{ data.contactInfo.phone }}</span>
          </div>
          <div
            v-if="data.contactInfo?.email"
            class="flex items-center gap-[var(--spacing-xs)] transition-all duration-150"
            :class="[
              isEditing && 'cursor-pointer',
              isEditing && !isContactFieldSelected('contactInfo.email') && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2 rounded',
              isEditing && isContactFieldSelected('contactInfo.email') && 'outline outline-2 outline-primary outline-offset-2 rounded',
            ]"
            @click="handleEmailClick"
          >
            <i class="lni lni-envelope text-[var(--color-muted)]" />
            <span>{{ data.contactInfo.email }}</span>
          </div>
          <div
            v-if="data.contactInfo?.address"
            class="flex items-center gap-[var(--spacing-xs)] transition-all duration-150"
            :class="[
              isEditing && 'cursor-pointer',
              isEditing && !isContactFieldSelected('contactInfo.address') && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2 rounded',
              isEditing && isContactFieldSelected('contactInfo.address') && 'outline outline-2 outline-primary outline-offset-2 rounded',
            ]"
            @click="handleAddressClick"
          >
            <i class="lni lni-map-marker text-[var(--color-muted)]" />
            <span>{{ data.contactInfo.address }}</span>
          </div>
        </div>

        <!-- Socials - each item selectable, always open in new tab -->
        <div v-if="data.socials?.length" class="flex flex-wrap justify-center gap-[var(--spacing-sm)]">
          <a
            v-for="(social, index) in data.socials"
            :key="index"
            :href="editable ? '#' : (social.url || '#')"
            target="_blank"
            rel="noopener noreferrer"
            class="px-[var(--spacing-md)] py-[var(--spacing-xs)] bg-[var(--color-surface)] text-[var(--color-fg)] text-[length:var(--text-sm)] rounded-[var(--radius-md)] hover:bg-[var(--color-secondary)] transition-all duration-150"
            :class="[
              isEditing && 'cursor-pointer',
              isEditing && !isSocialSelected(index) && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
              isEditing && isSocialSelected(index) && 'outline outline-2 outline-primary outline-offset-2',
            ]"
            :style="getItemContainerStyle()"
            @click="handleSocialClick($event, index)"
          >{{ social.label }}</a>
        </div>
      </div>

      <!-- Form - form is selectable as a node -->
      <form
        v-if="data.form?.fields?.length || isEditing"
        class="flex flex-col gap-[var(--spacing-md)] max-w-[500px] mx-auto w-full transition-all duration-150"
        :class="[
          isEditing && 'cursor-pointer',
          isEditing && !isFormSelected() && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2 rounded-[var(--radius-lg)]',
          isEditing && isFormSelected() && 'outline outline-2 outline-primary outline-offset-2 rounded-[var(--radius-lg)]',
        ]"
        @submit="handleSubmit"
        @click="handleFormClick"
      >
        <!-- Form fields - each selectable -->
        <template v-for="(field, index) in data.form?.fields" :key="index">
          <div
            class="transition-all duration-150"
            :class="[
              isEditing && 'cursor-pointer',
              isEditing && !isFormFieldSelected(index) && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-1 rounded-[var(--btn-radius)]',
              isEditing && isFormFieldSelected(index) && 'outline outline-2 outline-primary -outline-offset-1 rounded-[var(--btn-radius)]',
            ]"
            @click="handleFieldClick($event, index)"
          >
            <input
              v-if="field.type === 'text' || field.type === 'email'"
              :type="field.type"
              :name="field.name"
              :placeholder="field.placeholder || field.name"
              class="w-full py-[var(--btn-py)] px-[var(--spacing-md)] bg-[var(--color-surface)] text-[var(--color-fg)] text-[length:var(--text-base)] rounded-[var(--btn-radius)] border border-[var(--color-border)] outline-none focus:border-[var(--color-primary)] transition-colors pointer-events-none"
              :style="getFormInputStyle()"
              readonly
            />
            <textarea
              v-else-if="field.type === 'textarea'"
              :name="field.name"
              :placeholder="field.placeholder || field.name"
              rows="4"
              class="w-full py-[var(--btn-py)] px-[var(--spacing-md)] bg-[var(--color-surface)] text-[var(--color-fg)] text-[length:var(--text-base)] rounded-[var(--btn-radius)] border border-[var(--color-border)] outline-none focus:border-[var(--color-primary)] transition-colors resize-none pointer-events-none"
              :style="getFormInputStyle()"
              readonly
            />
          </div>
        </template>

        <!-- Submit button - selects form.submitLabel -->
        <button
          type="submit"
          class="w-full py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[length:var(--text-base)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:opacity-90 transition-all duration-150"
          :class="[
            isEditing && 'cursor-pointer',
            isEditing && activeField !== 'form.submitLabel' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
            isEditing && activeField === 'form.submitLabel' && 'outline outline-2 outline-primary outline-offset-2',
          ]"
          :style="getFormButtonStyle()"
          @click="handleFormButtonClick"
        >{{ data.form?.submitLabel || 'Send Message' }}</button>
      </form>
    </div>
  </section>
</template>
