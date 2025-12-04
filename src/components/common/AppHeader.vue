<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useEditorStore } from '@/stores/editor'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const projectsStore = useProjectsStore()
const editorStore = useEditorStore()
const userStore = useUserStore()

const showProjectDropdown = ref(false)
const isPublishing = ref(false)

// Check if we're in a project context
const isProjectRoute = computed(() => !!route.params.projectId)
const isEditorRoute = computed(() => route.name === 'editor')
const projectId = computed(() => route.params.projectId as string | undefined)

// Get current project
const currentProject = computed(() => {
  if (!projectId.value) return null
  return projectsStore.getProjectById(projectId.value)
})

// Get route title for non-project routes
const routeTitle = computed(() => {
  switch (route.name) {
    case 'dashboard':
      const firstName = userStore.user?.name?.split(' ')[0] || 'there'
      return `Hello ${firstName}`
    case 'account':
      return 'Account'
    default:
      return ''
  }
})

// Get project page title
const projectPageTitle = computed(() => {
  switch (route.name) {
    case 'editor':
      return 'Editor'
    case 'settings':
      return 'Settings'
    case 'analytics':
      return 'Analytics'
    case 'integration':
      return 'Integration'
    default:
      return 'Editor'
  }
})

// Save status
const saveStatus = computed(() => {
  if (editorStore.isSaving) return 'Saving...'
  if (editorStore.hasUnsavedChanges) return 'Unsaved changes'
  return 'Saved'
})

const saveStatusDotClass = computed(() => {
  if (editorStore.isSaving) return 'bg-muted-foreground'
  if (editorStore.hasUnsavedChanges) return 'bg-amber-500'
  return 'bg-green-500'
})

function getProjectInitial(title: string) {
  return title.charAt(0).toUpperCase()
}

function getInitials(name: string) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function handlePreview() {
  if (currentProject.value) {
    window.open(`https://${currentProject.value.slug}.lands.app`, '_blank')
  }
}

async function handlePublish() {
  if (!projectId.value || isPublishing.value) return

  isPublishing.value = true

  try {
    // First save any unsaved changes
    if (editorStore.hasUnsavedChanges) {
      const saved = await editorStore.saveProject()
      if (!saved) {
        isPublishing.value = false
        return
      }
    }

    // Ensure content is loaded in the store
    if (!projectsStore.getProjectContent(projectId.value)) {
      await projectsStore.fetchProjectContent(projectId.value)
    }

    // Publish (or republish) the project
    await projectsStore.publishProject(projectId.value)
  } finally {
    isPublishing.value = false
  }
}

async function handleSave() {
  if (!editorStore.hasUnsavedChanges && !editorStore.isSaving) {
    console.log('No changes to save')
    return
  }

  const success = await editorStore.saveProject()
  if (!success) {
    console.error('Failed to save project')
  }
}
</script>

<template>
  <header class="relative flex items-center justify-between h-14 px-6 bg-sidebar-background border-b border-border">
    <!-- Project Route Header -->
    <template v-if="isProjectRoute && currentProject">
      <!-- Left: Page Title + Project Selector -->
      <div class="flex items-center gap-4">
        <!-- Project Dropdown -->
        <div class="relative">
          <button
            class="flex items-center gap-3 px-1.5 py-1.5 rounded-xl transition-colors text-left bg-sidebar-accent hover:bg-muted w-72"
            @click="showProjectDropdown = !showProjectDropdown"
          >
            <div class="w-6 h-6 shrink-0 rounded bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
              {{ getProjectInitial(currentProject.title) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground truncate leading-none">{{ currentProject.title }}</p>
              <p class="text-[10px] text-muted-foreground leading-none">{{ currentProject.slug }}.lands.app</p>
            </div>
            <svg
              class="w-3 h-3 mr-1.5 shrink-0 text-muted-foreground transition-transform"
              :class="{ 'rotate-180': showProjectDropdown }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showProjectDropdown"
            class="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 py-2"
          >
            <!-- Project Info -->
            <div class="px-3 py-2 border-b border-border">
              <p class="text-xs text-muted-foreground mb-1">Project URL</p>
              <p class="text-sm font-medium text-foreground">{{ currentProject.slug }}.lands.app</p>
            </div>

            <!-- Project Stats -->
            <div class="px-3 py-2 border-b border-border">
              <p class="text-xs text-muted-foreground mb-2">Status</p>
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full"
                  :class="currentProject.isPublished
                    ? 'bg-green-500/10 text-green-600'
                    : 'bg-muted text-muted-foreground'"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="currentProject.isPublished ? 'bg-green-500' : 'bg-muted-foreground'"
                  ></span>
                  {{ currentProject.isPublished ? 'Published' : 'Draft' }}
                </span>
                <span class="text-xs text-muted-foreground">{{ currentProject.plan }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="px-1 py-1">
              <button
                class="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                @click="showProjectDropdown = false"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Project Settings
              </button>
              <button
                class="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                @click="showProjectDropdown = false"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate Project
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Center: Viewport Toggle (Editor only) -->
      <div v-if="isEditorRoute" class="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 rounded-lg bg-secondary">
        <button
          class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
          :class="editorStore.viewport === 'desktop' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="editorStore.setViewport('desktop')"
        >
          Desktop
        </button>
        <button
          class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
          :class="editorStore.viewport === 'tablet' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="editorStore.setViewport('tablet')"
        >
          Tablet
        </button>
        <button
          class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
          :class="editorStore.viewport === 'mobile' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="editorStore.setViewport('mobile')"
        >
          Mobile
        </button>
      </div>

      <!-- Right: Save Status + Save + Preview + Publish -->
      <div class="flex items-center gap-3">
        <!-- Save Status & Button -->
        <button
          class="flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors"
          :class="editorStore.hasUnsavedChanges ? 'hover:bg-muted cursor-pointer' : 'cursor-default'"
          :disabled="editorStore.isSaving || !editorStore.hasUnsavedChanges"
          @click="handleSave"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="saveStatusDotClass"
          ></span>
          <span class="text-xs text-muted-foreground">{{ saveStatus }}</span>
        </button>

        <button
          class="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          @click="handlePreview"
        >
          Preview
        </button>
        <button
          class="px-4 py-1.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
          :disabled="isPublishing"
          @click="handlePublish"
        >
          <svg v-if="isPublishing" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isPublishing ? 'Publishing...' : (currentProject?.isPublished ? 'Update' : 'Publish') }}
        </button>
      </div>
    </template>

    <!-- Default Route Header (Dashboard, Account, etc.) -->
    <template v-else>
      <!-- Left: Page Title -->
      <div class="flex items-center gap-4">
        <h1 class="text-sm text-foreground">{{ routeTitle }}</h1>
      </div>

      <!-- Right: User -->
      <div class="flex items-center gap-3">
        <button class="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>
    </template>
  </header>

  <!-- Click outside to close dropdown -->
  <div
    v-if="showProjectDropdown"
    class="fixed inset-0 z-40"
    @click="showProjectDropdown = false"
  ></div>
</template>
