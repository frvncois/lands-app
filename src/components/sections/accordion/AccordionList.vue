<script setup lang="ts">
/**
 * ACCORDION LIST VARIANT
 *
 * Headline + paragraph at the top (if present).
 * Accordion items stacked vertically below.
 * Single-column layout.
 *
 * Interaction rules:
 * - Only ONE item may be open at a time
 * - Clicking an open item closes it
 *
 * Supports 3 use cases:
 * - faq: Question/answer format
 * - menu: Category with nested menu items
 * - event: Full event with datetime
 *
 * NO layout options exposed.
 */

import { ref } from 'vue'
import type {
  AccordionData,
  AccordionItemFAQ,
  AccordionItemMenu,
  AccordionItemEvent,
} from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles, ItemStyleProperties } from '@/types/sections'
import EditableText from '../EditableText.vue'
import { resolveSectionStyles, getTextStyle } from '@/lib/section-styles'

const props = defineProps<{
  data: AccordionData
  sectionStyles?: SectionStyleProperties
  fieldStyles?: FieldStyles
  itemStyles?: ItemStyleProperties
  editable?: boolean
  activeField?: string | null
  hiddenFields?: string[]
}>()

const emit = defineEmits<{
  selectField: [fieldKey: string]
  'update': [fieldKey: string, value: unknown]
}>()

const openIndex = ref<number | null>(0)

// Type guards for use cases
function isFAQ(item: unknown): item is AccordionItemFAQ {
  return props.data.useCase === 'faq'
}

function isMenu(item: unknown): item is AccordionItemMenu {
  return props.data.useCase === 'menu'
}

function isEvent(item: unknown): item is AccordionItemEvent {
  return props.data.useCase === 'event'
}

function toggle(index: number) {
  if (props.editable) return
  openIndex.value = openIndex.value === index ? null : index
}

function getSectionStyle(): Record<string, string> {
  return resolveSectionStyles(props.sectionStyles)
}

function getHeaderFieldStyle(fieldKey: string, defaultFont: string = '--font-body'): Record<string, string> {
  return getTextStyle(props.fieldStyles, fieldKey, defaultFont)
}

/**
 * Get shared styles for repeater item containers
 * Applied to each item wrapper - shared across all items
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

function handleItemClick(e: MouseEvent, index: number) {
  if (!props.editable) return
  e.stopPropagation()
  emit('selectField', `items.${index}`)
}

function handleSelectField(fieldKey: string) {
  emit('selectField', fieldKey)
}

function handleUpdate(fieldKey: string, value: unknown) {
  emit('update', fieldKey, value)
}

// Get item headline (all use cases have it)
function getItemHeadline(item: AccordionItemFAQ | AccordionItemMenu | AccordionItemEvent): string {
  return item.headline || ''
}

// Get header metadata for events
function getHeaderMeta(item: AccordionItemEvent): string | undefined {
  if (isEvent(item) && (item as AccordionItemEvent).datetime) {
    const event = item as AccordionItemEvent
    const parts: string[] = []
    if (event.datetime) parts.push(event.datetime)
    if (event.location) parts.push(event.location)
    return parts.join(' • ')
  }
  return undefined
}
</script>

<template>
  <section
    class="bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-section)] px-[var(--spacing-container)]"
    :style="getSectionStyle()"
  >
    <div class="max-w-[800px] mx-auto w-full">
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

      <!-- Accordion Items -->
      <div class="flex flex-col gap-[var(--spacing-sm)]">
        <div
          v-for="(item, index) in data.items"
          :key="index"
          class="bg-[var(--color-surface)] rounded-[var(--radius-md)] overflow-hidden"
          :class="[
            editable && 'cursor-pointer transition-all duration-150',
            editable && activeField !== `items.${index}` && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-2',
            editable && activeField === `items.${index}` && 'outline outline-2 outline-primary -outline-offset-2',
          ]"
          :style="getItemContainerStyle()"
          @click="handleItemClick($event, index)"
        >
          <!-- Header (common to all use cases) -->
          <button
            class="w-full flex items-center justify-between gap-[var(--spacing-md)] text-left p-[var(--spacing-md)]"
            @click="toggle(index)"
          >
            <div class="flex-1 min-w-0">
              <EditableText
                tag="span"
                :value="getItemHeadline(item)"
                :field-key="`items.${index}.headline`"
                :editable="editable"
                :active-field="activeField"
                :hidden-fields="hiddenFields"
                class="text-[length:var(--text-base)] font-medium block"
                :style="{ fontFamily: 'var(--font-heading)' }"
                @selectField="handleSelectField"
                @update="handleUpdate"
              />
              <!-- Event metadata in header -->
              <span
                v-if="isEvent(item) && getHeaderMeta(item as AccordionItemEvent)"
                class="text-[length:var(--text-sm)] text-[var(--color-muted)] mt-1 block"
              >
                {{ getHeaderMeta(item as AccordionItemEvent) }}
              </span>
            </div>
            <i
              class="lni text-[var(--color-muted)] transition-transform duration-200 flex-shrink-0"
              :class="openIndex === index ? 'lni-chevron-up' : 'lni-chevron-down'"
            />
          </button>

          <!-- Content (varies by use case) -->
          <div
            v-show="openIndex === index || editable"
            class="px-[var(--spacing-md)] pb-[var(--spacing-md)]"
          >
            <!-- FAQ Content -->
            <template v-if="isFAQ(item)">
              <EditableText
                tag="div"
                :value="(item as AccordionItemFAQ).content || ''"
                :field-key="`items.${index}.content`"
                :editable="editable"
                :active-field="activeField"
                :hidden-fields="hiddenFields"
                :html="true"
                class="text-[length:var(--text-base)] text-[var(--color-muted)] prose prose-sm max-w-none"
                :style="{ fontFamily: 'var(--font-body)' }"
                @selectField="handleSelectField"
                @update="handleUpdate"
              />
            </template>

            <!-- Menu Content -->
            <template v-else-if="isMenu(item)">
              <div class="flex flex-col gap-[var(--spacing-md)]">
                <div
                  v-for="(menuItem, menuIndex) in (item as AccordionItemMenu).items"
                  :key="menuIndex"
                  class="flex gap-[var(--spacing-md)] items-start"
                >
                  <img
                    v-if="menuItem.image?.src"
                    :src="menuItem.image.src"
                    :alt="menuItem.image.alt || ''"
                    class="w-16 h-16 object-cover rounded-[var(--radius-sm)] flex-shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between gap-[var(--spacing-sm)]">
                      <span class="font-medium text-[length:var(--text-base)]">{{ menuItem.subheadline }}</span>
                      <span v-if="menuItem.price" class="text-[length:var(--text-base)] text-[var(--color-muted)] flex-shrink-0">{{ menuItem.price }}</span>
                    </div>
                    <p v-if="menuItem.details" class="text-[length:var(--text-sm)] text-[var(--color-muted)] m-0 mt-1">{{ menuItem.details }}</p>
                  </div>
                </div>
              </div>
            </template>

            <!-- Event Content -->
            <template v-else-if="isEvent(item)">
              <div class="flex flex-col gap-[var(--spacing-md)]">
                <img
                  v-if="(item as AccordionItemEvent).image?.src"
                  :src="(item as AccordionItemEvent).image!.src"
                  :alt="(item as AccordionItemEvent).image?.alt || ''"
                  class="w-full aspect-video object-cover rounded-[var(--radius-md)]"
                />
                <div v-if="(item as AccordionItemEvent).details" class="text-[length:var(--text-base)] text-[var(--color-muted)] prose prose-sm max-w-none" v-html="(item as AccordionItemEvent).details" />
                <div v-if="(item as AccordionItemEvent).price" class="text-[length:var(--text-lg)] font-medium">{{ (item as AccordionItemEvent).price }}</div>
                <a
                  v-if="(item as AccordionItemEvent).button?.label"
                  :href="editable ? '#' : ((item as AccordionItemEvent).button?.url || '#')"
                  class="inline-flex items-center justify-center py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[length:var(--text-sm)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:opacity-90 transition-opacity self-start"
                >{{ (item as AccordionItemEvent).button!.label }}</a>
              </div>
            </template>

          </div>
        </div>
      </div>
    </div>
  </section>
</template>
