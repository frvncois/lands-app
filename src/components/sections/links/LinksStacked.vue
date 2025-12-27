<script setup lang="ts">
/**
 * LINKS STACKED VARIANT
 *
 * Displays headline + paragraph at the top.
 * Links list underneath in vertical flow.
 *
 * Simple list layout.
 * Mobile and desktop behave the same.
 *
 * NO layout options exposed.
 */

import { computed } from 'vue'
import type { LinksData } from '@/lib/section-registry'
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
  resolveRepeaterGroupStyles,
  resolveSharedLinkContainerStyles,
  resolveSharedLinkTextStyles,
} from '@/lib/section-styles'

// EditableText kept only for section header fields (headline, paragraph)

const props = defineProps<{
  data: LinksData
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

const repeaterGroupStyles = computed(() => resolveRepeaterGroupStyles(props.sectionStyles, 'items'))
const repeaterGapStyle = computed(() => (
  repeaterGroupStyles.value.spaceBetween !== undefined
    ? { gap: `${repeaterGroupStyles.value.spaceBetween}px` }
    : {}
))

function getSectionStyle(): Record<string, string> {
  return resolveSectionStyles(props.sectionStyles)
}

function getHeaderFieldStyle(fieldKey: string, defaultFont: string = '--font-body'): Record<string, string> {
  return getTextStyle(props.fieldStyles, fieldKey, defaultFont)
}

/**
 * Get shared styles for repeater item containers
 * Applied to each item wrapper - shared across all items from sectionStyles
 */
function getItemContainerStyle(): Record<string, string> {
  return resolveSharedLinkContainerStyles(props.sectionStyles)
}

function getItemLabelStyle(): Record<string, string> {
  return resolveSharedLinkTextStyles(props.sectionStyles, 'Label', '--font-body')
}

function getItemDescriptionStyle(): Record<string, string> {
  return resolveSharedLinkTextStyles(props.sectionStyles, 'Description', '--font-body')
}

function getLinkId(link: LinksData['items'][number], fallback: number): string | null {
  if (link?.id) return link.id
  return fallback.toString()
}

function isLinkActive(link: LinksData['items'][number], index: number): boolean {
  if (!props.editable) return false
  const linkId = getLinkId(link, index)
  if (!linkId) return false
  return (
    props.activeNodeType === 'item' &&
    props.activeFieldKey === 'items' &&
    props.activeItemId === linkId
  )
}

function handleItemClick(e: MouseEvent, link: LinksData['items'][number], index: number) {
  if (!props.editable) return
  e.preventDefault()
  e.stopPropagation()
  const linkId = getLinkId(link, index)
  if (!linkId) return
  emit('selectField', {
    type: 'item',
    fieldKey: 'items',
    itemId: linkId,
  })
}

function handleSelectField(fieldKey: string) {
  emit('selectField', fieldKey)
}

function handleUpdate(fieldKey: string, value: unknown) {
  emit('update', fieldKey, value)
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
        v-if="data.headline || data.paragraph"
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
          class="text-[length:var(--text-3xl)] font-bold leading-tight m-0 mb-[var(--spacing-md)]"
          :style="getHeaderFieldStyle('headline', '--font-heading')"
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
          class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0"
          :style="getHeaderFieldStyle('paragraph', '--font-body')"
          @selectField="handleSelectField"
          @update="handleUpdate"
        />
      </div>

      <!-- Links List -->
      <div class="flex flex-col gap-[var(--spacing-sm)]" :style="repeaterGapStyle">
        <a
          v-for="(link, index) in data.items"
          :key="link.id || index"
          :href="editable ? '#' : (link.url || '#')"
          class="flex items-center gap-[var(--spacing-md)] p-[var(--spacing-md)] bg-[var(--color-surface)] rounded-[var(--radius-md)] hover:bg-[var(--color-secondary)] transition-colors group"
          :class="[
            editable && 'cursor-pointer transition-all duration-150 select-none',
            editable && !isLinkActive(link, index) && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-2',
            editable && isLinkActive(link, index) && 'outline outline-2 outline-primary -outline-offset-2',
          ]"
          :style="getItemContainerStyle()"
          @click="handleItemClick($event, link, index)"
        >
          <!-- Thumbnail (if image exists) -->
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
              :style="getItemLabelStyle()"
            >{{ link.label }}</span>
            <span
              v-if="link.description"
              class="text-[length:var(--text-sm)] text-[var(--color-muted)]"
              :class="editable && 'pointer-events-none select-none'"
              :style="getItemDescriptionStyle()"
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
