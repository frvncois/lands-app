<script setup lang="ts">
/**
 * CTA STACKED VARIANT
 *
 * Style options (from sectionStyles):
 * - height: 'auto' | 'full' | 'half'
 * - stackedLayout: 'option1' | 'option2' | 'option3'
 *
 * Option 1: Centered single-column
 *   Headline
 *   Paragraph
 *   [Primary] [Secondary]
 *
 * Option 2: Left-aligned single-column
 *   Headline
 *   Paragraph
 *   [Primary] [Secondary]
 *
 * Option 3: Headline with inline buttons
 *   Headline [Primary] [Secondary]
 *   Paragraph
 */

import { computed } from 'vue'
import type { CTABlockData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles } from '@/types/sections'
import EditableText from '../EditableText.vue'
import { resolveSectionStyles, getTextStyle, getButtonStyle as getButtonStyleUtil, getImageStyle, getMediaStyle } from '@/lib/section-styles'

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

const ctaLayout = computed(() => {
  const styles = props.sectionStyles as Record<string, unknown> | undefined
  // Prefer new ctaLayout, fallback to legacy stackedLayout
  return (styles?.ctaLayout as string) ?? (styles?.stackedLayout as string) ?? 'option1'
})

const wrapGap = computed(() => {
  const styles = props.sectionStyles as Record<string, unknown> | undefined
  // Prefer new ctaWrapGap, fallback to legacy wrapGap
  return (styles?.ctaWrapGap as number) ?? (Number(styles?.wrapGap) || 32)
})

// Height classes (1=auto, 2=50vh, 3=100vh)
const heightClass = computed(() => {
  switch (ctaHeight.value) {
    case 3: return 'min-h-screen'
    case 2: return 'min-h-[50vh]'
    default: return ''
  }
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
    <!-- Option 1: Centered -->
    <div
      v-if="ctaLayout === 'option1'"
      class="max-w-[800px] mx-auto w-full text-center flex flex-col items-center gap-[var(--spacing-md)]"
      :class="ctaHeight !== 1 && 'justify-center h-full'"
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
        class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0 max-w-[600px]"
        :style="getFieldStyle('paragraph', '--font-body')"
        @selectField="handleSelectField"
        @update="handleUpdate"
      />

      <div
        class="flex flex-wrap items-center justify-center mt-[var(--spacing-sm)]"
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

    <!-- Option 2: Left-aligned -->
    <div
      v-else-if="ctaLayout === 'option2'"
      class="max-w-[800px] mx-auto w-full flex flex-col gap-[var(--spacing-md)]"
      :class="ctaHeight !== 1 && 'justify-center h-full'"
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
        class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0 max-w-[600px]"
        :style="getFieldStyle('paragraph', '--font-body')"
        @selectField="handleSelectField"
        @update="handleUpdate"
      />

      <div
        class="flex flex-wrap items-center mt-[var(--spacing-sm)]"
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

    <!-- Option 3: Headline with inline buttons -->
    <div
      v-else
      class="max-w-[1200px] mx-auto w-full flex flex-col gap-[var(--spacing-md)]"
      :class="ctaHeight !== 1 && 'justify-center h-full'"
    >
      <div class="flex flex-wrap items-center" :style="{ gap: `${wrapGap}px` }">
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

        <div class="flex flex-wrap items-center" :style="{ gap: `${wrapGap}px` }">
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

      <EditableText
        v-if="data.paragraph"
        tag="div"
        :value="data.paragraph"
        field-key="paragraph"
        :editable="editable"
        :active-field="activeField"
        :hidden-fields="hiddenFields"
        :html="true"
        class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0 max-w-[600px]"
        :style="getFieldStyle('paragraph', '--font-body')"
        @selectField="handleSelectField"
        @update="handleUpdate"
      />
    </div>
  </section>
</template>
