<script setup lang="ts">
/**
 * GALLERY GRID VARIANT
 *
 * Fixed responsive grid layout:
 * - Desktop: 3 columns
 * - Tablet: 2 columns
 * - Mobile: 1 column
 *
 * All items have uniform aspect ratio (square).
 * NO captions - media only.
 */

import type { GalleryData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles, ItemStyleProperties } from '@/types/sections'
import { resolveSectionStyles } from '@/lib/section-styles'

const props = defineProps<{
  data: GalleryData
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

function getSectionStyle(): Record<string, string> {
  return resolveSectionStyles(props.sectionStyles)
}

function getItemContainerStyle(): Record<string, string> {
  const styles = props.itemStyles
  if (!styles) return {}

  const result: Record<string, string> = {}
  if (styles.borderRadius !== undefined) result.borderRadius = `${styles.borderRadius}px`
  return result
}

function handleItemClick(e: MouseEvent, index: number) {
  if (!props.editable) return
  e.stopPropagation()
  e.preventDefault()
  emit('selectField', `items.${index}`)
}
</script>

<template>
  <section
    class="bg-[var(--color-bg)] text-[var(--color-fg)] py-[var(--spacing-section)] px-[var(--spacing-container)]"
    :style="getSectionStyle()"
  >
    <div class="max-w-[1200px] mx-auto w-full">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]">
        <template v-for="(item, index) in data.items" :key="index">
          <component
            :is="item.link?.url && !editable ? 'a' : 'div'"
            :href="item.link?.url && !editable ? item.link.url : undefined"
            :target="item.link?.url && !editable ? (item.link.target || '_self') : undefined"
            class="block aspect-square rounded-[var(--radius-md)] overflow-hidden"
            :class="[
              editable && 'cursor-pointer transition-all duration-150',
              editable && activeField !== `items.${index}` && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 hover:-outline-offset-2',
              editable && activeField === `items.${index}` && 'outline outline-2 outline-primary -outline-offset-2',
            ]"
            :style="getItemContainerStyle()"
            @click="handleItemClick($event, index)"
          >
            <img
              v-if="item.media.type === 'image'"
              :src="item.media.src || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22%3E%3Crect fill=%22%23374151%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%239CA3AF%22 font-family=%22system-ui%22 font-size=%2216%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo image%3C/text%3E%3C/svg%3E'"
              :alt="item.media.alt || ''"
              class="w-full h-full object-cover"
            />
            <video
              v-else-if="item.media.type === 'video'"
              :src="item.media.src"
              class="w-full h-full object-cover"
              autoplay
              muted
              loop
              playsinline
            />
          </component>
        </template>
      </div>
    </div>
  </section>
</template>
