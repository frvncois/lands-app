<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { sortByPosition, generatePositionBetween, generatePositionBefore, generatePositionAfter } from '@/lib/utils/position'
import { useEditorActions } from '@/composables/useEditorActions'
import type { Section } from '@/types/section'
import BaseContextMenu from '@/components/ui/BaseContextMenu.vue'
import SectionHeader from '@/components/sections/SectionHeader.vue'
import SectionContentMedia from '@/components/sections/SectionContentMedia.vue'
import SectionList from '@/components/sections/SectionList.vue'
import SectionCollection from '@/components/sections/SectionCollection.vue'
import SectionCampaign from '@/components/sections/SectionCampaign.vue'
import SectionStore from '@/components/sections/SectionStore.vue'
import SectionMonetize from '@/components/sections/SectionMonetize.vue'
import SectionFooter from '@/components/sections/SectionFooter.vue'

const landStore = useLandStore()
const editorStore = useEditorStore()
const { deleteSection, duplicateSection, reorderSection } = useEditorActions()

const sections = computed(() => sortByPosition(landStore.activeLand?.sections ?? []))
const localSections = ref<Section[]>([...sections.value])

watch(sections, (val) => {
  localSections.value = [...val]
})

const isInteractive = computed(() => editorStore.isEditMode)
const dragOccurred = ref(false)

const componentMap = {
  header: SectionHeader,
  content_media: SectionContentMedia,
  list: SectionList,
  collection: SectionCollection,
  campaign: SectionCampaign,
  store: SectionStore,
  monetize: SectionMonetize,
  footer: SectionFooter,
}

function selectSection(section: Section) {
  editorStore.setActiveSection(section, true)
}

function handleSectionClick(section: Section) {
  if (!isInteractive.value || dragOccurred.value) return
  selectSection(section)
}

function onDragStart() {
  dragOccurred.value = true
}

function moveUp(section: Section) {
  const sorted = sections.value
  const idx = sorted.findIndex((s) => s.id === section.id)
  if (idx <= 0) return
  const prev = sorted[idx - 1]
  const prevPrev = sorted[idx - 2]
  if (!prev) return
  reorderSection(section.id, generatePositionBetween(prevPrev?.position ?? null, prev.position))
}

function moveDown(section: Section) {
  const sorted = sections.value
  const idx = sorted.findIndex((s) => s.id === section.id)
  if (idx === -1 || idx >= sorted.length - 1) return
  const next = sorted[idx + 1]
  const nextNext = sorted[idx + 2]
  if (!next) return
  reorderSection(section.id, generatePositionBetween(next.position, nextNext?.position ?? null))
}

function onMove(evt: { draggedContext: { element: Section; futureIndex: number }; relatedContext: { element: Section } }) {
  const dragged = evt.draggedContext.element
  const related = evt.relatedContext?.element
  if (dragged.type === 'header' || dragged.type === 'footer') return false
  if (related?.type === 'header') return false
  if (related?.type === 'footer') return false
  if (evt.draggedContext.futureIndex === 0) return false
  return true
}

function sectionComponent(section: Section) {
  return componentMap[section.type]
}

// Context menu
const contextMenu = ref<{ x: number; y: number; section: Section; idx: number } | null>(null)

function onContextMenu(e: MouseEvent, section: Section, idx: number) {
  if (!isInteractive.value) return
  contextMenu.value = { x: e.clientX, y: e.clientY, section, idx }
}

function closeContextMenu() {
  contextMenu.value = null
}

function onDragEnd(event: { oldIndex: number; newIndex: number }) {
  setTimeout(() => { dragOccurred.value = false }, 0)
  const { oldIndex, newIndex } = event
  if (oldIndex === newIndex) return
  // Use original sorted order from the store (not localSections which is already mutated)
  const sorted = sections.value
  const moved = sorted[oldIndex]
  if (!moved || moved.type === 'header' || moved.type === 'footer') return
  if (sorted[newIndex]?.type === 'header') return
  if (sorted[newIndex]?.type === 'footer' && newIndex === sorted.length - 1) return
  const remaining = sorted.filter((_, i) => i !== oldIndex)
  const prevPos = remaining[newIndex - 1]?.position ?? null
  const nextPos = remaining[newIndex]?.position ?? null
  const newPosition = prevPos === null
    ? generatePositionBefore(nextPos)
    : nextPos === null
      ? generatePositionAfter(prevPos)
      : generatePositionBetween(prevPos, nextPos)
  reorderSection(moved.id, newPosition)
}
</script>

<template>
  <div>
  <draggable
    v-model="localSections"
    item-key="id"
    ghost-class="editor-section-ghost"
    :animation="150"
    :move="onMove"
    tag="div"
    filter=".section-actions"
    :prevent-on-filter="true"
    @start="onDragStart"
    @end="onDragEnd"
  >
    <template #item="{ element: section, index: idx }">
      <div
        class="relative group"
        :class="isInteractive && section.type !== 'header' && section.type !== 'footer'
          ? 'cursor-grab active:cursor-grabbing'
          : isInteractive ? 'cursor-pointer' : ''"
        @click="handleSectionClick(section)"
        @contextmenu.prevent="onContextMenu($event, section, idx)"
      >
        <component :is="sectionComponent(section)" :section="section" class="theme-section" style="font-family: var(--theme-font)" />

        <template v-if="isInteractive">
          <!-- Active / hover border -->
          <div
            class="absolute inset-0 border-1 transition-colors pointer-events-none rounded-xl"
            :class="editorStore.activeSection?.id === section.id
              ? 'border-blue-500'
              : 'border-transparent group-hover:border-blue-200'"
          />

          <!-- Edit badge + action buttons -->
          <div class="section-actions absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="flex items-center gap-1 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-medium px-2 py-1.5 rounded-full shadow-lg cursor-pointer">
              <button
                class="flex items-center gap-1.5 px-1 hover:opacity-80 transition-opacity"
                @click.stop="handleSectionClick(section)"
              >
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit section
              </button>

              <div class="w-px h-3.5 bg-white/20 mx-0.5" />

              <button
                v-if="idx > 0 && section.type !== 'header' && section.type !== 'footer'"
                title="Move up"
                class="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 transition-colors"
                @click.stop="moveUp(section)"
              >
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>
              </button>

              <button
                v-if="idx < localSections.length - 1 && section.type !== 'header' && section.type !== 'footer'"
                title="Move down"
                class="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 transition-colors"
                @click.stop="moveDown(section)"
              >
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>

              <button
                v-if="section.type !== 'header' && section.type !== 'footer'"
                title="Duplicate"
                class="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 transition-colors"
                @click.stop="duplicateSection(section.id)"
              >
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>

              <button
                v-if="section.type !== 'header' && section.type !== 'footer'"
                title="Delete"
                class="flex items-center justify-center w-6 h-6 rounded-full hover:bg-red-500/80 transition-colors"
                @click.stop="deleteSection(section.id)"
              >
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
          </div>
        </template>
      </div>
    </template>
  </draggable>

  <div v-if="localSections.length === 0" class="flex items-center justify-center h-64 text-sm text-gray-400">
    No sections yet. Add one from the editor panel.
  </div>

  <Teleport to="body">
    <BaseContextMenu
      v-if="contextMenu"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :locked="contextMenu.section.type === 'header' || contextMenu.section.type === 'footer'"
      :can-move-up="contextMenu.idx > 0 && sections[contextMenu.idx - 1]?.type !== 'header'"
      :can-move-down="contextMenu.idx < sections.length - 1 && sections[contextMenu.idx + 1]?.type !== 'footer'"
      @edit="selectSection(contextMenu.section)"
      @duplicate="duplicateSection(contextMenu.section.id)"
      @move-up="moveUp(contextMenu.section)"
      @move-down="moveDown(contextMenu.section)"
      @delete="deleteSection(contextMenu.section.id)"
      @close="closeContextMenu"
    />
  </Teleport>
  </div>
</template>

<style>
.editor-section-ghost {
  opacity: 0.25;
  outline: 2px dashed #6366f1;
  outline-offset: -2px;
}
</style>
