<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useDesignerStore } from '@/stores/designer'
import { useUserStore } from '@/stores/user'
import { connectionState } from '@/lib/supabase'
import { Button, Command, Dropdown, Icon, Avatar, Badge } from '@/components/ui'
import LandsLogo from '@/assets/LandsLogo.vue'
import ProjectTranslate from '@/components/modal/ProjectTranslate.vue'
import ProjectPublished from '@/components/modal/ProjectPublished.vue'
import ProjectCreateWizard from '@/components/modal/ProjectCreateWizard/index.vue'
import AIAssistant from '@/components/modal/AIAssistant.vue'
import { getLanguageByCode } from '@/lib/languages'
import type { LanguageCode } from '@/types/designer'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const designerStore = useDesignerStore()
const userStore = useUserStore()

// Fetch projects on mount if not already loaded
onMounted(() => {
  if (projectsStore.projects.length === 0) {
    projectsStore.fetchProjects()
  }
})

const showCommand = ref(false)
const isPublishing = ref(false)
const showTranslateModal = ref(false)
const showPublishedModal = ref(false)
const showNewProjectModal = ref(false)
const showAIModal = ref(false)
const projectDropdownRef = ref<{ close: () => void } | null>(null)
const userDropdownRef = ref<{ close: () => void } | null>(null)

// User info
const user = computed(() => userStore.settings.profile)
const userEmail = computed(() => userStore.authUser?.email || '')
const userInitial = computed(() => {
  if (user.value?.name) return user.value.name.charAt(0).toUpperCase()
  if (userEmail.value) return userEmail.value.charAt(0).toUpperCase()
  return '?'
})

// Translation helpers
const currentLanguageDisplay = computed(() => {
  if (!designerStore.currentLanguage) {
    const defaultLang = getLanguageByCode(designerStore.translations.defaultLanguage)
    return defaultLang ? `Default (${defaultLang.name})` : 'Default'
  }
  const lang = getLanguageByCode(designerStore.currentLanguage)
  return lang ? lang.name : designerStore.currentLanguage
})

function handleLanguageChange(langCode: LanguageCode | null) {
  designerStore.setCurrentLanguage(langCode)
}

// Route checks
const isProjectRoute = computed(() => !!route.params.projectId)
const isDesignerRoute = computed(() => route.name === 'designer')
const isContentRoute = computed(() => route.name === 'content')
const isAnalyticsRoute = computed(() => route.name === 'analytics')
const isSettingsRoute = computed(() => route.name === 'settings')
const isEditorRoute = computed(() => isDesignerRoute.value || isContentRoute.value)
const projectId = computed(() => route.params.projectId as string | undefined)

// Close AI modal when leaving project routes
watch(isProjectRoute, (isProject) => {
  if (!isProject) {
    showAIModal.value = false
  }
})

// Get current project
const currentProject = computed(() => {
  if (!projectId.value) return null
  return projectsStore.getProjectById(projectId.value)
})

// Get all projects for the dropdown
const projects = computed(() => projectsStore.projects)

// Get project initial for avatar
function getProjectInitial(title: string) {
  return title.charAt(0).toUpperCase()
}

// Project route tabs
const projectTabs = computed(() => [
  { name: 'content', label: 'Edit', icon: 'app-content' },
  { name: 'designer', label: 'Style', icon: 'app-designer' },
  { name: 'analytics', label: 'Grow', icon: 'app-analytics' },
  { name: 'settings', label: 'Settings', icon: 'app-settings' },
])

function navigateToProjectRoute(routeName: string) {
  if (projectId.value) {
    router.push({ name: routeName, params: { projectId: projectId.value } })
  }
}

function switchToProject(newProjectId: string) {
  projectDropdownRef.value?.close()
  // Navigate to same route type but different project
  const currentRouteName = route.name as string
  const validRoutes = ['designer', 'content', 'analytics', 'settings']
  const targetRoute = validRoutes.includes(currentRouteName) ? currentRouteName : 'designer'
  router.push({ name: targetRoute, params: { projectId: newProjectId } })
}

// Command item type
interface CommandItem {
  id: string
  label: string
  icon: string
  group: string
  shortcut?: string[]
  action: () => void | Promise<unknown>
}

// Command items for search
const commandItems = computed(() => {
  const items: CommandItem[] = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: 'app-dashboard', group: 'Navigation', action: () => router.push({ name: 'dashboard' }) },
    { id: 'account', label: 'Account Settings', icon: 'app-user', group: 'Navigation', action: () => router.push({ name: 'account' }) },
  ]

  // Add all projects to navigation
  for (const project of projectsStore.projects) {
    items.push({
      id: `project-${project.id}`,
      label: project.title,
      icon: 'app-editor',
      group: 'Projects',
      action: () => router.push({ name: 'designer', params: { projectId: project.id } }),
    })
  }

  return items
})

// Connection state - only show issues if actually problematic
const isRecovering = computed(() => connectionState.value === 'recovering')
const isUnhealthy = computed(() => connectionState.value === 'unhealthy')

// Only show "Reconnecting" if it's taking a while (more than 2 seconds)
const showRecovering = ref(false)
let recoveringTimeout: ReturnType<typeof setTimeout> | null = null

watch(() => connectionState.value, (newState) => {
  if (newState === 'recovering') {
    recoveringTimeout = setTimeout(() => {
      showRecovering.value = true
    }, 2000)
  } else {
    if (recoveringTimeout) {
      clearTimeout(recoveringTimeout)
      recoveringTimeout = null
    }
    showRecovering.value = false
  }
}, { immediate: true })

// Save queue state from editor store
const isOffline = computed(() => designerStore.isOffline)
const isSyncing = computed(() => designerStore.isSyncingChanges)
const hasPendingChanges = computed(() => designerStore.hasPendingChanges)

// Save status dot class
const saveStatusDotClass = computed(() => {
  if (isOffline.value) return 'bg-red-500'
  if (isUnhealthy.value) return 'bg-red-500'
  if (showRecovering.value) return 'bg-amber-500 animate-pulse'
  if (isSyncing.value) return 'bg-blue-500 animate-pulse'
  if (designerStore.isSaving) return 'bg-muted-foreground animate-pulse'
  if (designerStore.hasUnsavedChanges || hasPendingChanges.value) return 'bg-amber-500'
  return 'bg-green-500'
})

// Can save: not offline, not recovering, and not already saving
const canSave = computed(() => !isOffline.value && !showRecovering.value && !designerStore.isSaving)

async function handlePublish() {
  if (!projectId.value || isPublishing.value) return

  isPublishing.value = true

  try {
    // First save any unsaved changes
    if (designerStore.hasUnsavedChanges) {
      const saved = await designerStore.saveProject()
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
    const success = await projectsStore.publishProject(projectId.value)
    if (success) {
      showPublishedModal.value = true
    }
  } finally {
    isPublishing.value = false
  }
}

async function handleSave() {
  if (!designerStore.hasUnsavedChanges && !designerStore.isSaving) {
    return
  }

  await designerStore.saveProject()
}

function handleCommandSelect() {
  // Action is called automatically by Command component
}

async function signOut() {
  userDropdownRef.value?.close()
  await userStore.signOut()
  router.push({ name: 'auth' })
}

function onProjectCreated(newProjectId: string) {
  router.push({ name: 'designer', params: { projectId: newProjectId } })
}
</script>

<template>
  <header class="flex items-center h-14 px-4 bg-sidebar-background border-b border-sidebar-border z-50">
    <!-- Left: Logo + Project/Page + Route Tabs -->
    <div class="flex items-center gap-3 flex-1">
      <!-- Logo -->
      <router-link :to="{ name: 'dashboard' }" class="flex items-center p-1 shrink-0">
        <LandsLogo class="w-6 h-6" />
      </router-link>

      <!-- Project Dropdown (when on project route) -->
      <template v-if="isProjectRoute && currentProject">
        <Dropdown ref="projectDropdownRef" align="left" width="min-w-64">
          <template #trigger="{ toggle }">
            <button
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors max-w-48"
              @click="toggle"
            >
              <span class="text-sm font-medium text-foreground truncate">{{ currentProject.title }}</span>
              <Icon name="chevron-down" :size="10" class="text-muted-foreground shrink-0" />
            </button>
          </template>

          <!-- Current project info -->
          <div class="px-3 py-2 border-b border-border">
            <div class="flex items-center gap-2">
              <div
                v-if="currentProject.thumbnail"
                class="w-8 h-8 rounded bg-cover bg-center shrink-0 border border-border"
                :style="{ backgroundImage: `url(${currentProject.thumbnail})` }"
              ></div>
              <div
                v-else
                class="w-8 h-8 rounded bg-secondary flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0"
              >
                {{ getProjectInitial(currentProject.title) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground truncate">{{ currentProject.title }}</p>
                <div class="flex items-center gap-1.5">
                  <Badge :variant="currentProject.isPublished ? 'success' : 'secondary'" size="xs" dot>
                    {{ currentProject.isPublished ? 'Published' : 'Draft' }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <!-- Other projects -->
          <div class="py-1">
            <p class="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Switch Project</p>
            <div class="max-h-48 overflow-y-auto">
              <button
                v-for="project in projects.filter(p => p.id !== currentProject?.id)"
                :key="project.id"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                @click="switchToProject(project.id)"
              >
                <div
                  v-if="project.thumbnail"
                  class="w-6 h-6 rounded bg-cover bg-center shrink-0 border border-border"
                  :style="{ backgroundImage: `url(${project.thumbnail})` }"
                ></div>
                <div
                  v-else
                  class="w-6 h-6 rounded bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0"
                >
                  {{ getProjectInitial(project.title) }}
                </div>
                <span class="flex-1 text-left truncate text-foreground">{{ project.title }}</span>
              </button>
            </div>
          </div>

          <Dropdown.Divider />
          <Dropdown.Item icon="plus" @click="projectDropdownRef?.close(); showNewProjectModal = true">
            New Project
          </Dropdown.Item>
        </Dropdown>

        <!-- Route Tabs -->
        <div class="flex items-center gap-1 ml-2">
          <button
            v-for="tab in projectTabs"
            :key="tab.name"
            class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
            :class="route.name === tab.name
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'"
            @click="navigateToProjectRoute(tab.name)"
          >
            {{ tab.label }}
          </button>
        </div>
      </template>

      <!-- Dashboard/Account label (when not on project route) -->
      <template v-else>
        <span class="text-sm font-medium text-foreground">
          {{ route.name === 'account' ? 'Account' : 'Dashboard' }}
        </span>
      </template>
    </div>

    <!-- Center: Editor Controls (only on Designer/Content routes) -->
    <div v-if="isProjectRoute && isEditorRoute" class="flex items-center gap-4">
      <!-- Undo/Redo Buttons -->
      <div class="flex items-center gap-1">
        <button
          class="p-1.5 rounded-md transition-colors"
          :class="designerStore.canUndo ? 'text-muted-foreground hover:text-foreground hover:bg-secondary' : 'text-muted-foreground/30 cursor-not-allowed'"
          :disabled="!designerStore.canUndo"
          title="Undo (⌘Z)"
          @click="designerStore.undo()"
        >
          <Icon name="app-undo" class="text-sm" />
        </button>
        <button
          class="p-1.5 rounded-md transition-colors"
          :class="designerStore.canRedo ? 'text-muted-foreground hover:text-foreground hover:bg-secondary' : 'text-muted-foreground/30 cursor-not-allowed'"
          :disabled="!designerStore.canRedo"
          title="Redo (⌘⇧Z)"
          @click="designerStore.redo()"
        >
          <Icon name="app-redo" class="text-sm" />
        </button>
      </div>

      <div class="h-5 w-px bg-border"></div>

      <!-- Viewport Toggle -->
      <div class="flex items-center gap-1 p-1 rounded-lg bg-secondary">
        <button
          class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
          :class="designerStore.viewport === 'desktop' ? 'bg-accent text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="designerStore.setViewport('desktop')"
        >
          Desktop
        </button>
        <button
          class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
          :class="designerStore.viewport === 'tablet' ? 'bg-accent text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="designerStore.setViewport('tablet')"
        >
          Tablet
        </button>
        <button
          class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
          :class="designerStore.viewport === 'mobile' ? 'bg-accent text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="designerStore.setViewport('mobile')"
        >
          Mobile
        </button>
      </div>

      <div class="h-5 w-px bg-border"></div>

      <!-- Language Selector -->
      <Dropdown width="min-w-48">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors whitespace-nowrap"
            @click="toggle"
          >
            <Icon name="globe-1" class="text-sm" />
            <span>{{ currentLanguageDisplay }}</span>
            <Icon name="chevron-down" :size="10" class="text-muted-foreground" />
          </button>
        </template>

        <!-- Default language option -->
        <Dropdown.Item @click="handleLanguageChange(null)">
          <span v-if="designerStore.currentLanguage === null" class="w-1.5 h-1.5 rounded-full bg-foreground shrink-0"></span>
          <span v-else class="w-1.5 h-1.5 shrink-0"></span>
          <span>Default ({{ getLanguageByCode(designerStore.translations.defaultLanguage)?.name }})</span>
        </Dropdown.Item>

        <!-- Translation languages -->
        <template v-if="designerStore.availableTranslations.length > 0">
          <Dropdown.Divider />
          <Dropdown.Item
            v-for="langCode in designerStore.availableTranslations"
            :key="langCode"
            @click="handleLanguageChange(langCode)"
          >
            <span v-if="designerStore.currentLanguage === langCode" class="w-1.5 h-1.5 rounded-full bg-foreground shrink-0"></span>
            <span v-else class="w-1.5 h-1.5 shrink-0"></span>
            <span>{{ getLanguageByCode(langCode)?.name }}</span>
          </Dropdown.Item>
        </template>

        <!-- Translation settings option -->
        <Dropdown.Divider />
        <Dropdown.Item icon="app-settings" @click="showTranslateModal = true">
          Translation Settings
        </Dropdown.Item>
      </Dropdown>
    </div>

    <!-- Right: Actions + User Menu -->
    <div class="flex items-center gap-3 flex-1 justify-end">
      <!-- Non-Project Route: Search -->
      <template v-if="!isProjectRoute">
        <Button variant="outline" size="sm" @click="showCommand = true">
          <Icon name="search-1" class="text-xs" />
          <span class="hidden sm:inline">Search...</span>
          <kbd class="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">
            <span>⌘</span><span>K</span>
          </kbd>
        </Button>
      </template>

      <!-- Project Route: AI Assistant + Save + Publish -->
      <template v-if="isProjectRoute && currentProject">
        <!-- AI Assistant Button -->
        <Button
          variant="outline"
          size="sm"
          @click="showAIModal = true"
        >
          <Icon name="app-ai" class="text-xs" />
          <span class="hidden lg:inline">AI Assistant</span>
        </Button>

        <!-- Collaborator Changes Alert -->
        <Button
          v-if="designerStore.hasCollaboratorChanges"
          variant="outline"
          size="sm"
          class="text-amber-600 border-amber-300 hover:bg-amber-50"
          @click="designerStore.reloadProjectContent()"
        >
          <Icon name="app-undo" class="text-xs" />
          Reload
        </Button>

        <!-- Save Button -->
        <Button
          variant="outline"
          size="sm"
          :disabled="!canSave || (!designerStore.hasUnsavedChanges && !hasPendingChanges)"
          @click="handleSave"
        >
          <span :class="['w-1.5 h-1.5 rounded-full shrink-0', saveStatusDotClass]"></span>
          <span v-if="isOffline">Offline</span>
          <span v-else-if="showRecovering">Reconnecting...</span>
          <span v-else-if="isUnhealthy">Connection Issue</span>
          <span v-else-if="isSyncing || designerStore.isSaving">Syncing...</span>
          <span v-else-if="designerStore.hasUnsavedChanges || hasPendingChanges">Save</span>
          <span v-else>Saved</span>
        </Button>

        <!-- Publish Button -->
        <Button size="sm" :loading="isPublishing" @click="handlePublish">
          {{ isPublishing ? 'Publishing...' : (currentProject?.isPublished ? 'Update' : 'Publish') }}
        </Button>
      </template>

      <!-- User Avatar Dropdown -->
      <Dropdown ref="userDropdownRef" align="right" width="min-w-48">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            @click="toggle"
          >
            {{ userInitial }}
          </button>
        </template>

        <!-- User info -->
        <div class="px-3 py-2 border-b border-border">
          <p class="text-sm font-medium text-foreground truncate">
            {{ user?.name || userEmail }}
          </p>
          <p v-if="user?.name" class="text-xs text-muted-foreground truncate">{{ userEmail }}</p>
        </div>

        <Dropdown.Item icon="app-dashboard" @click="userDropdownRef?.close(); router.push({ name: 'dashboard' })">
          Dashboard
        </Dropdown.Item>
        <Dropdown.Item icon="app-user" @click="userDropdownRef?.close(); router.push({ name: 'account' })">
          Account Settings
        </Dropdown.Item>

        <Dropdown.Divider />

        <Dropdown.Item icon="app-logout" @click="signOut">
          Sign Out
        </Dropdown.Item>
      </Dropdown>
    </div>
  </header>

  <!-- Command Palette (non-project routes only) -->
  <Command
    v-if="!isProjectRoute"
    v-model:open="showCommand"
    :items="commandItems"
    placeholder="Search commands, pages, projects..."
    @select="handleCommandSelect"
  />

  <!-- Translation Modal -->
  <ProjectTranslate v-model:open="showTranslateModal" />

  <!-- Published Modal -->
  <ProjectPublished
    v-if="currentProject"
    v-model:open="showPublishedModal"
    :project-id="currentProject.id"
    :project-slug="currentProject.slug"
    :custom-domain="currentProject.customDomain"
  />

  <!-- New Project Wizard -->
  <ProjectCreateWizard
    v-model:open="showNewProjectModal"
    @created="onProjectCreated"
  />

  <!-- AI Assistant Modal -->
  <AIAssistant v-model:open="showAIModal" />
</template>
