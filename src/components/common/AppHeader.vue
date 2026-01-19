<script setup lang="ts">
/**
 * APP HEADER
 * Simplified for new section-based editor
 */

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useEditorStore } from '@/stores/editor'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/stores/toast'
import { Button, Command, Dropdown, Icon, Badge } from '@/components/ui'
import LandsLogo from '@/assets/LandsLogo.vue'
import ProjectPublished from '@/components/modal/ProjectPublished.vue'
import ProjectTranslation from '@/components/modal/ProjectTranslation.vue'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const editor = useEditorStore()
const userStore = useUserStore()
const toast = useToast()

// Fetch projects on mount if not already loaded
onMounted(() => {
  if (projectsStore.projects.length === 0) {
    projectsStore.fetchProjects()
  }
})

const showCommand = ref(false)
const isSaving = ref(false)
const isPublishing = ref(false)
const showPublishedModal = ref(false)
const showTranslationModal = ref(false)
const projectDropdownRef = ref<{ close: () => void } | null>(null)
const userDropdownRef = ref<{ close: () => void } | null>(null)
const languageDropdownRef = ref<{ close: () => void } | null>(null)

// Language options
const LANGUAGE_OPTIONS: Record<string, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  nl: 'Nederlands',
  pl: 'Polski',
  ru: 'Русский',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
  ar: 'العربية',
}

function getLanguageLabel(code: string): string {
  return LANGUAGE_OPTIONS[code] || code
}

function getCurrentLanguageLabel(): string {
  if (!editor.hasTranslations) return 'Translations'
  const current = editor.currentLanguage || editor.defaultLanguage
  return getLanguageLabel(current)
}

function switchLanguage(code: string) {
  languageDropdownRef.value?.close()
  if (code === editor.defaultLanguage) {
    editor.setCurrentLanguage(null)
  } else {
    editor.setCurrentLanguage(code)
  }
}

function openTranslationModal() {
  languageDropdownRef.value?.close()
  showTranslationModal.value = true
}

// User info
const user = computed(() => userStore.settings.profile)
const userEmail = computed(() => userStore.authUser?.email || '')
const userInitial = computed(() => {
  if (user.value?.name) return user.value.name.charAt(0).toUpperCase()
  if (userEmail.value) return userEmail.value.charAt(0).toUpperCase()
  return '?'
})

// Route checks
const isProjectRoute = computed(() => !!route.params.projectId)
const isDesignerRoute = computed(() => route.name === 'designer')
const projectId = computed(() => route.params.projectId as string | undefined)

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

function navigateToProjectRoute(routeName: string) {
  if (projectId.value) {
    router.push({ name: routeName, params: { projectId: projectId.value } })
  }
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
    { id: 'support', label: 'Support', icon: 'lni-comment-1-text', group: 'Navigation', action: () => router.push({ name: 'support' }) },
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

async function handleSave() {
  if (!projectId.value || isSaving.value) return

  isSaving.value = true
  try {
    const content = editor.getPageContent()
    const success = await projectsStore.saveProjectContent(projectId.value, content)
    if (success) {
      editor.isDirty = false
      toast.success('Saved', 'Project saved successfully')
    }
  } finally {
    isSaving.value = false
  }
}

async function handlePublish() {
  if (!projectId.value || isPublishing.value) return

  isPublishing.value = true

  try {
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

function handleCommandSelect() {
  // Action is called automatically by Command component
}

async function signOut() {
  userDropdownRef.value?.close()
  await userStore.signOut()
  router.push({ name: 'auth' })
}
</script>

<template>
  <header class="flex items-center h-14 px-4 bg-sidebar-background border-b border-sidebar-border z-150">
    <!-- Left: Logo + Project/Page + Route Tabs -->
    <div class="flex items-center gap-3 flex-1">
      <!-- Logo -->
      <router-link
        :to="{ name: 'dashboard' }"
        class="flex items-center p-1 shrink-0"
      >
        <LandsLogo class="w-6 h-6" />
      </router-link>

      <!-- Project Dropdown (when on project route) -->
      <Dropdown
        v-if="isProjectRoute && currentProject"
        ref="projectDropdownRef"
        align="left"
        width="min-w-80"
      >
        <template #trigger="{ toggle }">
          <Button
            variant="secondary"
            size="sm"
            class="min-w-[250px] !justify-between"
            @click="toggle"
          >
            <span class="truncate text-left flex-1">{{ currentProject.title }}</span>
            <Icon
              name="chevron-down"
              :size="10"
              class="text-muted-foreground shrink-0 ml-2"
            />
          </Button>
        </template>

        <!-- Project Card -->
        <div class="p-4">
          <!-- Project Icon + Title -->
          <div class="flex items-center gap-3 mb-3">
            <div
              v-if="currentProject.thumbnail"
              class="w-10 h-10 rounded bg-cover bg-center shrink-0 border border-border"
              :style="{ backgroundImage: `url(${currentProject.thumbnail})` }"
            />
            <div
              v-else
              class="w-10 h-10 rounded bg-secondary flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0"
            >
              {{ getProjectInitial(currentProject.title) }}
            </div>
            <p class="text-sm font-semibold text-foreground truncate flex-1">
              {{ currentProject.title }}
            </p>
          </div>

          <!-- Project Status -->
          <div class="mb-3">
            <Badge
              :variant="currentProject.isPublished ? 'success' : 'secondary'"
              size="sm"
              dot
            >
              {{ currentProject.isPublished ? 'Published' : 'Draft' }}
            </Badge>
          </div>

          <!-- Project URL -->
          <div class="mb-4">
            <a
              :href="`https://${currentProject.slug}.lands.app`"
              target="_blank"
              class="text-xs text-primary hover:underline truncate block"
            >
              {{ currentProject.slug }}.lands.app
            </a>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex gap-2">
            <Button
              :variant="route.name === 'designer' ? 'default' : 'outline'"
              size="sm"
              class="flex-1"
              @click="projectDropdownRef?.close(); navigateToProjectRoute('designer')"
            >
              <Icon
                name="app-designer"
                :size="14"
              />
              Editor
            </Button>
            <Button
              :variant="route.name === 'settings' ? 'default' : 'outline'"
              size="sm"
              class="flex-1"
              :data-tour="'settings'"
              @click="projectDropdownRef?.close(); navigateToProjectRoute('settings')"
            >
              <Icon
                name="app-settings"
                :size="14"
              />
              Settings
            </Button>
          </div>
        </div>
      </Dropdown>

      <!-- Dashboard/Account label (when not on project route) -->
      <span
        v-else
        class="text-sm font-medium text-foreground"
      >
        {{ route.name === 'account' ? 'Account' : 'Dashboard' }}
      </span>
    </div>

    <!-- Center: Editor Controls (project routes only) -->
    <div
      v-if="isDesignerRoute"
      class="flex items-center gap-4"
    >
      <!-- Undo/Redo Buttons -->
      <div class="flex items-center gap-1">
        <button
          class="p-1.5 rounded-md transition-colors"
          :class="editor.canUndo ? 'text-muted-foreground hover:text-foreground hover:bg-secondary' : 'text-muted-foreground/30 cursor-not-allowed'"
          :disabled="!editor.canUndo"
          title="Undo (⌘Z)"
          @click="editor.undo()"
        >
          <Icon
            name="app-undo"
            class="text-sm"
          />
        </button>
        <button
          class="p-1.5 rounded-md transition-colors"
          :class="editor.canRedo ? 'text-muted-foreground hover:text-foreground hover:bg-secondary' : 'text-muted-foreground/30 cursor-not-allowed'"
          :disabled="!editor.canRedo"
          title="Redo (⌘⇧Z)"
          @click="editor.redo()"
        >
          <Icon
            name="app-redo"
            class="text-sm"
          />
        </button>
      </div>

      <!-- View Mode Switcher (Desktop/Mobile) -->
      <div class="flex items-center gap-0.5 p-0.5 bg-secondary rounded-md">
        <button
          class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-sm transition-colors"
          :class="editor.previewMode === 'desktop'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'"
          title="Desktop view"
          @click="editor.setPreviewMode('desktop')"
        >
          <Icon
            name="device-desktop"
            :size="14"
          />
          <span>Desktop</span>
        </button>
        <button
          class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-sm transition-colors"
          :class="editor.previewMode === 'mobile'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'"
          title="Mobile view"
          @click="editor.setPreviewMode('mobile')"
        >
          <Icon
            name="device-mobile"
            :size="14"
          />
          <span>Mobile</span>
        </button>
      </div>

      <!-- Language Selector -->
      <Dropdown
        ref="languageDropdownRef"
        align="left"
        width="min-w-48"
      >
        <template #trigger="{ toggle }">
          <button
            data-tour="translations"
            class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors"
            :class="editor.hasTranslations
              ? 'text-foreground hover:bg-accent'
              : 'bg-secondary text-foreground hover:text-foreground hover:bg-secondary'"
            @click="toggle"
          >
            <Icon
              name="app-language"
              :size="14"
            />
            <span>{{ getCurrentLanguageLabel() }}</span>
            <Icon
              name="chevron-down"
              :size="14"
              class="text-foreground"
            />
          </button>
        </template>

        <!-- No translations configured -->
        <div v-show="!editor.hasTranslations">
          <div class="px-3 py-2 text-xs text-muted-foreground">
            No translations added yet
          </div>
          <Dropdown.Divider />
          <Dropdown.Item
            icon="plus"
            @click="openTranslationModal"
          >
            Add Translation
          </Dropdown.Item>
        </div>

        <!-- Translations configured - show language list -->
        <div v-show="editor.hasTranslations">
          <!-- Default language -->
          <div class="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Default
          </div>
          <button
            class="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
            :class="{ 'bg-accent': !editor.currentLanguage }"
            @click="switchLanguage(editor.defaultLanguage)"
          >
            <span class="flex-1 text-left">{{ getLanguageLabel(editor.defaultLanguage) }}</span>
            <Icon
              v-if="!editor.currentLanguage"
              name="checkmark"
              :size="14"
              class="text-primary"
            />
          </button>

          <!-- Other languages -->
          <div v-show="editor.translationSettings?.languages.length">
            <Dropdown.Divider />
            <div class="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Translations
            </div>
            <button
              v-for="lang in editor.translationSettings?.languages"
              :key="lang"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
              :class="{ 'bg-accent': editor.currentLanguage === lang }"
              @click="switchLanguage(lang)"
            >
              <span class="flex-1 text-left">{{ getLanguageLabel(lang) }}</span>
              <Icon
                v-if="editor.currentLanguage === lang"
                name="checkmark"
                :size="14"
                class="text-primary"
              />
            </button>
          </div>

          <Dropdown.Divider />
          <Dropdown.Item
            icon="plus"
            @click="openTranslationModal"
          >
            Manage Translations
          </Dropdown.Item>
        </div>
      </Dropdown>
    </div>

    <!-- Right: Actions + User Menu -->
    <div class="flex items-center gap-3 flex-1 justify-end">
      <!-- Search (non-project routes only) -->
      <button
        v-if="!isProjectRoute"
        class="flex items-center justify-between gap-4 min-w-72 h-9 px-4 bg-background border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent/50 hover:border-border/80 transition-colors"
        @click="showCommand = true"
      >
        <div class="flex items-center gap-2">
          <Icon
            name="search-1"
            class="text-sm"
          />
          <span>Search...</span>
        </div>
        <kbd class="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">
          <span>⌘</span><span>K</span>
        </kbd>
      </button>

      <!-- Project Route: Save + Publish -->
      <div
        v-show="isProjectRoute && currentProject"
        class="flex items-center gap-3"
      >
        <!-- Save indicator -->
        <div
          :class="[
            'flex items-center gap-2 px-3 py-1.5 text-xxs font-medium font-mono uppercase rounded-md',
            editor.isDirty ? 'bg-orange-500/10' : 'bg-green-500/10'
          ]"
        >
          <span
            :class="[
              'w-1.5 h-1.5 rounded-full',
              editor.isDirty ? 'bg-orange-500' : 'bg-green-500'
            ]"
          />
          <span :class="editor.isDirty ? 'text-orange-500' : 'text-green-500'">
            {{ editor.isDirty ? 'Unsaved' : 'Saved' }}
          </span>
        </div>

        <!-- Save Button -->
        <Button
          size="sm"
          variant="secondary"
          :loading="isSaving"
          :disabled="!editor.isDirty"
          @click="handleSave"
        >
          {{ isSaving ? 'Saving...' : 'Save' }}
        </Button>

        <!-- Publish Button -->
        <Button
          size="sm"
          :loading="isPublishing"
          data-tour="publish"
          @click="handlePublish"
        >
          {{ isPublishing ? 'Publishing...' : (currentProject?.isPublished ? 'Update' : 'Publish') }}
        </Button>
      </div>

      <!-- User Avatar Dropdown -->
      <Dropdown
        ref="userDropdownRef"
        align="right"
        width="min-w-48"
      >
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
          <p
            v-if="user?.name"
            class="text-xs text-muted-foreground truncate"
          >
            {{ userEmail }}
          </p>
        </div>

        <Dropdown.Item
          icon="app-dashboard"
          @click="userDropdownRef?.close(); router.push({ name: 'dashboard' })"
        >
          Dashboard
        </Dropdown.Item>
        <Dropdown.Item
          icon="app-user"
          @click="userDropdownRef?.close(); router.push({ name: 'account' })"
        >
          Account Settings
        </Dropdown.Item>
        <Dropdown.Item
          icon="lni-comment-1-text"
          @click="userDropdownRef?.close(); router.push({ name: 'support' })"
        >
          Support
        </Dropdown.Item>

        <Dropdown.Divider />

        <Dropdown.Item
          icon="app-logout"
          @click="signOut"
        >
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

  <!-- Published Modal -->
  <ProjectPublished
    v-if="currentProject"
    v-model:open="showPublishedModal"
    :project-id="currentProject.id"
    :project-slug="currentProject.slug"
    :custom-domain="currentProject.customDomain"
  />

  <!-- Translation Modal -->
  <ProjectTranslation
    v-model:open="showTranslationModal"
  />
</template>
