<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useEditorStore } from '@/stores/editor'
import { useUserStore } from '@/stores/user'
import { connectionState } from '@/lib/supabase'
import { Button, Command, Dropdown, Icon, Avatar, Badge } from '@/components/ui'
import LandsLogo from '@/assets/LandsLogo.vue'
import ProjectTranslate from '@/components/modal/ProjectTranslate.vue'
import ProjectPublished from '@/components/modal/ProjectPublished.vue'
import ProjectCreate from '@/components/modal/ProjectCreate.vue'
import { getLanguageByCode } from '@/lib/languages'
import type { LanguageCode } from '@/types/editor'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const editorStore = useEditorStore()
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
const hoveredProjectId = ref<string | null>(null)
const hoveredProjectRect = ref<DOMRect | null>(null)
const isHoveringPopover = ref(false)
const userDropdownRef = ref<{ close: () => void } | null>(null)
let leaveTimeout: ReturnType<typeof setTimeout> | null = null

// Track hovered project position for popover
function handleProjectHover(projectId: string, event: MouseEvent) {
  if (leaveTimeout) {
    clearTimeout(leaveTimeout)
    leaveTimeout = null
  }
  hoveredProjectId.value = projectId
  const target = event.currentTarget as HTMLElement
  hoveredProjectRect.value = target.getBoundingClientRect()
}

function handleProjectLeave() {
  // Delay closing to allow mouse to reach popover
  leaveTimeout = setTimeout(() => {
    if (!isHoveringPopover.value) {
      hoveredProjectId.value = null
      hoveredProjectRect.value = null
    }
  }, 100)
}

function handlePopoverEnter() {
  if (leaveTimeout) {
    clearTimeout(leaveTimeout)
    leaveTimeout = null
  }
  isHoveringPopover.value = true
}

function handlePopoverLeave() {
  isHoveringPopover.value = false
  hoveredProjectId.value = null
  hoveredProjectRect.value = null
}

// Get popover position
const popoverStyle = computed(() => {
  if (!hoveredProjectRect.value) return {}
  return {
    top: `${hoveredProjectRect.value.top}px`,
    left: `${hoveredProjectRect.value.right + 8}px`,
  }
})

// User info
const user = computed(() => userStore.settings.profile)

// Close dropdown and navigate
function closeDropdownAndNavigate(routeName: string, params?: Record<string, string>) {
  userDropdownRef.value?.close()
  hoveredProjectId.value = null
  router.push({ name: routeName, params })
}

// Get project initial for avatar
function getProjectInitial(title: string) {
  return title.charAt(0).toUpperCase()
}

// Translation helpers
const currentLanguageDisplay = computed(() => {
  if (!editorStore.currentLanguage) {
    const defaultLang = getLanguageByCode(editorStore.translations.defaultLanguage)
    return defaultLang ? `Default (${defaultLang.name})` : 'Default'
  }
  const lang = getLanguageByCode(editorStore.currentLanguage)
  return lang ? lang.name : editorStore.currentLanguage
})

function handleLanguageChange(langCode: LanguageCode | null) {
  editorStore.setCurrentLanguage(langCode)
}

// Check if we're in a project context
const isProjectRoute = computed(() => !!route.params.projectId)
const isEditorRoute = computed(() => route.name === 'editor')
const projectId = computed(() => route.params.projectId as string | undefined)

// Get current project
const currentProject = computed(() => {
  if (!projectId.value) return null
  return projectsStore.getProjectById(projectId.value)
})

// Get current page name for dropdown display
const currentPageName = computed(() => {
  if (currentProject.value) {
    // On project routes, show project name + current section
    const section = route.name === 'editor' ? 'Editor'
      : route.name === 'analytics' ? 'Analytics'
      : route.name === 'settings' ? 'Settings'
      : ''
    return section ? `${currentProject.value.title} / ${section}` : currentProject.value.title
  }
  // Non-project routes
  switch (route.name) {
    case 'dashboard': return 'Dashboard'
    case 'account': return 'Account'
    default: return 'Lands'
  }
})

// Get all projects for the dropdown
const projects = computed(() => projectsStore.projects)

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
      action: () => router.push({ name: 'editor', params: { projectId: project.id } }),
    })
  }

  return items
})

// Connection state
const isRecovering = computed(() => connectionState.value === 'recovering')
const isUnhealthy = computed(() => connectionState.value === 'unhealthy')

// Save queue state from editor store
const isOffline = computed(() => editorStore.isOffline)
const isSyncing = computed(() => editorStore.isSyncingChanges)
const hasPendingChanges = computed(() => editorStore.hasPendingChanges)

// Save status dot class
const saveStatusDotClass = computed(() => {
  if (isOffline.value) return 'bg-red-500'
  if (isRecovering.value || isUnhealthy.value) return 'bg-amber-500 animate-pulse'
  if (isSyncing.value) return 'bg-blue-500 animate-pulse'
  if (editorStore.isSaving) return 'bg-muted-foreground animate-pulse'
  if (editorStore.hasUnsavedChanges || hasPendingChanges.value) return 'bg-amber-500'
  return 'bg-green-500'
})

// Can save: not offline, not recovering, and not already saving
const canSave = computed(() => !isOffline.value && !isRecovering.value && !editorStore.isSaving)

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
    const success = await projectsStore.publishProject(projectId.value)
    if (success) {
      showPublishedModal.value = true
    }
  } finally {
    isPublishing.value = false
  }
}

async function handleSave() {
  if (!editorStore.hasUnsavedChanges && !editorStore.isSaving) {
    return
  }

  await editorStore.saveProject()
}

function handleCommandSelect() {
  // Action is called automatically by Command component
}

async function signOut() {
  await userStore.signOut()
  router.push({ name: 'auth' })
}

function onProjectCreated(newProjectId: string) {
  router.push({ name: 'editor', params: { projectId: newProjectId } })
}
</script>

<template>
  <header class="relative flex items-center justify-between h-14 px-4 bg-sidebar-background border-b border-sidebar-border z-50">
    <!-- Left: Logo + User Dropdown -->
    <div class="flex items-center gap-2">
      <!-- Logo -->
      <router-link :to="{ name: 'dashboard' }" class="flex items-center gap-2 p-1 mr-1">
        <LandsLogo class="w-6 h-6 shrink-0" />
      </router-link>

      <!-- User Dropdown -->
      <Dropdown ref="userDropdownRef" align="left" width="min-w-56" :close-on-click="false">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
            @click="toggle"
          >
            <span class="text-sm font-medium text-foreground max-w-48 truncate">{{ currentPageName }}</span>
            <Icon name="chevron-down" class="text-[10px] text-muted-foreground" />
          </button>
        </template>

        <!-- Projects Section -->
        <div class="px-2 pt-2 pb-1">
          <p class="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2 mb-1">Projects</p>
        </div>
        <div class="max-h-64 overflow-y-auto">
          <div
            v-for="project in projects"
            :key="project.id"
            @mouseenter="handleProjectHover(project.id, $event)"
            @mouseleave="handleProjectLeave"
          >
            <!-- Project Item -->
            <button
              class="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer hover:bg-accent/75"
              :class="currentProject?.id === project.id ? 'bg-accent/50' : ''"
            >
              <span class="flex-1 text-left truncate text-foreground">{{ project.title }}</span>
              <Icon name="chevron-right" :size="10" class="text-muted-foreground shrink-0" />
            </button>
          </div>
        </div>
        <Dropdown.Item icon="plus" @click="userDropdownRef?.close(); showNewProjectModal = true">
          New Project
        </Dropdown.Item>

        <Dropdown.Divider />

        <!-- Navigation -->
        <Dropdown.Item icon="app-dashboard" @click="closeDropdownAndNavigate('dashboard')">
          Dashboard
        </Dropdown.Item>
        <Dropdown.Item icon="app-user" @click="closeDropdownAndNavigate('account')">
          Account
        </Dropdown.Item>

        <Dropdown.Divider />

        <!-- Logout -->
        <Dropdown.Item icon="app-logout" @click="userDropdownRef?.close(); signOut()">
          Sign Out
        </Dropdown.Item>
      </Dropdown>
    </div>

    <!-- Project Route: Center Controls -->
    <div v-if="isProjectRoute && isEditorRoute" class="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
      <!-- Undo/Redo Buttons -->
      <div class="flex items-center gap-1">
        <button
          class="p-1.5 rounded-md transition-colors"
          :class="editorStore.canUndo ? 'text-muted-foreground hover:text-foreground hover:bg-secondary' : 'text-muted-foreground/30 cursor-not-allowed'"
          :disabled="!editorStore.canUndo"
          title="Undo"
          @click="editorStore.undo()"
        >
          <Icon name="app-undo" class="text-sm" />
        </button>
        <button
          class="p-1.5 rounded-md transition-colors"
          :class="editorStore.canRedo ? 'text-muted-foreground hover:text-foreground hover:bg-secondary' : 'text-muted-foreground/30 cursor-not-allowed'"
          :disabled="!editorStore.canRedo"
          title="Redo"
          @click="editorStore.redo()"
        >
          <Icon name="app-redo" class="text-sm" />
        </button>
      </div>

      <div class="h-5 w-px bg-border"></div>

      <!-- Viewport Toggle -->
      <div class="flex items-center gap-1 p-1 rounded-lg bg-secondary">
        <button
          class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
          :class="editorStore.viewport === 'desktop' ? 'bg-accent text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="editorStore.setViewport('desktop')"
        >
          Desktop
        </button>
        <button
          class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
          :class="editorStore.viewport === 'tablet' ? 'bg-accent text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="editorStore.setViewport('tablet')"
        >
          Tablet
        </button>
        <button
          class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
          :class="editorStore.viewport === 'mobile' ? 'bg-accent text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="editorStore.setViewport('mobile')"
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
            <Icon name="chevron-down" class="text-[10px] text-muted-foreground" />
          </button>
        </template>

        <!-- Default language option -->
        <Dropdown.Item @click="handleLanguageChange(null)">
          <span v-if="editorStore.currentLanguage === null" class="w-1.5 h-1.5 rounded-full bg-foreground shrink-0"></span>
          <span v-else class="w-1.5 h-1.5 shrink-0"></span>
          <span>Default ({{ getLanguageByCode(editorStore.translations.defaultLanguage)?.name }})</span>
        </Dropdown.Item>

        <!-- Translation languages -->
        <template v-if="editorStore.availableTranslations.length > 0">
          <Dropdown.Divider />
          <Dropdown.Item
            v-for="langCode in editorStore.availableTranslations"
            :key="langCode"
            @click="handleLanguageChange(langCode)"
          >
            <span v-if="editorStore.currentLanguage === langCode" class="w-1.5 h-1.5 rounded-full bg-foreground shrink-0"></span>
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

    <!-- Right Side -->
    <div class="flex items-center gap-3">
      <!-- Non-Project Route: Search -->
      <template v-if="!isProjectRoute">
        <Button variant="outline" size="sm" @click="showCommand = true">
          <Icon name="search-1" class="text-xs" />
          <span class="hidden sm:inline">Search...</span>
          <kbd class="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">
            <span>&#8984;</span><span>K</span>
          </kbd>
        </Button>
      </template>

      <!-- Project Route: Save + Publish -->
      <template v-if="isProjectRoute && currentProject">
        <!-- Collaborator Changes Alert -->
        <Button
          v-if="editorStore.hasCollaboratorChanges"
          variant="outline"
          size="sm"
          class="text-amber-600 border-amber-300 hover:bg-amber-50"
          @click="editorStore.reloadProjectContent()"
        >
          <Icon name="app-undo" class="text-xs" />
          Reload
        </Button>

        <!-- Save Button -->
        <Button
          variant="outline"
          size="sm"
          :disabled="!canSave || (!editorStore.hasUnsavedChanges && !hasPendingChanges)"
          @click="handleSave"
        >
          <span :class="['w-1.5 h-1.5 rounded-full shrink-0', saveStatusDotClass]"></span>
          <span v-if="isOffline">Offline</span>
          <span v-else-if="isRecovering">Reconnecting...</span>
          <span v-else-if="isSyncing || editorStore.isSaving">Syncing...</span>
          <span v-else-if="editorStore.hasUnsavedChanges || hasPendingChanges">Save</span>
          <span v-else>Saved</span>
        </Button>

        <!-- Publish Button -->
        <Button size="sm" :loading="isPublishing" @click="handlePublish">
          {{ isPublishing ? 'Publishing...' : (currentProject?.isPublished ? 'Update' : 'Publish') }}
        </Button>
      </template>
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

  <!-- New Project Modal -->
  <ProjectCreate
    v-model:open="showNewProjectModal"
    @created="onProjectCreated"
  />

  <!-- Project Popover (Teleported) -->
  <Teleport to="body">
    <div
      v-if="hoveredProjectId && hoveredProjectRect"
      class="fixed w-56 bg-popover border border-border rounded-xl shadow-lg z-[100] p-3"
      :style="popoverStyle"
      @mouseenter="handlePopoverEnter"
      @mouseleave="handlePopoverLeave"
    >
      <template v-for="project in projects" :key="project.id">
        <template v-if="project.id === hoveredProjectId">
          <!-- Project Info -->
          <div class="flex items-start gap-3 mb-3">
            <!-- Thumbnail -->
            <div
              v-if="project.thumbnail"
              class="w-12 h-12 rounded-lg bg-cover bg-center shrink-0 border border-border"
              :style="{ backgroundImage: `url(${project.thumbnail})` }"
            ></div>
            <div
              v-else
              class="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-lg font-semibold text-muted-foreground shrink-0"
            >
              {{ getProjectInitial(project.title) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground truncate">{{ project.title }}</p>
              <div class="flex items-center gap-1.5 mt-1">
                <Badge :variant="project.isPublished ? 'success' : 'secondary'" size="xs" dot>
                  {{ project.isPublished ? 'Published' : 'Draft' }}
                </Badge>
                <Badge :variant="project.plan === 'pro' ? 'info' : 'outline'" size="xs">
                  {{ project.plan === 'pro' ? 'Pro' : 'Free' }}
                </Badge>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-1">
            <button
              class="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors text-foreground hover:bg-accent"
              @click="closeDropdownAndNavigate('editor', { projectId: project.id })"
            >
              <Icon name="app-editor" :size="14" />
              <span>Editor</span>
            </button>
            <button
              class="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors text-foreground hover:bg-accent"
              @click="closeDropdownAndNavigate('analytics', { projectId: project.id })"
            >
              <Icon name="app-analytics" :size="14" />
              <span>Analytics</span>
            </button>
            <button
              class="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors text-foreground hover:bg-accent"
              @click="closeDropdownAndNavigate('settings', { projectId: project.id })"
            >
              <Icon name="app-settings" :size="14" />
              <span>Settings</span>
            </button>
          </div>
        </template>
      </template>
    </div>
  </Teleport>
</template>
