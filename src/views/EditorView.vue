<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import EditorSidebar from '@/components/builder/EditorSidebar.vue'
import EditorPreview from '@/components/builder/EditorPreview.vue'
import EditorInspector from '@/components/builder/EditorInspector.vue'

const route = useRoute()
const editorStore = useEditorStore()

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

// Save and cleanup before leaving the editor
onBeforeUnmount(async () => {
  // Cancel any pending auto-save
  editorStore.cancelAutoSave()

  // Save if there are unsaved changes
  if (editorStore.hasUnsavedChanges) {
    await editorStore.saveProject()
  }
})
</script>

<template>
  <div class="flex h-full">
    <EditorSidebar />
    <EditorPreview />
    <EditorInspector />
  </div>
</template>
