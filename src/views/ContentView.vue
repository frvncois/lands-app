<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useDesignerStore } from '@/stores/designer'
import ContentEditor from '@/components/content/ContentEditor.vue'
import ContentPreview from '@/components/content/ContentPreview.vue'

const route = useRoute()
const designerStore = useDesignerStore()

// Keyboard shortcuts handler (simplified for content view)
function handleKeyDown(e: KeyboardEvent) {
  const metaKey = e.metaKey || e.ctrlKey

  // CMD+S - Save project
  if (metaKey && e.key === 's') {
    e.preventDefault()
    if (designerStore.hasUnsavedChanges && !designerStore.isSaving) {
      designerStore.saveProject()
    }
    return
  }

  // CMD+Z - Undo
  if (metaKey && !e.shiftKey && e.key === 'z') {
    e.preventDefault()
    designerStore.undo()
    return
  }

  // CMD+SHIFT+Z - Redo
  if (metaKey && e.shiftKey && e.key === 'z') {
    e.preventDefault()
    designerStore.redo()
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
        await designerStore.saveProject()
      }
      // Load the new project
      await designerStore.loadProject(projectId)
    }
  },
  { immediate: true }
)

// Cleanup before leaving
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="flex h-full">
    <ContentEditor class="w-[400px] flex-shrink-0 border-r border-sidebar-border" />
    <ContentPreview class="flex-1" />
  </div>
</template>
