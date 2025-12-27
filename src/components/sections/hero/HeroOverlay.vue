<script setup lang="ts">
/**
 * HERO OVERLAY VARIANT
 *
 * Style options (from sectionStyles):
 * - overlayHeight: 'full' | 'half'
 * - overlayPositionX: 'left' | 'center' | 'right'
 * - overlayPositionY: 'top' | 'middle' | 'bottom'
 * - overlayOpacity: 0-100 (percentage)
 * - overlayBlur: 0-32 (px)
 * - spaceBetween: gap between content blocks
 *
 * Image/video is background, content absolutely positioned based on position.
 *
 * CONTENT STRUCTURE (Intro → Explanation):
 * - BLOCK A: Headline + Subheadline (grouped)
 * - BLOCK B: Paragraph + Buttons (grouped)
 */

import { computed } from 'vue'
import type { HeroData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles } from '@/types/sections'
import EditableText from '../EditableText.vue'
import { getTextStyle, getButtonStyle as getButtonStyleUtil } from '@/lib/section-styles'

const props = defineProps<{
  data: HeroData
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
const overlayHeight = computed(() => props.sectionStyles?.overlayHeight ?? 'full')
const positionX = computed(() => props.sectionStyles?.overlayPositionX ?? 'center')
const positionY = computed(() => props.sectionStyles?.overlayPositionY ?? 'middle')
const overlayOpacity = computed(() => props.sectionStyles?.overlayOpacity ?? 50)
const overlayBlur = computed(() => props.sectionStyles?.overlayBlur ?? 0)
const spaceBetween = computed(() => props.sectionStyles?.spaceBetween ?? 32)

// Height classes
const heightClass = computed(() => {
  switch (overlayHeight.value) {
    case 'full': return 'min-h-screen'
    case 'half': return 'min-h-[50vh]'
    default: return 'min-h-screen'
  }
})

// Position classes for content
const positionClasses = computed(() => {
  const classes: string[] = ['absolute', 'z-10', 'px-[var(--spacing-container)]', 'py-[var(--spacing-section)]']

  // Vertical positioning
  switch (positionY.value) {
    case 'top':
      classes.push('top-0')
      break
    case 'bottom':
      classes.push('bottom-0')
      break
    default: // middle
      classes.push('top-1/2', '-translate-y-1/2')
  }

  // Horizontal positioning
  switch (positionX.value) {
    case 'left':
      classes.push('left-0')
      break
    case 'right':
      classes.push('right-0')
      break
    default: // center
      classes.push('left-1/2', '-translate-x-1/2')
  }

  return classes.join(' ')
})

// Text alignment based on horizontal position
const textAlign = computed(() => {
  switch (positionX.value) {
    case 'left': return 'text-left items-start'
    case 'right': return 'text-right items-end'
    default: return 'text-center items-center'
  }
})

// Content gap style using spaceBetween from sectionStyles
const contentGapStyle = computed(() => ({
  gap: `${spaceBetween.value}px`
}))

// Overlay style with configurable opacity and blur
function getOverlayStyle(): Record<string, string> {
  const opacity = overlayOpacity.value / 100
  const blur = overlayBlur.value

  const result: Record<string, string> = {
    backgroundColor: `rgba(0, 0, 0, ${opacity})`
  }

  if (blur > 0) {
    result.backdropFilter = `blur(${blur}px)`
  }

  return result
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
    class="relative overflow-hidden flex"
    :class="heightClass"
  >
    <!-- Background Media -->
    <template v-if="data.media?.src">
      <img
        v-if="data.media.type === 'image'"
        :src="data.media.src"
        :alt="data.media.alt || ''"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <video
        v-else-if="data.media.type === 'video'"
        :src="data.media.src"
        class="absolute inset-0 w-full h-full object-cover"
        autoplay
        muted
        loop
        playsinline
      />
    </template>

    <!-- Fallback background if no media -->
    <div
      v-else
      class="absolute inset-0 bg-[var(--color-secondary)]"
    />

    <!-- Overlay with configurable opacity and blur -->
    <div class="absolute inset-0" :style="getOverlayStyle()" />

    <!-- Content Overlay -->
    <div
      :class="positionClasses"
      class="w-full max-w-[1200px] mx-auto"
    >
      <div
        class="flex flex-col"
        :class="textAlign"
        :style="contentGapStyle"
      >
        <!-- BLOCK A: Headline + Subheadline (Intro) -->
        <div class="flex flex-col gap-[var(--spacing-sm)]" :class="textAlign">
          <EditableText
            v-if="data.headline"
            tag="h1"
            :value="data.headline"
            field-key="headline"
            :editable="editable"
            :active-field="activeField"
            :hidden-fields="hiddenFields"
            class="text-[length:var(--text-5xl)] font-bold leading-tight m-0 text-white"
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
            class="text-[length:var(--text-xl)] text-white/80 m-0 max-w-[600px]"
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
            class="text-[length:var(--text-base)] text-white/70 m-0 max-w-[600px] prose prose-sm prose-invert"
            :style="getFieldStyle('paragraph', '--font-body')"
            @selectField="handleSelectField"
            @update="handleUpdate"
          />
        </div>

        <!-- BLOCK B: Buttons (Explanation) -->
        <div class="flex flex-col gap-[var(--spacing-md)]" :class="textAlign">
          <!-- Buttons -->
          <div
            class="flex gap-[var(--spacing-md)]"
            :class="{
              'justify-start': positionX === 'left',
              'justify-center': positionX === 'center',
              'justify-end': positionX === 'right',
            }"
          >
            <a
              v-if="data.primaryCTA?.label && !isFieldHidden('primaryCTA')"
              :href="editable ? '#' : (data.primaryCTA.url || '#')"
              class="inline-flex items-center justify-center py-[var(--btn-py)] px-[var(--btn-px)] bg-white text-black text-[length:var(--text-base)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:opacity-90 transition-opacity"
              :class="[
                editable && 'cursor-pointer',
                editable && activeField !== 'primaryCTA' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-white/50 hover:outline-offset-2',
                editable && activeField === 'primaryCTA' && 'outline outline-2 outline-white outline-offset-2',
              ]"
              :style="getButtonStyle('primaryCTA')"
              @click="handleButtonClick($event, 'primaryCTA')"
            >{{ data.primaryCTA.label }}</a>

            <a
              v-if="data.secondaryCTA?.label && !isFieldHidden('secondaryCTA')"
              :href="editable ? '#' : (data.secondaryCTA.url || '#')"
              class="inline-flex items-center justify-center py-[var(--btn-py)] px-[var(--btn-px)] bg-transparent text-white border border-white text-[length:var(--text-base)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:bg-white/10 transition-colors"
              :class="[
                editable && 'cursor-pointer',
                editable && activeField !== 'secondaryCTA' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-white/50 hover:outline-offset-2',
                editable && activeField === 'secondaryCTA' && 'outline outline-2 outline-white outline-offset-2',
              ]"
              :style="getButtonStyle('secondaryCTA')"
              @click="handleButtonClick($event, 'secondaryCTA')"
            >{{ data.secondaryCTA.label }}</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
