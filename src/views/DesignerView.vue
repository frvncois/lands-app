<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useDesignerStore } from '@/stores/designer'
import { useUserStore } from '@/stores/user'
import { canHaveChildren } from '@/lib/designer-utils'
import DesignerSidebar from '@/components/builder/DesignerSidebar.vue'
import DesignerPreview from '@/components/builder/DesignerPreview.vue'
import DesignerInspector from '@/components/builder/DesignerInspector.vue'

const route = useRoute()
const designerStore = useDesignerStore()
const userStore = useUserStore()

// Ref to DesignerPreview for thumbnail generation
const editorPreviewRef = ref<InstanceType<typeof DesignerPreview> | null>(null)

/**
 * Save project with thumbnail generation
 * Generates thumbnail in background, doesn't block the save
 */
async function saveProjectWithThumbnail() {
  if (!designerStore.hasUnsavedChanges || designerStore.isSaving) return

  // Start the save immediately
  designerStore.saveProject()

  // Generate thumbnail in background (don't await - let it complete async)
  const previewElement = editorPreviewRef.value?.getPreviewElement()
  if (previewElement && designerStore.currentProjectId && userStore.authUser?.id) {
    // Dynamic import to avoid loading screenshot library until needed
    import('@/lib/thumbnail').then(({ generateAndUploadThumbnail }) => {
      generateAndUploadThumbnail(
        previewElement,
        designerStore.currentProjectId!,
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
    designerStore.undo()
    return
  }

  // CMD+SHIFT+Z - Redo (works everywhere)
  if (metaKey && e.shiftKey && e.key === 'z') {
    e.preventDefault()
    designerStore.redo()
    return
  }

  // Don't handle other shortcuts when in input fields or contenteditable
  if (isInput || isEditable) return

  const selectedBlock = designerStore.selectedBlock

  // Check if block is protected (none currently)
  const isBlockProtected = false

  // Delete - Delete selected block
  // Blocked for children inside list items and header/footer stacks
  // Note: If user is in typing mode (contentEditable), we already returned at line 46
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedBlock && !isBlockProtected) {
      e.preventDefault()
      designerStore.deleteBlock(selectedBlock.id)
    }
    return
  }

  // CMD+D - Duplicate selected block (blocked for protected blocks)
  if (metaKey && e.key === 'd') {
    if (selectedBlock && !isBlockProtected) {
      e.preventDefault()
      designerStore.duplicateBlock(selectedBlock.id)
    }
    return
  }

  // CMD+C - Copy selected block (blocked for protected blocks)
  if (metaKey && e.key === 'c') {
    if (selectedBlock && !isBlockProtected) {
      e.preventDefault()
      designerStore.copyBlock(selectedBlock.id)
    }
    return
  }

  // CMD+V - Paste block (blocked when inside protected areas)
  // If selected block can have children (container, stack, grid) → paste inside it
  // If selected block cannot have children (text, image, etc.) → paste as sibling
  if (metaKey && e.key === 'v') {
    if (designerStore.hasClipboardBlock && !isBlockProtected) {
      e.preventDefault()
      let parentId: string | undefined
      if (selectedBlock) {
        // If selected block can have children, paste inside it
        // Otherwise paste as sibling (in same parent)
        parentId = canHaveChildren(selectedBlock.type)
          ? selectedBlock.id
          : designerStore.findParentBlock(selectedBlock.id)?.id
      }
      designerStore.pasteBlock(parentId)
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
      if (designerStore.currentProjectId && designerStore.hasUnsavedChanges) {
        // Save and generate thumbnail before switching projects
        await saveProjectWithThumbnail()
      }
      // Load the new project
      await designerStore.loadProject(projectId)
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
    <DesignerSidebar />
    <DesignerPreview ref="editorPreviewRef" />
    <DesignerInspector />
  </div>
</template>
