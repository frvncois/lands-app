<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProjectsStore } from '@/stores/projects'
import { useProjectSidebarNav } from '@/composables/useProjectSidebarNav'
import LandsLogo from '@/assets/LandsLogo.vue'
import ProjectCreate from '@/components/modal/ProjectCreate.vue'
import { Card, Button, Badge, Avatar, Dropdown, Icon, Tooltip } from '@/components/ui'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const projectsStore = useProjectsStore()
const { navItems } = useProjectSidebarNav()

const isCollapsed = ref(false)
const expandedProjectId = ref<string | null>(null)
const showNewProjectModal = ref(false)
const hoveredProjectId = ref<string | null>(null)

const user = computed(() => userStore.settings.profile)
const projects = computed(() => projectsStore.projects)

const currentProjectId = computed(() => route.params.projectId as string | undefined)

onMounted(() => {
  projectsStore.fetchProjects()
})

watch(currentProjectId, (newId) => {
  if (newId) {
    expandedProjectId.value = newId
  }
}, { immediate: true })

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

function handleProjectClick(projectId: string) {
  if (isCollapsed.value) {
    router.push({ name: 'editor', params: { projectId } })
  } else {
    toggleProject(projectId)
  }
}

function getProjectInitial(title: string) {
  return title.charAt(0).toUpperCase()
}

function goToAccount() {
  router.push({ name: 'account' })
}

async function signOut() {
  await userStore.signOut()
  router.push({ name: 'auth' })
}

function onProjectCreated(projectId: string) {
  expandedProjectId.value = projectId
}

function isNavActive(navName: string, projectId: string) {
  return route.name === navName && currentProjectId.value === projectId
}
</script>

<template>
  <aside
    class="group/sidebar relative flex flex-col h-full bg-sidebar-background transition-[width] duration-300 ease-out border-r border-sidebar-border"
    :class="isCollapsed ? 'w-16' : 'w-56'"
  >
    <!-- Right border toggle handle -->
    <div
      class="absolute top-0 right-0 w-1 h-full cursor-ew-resize z-10 transition-colors hover:bg-primary/50 active:bg-primary"
      :class="isCollapsed ? 'bg-transparent group-hover/sidebar:bg-sidebar-border' : 'bg-sidebar-border group-hover/sidebar:bg-sidebar-foreground/20'"
      @click="isCollapsed = !isCollapsed"
    >
      <div class="absolute top-1/2 -translate-y-1/2 -right-1.5 w-4 h-8 flex items-center justify-center opacity-0 group-hover/sidebar:opacity-100 transition-opacity pointer-events-none">
        <div class="w-1 h-6 rounded-full bg-primary/50"></div>
      </div>
    </div>

    <!-- Logo -->
    <div class="flex items-center h-14 px-4 border-sidebar-border overflow-hidden">
      <router-link :to="{ name: 'dashboard' }" class="flex items-center gap-2 p-1">
        <LandsLogo class="w-6 h-6 shrink-0" />
        <span
          class="text-base font-semibold text-sidebar-primary whitespace-nowrap transition-[opacity,transform] duration-200"
          :class="isCollapsed ? 'opacity-0 -translate-x-2' : 'opacity-100 translate-x-0'"
        >Lands</span>
      </router-link>
    </div>

    <!-- Main Navigation -->
    <nav class="flex flex-col flex-1 px-3 space-y-1">

      <!-- Projects List -->
      <div v-for="(project, index) in projects" :key="project.id" class="space-y-0.5">
        <!-- Separator between projects (collapsed only) -->
        <div v-if="isCollapsed && index > 0" class="mx-3 my-1 border-t border-foreground"></div>

        <!-- Project Item Wrapper -->
        <div
          class="relative"
          @mouseenter="isCollapsed && (hoveredProjectId = project.id)"
          @mouseleave="hoveredProjectId = null"
        >
          <!-- Project Header Button -->
          <button
            class="group w-full flex items-center gap-3 px-2 py-1 rounded-xl transition-colors text-left overflow-hidden"
            :class="expandedProjectId === project.id
              ? 'text-sidebar-accent-foreground'
              : 'text-sidebar-foreground hover:text-sidebar-accent-foreground'"
            @click="handleProjectClick(project.id)"
          >
            <!-- Project Initial Avatar -->
            <div
              class="w-6 h-6 shrink-0 rounded bg-foreground flex items-center justify-center text-xs transition-colors"
              :class="expandedProjectId === project.id ? 'text-secondary' : 'text-secondary'"
            >
              {{ getProjectInitial(project.title) }}
            </div>

            <!-- Project Info (expanded) -->
            <div
              class="flex-1 min-w-0 transition-[opacity,transform] duration-200"
              :class="isCollapsed ? 'opacity-0 -translate-x-2' : 'opacity-100 translate-x-0'"
            >
              <p class="text-sm font-medium truncate">{{ project.title }}</p>
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full" :class="project.isPublished ? 'bg-green-500' : 'bg-muted-foreground'"></span>
                <span class="text-[10px] text-sidebar-foreground/60">{{ project.isPublished ? 'Published' : 'Draft' }}</span>
              </div>
            </div>

            <!-- Chevron -->
            <Icon name="chevron-down" class="text-xs shrink-0 text-sidebar-foreground/50 transition-all duration-200" />
          </button>

          <!-- Hover Card (collapsed only) -->
          <Card
            v-if="isCollapsed && hoveredProjectId === project.id"
            class="absolute left-full top-0 ml-3 w-56 z-50 p-3.5 shadow-lg pointer-events-none"
          >
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {{ getProjectInitial(project.title) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-foreground truncate">{{ project.title }}</p>
                  <p class="text-[10px] text-muted-foreground truncate">{{ project.slug }}.lands.app</p>
                </div>
              </div>
              <div class="flex items-center justify-between pt-1 border-t border-border">
                <Badge :variant="project.isPublished ? 'success' : 'secondary'" size="xs" dot>
                  {{ project.isPublished ? 'Published' : 'Draft' }}
                </Badge>
                <Badge :variant="project.plan === 'pro' ? 'info' : 'outline'" size="xs">
                  {{ project.plan === 'pro' ? 'Pro' : 'Free' }}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        <!-- Project Sub-navigation (expanded - full width) -->
        <div
          v-if="!isCollapsed"
          class="grid transition-[grid-template-rows] duration-200 ease-out"
          :class="expandedProjectId === project.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        >
          <div class="overflow-hidden">
            <div class="ml-6 pl-1 border-l border-sidebar-border space-y-0.5 py-0.5">
              <router-link
                v-for="nav in navItems"
                :key="nav.name"
                :to="{ name: nav.name, params: { projectId: project.id } }"
                class="flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors"
                :class="isNavActive(nav.name, project.id)
                  ? 'bg-sidebar-accent/50 text-sidebar-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'"
              >
                <Icon :name="nav.icon" :size="14" class="shrink-0" />
                <span class="text-xs font-medium">{{ nav.label }}</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Project Sub-navigation (collapsed - icons only) -->
        <div
          v-if="isCollapsed && expandedProjectId === project.id"
          class="flex flex-col items-center gap-1 py-1"
        >
          <Tooltip v-for="nav in navItems" :key="nav.name" :text="nav.label" position="right">
            <router-link
              :to="{ name: nav.name, params: { projectId: project.id } }"
              class="flex items-center justify-center w-8 h-8 rounded-md transition-colors"
              :class="isNavActive(nav.name, project.id)
                ? 'bg-sidebar-accent text-sidebar-foreground'
                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'"
            >
              <Icon :name="nav.icon" :size="14" />
            </router-link>
          </Tooltip>
        </div>
      </div>

      <!-- New Project Button -->
      <Button
        v-if="projects.length > 0"
        variant="ghost"
        :size="isCollapsed ? 'icon' : 'xs'"
        :full-width="!isCollapsed"
        class="mt-2 border border-dashed p-0 border-sidebar-border "
        :class="isCollapsed ? 'mx-auto' : ''"
        @click="showNewProjectModal = true"
      >
        <Icon name="plus" class="text-lg" />
        <span
          v-if="!isCollapsed"
          class="text-xxs font-medium"
        >New project</span>
      </Button>
    </nav>

    <!-- User section -->
    <div class="p-2">
      <Dropdown align="left" position="top">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sidebar-foreground bg-sidebar-accent transition-colors overflow-hidden"
            :class="isCollapsed ? 'justify-center' : ''"
            @click="toggle"
          >
            <Avatar
              :src="user.avatar"
              :name="user.name"
              :email="user.email"
              size="sm"
            />
            <div
              class="flex-1 min-w-0 text-left transition-[opacity,transform] duration-200"
              :class="isCollapsed ? 'opacity-0 -translate-x-2 absolute' : 'opacity-100 translate-x-0'"
            >
              <p class="text-sm font-medium text-sidebar-foreground truncate">{{ user.name || 'User' }}</p>
              <p class="text-xs text-sidebar-foreground/60 truncate">{{ user.email }}</p>
            </div>
          </button>
        </template>

        <Dropdown.Item icon="lni-user-4" @click="goToAccount">
          Account Settings
        </Dropdown.Item>
        <Dropdown.Item icon="app-logout" @click="signOut">
          Sign Out
        </Dropdown.Item>
      </Dropdown>
    </div>

    <!-- New Project Modal -->
    <ProjectCreate
      v-model:open="showNewProjectModal"
      @created="onProjectCreated"
    />
  </aside>
</template>
