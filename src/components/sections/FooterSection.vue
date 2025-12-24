<script setup lang="ts">
/**
 * FOOTER SECTION (Global)
 *
 * Variants:
 * - default: Logo/title left, links right
 * - centered: Everything centered
 * - minimal: Just secondary text
 */

import type { FooterData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles } from '@/types/sections'
import EditableText from './EditableText.vue'
import { resolveSectionStyles, getTextStyle, getButtonStyle as getButtonStyleUtil, getImageStyle, getMediaStyle } from '@/lib/section-styles'

const props = defineProps<{
  data: FooterData
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

function getSectionStyle(): Record<string, string> {
  return resolveSectionStyles(props.sectionStyles)
}

function getFieldStyle(fieldKey: string, defaultFont: string = '--font-body'): Record<string, string> {
  return getTextStyle(props.fieldStyles, fieldKey, defaultFont)
}

function getLogoStyle(): Record<string, string> {
  return getImageStyle(props.fieldStyles, 'logo.src')
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
  emit('selectField', 'logo')
}
</script>

<template>
  <footer
    class="bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-lg)] px-[var(--spacing-container)]"
    :style="getSectionStyle()"
  >
    <div
      class="max-w-[1200px] mx-auto w-full"
      :class="{
        'flex flex-col md:flex-row items-start md:items-center justify-between gap-[var(--spacing-lg)]': variant === 'default',
        'flex flex-col items-center text-center gap-[var(--spacing-md)]': variant === 'centered',
        'flex items-center justify-center': variant === 'minimal'
      }"
    >
      <!-- Logo + Info -->
      <div
        v-if="variant !== 'minimal'"
        class="flex flex-col gap-[var(--spacing-sm)]"
        :class="{ 'items-center': variant === 'centered' }"
      >
        <div class="flex items-center gap-[var(--spacing-sm)]">
          <!-- Logo (with placeholder in edit mode - persists even when unselected) -->
          <div
            v-if="(data.logo || isEditing) && !hiddenFields?.includes('logo')"
            :class="[
              editable && 'cursor-pointer transition-all duration-150',
              editable && activeField !== 'logo' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
              editable && activeField === 'logo' && 'outline outline-2 outline-primary outline-offset-2',
            ]"
            @click="handleLogoClick"
          >
            <img
              v-if="data.logo"
              :src="data.logo"
              alt=""
              class="h-8 w-auto"
              :style="getLogoStyle()"
            />
            <div
              v-else
              class="h-8 w-20 bg-[var(--color-secondary)] rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--color-muted)] text-[length:var(--text-xs)]"
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
            :style="getFieldStyle('title', '--font-heading')"
            @selectField="handleSelectField"
            @update="handleUpdate"
          />
        </div>
        <EditableText
          v-if="data.paragraph"
          tag="div"
          :value="data.paragraph"
          field-key="paragraph"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          :html="true"
          class="text-[length:var(--text-sm)] text-[var(--color-muted)] max-w-[300px]"
          :style="getFieldStyle('paragraph', '--font-body')"
          @selectField="handleSelectField"
          @update="handleUpdate"
        />
      </div>

      <!-- Links -->
      <div
        v-if="variant !== 'minimal' && data.links?.length"
        class="flex flex-wrap gap-[var(--spacing-md)]"
        :class="{ 'justify-center': variant === 'centered' }"
      >
        <a
          v-for="(link, index) in data.links"
          :key="index"
          :href="link.url || '#'"
          class="text-[length:var(--text-sm)] text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
          :style="{ fontFamily: 'var(--font-body)' }"
        >{{ link.label }}</a>
      </div>

      <!-- Secondary Text -->
      <EditableText
        v-if="data.secondaryText"
        tag="p"
        :value="data.secondaryText"
        field-key="secondaryText"
        :editable="editable"
        :active-field="activeField"
        :hidden-fields="hiddenFields"
        class="text-[length:var(--text-sm)] text-[var(--color-muted)] m-0"
        :class="{ 'mt-[var(--spacing-md)]': variant === 'centered' }"
        :style="getFieldStyle('secondaryText', '--font-body')"
        @selectField="handleSelectField"
        @update="handleUpdate"
      />
    </div>
  </footer>
</template>
