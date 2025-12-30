<script setup lang="ts">
/**
 * DESIGNER VIEW
 * Main editor view using the new section-based PageEditor
 */

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from '@/stores/toast'
import { useTourStore } from '@/stores/tour'
import PageEditor from '@/components/editor/PageEditor.vue'
import { TourProvider } from '@/components/tour'
import LandsLogo from '@/assets/LandsLogo.vue'
import { applyTheme, getDefaultTheme } from '@/lib/themes'

const route = useRoute()
const editor = useEditorStore()
const projects = useProjectsStore()
const toast = useToast()
const tour = useTourStore()

const isSaving = ref(false)
const isPublishing = ref(false)
const isLoading = ref(true)

// Get current project
const currentProject = computed(() => {
  const projectId = route.params.projectId as string
  return projectId ? projects.getProjectById(projectId) : null
})

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
      isLoading.value = true

      // Fetch project content from database
      const content = await projects.fetchProjectContent(projectId)
      if (content) {
        // Initialize editor with the fetched content
        editor.initializeEditor(content, projectId)

        // Small delay to ensure smooth transition
        setTimeout(() => {
          isLoading.value = false
        }, 300)

        // Check and start tour for new projects
        const shouldShowTour = await tour.checkTourStatus(projectId)
        if (shouldShowTour) {
          // Delay tour start to ensure UI is fully rendered
          setTimeout(() => {
            tour.startTour(projectId)
          }, 1100)
        }
      } else {
        isLoading.value = false
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
  <!-- Loading Screen -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    leave-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-6">
        <!-- Logo with spinning ring -->
        <div class="relative">
          <!-- Spinning ring -->
          <div class="absolute inset-0 -m-4">
            <svg class="w-24 h-24 animate-spin" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-dasharray="70 200"
                stroke-linecap="round"
                class="text-white/30"
              />
            </svg>
          </div>
          <!-- Logo -->
          <div class="w-16 h-16 flex items-center justify-center text-white">
            <LandsLogo />
          </div>
        </div>

        <!-- Loading text -->
        <div class="text-center">
          <p class="text-white/90 text-sm font-medium">
            Loading {{ currentProject?.title || 'project' }}
          </p>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Editor -->
  <PageEditor v-show="!isLoading" />
  <TourProvider />
</template>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1.5s linear infinite;
}
</style>
