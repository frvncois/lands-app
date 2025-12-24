<script setup lang="ts">
/**
 * HERO SPLIT VARIANT
 *
 * Style options (from sectionStyles):
 * - height: 'full' | 'half'
 * - contentPosition: 'left' | 'right'
 *
 * Image ALWAYS stretches to container height.
 * Mobile stacks vertically (media first).
 */

import { computed } from 'vue'
import type { HeroData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles } from '@/types/sections'
import EditableText from '../EditableText.vue'
import MediaPlaceholder from '../MediaPlaceholder.vue'
import { resolveSectionStyles, getTextStyle, getButtonStyle as getButtonStyleUtil } from '@/lib/section-styles'

const props = defineProps<{
  data: HeroData
  sectionStyles?: SectionStyleProperties
  fieldStyles?: FieldStyles
  isEditing?: boolean
  editable?: boolean
  activeField?: string | null
  hiddenFields?: string[]
  spaceBetween: number
}>()

const emit = defineEmits<{
  selectField: [fieldKey: string]
  'update': [fieldKey: string, value: unknown]
}>()

// Style options from sectionStyles
const height = computed(() => {
  const styles = props.sectionStyles as Record<string, unknown> | undefined
  return (styles?.height as string) || 'full'
})

const contentPosition = computed(() => {
  const styles = props.sectionStyles as Record<string, unknown> | undefined
  return (styles?.contentPosition as string) || 'right'
})

// Height classes
const heightClass = computed(() => {
  switch (height.value) {
    case 'full': return 'min-h-screen'
    case 'half': return 'min-h-[50vh]'
    default: return 'min-h-screen'
  }
})

// Media column order based on contentPosition
// contentPosition: 'left' means content on left, media on right
// contentPosition: 'right' means content on right, media on left
const mediaOrder = computed(() => {
  return contentPosition.value === 'left' ? 'md:order-2' : 'md:order-1'
})

const contentOrder = computed(() => {
  return contentPosition.value === 'left' ? 'md:order-1' : 'md:order-2'
})

// Content gap style using spaceBetween
const contentGapStyle = computed(() => ({
  gap: `${props.spaceBetween}px`
}))

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

function isFieldHidden(fieldKey: string): boolean {
  return props.hiddenFields?.includes(fieldKey) ?? false
}
</script>

<template>
  <section
    class="bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-section)] px-[var(--spacing-container)]"
    :class="heightClass"
    :style="getSectionStyle()"
  >
    <div
      class="max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-2xl)] items-center"
    >
      <!-- Media Column (first on mobile) - always stretches to height -->
      <div
        :class="[
          mediaOrder,
          'h-full',
          isEditing && 'cursor-pointer',
          isEditing && activeField !== 'media' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2 rounded-[var(--radius-lg)]',
          isEditing && activeField === 'media' && 'outline outline-2 outline-primary outline-offset-2 rounded-[var(--radius-lg)]',
        ]"
        @click.stop="isEditing && handleSelectField('media')"
      >
        <template v-if="data.media?.src">
          <img
            v-if="data.media.type === 'image'"
            :src="data.media.src"
            :alt="data.media.alt || ''"
            class="w-full h-full rounded-[var(--radius-lg)] object-cover"
          />
          <video
            v-else-if="data.media.type === 'video'"
            :src="data.media.src"
            class="w-full h-full rounded-[var(--radius-lg)] object-cover"
            autoplay
            muted
            loop
            playsinline
          />
        </template>

        <!-- Placeholder when no media -->
        <MediaPlaceholder
          v-else
          :show="true"
          class="h-full"
        />
      </div>

      <!-- Content Column -->
      <div
        class="flex flex-col"
        :class="contentOrder"
        :style="contentGapStyle"
      >
        <EditableText
          v-if="data.headline"
          tag="h1"
          :value="data.headline"
          field-key="headline"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          class="text-[length:var(--text-5xl)] font-bold leading-tight m-0"
          :style="getFieldStyle('headline', '--font-heading')"
          @selectField="handleSelectField"
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
          class="text-[length:var(--text-xl)] text-[var(--color-muted)] m-0"
          :style="getFieldStyle('subheadline', '--font-body')"
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

        <!-- Buttons -->
        <div class="flex gap-[var(--spacing-md)]">
          <a
            v-if="data.primaryCTA?.label && !isFieldHidden('primaryCTA')"
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
            v-if="data.secondaryCTA?.label && !isFieldHidden('secondaryCTA')"
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
    </div>
  </section>
</template>
