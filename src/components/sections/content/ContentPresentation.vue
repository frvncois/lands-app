<script setup lang="ts">
/**
 * HERO PRESENTATION VARIANT
 *
 * Style options (from sectionStyles):
 * - heroPresentationLayout: 'inline' | 'stacked'
 * - spaceBetween: gap between content blocks
 *
 * Inline layout: Image left, text right
 *   [ IMG ]  Headline      (Buttons inline)
 *           Subheadline
 *           Paragraph
 *
 * Stacked layout: Vertical stack
 *   [ image ]
 *   [ headline + subheadline ]
 *   [ paragraph + buttons ]
 */

import { computed } from 'vue'
import type { ContentData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles } from '@/types/sections'
import EditableText from '../EditableText.vue'
import { resolveSectionStyles, getTextStyle, getButtonStyle as getButtonStyleUtil } from '@/lib/section-styles'

const props = defineProps<{
  data: ContentData
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
const layout = computed(() => props.sectionStyles?.heroPresentationLayout ?? 'inline')
const spaceBetween = computed(() => props.sectionStyles?.spaceBetween ?? 32)

// Content gap style using spaceBetween
const contentGapStyle = computed(() => ({
  gap: `${spaceBetween.value}px`
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
    :style="getSectionStyle()"
  >
    <!-- Inline Layout: Image left, text right -->
    <div
      v-if="layout === 'inline'"
      class="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row items-start"
      :style="contentGapStyle"
    >
      <!-- Profile Image (small, rounded) -->
      <div
        class="shrink-0"
        :class="[
          isEditing && 'cursor-pointer',
          isEditing && activeField !== 'media' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2 rounded-full',
          isEditing && activeField === 'media' && 'outline outline-2 outline-primary outline-offset-2 rounded-full',
        ]"
        @click.stop="isEditing && handleSelectField('media')"
      >
        <img
          v-if="data.media?.src && data.media.type === 'image'"
          :src="data.media.src"
          :alt="data.media.alt || ''"
          class="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
        />
        <div
          v-else
          class="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[var(--color-secondary)] flex items-center justify-center"
        >
          <span class="text-[var(--color-muted)] text-xs">Photo</span>
        </div>
      </div>

      <!-- Content -->
      <div class="flex flex-col gap-[var(--spacing-md)] flex-1">
        <!-- Headline + Buttons (inline) -->
        <div class="flex flex-wrap items-center gap-[var(--spacing-md)]">
          <EditableText
            v-if="data.headline"
            tag="h1"
            :value="data.headline"
            field-key="headline"
            :editable="editable"
            :active-field="activeField"
            :hidden-fields="hiddenFields"
            class="text-[length:var(--text-4xl)] font-bold leading-tight m-0"
            :style="getFieldStyle('headline', '--font-heading')"
            @selectField="handleSelectField"
            @update="handleUpdate"
          />

          <!-- Buttons (inline with headline) -->
          <div class="flex gap-[var(--spacing-sm)]">
            <a
              v-if="data.primaryCTA?.label && !isFieldHidden('primaryCTA')"
              :href="editable ? '#' : (data.primaryCTA.url || '#')"
              class="inline-flex items-center justify-center py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[length:var(--text-sm)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:opacity-90 transition-opacity"
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
              class="inline-flex items-center justify-center py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-secondary)] text-[var(--color-secondary-fg)] text-[length:var(--text-sm)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:opacity-90 transition-opacity"
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
          v-if="data.subheadline"
          tag="p"
          :value="data.subheadline"
          field-key="subheadline"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          class="text-[length:var(--text-lg)] text-[var(--color-muted)] m-0"
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
      </div>
    </div>

    <!-- Stacked Layout: Vertical stack -->
    <div
      v-else
      class="max-w-[1200px] mx-auto w-full flex flex-col items-center text-center"
      :style="contentGapStyle"
    >
      <!-- Media -->
      <div
        class="shrink-0"
        :class="[
          isEditing && 'cursor-pointer',
          isEditing && activeField !== 'media' && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:outline-offset-2 rounded-full',
          isEditing && activeField === 'media' && 'outline outline-2 outline-primary outline-offset-2 rounded-full',
        ]"
        @click.stop="isEditing && handleSelectField('media')"
      >
        <img
          v-if="data.media?.src && data.media.type === 'image'"
          :src="data.media.src"
          :alt="data.media.alt || ''"
          class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
        />
        <div
          v-else
          class="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[var(--color-secondary)] flex items-center justify-center"
        >
          <span class="text-[var(--color-muted)] text-xs">Photo</span>
        </div>
      </div>

      <!-- Headline + Subheadline -->
      <div class="flex flex-col gap-[var(--spacing-sm)] items-center">
        <EditableText
          v-if="data.headline"
          tag="h1"
          :value="data.headline"
          field-key="headline"
          :editable="editable"
          :active-field="activeField"
          :hidden-fields="hiddenFields"
          class="text-[length:var(--text-4xl)] font-bold leading-tight m-0"
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
          class="text-[length:var(--text-lg)] text-[var(--color-muted)] m-0 max-w-[600px]"
          :style="getFieldStyle('subheadline', '--font-body')"
          @selectField="handleSelectField"
          @update="handleUpdate"
        />
      </div>

      <!-- Paragraph + Buttons -->
      <div class="flex flex-col gap-[var(--spacing-md)] items-center">
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
          @selectField="handleSelectField"
          @update="handleUpdate"
        />

        <div class="flex gap-[var(--spacing-sm)] justify-center">
          <a
            v-if="data.primaryCTA?.label && !isFieldHidden('primaryCTA')"
            :href="editable ? '#' : (data.primaryCTA.url || '#')"
            class="inline-flex items-center justify-center py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[length:var(--text-sm)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:opacity-90 transition-opacity"
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
            class="inline-flex items-center justify-center py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-secondary)] text-[var(--color-secondary-fg)] text-[length:var(--text-sm)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:opacity-90 transition-opacity"
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
