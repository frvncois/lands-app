<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLandStore } from '@/features/lands/stores/land'
import { useEditorStore } from '@/features/editor/stores/editor'
import { sortByPosition } from '@/shared/lib/position'
import { useSectionLifecycle } from '@/features/editor/composables/useSectionLifecycle'
import { useSectionInsert } from '@/features/editor/composables/useSectionInsert'
import type { Section } from '@/features/sections/types'
import BaseContextMenu from '@/shared/ui/BaseContextMenu.vue'
import ErrorBoundary from '@/shared/ui/ErrorBoundary.vue'
import SectionRenderer from '@/features/editor/components/sections/SectionRenderer.vue'

const landStore = useLandStore()
const editorStore = useEditorStore()
const { deleteSection, duplicateSection } = useSectionLifecycle()
const { moveUp: _moveUp, moveDown: _moveDown } = useSectionInsert()

const sections = computed(() => sortByPosition(landStore.activeLand?.sections ?? []))
const isInteractive = computed(() => editorStore.isEditMode)

function selectSection(section: Section) {
  editorStore.setActiveSection(section, true)
}

function handleSectionClick(section: Section) {
  if (!isInteractive.value) return
  selectSection(section)
}

function moveUp(section: Section) { _moveUp(section.id) }
function moveDown(section: Section) { _moveDown(section.id) }

const contextMenu = ref<{ x: number; y: number; section: Section; idx: number } | null>(null)

function onContextMenu(e: MouseEvent, section: Section, idx: number) {
  if (!isInteractive.value) return
  contextMenu.value = { x: e.clientX, y: e.clientY, section, idx }
}

function closeContextMenu() {
  contextMenu.value = null
}
</script>

<template>
  <div>
    <div>
        <div
          v-for="(section, idx) in sections"
          :key="section.id"
          class="relative group"
          :class="isInteractive ? 'cursor-pointer' : ''"
          @click="handleSectionClick(section)"
          @contextmenu.prevent="onContextMenu($event, section, idx)"
        >
          <ErrorBoundary :key="section.id">
            <SectionRenderer :section="section" class="theme-section" style="font-family: var(--theme-font)" />
          </ErrorBoundary>

          <template v-if="isInteractive">
            <!-- Active / hover border -->
            <div
              class="absolute inset-0 border-1 transition-colors pointer-events-none rounded-xl"
              :class="editorStore.activeSection?.id === section.id
                ? 'border-blue-500'
                : 'border-transparent group-hover:border-blue-200'"
            />

            <!-- Action buttons: top-left corner -->
            <div class="section-actions absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="flex items-center gap-0.5 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-medium px-1.5 py-1 rounded-lg shadow-lg">
                <button
                  class="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/20 transition-colors"
                  @click.stop="handleSectionClick(section)"
                >
                  <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>

                <template v-if="section.type !== 'header' && section.type !== 'footer'">
                  <div class="w-px h-3 bg-white/20 mx-0.5" />

                  <button
                    v-if="idx > 1"
                    title="Move up"
                    class="flex items-center justify-center w-5 h-5 rounded hover:bg-white/20 transition-colors"
                    @click.stop="moveUp(section)"
                  >
                    <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>
                  </button>

                  <button
                    v-if="idx < sections.length - 2"
                    title="Move down"
                    class="flex items-center justify-center w-5 h-5 rounded hover:bg-white/20 transition-colors"
                    @click.stop="moveDown(section)"
                  >
                    <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
                  </button>

                  <div class="w-px h-3 bg-white/20 mx-0.5" />

                  <button
                    title="Duplicate"
                    class="flex items-center justify-center w-5 h-5 rounded hover:bg-white/20 transition-colors"
                    @click.stop="duplicateSection(section.id)"
                  >
                    <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>

                  <button
                    title="Delete"
                    class="flex items-center justify-center w-5 h-5 rounded hover:bg-red-500/80 transition-colors"
                    @click.stop="deleteSection(section.id)"
                  >
                    <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </template>
              </div>
            </div>
          </template>
        </div>

        <div v-if="sections.length === 0" class="flex items-center justify-center h-64 text-sm text-gray-400">
          No sections yet. Add one from the editor panel.
        </div>
      </div>

      <Teleport to="body">
        <BaseContextMenu
          v-if="contextMenu"
          :x="contextMenu.x"
          :y="contextMenu.y"
          :locked="contextMenu.section.type === 'header' || contextMenu.section.type === 'footer'"
          :can-move-up="contextMenu.idx > 1 && sections[contextMenu.idx - 1]?.type !== 'header'"
          :can-move-down="contextMenu.idx < sections.length - 2 && sections[contextMenu.idx + 1]?.type !== 'footer'"
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
