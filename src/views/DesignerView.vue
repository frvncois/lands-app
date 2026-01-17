<script setup lang="ts">
/**
 * DESIGNER VIEW
 * Main editor view using the new section-based PageEditor
 */

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from '@/stores/toast'
import { useTourStore } from '@/stores/tour'
import PageEditor from '@/components/editor/PageEditor.vue'
import { TourProvider } from '@/components/tour'
import LandsLogo from '@/assets/LandsLogo.vue'
import { applyTheme, getDefaultTheme } from '@/lib/themes'
import { ConfirmModal } from '@/components/ui/Modal'
import type { RouteLocationNormalized } from 'vue-router'

const route = useRoute()
const router = useRouter()
const editor = useEditorStore()
const projects = useProjectsStore()
const toast = useToast()
const tour = useTourStore()

const isSaving = ref(false)
const isPublishing = ref(false)
const isLoading = ref(true)
const showUnsavedModal = ref(false)
const pendingNavigation = ref<RouteLocationNormalized | null>(null)

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

// Load project when route changes
watch(
  () => route.params.projectId as string,
  async (projectId, _, onCleanup) => {
    if (!projectId) return

    // Track if this watch has been superseded
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })

    isLoading.value = true

    // Fetch project content from database
    const content = await projects.fetchProjectContent(projectId)

    // CRITICAL: Abort if user navigated away during fetch
    if (cancelled) {
      return
    }

    if (content) {
      // Initialize editor with the fetched content
      editor.initializeEditor(content, projectId)

      // Small delay to ensure smooth transition
      setTimeout(() => {
        if (cancelled) return
        isLoading.value = false
      }, 300)

      // Check and start tour for new projects
      const shouldShowTour = await tour.checkTourStatus(projectId)
      if (shouldShowTour && !cancelled) {
        // Delay tour start to ensure UI is fully rendered
        setTimeout(() => {
          if (!cancelled) {
            tour.startTour(projectId)
          }
        }, 1100)
      }
    } else {
      if (!cancelled) {
        isLoading.value = false
      }
    }
  },
  { immediate: true }
)

// ============================================
// UNSAVED CHANGES WARNING
// ============================================

// Warn when navigating away via Vue Router
onBeforeRouteLeave((to, from) => {
  if (editor.isDirty && !pendingNavigation.value) {
    // Store navigation target and show modal
    pendingNavigation.value = to
    showUnsavedModal.value = true
    // Block navigation initially
    return false
  }
  // If pendingNavigation is set, user confirmed - clear it and allow
  if (pendingNavigation.value) {
    pendingNavigation.value = null
  }
  // Allow navigation if no unsaved changes or already confirmed
  return true
})

// Handle user confirmation to leave despite unsaved changes
function handleConfirmLeave() {
  showUnsavedModal.value = false
  if (pendingNavigation.value) {
    const target = pendingNavigation.value
    // Don't clear pendingNavigation here - let the guard handle it
    // This prevents the guard from triggering the modal again
    router.push(target)
  }
}

// Handle user cancellation (stay on page)
function handleCancelLeave() {
  showUnsavedModal.value = false
  pendingNavigation.value = null
}

// Warn when closing browser tab or refreshing
function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (editor.isDirty) {
    e.preventDefault()
    e.returnValue = '' // Required for Chrome
  }
}

// Apply default theme on mount and add event listeners
onMounted(() => {
  applyTheme(getDefaultTheme())
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// Cleanup
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('beforeunload', handleBeforeUnload)
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

  <!-- Unsaved Changes Modal -->
  <ConfirmModal
    :open="showUnsavedModal"
    title="Unsaved Changes"
    message="You have unsaved changes. Are you sure you want to leave?"
    variant="warning"
    confirm-text="Leave"
    cancel-text="Stay"
    @confirm="handleConfirmLeave"
    @update:open="(value) => !value && handleCancelLeave()"
  />
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
