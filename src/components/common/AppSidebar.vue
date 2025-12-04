<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProjectsStore } from '@/stores/projects'
import LandsLogo from '@/assets/LandsLogo.vue'
import ProjectCreate from '@/components/modal/ProjectCreate.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const projectsStore = useProjectsStore()

const isCollapsed = ref(false)
const showUserMenu = ref(false)
const expandedProjectId = ref<string | null>(null)
const showNewProjectModal = ref(false)

const user = computed(() => userStore.settings.profile)
const projects = computed(() => projectsStore.projects)

// Check if we're in a project context
const currentProjectId = computed(() => route.params.projectId as string | undefined)

// Fetch projects on mount
onMounted(() => {
  projectsStore.fetchProjects()
})

// Auto-expand current project when navigating
watch(currentProjectId, (newId) => {
  if (newId) {
    expandedProjectId.value = newId
  }
}, { immediate: true })

// Auto-collapse sidebar when on EditorView
watch(() => route.name, (routeName) => {
  if (routeName === 'editor') {
    isCollapsed.value = true
  }
}, { immediate: true })

function toggleProject(projectId: string) {
  if (expandedProjectId.value === projectId) {
    expandedProjectId.value = null
  } else {
    expandedProjectId.value = projectId
  }
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

function getProjectInitial(title: string) {
  return title.charAt(0).toUpperCase()
}

function goToAccount() {
  showUserMenu.value = false
  router.push({ name: 'account' })
}

async function signOut() {
  showUserMenu.value = false
  await userStore.signOut()
  router.push({ name: 'auth' })
}

function onProjectCreated(projectId: string) {
  expandedProjectId.value = projectId
}
</script>

<template>
  <aside
    class="flex flex-col h-full bg-sidebar-background border-r border-sidebar-border transition-all duration-200"
    :class="isCollapsed ? 'w-16' : 'w-56'"
  >
    <!-- Logo + Collapse Toggle -->
    <div class="flex items-center justify-between h-14 px-4 border-b border-sidebar-border">
      <router-link :to="{ name: 'dashboard' }" class="flex items-center gap-2">
        <LandsLogo class="w-6 h-6" />
        <span v-if="!isCollapsed" class="text-base font-semibold text-sidebar-primary">Lands</span>
      </router-link>
      <button
        class="p-1 rounded text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        @click="isCollapsed = !isCollapsed"
      >
        <i class="lni text-sm transition-transform" :class="isCollapsed ? 'lni-angle-double-right' : 'lni-angle-double-left'"></i>
      </button>
    </div>

    <!-- Main Navigation -->
    <nav class="flex-1 py-3 px-3 space-y-1">
      <!-- Dashboard link -->
      <router-link
        :to="{ name: 'dashboard' }"
        class="group relative flex items-center gap-3 px-3 py-3 rounded-md text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-colors"
        :class="{ 'bg-sidebar-accent text-sidebar-accent-foreground': route.name === 'dashboard' }"
      >
        <i class="lni lni-home-2 text-lg shrink-0"></i>
        <span v-if="!isCollapsed" class="text-xs">Dashboard</span>
        <!-- Tooltip -->
        <span
          v-if="isCollapsed"
          class="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-popover-foreground bg-popover border border-border rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50"
        >
          Dashboard
        </span>
      </router-link>

      <!-- Projects Section -->
      <div class="pt-2 pb-2">
        <p v-if="!isCollapsed" class="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">Projects</p>
        <div v-else class="mx-3 border-t border-sidebar-border"></div>
      </div>

      <!-- Projects List (Accordion) -->
      <div v-for="project in projects" :key="project.id" class="space-y-0.5">
        <!-- Project Item -->
        <button
          class="group relative w-full flex items-center gap-3 px-2 py-2 rounded-md transition-colors text-left"
          :class="expandedProjectId === project.id
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'"
          @click="toggleProject(project.id)"
        >
          <div class="w-6 h-6 shrink-0 rounded bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
            {{ getProjectInitial(project.title) }}
          </div>
          <div v-if="!isCollapsed" class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ project.title }}</p>
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full" :class="project.isPublished ? 'bg-green-500' : 'bg-muted-foreground'"></span>
              <span class="text-[10px] text-sidebar-foreground/60">{{ project.isPublished ? 'Published' : 'Draft' }}</span>
            </div>
          </div>
          <i
            v-if="!isCollapsed"
            class="lni lni-chevron-down text-xs shrink-0 text-sidebar-foreground/50 transition-transform"
            :class="{ 'rotate-180': expandedProjectId === project.id }"
          ></i>
          <!-- Tooltip -->
          <span
            v-if="isCollapsed"
            class="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-popover-foreground bg-popover border border-border rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50"
          >
            {{ project.title }}
          </span>
        </button>

        <!-- Project Sub-navigation (expanded - full width) -->
        <div
          v-if="expandedProjectId === project.id && !isCollapsed"
          class="ml-6 pl-1 border-l border-sidebar-border space-y-0.5"
        >
          <router-link
            :to="{ name: 'editor', params: { projectId: project.id } }"
            class="flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors"
            :class="route.name === 'editor' && currentProjectId === project.id
              ? 'bg-sidebar-accent/50 text-sidebar-foreground'
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'"
          >
            <i class="lni lni-pencil-1 text-sm shrink-0"></i>
            <span class="text-xs font-medium">Editor</span>
          </router-link>

          <router-link
            :to="{ name: 'analytics', params: { projectId: project.id } }"
            class="flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors"
            :class="route.name === 'analytics' && currentProjectId === project.id
              ? 'bg-sidebar-accent/50 text-sidebar-foreground'
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'"
          >
            <i class="lni lni-bar-chart-4 text-sm shrink-0"></i>
            <span class="text-xs font-medium">Analytics</span>
          </router-link>

          <router-link
            :to="{ name: 'settings', params: { projectId: project.id } }"
            class="flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors"
            :class="route.name === 'settings' && currentProjectId === project.id
              ? 'bg-sidebar-accent/50 text-sidebar-foreground'
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'"
          >
            <i class="lni lni-gear-1 text-sm shrink-0"></i>
            <span class="text-xs font-medium">Settings</span>
          </router-link>

          <router-link
            :to="{ name: 'integration', params: { projectId: project.id } }"
            class="flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors"
            :class="route.name === 'integration' && currentProjectId === project.id
              ? 'bg-sidebar-accent/50 text-sidebar-foreground'
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'"
          >
            <i class="lni lni-link-2-angular-right text-sm shrink-0"></i>
            <span class="text-xs font-medium">Integration</span>
          </router-link>
        </div>

        <!-- Project Sub-navigation (collapsed - icons only) -->
        <div
          v-if="expandedProjectId === project.id && isCollapsed"
          class="flex flex-col items-center gap-1 mt-1"
        >
          <router-link
            :to="{ name: 'editor', params: { projectId: project.id } }"
            class="group relative flex items-center justify-center w-10 h-8 rounded-md transition-colors"
            :class="route.name === 'editor' && currentProjectId === project.id
              ? 'bg-sidebar-accent/50 text-sidebar-foreground'
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'"
          >
            <i class="lni lni-pencil-1 text-sm"></i>
            <span class="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-popover-foreground bg-popover border border-border rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Editor</span>
          </router-link>

          <router-link
            :to="{ name: 'analytics', params: { projectId: project.id } }"
            class="group relative flex items-center justify-center w-10 h-8 rounded-md transition-colors"
            :class="route.name === 'analytics' && currentProjectId === project.id
              ? 'bg-sidebar-accent/50 text-sidebar-foreground'
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'"
          >
            <i class="lni lni-bar-chart-4 text-sm"></i>
            <span class="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-popover-foreground bg-popover border border-border rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Analytics</span>
          </router-link>

          <router-link
            :to="{ name: 'settings', params: { projectId: project.id } }"
            class="group relative flex items-center justify-center w-10 h-8 rounded-md transition-colors"
            :class="route.name === 'settings' && currentProjectId === project.id
              ? 'bg-sidebar-accent/50 text-sidebar-foreground'
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'"
          >
            <i class="lni lni-gear-1 text-sm"></i>
            <span class="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-popover-foreground bg-popover border border-border rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Settings</span>
          </router-link>

          <router-link
            :to="{ name: 'integration', params: { projectId: project.id } }"
            class="group relative flex items-center justify-center w-10 h-8 rounded-md transition-colors"
            :class="route.name === 'integration' && currentProjectId === project.id
              ? 'bg-sidebar-accent/50 text-sidebar-foreground'
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'"
          >
            <i class="lni lni-link-2-angular-right text-sm"></i>
            <span class="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-popover-foreground bg-popover border border-border rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Integration</span>
          </router-link>
        </div>
      </div>

      <!-- New Project Button -->
      <button
        v-if="!isCollapsed"
        class="flex items-center gap-3 w-full px-3 py-2 mt-2 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors border border-dashed border-sidebar-border"
        @click="showNewProjectModal = true"
      >
        <i class="lni lni-plus text-lg shrink-0"></i>
        <span class="text-sm font-medium">New project</span>
      </button>
      <button
        v-else
        class="group relative flex items-center justify-center w-full p-2 mt-2 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors border border-dashed border-sidebar-border"
        @click="showNewProjectModal = true"
      >
        <i class="lni lni-plus text-lg"></i>
        <span class="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-popover-foreground bg-popover border border-border rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">New project</span>
      </button>
    </nav>

    <!-- User section -->
    <div class="p-2">
      <div class="relative">
        <button
          class="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sidebar-foreground bg-sidebar-accent transition-colors"
          @click="showUserMenu = !showUserMenu"
        >
          <!-- Avatar -->
          <div
            v-if="user.avatar"
            class="w-8 h-8 rounded-full bg-cover bg-center shrink-0"
            :style="{ backgroundImage: `url(${user.avatar})` }"
          />
          <div
            v-else
            class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0"
          >
            {{ getInitials(user.name) }}
          </div>
          <div v-if="!isCollapsed" class="flex-1 min-w-0 text-left">
            <p class="text-sm font-medium text-sidebar-foreground truncate">{{ user.name || 'User' }}</p>
            <p class="text-xs text-sidebar-foreground/60 truncate">{{ user.email }}</p>
          </div>
          <i v-if="!isCollapsed" class="lni lni-chevron-up text-xs shrink-0 text-sidebar-foreground/50"></i>
        </button>

        <!-- User dropdown menu -->
        <div
          v-if="showUserMenu"
          class="absolute bottom-full left-0 right-0 mb-1 bg-popover border border-border rounded-md shadow-lg py-1 z-50"
        >
          <button
            class="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            @click="goToAccount"
          >
            <i class="lni lni-user-4 text-sm"></i>
            Account Settings
          </button>
          <div class="my-1 border-t border-border"></div>
          <button
            class="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            @click="signOut"
          >
            <i class="lni lni-exit text-sm"></i>
            Sign Out
          </button>
        </div>
      </div>
    </div>

    <!-- New Project Modal -->
    <ProjectCreate
      v-model:open="showNewProjectModal"
      @created="onProjectCreated"
    />
  </aside>
</template>
