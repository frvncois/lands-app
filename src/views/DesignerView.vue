<script setup lang="ts">
/**
 * DESIGNER VIEW
 * Main editor view using the new section-based PageEditor
 */

import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from '@/stores/toast'
import PageEditor from '@/components/editor/PageEditor.vue'
import { applyTheme, getDefaultTheme } from '@/lib/themes'

const route = useRoute()
const editor = useEditorStore()
const projects = useProjectsStore()
const toast = useToast()

const isSaving = ref(false)
const isPublishing = ref(false)

// Save project content
async function saveProject() {
  const projectId = route.params.projectId as string
  if (!projectId || isSaving.value) return

  isSaving.value = true
  try {
    const content = editor.getPageContent()
    const success = await projects.saveProjectContent(projectId, content)
    if (success) {
      editor.isDirty = false
      toast.success('Saved', 'Project saved successfully')
    }
  } finally {
    isSaving.value = false
  }
}

// Publish project
async function publishProject() {
  const projectId = route.params.projectId as string
  if (!projectId || isPublishing.value) return

  isPublishing.value = true
  try {
    // Save first to ensure latest content is published
    const content = editor.getPageContent()
    await projects.saveProjectContent(projectId, content)
    editor.isDirty = false

    // Then publish
    await projects.publishProject(projectId)
  } finally {
    isPublishing.value = false
  }
}

// Keyboard shortcuts
function handleKeydown(e: KeyboardEvent) {
  // CMD/CTRL + S = Save
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault()
    saveProject()
  }
  // CMD/CTRL + P = Publish
  if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
    e.preventDefault()
    publishProject()
  }
}

// Apply default theme on mount
onMounted(() => {
  applyTheme(getDefaultTheme())
  window.addEventListener('keydown', handleKeydown)
})

// Load project when route changes
watch(
  () => route.params.projectId as string,
  async (projectId) => {
    if (projectId) {
      // Fetch project content from database
      const content = await projects.fetchProjectContent(projectId)
      if (content) {
        // Initialize editor with the fetched content
        editor.initializeEditor(content, projectId)
      }
    }
  },
  { immediate: true }
)

// Cleanup
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  editor.resetEditor()
})
</script>

<template>
  <PageEditor />
</template>
