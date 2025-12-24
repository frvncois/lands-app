<script setup lang="ts">
/**
 * PAGE EDITOR
 *
 * Three-panel layout:
 * - Left: Expandable section tree
 * - Center: Canvas preview
 * - Right: Style inspector
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/editor'
import SectionList from './SectionList.vue'
import SectionRenderer from './SectionRenderer.vue'
import StyleInspector from './StyleInspector.vue'
import AddSectionMenu from './AddSectionMenu.vue'
import Icon from '@/components/ui/Icon.vue'

const editor = useEditorStore()

// Canvas ref for viewport height measurement
const canvasRef = ref<HTMLElement | null>(null)

// Update --canvas-vh CSS variable based on canvas height
function updateCanvasViewportHeight() {
  if (!canvasRef.value) return
  canvasRef.value.style.setProperty(
    '--canvas-vh',
    `${canvasRef.value.clientHeight}px`
  )
}

const sections = computed(() => editor.sections)
const selectedId = computed(() => editor.selectedSectionId)
const previewMode = computed(() => editor.previewMode)

// Canvas container classes based on preview mode
const canvasClasses = computed(() => {
  return previewMode.value === 'mobile'
    ? 'max-w-[375px] transition-all duration-300'  // iPhone width
    : 'max-w-5xl transition-all duration-300'      // Desktop width
})

// Generate CSS variables for the preview container
const previewStyle = computed(() => {
  const tokens = editor.theme.tokens
  return {
    // CSS Variables
    '--color-bg': tokens.colors.background,
    '--color-fg': tokens.colors.foreground,
    '--color-primary': tokens.colors.primary,
    '--color-primary-fg': tokens.colors.primaryForeground,
    '--color-secondary': tokens.colors.secondary,
    '--color-secondary-fg': tokens.colors.secondaryForeground,
    '--color-muted': tokens.colors.muted,
    '--color-muted-fg': tokens.colors.mutedForeground,
    '--color-accent': tokens.colors.accent,
    '--color-accent-fg': tokens.colors.accentForeground,
    '--color-border': tokens.colors.border,
    '--font-heading': tokens.fonts.heading,
    '--font-body': tokens.fonts.body,
    '--font-mono': tokens.fonts.mono || 'monospace',
    '--text-xs': tokens.fontScale.xs,
    '--text-sm': tokens.fontScale.sm,
    '--text-base': tokens.fontScale.base,
    '--text-lg': tokens.fontScale.lg,
    '--text-xl': tokens.fontScale.xl,
    '--text-2xl': tokens.fontScale['2xl'],
    '--text-3xl': tokens.fontScale['3xl'],
    '--text-4xl': tokens.fontScale['4xl'],
    '--text-5xl': tokens.fontScale['5xl'],
    '--spacing-section': tokens.spacing.section,
    '--spacing-container': tokens.spacing.container,
    '--spacing-xs': tokens.spacing.xs,
    '--spacing-sm': tokens.spacing.sm,
    '--spacing-md': tokens.spacing.md,
    '--spacing-lg': tokens.spacing.lg,
    '--spacing-xl': tokens.spacing.xl,
    '--spacing-2xl': tokens.spacing['2xl'],
    '--radius-none': tokens.radius.none,
    '--radius-sm': tokens.radius.sm,
    '--radius-md': tokens.radius.md,
    '--radius-lg': tokens.radius.lg,
    '--radius-xl': tokens.radius.xl,
    '--radius-full': tokens.radius.full,
    '--btn-radius': tokens.button.borderRadius,
    '--btn-px': tokens.button.paddingX,
    '--btn-py': tokens.button.paddingY,
    '--btn-weight': tokens.button.fontWeight,
    // Direct styles
    'backgroundColor': tokens.colors.background,
    'color': tokens.colors.foreground,
    'fontFamily': tokens.fonts.body,
  }
})

// Keyboard shortcuts
function handleKeydown(e: KeyboardEvent) {
  // Undo: Cmd/Ctrl + Z
  if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    editor.undo()
  }

  // Redo: Cmd/Ctrl + Shift + Z
  if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
    e.preventDefault()
    editor.redo()
  }

  // Delete: Backspace or Delete
  if ((e.key === 'Backspace' || e.key === 'Delete') && selectedId.value) {
    if (document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA') {
      e.preventDefault()
      editor.removeSection(selectedId.value)
    }
  }

  // Navigate: Arrow keys
  if (e.key === 'ArrowUp' && !e.metaKey && !e.ctrlKey) {
    if (document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA') {
      e.preventDefault()
      editor.selectPreviousSection()
    }
  }

  if (e.key === 'ArrowDown' && !e.metaKey && !e.ctrlKey) {
    if (document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA') {
      e.preventDefault()
      editor.selectNextSection()
    }
  }

  // Escape: Deselect
  if (e.key === 'Escape') {
    editor.selectSection(null)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  updateCanvasViewportHeight()
  window.addEventListener('resize', updateCanvasViewportHeight)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', updateCanvasViewportHeight)
})

function handleCanvasClick() {
  editor.selectSection(null)
}
</script>

<template>
  <div class="grid grid-cols-[260px_1fr_260px] h-full">
    <!-- Left Sidebar: Sections -->
    <aside class="flex flex-col bg-sidebar-background border-r border-border overflow-hidden">
      <SectionList />
    </aside>

    <!-- Canvas -->
    <main ref="canvasRef" data-canvas-root class="overflow-y-auto" @click="handleCanvasClick">
      <div class="p-6">
        <div class="page-editor__preview w-full mx-auto rounded-lg shadow-lg min-h-[calc(100vh-theme(spacing.32))]" :class="canvasClasses" :style="previewStyle">
          <div v-if="sections.length === 0" class="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.32))] text-muted-foreground text-center p-12 font-sans">
            <Icon name="layout-container" :size="48" />
            <h3 class="text-lg font-semibold text-background mt-6">Start building your page</h3>
            <p class="text-sm mb-6">Add sections to create your landing page</p>
            <AddSectionMenu />
          </div>

          <template v-else>
            <SectionRenderer
              v-for="section in sections"
              :key="section.id"
              :section="section"
              :is-selected="selectedId === section.id"
              :is-editing="true"
              @select="editor.selectSection(section.id)"
            />
          </template>
        </div>
      </div>
    </main>

    <!-- Right Sidebar: Style -->
    <aside class="flex flex-col bg-sidebar-background border-l border-border overflow-hidden">
      <StyleInspector />
    </aside>
  </div>
</template>
