<script setup lang="ts">
/**
 * SECTION LIST
 *
 * Expandable tree view of sections and their fields.
 * Each section expands to show its content fields.
 * Repeater items are shown as individual selectable rows.
 * Supports drag-and-drop reordering.
 */

import { ref, computed, watch } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { getSectionDefinition } from '@/lib/section-registry'
import type { FieldSchema, RepeaterField, SectionInstance, SectionDefinition } from '@/types/sections'
import Icon from '@/components/ui/Icon.vue'
import AddSectionMenu from './AddSectionMenu.vue'
import SectionContextMenu from './SectionContextMenu.vue'
import { getAccordionLabels, isAccordionSectionType } from '@/lib/accordion-labels'

const editor = useEditorStore()


// Track expanded sections
const expandedSections = ref<Set<string>>(new Set())
const expandedRepeaterGroups = ref<Set<string>>(new Set())

// Auto-expand section when selected (e.g., from canvas click)
watch(() => editor.selectedSectionId, (sectionId) => {
  if (sectionId) {
    expandedSections.value.add(sectionId)
  }
})

watch(
  () => ({ sectionId: editor.selectedSectionId, path: editor.activeFieldPath }),
  ({ sectionId, path }) => {
    if (!sectionId || !path) return
    const repeaterKey = getRepeaterKeyFromPath(path)
    if (repeaterKey) {
      expandRepeaterGroup(sectionId, repeaterKey)
    }
  },
)

// Drag state
const draggedIndex = ref<number | null>(null)
const dropTargetIndex = ref<number | null>(null)

// Sections with their definitions
const sections = computed(() =>
  editor.sections.map(section => ({
    ...section,
    definition: getSectionDefinition(section.type),
  }))
)

function toggleExpand(sectionId: string) {
  if (expandedSections.value.has(sectionId)) {
    expandedSections.value.delete(sectionId)
  } else {
    expandedSections.value.add(sectionId)
  }
}

function isExpanded(sectionId: string): boolean {
  return expandedSections.value.has(sectionId)
}

function getRepeaterGroupKey(sectionId: string, repeaterKey: string): string {
  return `${sectionId}:${repeaterKey}`
}

function isRepeaterExpanded(sectionId: string, repeaterKey: string): boolean {
  const key = getRepeaterGroupKey(sectionId, repeaterKey)
  return expandedRepeaterGroups.value.has(key)
}

function toggleRepeater(sectionId: string, repeaterKey: string) {
  const key = getRepeaterGroupKey(sectionId, repeaterKey)
  if (expandedRepeaterGroups.value.has(key)) {
    expandedRepeaterGroups.value.delete(key)
  } else {
    expandedRepeaterGroups.value.add(key)
  }
}

function expandRepeaterGroup(sectionId: string, repeaterKey: string) {
  const key = getRepeaterGroupKey(sectionId, repeaterKey)
  expandedRepeaterGroups.value.add(key)
}

function selectSection(sectionId: string) {
  editor.selectSection(sectionId)
  // Auto-expand when selecting
  expandedSections.value.add(sectionId)
}

function selectField(sectionId: string, fieldKey: string) {
  editor.selectSection(sectionId)
  editor.selectFieldNode(sectionId, fieldKey)
}

function selectItem(sectionId: string, fieldKey: string, itemId: string) {
  editor.selectSection(sectionId)
  expandRepeaterGroup(sectionId, fieldKey)
  editor.selectItemNode(sectionId, fieldKey, itemId)
}

function selectRepeaterGroup(section: SectionListEntry, repeater: RepeaterField) {
  editor.selectSection(section.id)
  selectField(section.id, repeater.key)
  expandRepeaterGroup(section.id, repeater.key)
}

// Get icon for a field type
function getFieldIcon(field: FieldSchema): string {
  switch (field.type) {
    case 'text': return 'content-text'
    case 'richText': return 'content-heading'
    case 'image': return 'content-image'
    case 'media': return 'content-image'
    case 'url': return 'content-link'
    case 'link': return 'content-link'
    case 'boolean': return 'content-form'
    case 'select': return 'list-menu'
    case 'repeater': return 'layout-container'
    default: return 'app-settings'
  }
}

// Filter to show only content fields (non-repeater, no category), ordered by fieldOrder if available
function getContentFields(schema: FieldSchema[], fieldOrder?: string[]): FieldSchema[] {
  const contentFields = schema.filter(field =>
    field.type !== 'repeater' &&
    field.category !== 'design' &&
    field.category !== 'button'
  )

  // If no fieldOrder, return as-is
  if (!fieldOrder || fieldOrder.length === 0) {
    return contentFields
  }

  // Sort by fieldOrder
  return contentFields.sort((a, b) => {
    const indexA = fieldOrder.indexOf(a.key)
    const indexB = fieldOrder.indexOf(b.key)
    // Fields not in fieldOrder go to the end
    const orderA = indexA === -1 ? 999 : indexA
    const orderB = indexB === -1 ? 999 : indexB
    return orderA - orderB
  })
}

type SectionListEntry = SectionInstance & { definition?: SectionDefinition }

function getVisibleContentFields(section: SectionListEntry): FieldSchema[] {
  if (!section.definition) return []
  const fields = getContentFields(section.definition.schema, section.definition.fieldOrder?.[section.variant])

  // For contact sections, exclude submitButton field (will be rendered inside formFields group)
  if (section.type === 'contact') {
    return fields.filter(field => field.key !== 'submitButton')
  }

  return fields
}

// Get repeater fields from schema
function getRepeaterFields(schema: FieldSchema[]): RepeaterField[] {
  return schema.filter(field => field.type === 'repeater') as RepeaterField[]
}

function getItemId(item: Record<string, unknown>, index: number): string {
  const id = item.id
  return typeof id === 'string' ? id : `${index}`
}

// Get the item schema for a repeater (variant-specific or useCase-specific if available)
function getRepeaterItemSchema(repeater: RepeaterField, variant: string, sectionData?: Record<string, unknown>): FieldSchema[] {
  // Check for useCase-specific schema first
  if (repeater.useCaseKey && repeater.useCaseSchemas && sectionData) {
    const useCase = sectionData[repeater.useCaseKey] as string
    if (useCase && repeater.useCaseSchemas[useCase]) {
      return repeater.useCaseSchemas[useCase]
    }
  }
  // Then check for variant-specific schema
  if (repeater.variantSchemas?.[variant]) {
    return repeater.variantSchemas[variant]
  }
  return repeater.itemSchema
}

// Get display label for a repeater item
function getItemDisplayLabel(item: Record<string, unknown>, itemSchema: FieldSchema[]): string {
  // Try to find a suitable label field
  const labelFields = ['headline', 'label', 'title', 'name', 'heading']
  for (const key of labelFields) {
    const value = item[key]
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }
  // Fallback to first text field with value
  for (const field of itemSchema) {
    if (field.type === 'text' || field.type === 'richText') {
      const value = item[field.key]
      if (typeof value === 'string' && value.trim()) {
        return value
      }
    }
  }
  return 'Untitled'
}

function getRepeaterKeyFromPath(path: string): string | null {
  if (!path) return null
  const segments = path.split('.')
  if (segments.length <= 1) return path
  const last = segments[segments.length - 1] ?? ''
  if (/^\d+$/.test(last)) {
    return segments.slice(0, -1).join('.')
  }
  return path
}

function isRepeaterGroupSelected(section: SectionListEntry, repeaterKey: string): boolean {
  if (editor.selectedSectionId !== section.id) return false
  const path = editor.activeFieldPath
  if (!path) return false
  if (path === repeaterKey) return true
  return path.startsWith(`${repeaterKey}.`)
}

function getRepeaterItems(section: SectionListEntry, repeaterKey: string): Record<string, unknown>[] {
  const parts = repeaterKey.split('.')
  let current: unknown = section.data
  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      current = undefined
      break
    }
    current = (current as Record<string, unknown>)[part]
  }
  return Array.isArray(current) ? current as Record<string, unknown>[] : []
}

function getRepeaterGroupLabel(section: SectionListEntry, repeater: RepeaterField): string {
  if (repeater.key === 'items' && isAccordionSectionType(section.type)) {
    return getAccordionLabels(section.type).itemsLabel
  }
  return repeater.label
}

function getRepeaterItemLabel(
  section: SectionListEntry,
  repeater: RepeaterField,
  item: Record<string, unknown>,
  index: number,
): string {
  return getItemDisplayLabel(item, getRepeaterItemSchema(repeater, section.variant, section.data as Record<string, unknown>))
}

function addItem(sectionId: string, fieldKey: string) {
  editor.addRepeaterItem(sectionId, fieldKey)
}

// Drag and drop handlers
function onDragStart(e: DragEvent, index: number) {
  draggedIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
}

function onDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
  dropTargetIndex.value = index
}

function onDragLeave() {
  dropTargetIndex.value = null
}

function onDrop(e: DragEvent, toIndex: number) {
  e.preventDefault()
  const fromIndex = draggedIndex.value
  if (fromIndex !== null && fromIndex !== toIndex) {
    editor.reorderSections(fromIndex, toIndex)
  }
  draggedIndex.value = null
  dropTargetIndex.value = null
}

function onDragEnd() {
  draggedIndex.value = null
  dropTargetIndex.value = null
}

// Check if an item is selected
function isItemSelected(sectionId: string, fieldKey: string, index: number): boolean {
  return editor.selectedSectionId === sectionId &&
    editor.activeFieldPath === `${fieldKey}.${index}`
}

// Section actions
function deleteSection(e: MouseEvent, sectionId: string) {
  e.stopPropagation()
  editor.removeSection(sectionId)
}

function duplicateSection(e: MouseEvent, sectionId: string) {
  e.stopPropagation()
  editor.duplicateSection(sectionId)
}

// Repeater item actions
function deleteItem(e: MouseEvent, sectionId: string, fieldKey: string, itemId: string) {
  e.stopPropagation()
  editor.removeRepeaterItem(sectionId, fieldKey, itemId)
}

function duplicateItem(e: MouseEvent, sectionId: string, fieldKey: string, itemId: string) {
  e.stopPropagation()
  editor.duplicateRepeaterItem(sectionId, fieldKey, itemId)
}

// Field visibility (uses store)
function toggleFieldVisibility(e: MouseEvent, sectionId: string, fieldKey: string) {
  e.stopPropagation()
  editor.toggleFieldVisibility(sectionId, fieldKey)
}

// Context menu state
const activeMenuSection = ref<SectionListEntry | null>(null)
const sectionMenuRef = ref<InstanceType<typeof SectionContextMenu> | null>(null)
const contentMenuRef = ref<InstanceType<typeof SectionContextMenu> | null>(null)
const activeContentField = ref<string | null>(null)

// Section right-click handler
function handleSectionContextMenu(event: MouseEvent, section: SectionListEntry) {
  event.preventDefault()
  event.stopPropagation()
  activeMenuSection.value = section
  activeContentField.value = null
  sectionMenuRef.value?.open(event)
}

// Content field right-click handler
function handleFieldContextMenu(event: MouseEvent, section: SectionListEntry, fieldKey: string) {
  event.preventDefault()
  event.stopPropagation()
  activeMenuSection.value = section
  activeContentField.value = fieldKey
  contentMenuRef.value?.open(event)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 h-14 border-b border-border">
      <span class="text-sm font-semibold text-foreground">Sections</span>
      <div data-tour="add-section">
        <AddSectionMenu />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="sections.length === 0"
      class="px-4 py-6 text-center text-xs text-muted-foreground"
    >
      No sections yet. Add one to get started.
    </div>

    <!-- Section List -->
    <div
      v-else
      class="flex-1 overflow-y-auto p-2"
    >
      <div
        v-for="(section, index) in sections"
        :key="section.id"
        class="mb-0.5"
        :class="[
          draggedIndex === index && 'opacity-50',
          dropTargetIndex === index && draggedIndex !== index && section.type !== 'header' && section.type !== 'footer' && 'ring-2 ring-primary ring-offset-1 rounded-xl'
        ]"
        :draggable="section.type !== 'header' && section.type !== 'footer'"
        @dragstart="section.type !== 'header' && section.type !== 'footer' && onDragStart($event, index)"
        @dragover="onDragOver($event, index)"
        @dragleave="onDragLeave"
        @drop="onDrop($event, index)"
        @dragend="onDragEnd"
      >
        <!-- Section Header -->
        <div
          class="group flex items-center gap-1.5 w-full px-2 py-2 rounded-lg transition-colors"
          :class="[
            editor.selectedSectionId === section.id && !editor.activeFieldPath
              ? 'bg-accent'
              : editor.selectedSectionId === section.id
                ? 'bg-accent/80'
                : 'hover:bg-accent',
            section.type !== 'header' && section.type !== 'footer' && 'cursor-grab',
            draggedIndex !== null && section.type !== 'header' && section.type !== 'footer' && 'cursor-grabbing'
          ]"
          @click="selectSection(section.id)"
          @contextmenu="handleSectionContextMenu($event, section)"
        >
          <!-- Expand Toggle -->
          <button
            class="flex items-center justify-center w-5 h-5 rounded text-muted-foreground hover:bg-border hover:text-foreground transition-colors"
            @click.stop="toggleExpand(section.id)"
          >
            <Icon
              :name="isExpanded(section.id) ? 'chevron-down' : 'chevron-right'"
              :size="16"
            />
          </button>

          <!-- Section Icon & Name -->
          <span class="flex-1 text-xs font-medium text-foreground truncate">
            {{ section.definition?.displayName || section.type }}
          </span>

          <!-- Section Actions (visible on hover) -->
          <div class="hidden group-hover:flex items-center gap-0.5">
            <button
              class="flex items-center justify-center w-5 h-5 rounded text-muted-foreground hover:bg-border hover:text-foreground transition-colors"
              title="Duplicate section"
              @click="duplicateSection($event, section.id)"
            >
              <Icon
                name="app-duplicate"
                :size="12"
              />
            </button>
            <button
              class="flex items-center justify-center w-5 h-5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Delete section"
              @click="deleteSection($event, section.id)"
            >
              <Icon
                name="app-delete"
                :size="12"
              />
            </button>
          </div>
        </div>

        <!-- Section Fields (expanded) -->
        <div
          v-if="isExpanded(section.id) && section.definition"
          class="pl-6 mt-0.5"
        >
          <!-- Regular content fields -->
          <div
            v-for="field in getVisibleContentFields(section)"
            :key="field.key"
            class="group/field flex items-center gap-3 w-full px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer"
            :class="[
              editor.selectedSectionId === section.id && editor.activeFieldPath === field.key
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent',
              editor.isFieldHidden(section.id, field.key) && 'opacity-50'
            ]"
            @click="selectField(section.id, field.key)"
            @contextmenu="handleFieldContextMenu($event, section, field.key)"
          >
            <Icon
              :name="getFieldIcon(field)"
              :size="12"
              :class="editor.selectedSectionId === section.id && editor.activeFieldPath === field.key
                ? 'text-primary-foreground'
                : 'text-muted-foreground'"
            />
            <span
              class="flex-1 text-xs truncate"
              :class="[
                editor.selectedSectionId === section.id && editor.activeFieldPath === field.key
                  ? 'text-primary-foreground'
                  : 'text-foreground'
              ]"
            >
              {{ field.label }}
            </span>
            <!-- Hide toggle (always visible when hidden, otherwise on hover) -->
            <button
              class="items-center justify-center w-4 h-4 rounded transition-colors"
              :class="[
                editor.isFieldHidden(section.id, field.key)
                  ? 'flex'
                  : 'hidden group-hover/field:flex',
                editor.selectedSectionId === section.id && editor.activeFieldPath === field.key
                  ? 'text-primary-foreground/70 hover:text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              ]"
              :title="editor.isFieldHidden(section.id, field.key) ? 'Show field' : 'Hide field'"
              @click="toggleFieldVisibility($event, section.id, field.key)"
            >
              <Icon
                :name="editor.isFieldHidden(section.id, field.key) ? 'app-hide' : 'eye'"
                :size="12"
              />
            </button>
          </div>

          <!-- Repeater groups -->
          <div
            v-for="repeater in getRepeaterFields(section.definition.schema)"
            :key="repeater.key"
          >
            <div
              class="flex items-center gap-2 w-full px-1.5 py-1 rounded text-left transition-colors cursor-pointer"
              :class="[
                isRepeaterGroupSelected(section, repeater.key)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              ]"
              @click="selectRepeaterGroup(section, repeater)"
            >
              <button
                class="flex items-center justify-center w-5 h-5 rounded text-muted-foreground  transition-colors"
                :class="[
                  isRepeaterGroupSelected(section, repeater.key) && 'text-primary-foreground hover:text-primary-foreground'
                ]"
                @click.stop="toggleRepeater(section.id, repeater.key)"
              >
                <Icon
                  :name="isRepeaterExpanded(section.id, repeater.key) ? 'chevron-down' : 'chevron-right'"
                  :size="16"
                />
              </button>
              <span
                class="flex-1 text-xs truncate"
                :class="[
                  isRepeaterGroupSelected(section, repeater.key)
                    ? 'text-primary-foreground'
                    : 'text-foreground'
                ]"
              >
                {{ getRepeaterGroupLabel(section, repeater) }} list
              </span>
            </div>

            <div
              v-if="isRepeaterExpanded(section.id, repeater.key)"
              class="ml-6 space-y-0.5"
            >
              <div
                v-for="(item, itemIndex) in getRepeaterItems(section, repeater.key)"
                :key="`${repeater.key}-${getItemId(item, itemIndex)}`"
                class="group/item flex items-center gap-3 w-full px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer"
                :class="[
                  isItemSelected(section.id, repeater.key, itemIndex)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                ]"
                @click="selectItem(section.id, repeater.key, getItemId(item, itemIndex))"
              >
                <Icon
                  :name="getFieldIcon(repeater)"
                  :size="12"
                  :class="isItemSelected(section.id, repeater.key, itemIndex)
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground'"
                />
                <span
                  class="flex-1 text-xs truncate"
                  :class="[
                    isItemSelected(section.id, repeater.key, itemIndex)
                      ? 'text-primary-foreground'
                      : 'text-foreground'
                  ]"
                >
                  {{ getRepeaterItemLabel(section, repeater, item, itemIndex) }}
                </span>
                <div
                  class="hidden group-hover/item:flex items-center gap-0.5"
                  :class="[
                    isItemSelected(section.id, repeater.key, itemIndex)
                      ? 'text-primary-foreground/70'
                      : ''
                  ]"
                >
                  <button
                    class="flex items-center justify-center w-4 h-4 rounded transition-colors"
                    :class="[
                      isItemSelected(section.id, repeater.key, itemIndex)
                        ? 'hover:text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    ]"
                    title="Duplicate item"
                    @click="duplicateItem($event, section.id, repeater.key, getItemId(item, itemIndex))"
                  >
                    <Icon
                      name="app-duplicate"
                      :size="10"
                    />
                  </button>
                  <button
                    class="flex items-center justify-center w-4 h-4 rounded transition-colors"
                    :class="[
                      isItemSelected(section.id, repeater.key, itemIndex)
                        ? 'hover:text-primary-foreground'
                        : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                    ]"
                    title="Delete item"
                    @click="deleteItem($event, section.id, repeater.key, getItemId(item, itemIndex))"
                  >
                    <Icon
                      name="app-delete"
                      :size="10"
                    />
                  </button>
                </div>
              </div>

              <!-- Add item button (hidden for socials) -->
              <button
                v-if="repeater.key !== 'socials'"
                class="flex items-center gap-3 w-full px-2.5 py-1.5 rounded text-left transition-colors hover:bg-accent cursor-pointer"
                @click="addItem(section.id, repeater.key)"
              >
                <Icon
                  name="plus"
                  :size="12"
                  class="text-muted-foreground"
                />
                <span class="text-xs text-foreground">Add {{ repeater.label.replace(/s$/, '') }}</span>
              </button>

              <!-- Submit Button (for contact section formFields only) -->
              <div
                v-if="section.type === 'contact' && repeater.key === 'formFields'"
                class="group/field flex items-center gap-3 w-full px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer"
                :class="[
                  editor.selectedSectionId === section.id && editor.activeFieldPath === 'submitButton'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent',
                  editor.isFieldHidden(section.id, 'submitButton') && 'opacity-50'
                ]"
                @click="selectField(section.id, 'submitButton')"
              >
                <Icon
                  name="content-link"
                  :size="12"
                  :class="editor.selectedSectionId === section.id && editor.activeFieldPath === 'submitButton'
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground'"
                />
                <span
                  class="flex-1 text-xs truncate"
                  :class="[
                    editor.selectedSectionId === section.id && editor.activeFieldPath === 'submitButton'
                      ? 'text-primary-foreground'
                      : 'text-foreground'
                  ]"
                >
                  Submit Button
                </span>
                <!-- Hide toggle (always visible when hidden, otherwise on hover) -->
                <button
                  class="items-center justify-center w-4 h-4 rounded transition-colors"
                  :class="[
                    editor.isFieldHidden(section.id, 'submitButton')
                      ? 'flex'
                      : 'hidden group-hover/field:flex',
                    editor.selectedSectionId === section.id && editor.activeFieldPath === 'submitButton'
                      ? 'text-primary-foreground/70 hover:text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  ]"
                  :title="editor.isFieldHidden(section.id, 'submitButton') ? 'Show field' : 'Hide field'"
                  @click="toggleFieldVisibility($event, section.id, 'submitButton')"
                >
                  <Icon
                    :name="editor.isFieldHidden(section.id, 'submitButton') ? 'app-hide' : 'eye'"
                    :size="12"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Context menus -->
    <SectionContextMenu
      v-if="activeMenuSection"
      ref="sectionMenuRef"
      :section="activeMenuSection"
      location="sidebar"
    />

    <SectionContextMenu
      v-if="activeMenuSection && activeContentField"
      ref="contentMenuRef"
      :section="activeMenuSection"
      :field-key="activeContentField"
      location="sidebar"
    />
  </div>
</template>
