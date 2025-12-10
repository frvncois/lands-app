<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import EditorSidebar from '@/components/builder/EditorSidebar.vue'
import EditorPreview from '@/components/builder/EditorPreview.vue'
import EditorInspector from '@/components/builder/EditorInspector.vue'

const route = useRoute()
const editorStore = useEditorStore()

// Keyboard shortcuts handler
function handleKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  const tagName = target.tagName.toLowerCase()
  const isEditable = target.isContentEditable
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select'

  // Get meta key (CMD on Mac, Ctrl on Windows)
  const metaKey = e.metaKey || e.ctrlKey

  // CMD+S - Save project (works everywhere)
  if (metaKey && e.key === 's') {
    e.preventDefault()
    if (editorStore.hasUnsavedChanges && !editorStore.isSaving) {
      editorStore.saveProject()
    }
    return
  }

  // CMD+Z - Undo (works everywhere)
  if (metaKey && !e.shiftKey && e.key === 'z') {
    e.preventDefault()
    editorStore.undo()
    return
  }

  // CMD+SHIFT+Z - Redo (works everywhere)
  if (metaKey && e.shiftKey && e.key === 'z') {
    e.preventDefault()
    editorStore.redo()
    return
  }

  // Don't handle other shortcuts when in input fields or contenteditable
  if (isInput || isEditable) return

  const selectedBlock = editorStore.selectedBlock

  // Don't allow keyboard shortcuts on protected blocks:
  // - Children inside list/collection items
  // - List/collection items themselves (Stack in Grid)
  // - Header/footer stacks (Start, Middle, End)
  const isInsideListItem = selectedBlock ? editorStore.isChildInsideListItem(selectedBlock.id) : false
  const isListItem = selectedBlock ? editorStore.isListCollectionItem(selectedBlock.id) : false
  const isHeaderFooterStack = selectedBlock ? editorStore.isHeaderFooterChild(selectedBlock.id) : false
  const isBlockProtected = isInsideListItem || isListItem || isHeaderFooterStack

  // Delete - Delete selected block (not for text/heading which need delete for editing)
  // Also blocked for children inside list items and header/footer stacks
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedBlock && !isBlockProtected && selectedBlock.type !== 'text' && selectedBlock.type !== 'heading') {
      e.preventDefault()
      editorStore.deleteBlock(selectedBlock.id)
    }
    return
  }

  // CMD+D - Duplicate selected block (blocked for protected blocks)
  if (metaKey && e.key === 'd') {
    if (selectedBlock && !isBlockProtected) {
      e.preventDefault()
      editorStore.duplicateBlock(selectedBlock.id)
    }
    return
  }

  // CMD+C - Copy selected block (blocked for protected blocks)
  if (metaKey && e.key === 'c') {
    if (selectedBlock && !isBlockProtected) {
      e.preventDefault()
      editorStore.copyBlock(selectedBlock.id)
    }
    return
  }

  // CMD+V - Paste block (blocked when inside protected areas)
  if (metaKey && e.key === 'v') {
    if (editorStore.hasClipboardBlock && !isBlockProtected) {
      e.preventDefault()
      editorStore.pasteBlock()
    }
    return
  }
}

// Register keyboard listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

// Load project when route changes
watch(
  () => route.params.projectId as string,
  async (projectId) => {
    if (projectId) {
      // Save current project before switching (if there's unsaved changes)
      if (editorStore.currentProjectId && editorStore.hasUnsavedChanges) {
        await editorStore.saveProject()
      }
      // Load the new project
      await editorStore.loadProject(projectId)
    }
  },
  { immediate: true }
)

// Cleanup before leaving the editor
onBeforeUnmount(() => {
  // Remove keyboard listener
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="flex h-full">
    <EditorSidebar />
    <EditorPreview />
    <EditorInspector />
  </div>
</template>
