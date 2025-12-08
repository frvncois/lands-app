<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useEditorStore } from '@/stores/editor'
import { useUserStore } from '@/stores/user'
import { Button, Badge, Command, Dropdown } from '@/components/ui'
import ProjectTranslate from '@/components/modal/ProjectTranslate.vue'
import { getLanguageByCode } from '@/lib/languages'
import type { LanguageCode } from '@/types/editor'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const editorStore = useEditorStore()
const userStore = useUserStore()

const showCommand = ref(false)
const isPublishing = ref(false)
const showTranslateModal = ref(false)

// Translation helpers
const currentLanguageDisplay = computed(() => {
  if (!editorStore.currentLanguage) {
    const defaultLang = getLanguageByCode(editorStore.translations.defaultLanguage)
    return defaultLang ? `${defaultLang.flag} Default (${defaultLang.name})` : 'Default'
  }
  const lang = getLanguageByCode(editorStore.currentLanguage)
  return lang ? `${lang.flag} ${lang.name}` : editorStore.currentLanguage
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

// Command items
const commandItems = computed(() => {
  const items = [
    // Navigation
    { id: 'dashboard', label: 'Go to Dashboard', icon: 'lni-home-2', group: 'Navigation', action: () => router.push({ name: 'dashboard' }) },
    { id: 'account', label: 'Account Settings', icon: 'lni-user-4', group: 'Navigation', action: () => router.push({ name: 'account' }) },
  ]

  // Add project-specific commands if in project context
  if (currentProject.value) {
    items.push(
      { id: 'editor', label: 'Open Editor', icon: 'lni-pencil-1', group: 'Project', shortcut: ['E'], action: () => router.push({ name: 'editor', params: { projectId: projectId.value } }) },
      { id: 'settings', label: 'Project Settings', icon: 'lni-gear-1', group: 'Project', shortcut: ['S'], action: () => router.push({ name: 'settings', params: { projectId: projectId.value } }) },
      { id: 'analytics', label: 'View Analytics', icon: 'lni-bar-chart-4', group: 'Project', shortcut: ['A'], action: () => router.push({ name: 'analytics', params: { projectId: projectId.value } }) },
      { id: 'integrations', label: 'Integrations', icon: 'lni-link-2-angular-right', group: 'Project', action: () => router.push({ name: 'integration', params: { projectId: projectId.value } }) },
    )

    // Actions
    items.push(
      { id: 'preview', label: 'Preview Site', icon: 'lni-eye', group: 'Actions', shortcut: ['P'], action: handlePreview },
      { id: 'publish', label: currentProject.value.isPublished ? 'Update Site' : 'Publish Site', icon: 'lni-upload-1', group: 'Actions', action: handlePublish },
    )
  }

  // Add all projects to navigation
  for (const project of projectsStore.projects) {
    if (project.id !== projectId.value) {
      items.push({
        id: `project-${project.id}`,
        label: project.title,
        icon: 'lni-folder-1',
        group: 'Projects',
        action: () => router.push({ name: 'editor', params: { projectId: project.id } }),
      })
    }
  }

  return items
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

function handleCommandSelect(item: any) {
  // Action is called automatically by Command component
}
</script>

<template>
  <header class="relative flex items-center justify-between h-14 px-6 bg-sidebar-background border-b border-sidebar-border z-100">
    <!-- Project Route Header -->
    <template v-if="isProjectRoute && currentProject">
      <!-- Left: Dashboard Link + Separator + Project Selector -->
      <div class="flex items-center gap-6">
        <!-- Dashboard Link -->
        <router-link
          :to="{ name: 'dashboard' }"
          class="flex items-center gap-2 text-foreground hover:text-foreground transition-colors"
        >
          <i class="lni lni-home-2 text-lg"></i>
        </router-link>

        <!-- Separator -->
        <div class="h-5 w-px bg-border"></div>

        <!-- Project Dropdown -->
        <Dropdown align="left">
          <template #trigger="{ toggle }">
            <button
              class="flex items-center gap-3 px-1.5 py-1.5 rounded-xl transition-colors text-left border border-accent hover:bg-muted w-62"
              @click="toggle"
            >
              <div class="w-6 h-6 shrink-0 rounded bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                {{ getProjectInitial(currentProject.title) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground truncate leading-none">{{ currentProject.title }}</p>
              </div>
              <i class="lni lni-chevron-down text-xs mr-1.5 text-muted-foreground"></i>
            </button>
          </template>

          <!-- Project Info -->
          <div class="px-3 py-2 border-b border-border">
            <p class="text-xs text-muted-foreground mb-1">Project URL</p>
            <p class="text-sm font-medium text-foreground">{{ currentProject.slug }}.lands.app</p>
          </div>

          <!-- Project Stats -->
          <div class="px-3 py-2 border-b border-border">
            <p class="text-xs text-muted-foreground mb-2">Status</p>
            <div class="flex items-center gap-2">
              <Badge :variant="currentProject.isPublished ? 'success' : 'secondary'" size="xs" dot>
                {{ currentProject.isPublished ? 'Published' : 'Draft' }}
              </Badge>
              <Badge :variant="currentProject.plan === 'pro' ? 'info' : 'outline'" size="xs">
                {{ currentProject.plan === 'pro' ? 'Pro' : 'Free' }}
              </Badge>
            </div>
          </div>

          <!-- Actions -->
          <Dropdown.Item icon="lni-gear-1" @click="router.push({ name: 'settings', params: { projectId } })">
            Project Settings
          </Dropdown.Item>
          <Dropdown.Item icon="lni-clipboard" @click="router.push({ name: 'settings', params: { projectId } })">
            Duplicate Project
          </Dropdown.Item>
        </Dropdown>
      </div>

      <!-- Center: Viewport Toggle + Language Selector (Editor only) -->
      <div v-if="isEditorRoute" class="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
        <!-- Viewport Toggle -->
        <div class="flex items-center gap-1 p-1 rounded-lg bg-secondary">
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

        <!-- Language Selector -->
        <Dropdown>
          <template #trigger="{ toggle }">
            <button
              class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              @click="toggle"
            >
              <i class="lni lni-globe-1 text-sm"></i>
              <span>{{ currentLanguageDisplay }}</span>
              <i class="lni lni-chevron-down text-[10px] text-muted-foreground"></i>
            </button>
          </template>

          <!-- Default language option -->
          <Dropdown.Item
            :icon="editorStore.currentLanguage === null ? 'lni-checkmark' : ''"
            @click="handleLanguageChange(null)"
          >
            <span class="flex items-center gap-2">
              <span>{{ getLanguageByCode(editorStore.translations.defaultLanguage)?.flag }}</span>
              <span>Default ({{ getLanguageByCode(editorStore.translations.defaultLanguage)?.name }})</span>
            </span>
          </Dropdown.Item>

          <!-- Translation languages -->
          <template v-if="editorStore.availableTranslations.length > 0">
            <Dropdown.Divider />
            <Dropdown.Item
              v-for="langCode in editorStore.availableTranslations"
              :key="langCode"
              :icon="editorStore.currentLanguage === langCode ? 'lni-checkmark' : ''"
              @click="handleLanguageChange(langCode)"
            >
              <span class="flex items-center gap-2">
                <span>{{ getLanguageByCode(langCode)?.flag }}</span>
                <span>{{ getLanguageByCode(langCode)?.name }}</span>
              </span>
            </Dropdown.Item>
          </template>

          <!-- Translation settings option -->
          <Dropdown.Divider />
          <Dropdown.Item icon="lni-cog-1" @click="showTranslateModal = true">
            Translation settings
          </Dropdown.Item>
        </Dropdown>
      </div>

      <!-- Right: Save Status + Preview + Publish -->
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

        <Button variant="outline" size="sm" @click="handlePreview">
          <i class="lni lni-eye text-xs"></i>
          Preview
        </Button>
        <Button size="sm" :loading="isPublishing" @click="handlePublish">
          {{ isPublishing ? 'Publishing...' : (currentProject?.isPublished ? 'Update' : 'Publish') }}
        </Button>
      </div>
    </template>

    <!-- Default Route Header (Dashboard, Account, etc.) -->
    <template v-else>
      <!-- Left: Dashboard Link + Separator + Page Title -->
      <div class="flex items-center gap-4">
        <!-- Dashboard Link -->
        <router-link
          :to="{ name: 'dashboard' }"
          class="flex items-center gap-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <i class="lni lni-home-2 text-lg"></i>
          <span class="text-sm">Dashboard</span>
        </router-link>

        <!-- Separator (only show if there's a route title) -->
        <template v-if="routeTitle && route.name !== 'dashboard'">
          <div class="h-5 w-px bg-border"></div>
          <h1 class="text-sm text-foreground">{{ routeTitle }}</h1>
        </template>
      </div>

      <!-- Right: Command Trigger -->
      <div class="flex items-center gap-3">
        <Button variant="outline" size="sm" @click="showCommand = true">
          <i class="lni lni-search-1 text-xs"></i>
          <span class="hidden sm:inline">Search...</span>
          <kbd class="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">
            <span>⌘</span><span>K</span>
          </kbd>
        </Button>
      </div>
    </template>
  </header>

  <!-- Command Palette (hidden on project routes) -->
  <Command
    v-if="!isProjectRoute"
    v-model:open="showCommand"
    :items="commandItems"
    placeholder="Search commands, pages, projects..."
    @select="handleCommandSelect"
  />

  <!-- Translation Modal -->
  <ProjectTranslate
    v-model:open="showTranslateModal"
  />
</template>
