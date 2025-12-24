<script setup lang="ts">
/**
 * CONTACT SPLIT VARIANT
 *
 * Two-column layout (desktop):
 * - Left: headline + paragraph + contact info + socials
 * - Right: form
 *
 * Mobile:
 * - Everything stacked vertically
 * - Content first, form last
 *
 * Column order is FIXED.
 * NO submission logic - form does nothing.
 *
 * Selectable elements:
 * - Email, Phone, Address (individual text fields)
 * - Social links (repeater items)
 * - Form (as a node - selects form.fields)
 * - Form fields (repeater items)
 */

import type { ContactData } from '@/lib/section-registry'
import type {
  SectionStyleProperties,
  FieldStyles,
  ItemStyleProperties,
  SelectionPayload,
} from '@/types/sections'
import EditableText from '../EditableText.vue'
import {
  resolveSectionStyles,
  getTextStyle,
  resolveItemContainerStyles,
  resolveItemTypographyStyles,
} from '@/lib/section-styles'
import { resolveFormInputStyle, resolveFormButtonStyle } from '@/lib/form-styles'

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
  selectField: [payload: SelectionPayload | string]
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
function getSocialItemStyle(): Record<string, string> {
  return resolveItemContainerStyles(props.itemStyles)
}

function getSocialTypographyStyle(): Record<string, string> {
  return resolveItemTypographyStyles(props.itemStyles)
}

function getFormInputStyle(): Record<string, string> {
  return resolveFormInputStyle(props.sectionStyles)
}

function getFormButtonStyle(): Record<string, string> {
  return resolveFormButtonStyle(props.sectionStyles)
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

function handleFormSelect(e?: Event) {
  if (!props.isEditing) return
  e?.preventDefault()
  e?.stopPropagation()
  emit('selectField', { type: 'form' })
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
  return props.activeField?.startsWith('form') ?? false
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
    <div class="max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-2xl)] items-start">
      <!-- Content Column -->
      <div class="flex flex-col gap-[var(--spacing-lg)]">
        <div>
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
            class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0 prose prose-sm"
            :style="getFieldStyle('paragraph', '--font-body')"
            @selectField="handleSelectField"
            @update="handleUpdate"
          />
        </div>

        <!-- Contact Info - each item selectable -->
        <div v-if="hasContactInfo()" class="flex flex-col gap-[var(--spacing-sm)] text-[length:var(--text-base)]">
          <div
            v-if="data.contactInfo?.phone"
            class="flex items-center gap-[var(--spacing-sm)] transition-all duration-150"
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
            class="flex items-center gap-[var(--spacing-sm)] transition-all duration-150"
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
            class="flex items-center gap-[var(--spacing-sm)] transition-all duration-150"
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
        <div v-if="data.socials?.length" class="flex flex-wrap gap-[var(--spacing-sm)]">
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
            :style="[getSocialItemStyle(), getSocialTypographyStyle()]"
            @click="handleSocialClick($event, index)"
          >{{ social.label }}</a>
        </div>
      </div>

      <!-- Form Column - form is selectable as a node -->
      <form
        v-if="data.form?.fields?.length || isEditing"
        class="flex flex-col gap-[var(--spacing-md)] bg-[var(--color-surface)] p-[var(--spacing-lg)] rounded-[var(--radius-lg)] transition-all duration-150"
        :class="[
          isEditing && 'cursor-pointer',
          isEditing && !isFormSelected() && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
          isEditing && isFormSelected() && 'outline outline-2 outline-primary outline-offset-2',
        ]"
        @submit="handleSubmit"
        @click="handleFormSelect"
      >
        <template v-for="(field, index) in data.form?.fields" :key="field.id || index">
          <div
            class="transition-all duration-150"
            :class="[
              isEditing && 'cursor-pointer',
              isEditing && !isFormFieldSelected(index) && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-1 rounded-[var(--btn-radius)]',
              isEditing && isFormFieldSelected(index) && 'outline outline-2 outline-primary -outline-offset-1 rounded-[var(--btn-radius)]',
            ]"
          >
            <input
              v-if="field.type === 'text' || field.type === 'email'"
              :type="field.type"
              :name="field.name"
              :placeholder="field.placeholder || field.name"
              class="w-full py-[var(--btn-py)] px-[var(--spacing-md)] bg-[var(--color-bg)] text-[var(--color-fg)] text-[length:var(--text-base)] rounded-[var(--btn-radius)] border border-[var(--color-border)] outline-none transition-colors"
              :class="isEditing && 'cursor-pointer'"
              :style="getFormInputStyle()"
              readonly
              @click.stop="handleFormSelect"
            />
            <textarea
              v-else-if="field.type === 'textarea'"
              :name="field.name"
              :placeholder="field.placeholder || field.name"
              rows="4"
              class="w-full py-[var(--btn-py)] px-[var(--spacing-md)] bg-[var(--color-bg)] text-[var(--color-fg)] text-[length:var(--text-base)] rounded-[var(--btn-radius)] border border-[var(--color-border)] outline-none transition-colors resize-none"
              :class="isEditing && 'cursor-pointer'"
              :style="getFormInputStyle()"
              readonly
              @click.stop="handleFormSelect"
            />
          </div>
        </template>

        <button
          type="submit"
          class="w-full py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[length:var(--text-base)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:opacity-90 transition-all duration-150"
          :class="isEditing && 'cursor-pointer'"
          :style="getFormButtonStyle()"
          @click.stop="handleFormSelect"
        >{{ data.form?.submitLabel || 'Send Message' }}</button>
      </form>
    </div>
  </section>
</template>
