<script setup lang="ts">
/**
 * HERO STACKED VARIANT
 *
 * Style options (from sectionStyles):
 * - heroStackedLayout: 'option1' | 'option2' | 'option3'
 * - spaceBetween: gap between content blocks
 *
 * Option 1: Headline (left), Subheadline (left), Image (full), Paragraph + Buttons (shifted right 50%)
 * Option 2: Headline (center), Subheadline (center), Paragraph (center), Buttons (center inline), Image (full)
 * Option 3: Image (full), Headline (center), Subheadline (center), Paragraph (center), Buttons (center inline)
 */

import { computed } from 'vue'
import type { HeroData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles } from '@/types/sections'
import { resolveSectionStyles, getTextStyle, getButtonStyle as getButtonStyleUtil, getMediaStyle } from '@/lib/section-styles'
import EditableText from '../EditableText.vue'
import MediaPlaceholder from '../MediaPlaceholder.vue'

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
const stackedLayout = computed(() => props.sectionStyles?.heroStackedLayout ?? 'option1')
const spaceBetween = computed(() => props.sectionStyles?.spaceBetween ?? 32)

function getSectionStyle(): Record<string, string> {
  return resolveSectionStyles(props.sectionStyles)
}

function getFieldStyle(fieldKey: string, defaultFont: string = '--font-body'): Record<string, string> {
  return getTextStyle(props.fieldStyles, fieldKey, defaultFont)
}

function getButtonStyle(fieldKey: string): Record<string, string> {
  return getButtonStyleUtil(props.fieldStyles, fieldKey)
}

function getMediaContainerStyle(fieldKey: string): Record<string, string> {
  const styles = getMediaStyle(props.fieldStyles, fieldKey)
  const result: Record<string, string> = {}

  // Apply aspect ratio to container (default to 16:9)
  const aspectRatio = styles.aspectRatio ?? '16 / 9'
  result.aspectRatio = aspectRatio
  result.flexGrow = '0'
  result.flexShrink = '0'

  // Apply border radius to container
  if (styles.borderRadius) {
    result.borderRadius = styles.borderRadius
  }

  // Apply border width and color to container
  if (styles.borderWidth) {
    result.borderWidth = styles.borderWidth
    result.borderStyle = styles.borderStyle || 'solid'
  }
  if (styles.borderColor) {
    result.borderColor = styles.borderColor
  }

  return result
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

// Hero viewport height style with dynamic spacing
const heroViewportStyle = computed(() => ({
  gap: `${spaceBetween.value}px`,
}))
</script>

<template>
  <section
    class="bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-section)] px-[var(--spacing-container)]"
    :style="getSectionStyle()"
  >
    <!-- Option 1: Order A → B → C (text left, media full, content right) -->
    <div
      v-if="stackedLayout === 'option1'"
      class="max-w-[1200px] mx-auto w-full flex flex-col"
      :style="heroViewportStyle"
    >
      <!-- BLOCK A: Headline + Subheadline -->
      <div class="flex flex-col">
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
          class="text-[length:var(--text-xl)] text-[var(--color-muted)] m-0 max-w-[600px]"
          :style="getFieldStyle('subheadline', '--font-body')"
          @select-field="handleSelectField"
          @update="handleUpdate"
        />
      </div>

      <!-- BLOCK B: Media (flex-grow) -->
      <div
        class="w-full min-h-0 relative overflow-hidden"
        :class="[
          isEditing && 'cursor-pointer',
          isEditing && activeField !== 'media' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
          isEditing && activeField === 'media' && 'outline outline-2 outline-primary outline-offset-2',
        ]"
        :style="getMediaContainerStyle('media')"
        @click.stop="isEditing && handleSelectField('media')"
      >
        <img
          v-if="data.media?.src && data.media.type === 'image'"
          :src="data.media.src"
          :alt="data.media.alt || ''"
          class="w-full h-full object-cover"
        />
        <video
          v-else-if="data.media?.src && data.media.type === 'video'"
          :src="data.media.src"
          class="w-full h-full object-cover"
          autoplay
          muted
          loop
          playsinline
        />
        <MediaPlaceholder
          v-else
          :show="true"
        />
      </div>

      <!-- BLOCK C: Paragraph + Buttons -->
      <div class="flex flex-col gap-[var(--spacing-lg)] ml-auto w-full md:w-1/2">
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

    <!-- Option 2: Order A → C → B (text center, content center, media last) -->
    <div
      v-else-if="stackedLayout === 'option2'"
      class="max-w-[1200px] mx-auto w-full flex flex-col items-center text-center"
      :style="heroViewportStyle"
    >
      <!-- BLOCK A: Headline + Subheadline -->
      <div class="flex flex-col gap-[var(--spacing-md)] items-center">
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
          class="text-[length:var(--text-xl)] text-[var(--color-muted)] m-0 max-w-[600px]"
          :style="getFieldStyle('subheadline', '--font-body')"
          @select-field="handleSelectField"
          @update="handleUpdate"
        />
      </div>

      <!-- BLOCK C: Paragraph + Buttons -->
      <div class="flex flex-col gap-[var(--spacing-lg)] items-center">
        <EditableText
          v-if="data.paragraph"
          tag="div"
          :value="data.paragraph"
          field-key="paragraph"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          :html="true"
          class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0 max-w-[600px] prose prose-sm"
          :style="getFieldStyle('paragraph', '--font-body')"
          @select-field="handleSelectField"
          @update="handleUpdate"
        />
        <div class="flex gap-[var(--spacing-md)] justify-center">
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

      <!-- BLOCK B: Media (flex-grow) -->
      <div
        class="w-full min-h-0 relative overflow-hidden"
        :class="[
          isEditing && 'cursor-pointer',
          isEditing && activeField !== 'media' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
          isEditing && activeField === 'media' && 'outline outline-2 outline-primary outline-offset-2',
        ]"
        :style="getMediaContainerStyle('media')"
        @click.stop="isEditing && handleSelectField('media')"
      >
        <img
          v-if="data.media?.src && data.media.type === 'image'"
          :src="data.media.src"
          :alt="data.media.alt || ''"
          class="w-full h-full object-cover"
        />
        <video
          v-else-if="data.media?.src && data.media.type === 'video'"
          :src="data.media.src"
          class="w-full h-full object-cover"
          autoplay
          muted
          loop
          playsinline
        />
        <MediaPlaceholder
          v-else
          :show="true"
          class="w-full h-full"
        />
      </div>
    </div>

    <!-- Option 3: Order B → A → C (media first, text center, content center) -->
    <div
      v-else
      class="max-w-[1200px] mx-auto w-full flex flex-col items-center text-center"
      :style="heroViewportStyle"
    >
      <!-- BLOCK B: Media (flex-grow) -->
      <div
        class="w-full min-h-0 relative overflow-hidden"
        :class="[
          isEditing && 'cursor-pointer',
          isEditing && activeField !== 'media' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2',
          isEditing && activeField === 'media' && 'outline outline-2 outline-primary outline-offset-2',
        ]"
        :style="getMediaContainerStyle('media')"
        @click.stop="isEditing && handleSelectField('media')"
      >
        <img
          v-if="data.media?.src && data.media.type === 'image'"
          :src="data.media.src"
          :alt="data.media.alt || ''"
          class="w-full h-full object-cover"
        />
        <video
          v-else-if="data.media?.src && data.media.type === 'video'"
          :src="data.media.src"
          class="w-full h-full object-cover"
          autoplay
          muted
          loop
          playsinline
        />
        <MediaPlaceholder
          v-else
          :show="true"
          class="w-full h-full"
        />
      </div>

      <!-- BLOCK A: Headline + Subheadline -->
      <div class="flex flex-col gap-[var(--spacing-md)] items-center">
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
          class="text-[length:var(--text-xl)] text-[var(--color-muted)] m-0 max-w-[600px]"
          :style="getFieldStyle('subheadline', '--font-body')"
          @select-field="handleSelectField"
          @update="handleUpdate"
        />
      </div>

      <!-- BLOCK C: Paragraph + Buttons -->
      <div class="flex flex-col gap-[var(--spacing-lg)] items-center">
        <EditableText
          v-if="data.paragraph"
          tag="div"
          :value="data.paragraph"
          field-key="paragraph"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          :html="true"
          class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0 max-w-[600px] prose prose-sm"
          :style="getFieldStyle('paragraph', '--font-body')"
          @select-field="handleSelectField"
          @update="handleUpdate"
        />
        <div class="flex gap-[var(--spacing-md)] justify-center">
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
