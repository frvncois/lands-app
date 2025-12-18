<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import { useUserStore } from '@/stores/user'
import EditorSidebar from '@/components/builder/EditorSidebar.vue'
import EditorPreview from '@/components/builder/EditorPreview.vue'
import EditorInspector from '@/components/builder/EditorInspector.vue'

const route = useRoute()
const editorStore = useEditorStore()
const userStore = useUserStore()

// Ref to EditorPreview for thumbnail generation
const editorPreviewRef = ref<InstanceType<typeof EditorPreview> | null>(null)

/**
 * Save project with thumbnail generation
 * Generates thumbnail in background, doesn't block the save
 */
async function saveProjectWithThumbnail() {
  if (!editorStore.hasUnsavedChanges || editorStore.isSaving) return

  // Start the save immediately
  editorStore.saveProject()

  // Generate thumbnail in background (don't await - let it complete async)
  const previewElement = editorPreviewRef.value?.getPreviewElement()
  if (previewElement && editorStore.currentProjectId && userStore.authUser?.id) {
    // Dynamic import to avoid loading screenshot library until needed
    import('@/lib/thumbnail').then(({ generateAndUploadThumbnail }) => {
      generateAndUploadThumbnail(
        previewElement,
        editorStore.currentProjectId!,
        userStore.authUser!.id
      ).catch((err) => {
        console.warn('[Thumbnail] Background generation failed:', err)
      })
    }).catch((err) => {
      console.warn('[Thumbnail] Failed to load thumbnail module:', err)
    })
  }
}

// Keyboard shortcuts handler
function handleKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  const tagName = target.tagName.toLowerCase()
  const isEditable = target.isContentEditable
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select'

  // Get meta key (CMD on Mac, Ctrl on Windows)
  const metaKey = e.metaKey || e.ctrlKey

  // CMD+S - Save project with thumbnail (works everywhere)
  if (metaKey && e.key === 's') {
    e.preventDefault()
    saveProjectWithThumbnail()
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

  // Check if block is protected (none currently)
  const isBlockProtected = false

  // Delete - Delete selected block
  // Blocked for children inside list items and header/footer stacks
  // Note: If user is in typing mode (contentEditable), we already returned at line 46
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedBlock && !isBlockProtected) {
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
        // Save and generate thumbnail before switching projects
        await saveProjectWithThumbnail()
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
    <EditorPreview ref="editorPreviewRef" />
    <EditorInspector />
  </div>
</template>
