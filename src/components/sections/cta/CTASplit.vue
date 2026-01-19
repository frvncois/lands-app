<script setup lang="ts">
/**
 * CTA SPLIT VARIANT
 *
 * Style options (from sectionStyles):
 * - ctaHeight: 1=auto, 2=50vh, 3=100vh (numeric)
 * - ctaWrapGap: gap in px between buttons
 * - splitLayout: 'content-buttons' | 'buttons-content'
 *
 * content-buttons: Content | Buttons
 * buttons-content: Buttons | Content
 *
 * Mobile stacks vertically (content first).
 */

import { computed } from 'vue'
import type { CTABlockData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles } from '@/types/sections'
import EditableText from '../EditableText.vue'
import { resolveSectionStyles, getTextStyle, getButtonStyle as getButtonStyleUtil } from '@/lib/section-styles'

const props = defineProps<{
  data: CTABlockData
  sectionStyles?: SectionStyleProperties
  fieldStyles?: FieldStyles
  editable?: boolean
  activeField?: string | null
  hiddenFields?: string[]
}>()

const emit = defineEmits<{
  selectField: [fieldKey: string]
  'update': [fieldKey: string, value: unknown]
}>()

// Style options from sectionStyles (normalized CTA style keys)
const ctaHeight = computed(() => {
  const styles = props.sectionStyles as Record<string, unknown> | undefined
  // ctaHeight: 1=auto, 2=50vh, 3=100vh (numeric)
  // Fallback to legacy 'height' if ctaHeight not set
  if (styles?.ctaHeight !== undefined) {
    return styles.ctaHeight as number
  }
  // Legacy support: map old string values to numeric
  const legacyHeight = styles?.height as string | undefined
  if (legacyHeight === 'full') return 3
  if (legacyHeight === 'half') return 2
  return 1
})

const wrapGap = computed(() => {
  const styles = props.sectionStyles as Record<string, unknown> | undefined
  // Prefer new ctaWrapGap, fallback to legacy wrapGap
  return (styles?.ctaWrapGap as number) ?? (Number(styles?.wrapGap) || 32)
})

const splitLayout = computed(() => {
  const styles = props.sectionStyles as Record<string, unknown> | undefined
  return (styles?.splitLayout as string) || 'content-buttons'
})

// Height classes (1=auto, 2=50vh, 3=100vh)
const heightClass = computed(() => {
  switch (ctaHeight.value) {
    case 3: return 'min-h-screen'
    case 2: return 'min-h-[50vh]'
    default: return ''
  }
})

// Column order based on splitLayout
const contentOrder = computed(() => {
  return splitLayout.value === 'buttons-content' ? 'md:order-2' : 'md:order-1'
})

const buttonsOrder = computed(() => {
  return splitLayout.value === 'buttons-content' ? 'md:order-1' : 'md:order-2'
})

// Button alignment based on layout
const buttonsAlign = computed(() => {
  return splitLayout.value === 'buttons-content' ? 'md:justify-start' : 'md:justify-end'
})

function getSectionStyle(): Record<string, string> {
  return resolveSectionStyles(props.sectionStyles)
}

function getFieldStyle(fieldKey: string, defaultFont: string = '--font-body'): Record<string, string> {
  return getTextStyle(props.fieldStyles, fieldKey, defaultFont)
}

function getButtonStyle(fieldKey: string): Record<string, string> {
  return getButtonStyleUtil(props.fieldStyles, fieldKey)
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
</script>

<template>
  <section
    class="bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-section)] px-[var(--spacing-container)]"
    :class="heightClass"
    :style="getSectionStyle()"
  >
    <div
      class="max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-xl)] items-center"
      :class="ctaHeight !== 1 && 'h-full'"
    >
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
          @select-field="handleSelectField"
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
          @select-field="handleSelectField"
          @update="handleUpdate"
        />
      </div>

      <!-- CTA Buttons Column -->
      <div
        class="flex flex-wrap items-center order-2"
        :class="[buttonsOrder, buttonsAlign]"
        :style="{ gap: `${wrapGap}px` }"
      >
        <a
          :href="editable ? '#' : (data.primaryCTA.url || '#')"
          class="inline-flex items-center justify-center py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[length:var(--text-base)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:opacity-90 transition-opacity"
          :class="[
            editable && 'cursor-pointer',
            editable && activeField !== 'primaryCTA' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
            editable && activeField === 'primaryCTA' && 'outline outline-2 outline-primary outline-offset-2',
          ]"
          :style="getButtonStyle('primaryCTA')"
          @click="handleButtonClick($event, 'primaryCTA')"
        >{{ data.primaryCTA.label }}</a>

        <a
          v-if="data.secondaryCTA?.label"
          :href="editable ? '#' : (data.secondaryCTA.url || '#')"
          class="inline-flex items-center justify-center py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-secondary)] text-[var(--color-secondary-fg)] text-[length:var(--text-base)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:opacity-90 transition-opacity"
          :class="[
            editable && 'cursor-pointer',
            editable && activeField !== 'secondaryCTA' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
            editable && activeField === 'secondaryCTA' && 'outline outline-2 outline-primary outline-offset-2',
          ]"
          :style="getButtonStyle('secondaryCTA')"
          @click="handleButtonClick($event, 'secondaryCTA')"
        >{{ data.secondaryCTA.label }}</a>
      </div>
    </div>
  </section>
</template>
