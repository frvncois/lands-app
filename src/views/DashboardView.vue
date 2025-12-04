<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import type { Project } from '@/types/project'
import ProjectCreate from '@/components/modal/ProjectCreate.vue'
import ProjectDelete from '@/components/modal/ProjectDelete.vue'

const router = useRouter()
const projectsStore = useProjectsStore()

const projects = computed(() => projectsStore.projects)
const isLoading = computed(() => projectsStore.isLoading)

const showNewProjectModal = ref(false)
const showDeleteModal = ref(false)
const projectToDelete = ref<Project | null>(null)
const projectMenuOpen = ref<string | null>(null)
const publishingProjectId = ref<string | null>(null)

onMounted(() => {
  projectsStore.fetchProjects()
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

function editProject(projectId: string) {
  router.push({ name: 'editor', params: { projectId } })
}

function openSettings(projectId: string) {
  router.push({ name: 'settings', params: { projectId } })
}

function openAnalytics(projectId: string) {
  router.push({ name: 'analytics', params: { projectId } })
}

async function duplicateProject(project: Project) {
  await projectsStore.duplicateProject(project.id)
  projectMenuOpen.value = null
}

function confirmDelete(project: Project) {
  projectToDelete.value = project
  showDeleteModal.value = true
  projectMenuOpen.value = null
}

function handleDeleted() {
  projectToDelete.value = null
}

async function publishProject(project: Project) {
  projectMenuOpen.value = null
  publishingProjectId.value = project.id

  // First fetch the project content if not already loaded
  if (!projectsStore.getProjectContent(project.id)) {
    await projectsStore.fetchProjectContent(project.id)
  }

  await projectsStore.publishProject(project.id)
  publishingProjectId.value = null
}

async function unpublishProject(project: Project) {
  projectMenuOpen.value = null
  publishingProjectId.value = project.id
  await projectsStore.unpublishProject(project.id)
  publishingProjectId.value = null
}

function openPublishedSite(project: Project) {
  if (project.publishedUrl) {
    window.open(project.publishedUrl, '_blank')
  } else {
    window.open(`https://${project.slug}.lands.app`, '_blank')
  }
  projectMenuOpen.value = null
}

function toggleMenu(projectId: string) {
  projectMenuOpen.value = projectMenuOpen.value === projectId ? null : projectId
}
</script>

<template>
  <div class="flex-1 h-full overflow-y-auto bg-background">
    <div class="max-w-6xl mx-auto p-8">
      <!-- Header (hidden when no projects) -->
      <div v-if="isLoading || projects.length > 0" class="flex items-center justify-between mb-10">
        <div>
          <h1 class="text-2xl text-foreground">Dashboard</h1>
          <p class="text-sm text-muted-foreground mt-1">Manage and create your landing pages.</p>
        </div>
        <button
          class="flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          @click="showNewProjectModal = true"
        >
          <i class="lni lni-plus text-sm"></i>
          New Project
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="flex items-center gap-3 text-muted-foreground">
          <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm">Loading projects...</span>
        </div>
      </div>

      <!-- Projects Grid -->
      <div v-else-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="project in projects"
          :key="project.id"
          class="group bg-card border border-border rounded-lg p-1 hover:border-muted-foreground/25 transition-colors"
        >
          <!-- Thumbnail -->
          <div
            class="relative aspect-video bg-muted flex items-center rounded-md justify-center cursor-pointer"
            @click="editProject(project.id)"
          >
            <img
              v-if="project.thumbnail"
              :src="project.thumbnail"
              :alt="project.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="flex flex-col items-center gap-2 text-muted-foreground">
              <i class="lni lni-photos text-3xl"></i>
              <span class="text-xs">No preview</span>
            </div>
            <!-- Hover overlay -->
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center backdrop-blur-xs justify-center gap-3">
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-xs font-medium rounded-md hover:bg-white/90 transition-colors"
                @click.stop="editProject(project.id)"
              >
                <i class="lni lni-pencil-1 text-xs"></i>
                Edit
              </button>
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white text-xs font-medium rounded-md hover:bg-white/20 transition-colors"
                @click.stop="openSettings(project.id)"
              >
                <i class="lni lni-gear-1 text-xs"></i>
                Settings
              </button>
            </div>
          </div>

          <!-- Info -->
          <div class="p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-medium text-foreground truncate">{{ project.title }}</h3>
                <p class="text-xs text-muted-foreground mt-0.5">{{ project.slug }}.lands.app</p>
              </div>
              <div class="relative">
                <button
                  class="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                  @click="toggleMenu(project.id)"
                >
                  <i class="lni lni-menu-meatballs-2 text-sm"></i>
                </button>
                <!-- Dropdown menu -->
                <div
                  v-if="projectMenuOpen === project.id"
                  class="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-md shadow-lg z-10 py-1"
                >
                  <button
                    class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
                    @click="editProject(project.id)"
                  >
                    <i class="lni lni-pencil-1 text-xs"></i>
                    Edit
                  </button>
                  <button
                    class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
                    @click="openSettings(project.id)"
                  >
                    <i class="lni lni-gear-1 text-xs"></i>
                    Settings
                  </button>
                  <button
                    class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
                    @click="openAnalytics(project.id)"
                  >
                    <i class="lni lni-bar-chart-4 text-xs"></i>
                    Analytics
                  </button>
                  <button
                    class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
                    @click="duplicateProject(project)"
                  >
                    <i class="lni lni-file-multiple text-xs"></i>
                    Duplicate
                  </button>
                  <div class="my-1 border-t border-border"></div>
                  <!-- Publish/Unpublish -->
                  <button
                    v-if="!project.isPublished"
                    class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    :disabled="publishingProjectId === project.id"
                    @click="publishProject(project)"
                  >
                    <i class="lni lni-cloud-upload text-xs"></i>
                    {{ publishingProjectId === project.id ? 'Publishing...' : 'Publish' }}
                  </button>
                  <template v-else>
                    <button
                      class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
                      @click="openPublishedSite(project)"
                    >
                      <i class="lni lni-link-1 text-xs"></i>
                      View Site
                    </button>
                    <button
                      class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      :disabled="publishingProjectId === project.id"
                      @click="unpublishProject(project)"
                    >
                      <i class="lni lni-cloud-download text-xs"></i>
                      {{ publishingProjectId === project.id ? 'Unpublishing...' : 'Unpublish' }}
                    </button>
                  </template>
                  <div class="my-1 border-t border-border"></div>
                  <button
                    class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                    @click="confirmDelete(project)"
                  >
                    <i class="lni lni-trash-3 text-xs"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 mt-3">
              <!-- Publishing indicator -->
              <span
                v-if="publishingProjectId === project.id"
                class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary/10 text-primary"
              >
                <svg class="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing...
              </span>
              <!-- Published badge (clickable) -->
              <button
                v-else-if="project.isPublished"
                class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
                @click="openPublishedSite(project)"
              >
                <span class="w-1 h-1 rounded-full bg-green-500"></span>
                Published
              </button>
              <!-- Draft badge -->
              <span
                v-else
                class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground"
              >
                <span class="w-1 h-1 rounded-full bg-muted-foreground"></span>
                Draft
              </span>
              <span class="text-[10px] text-muted-foreground">Updated {{ formatDate(project.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- New Project Card -->
        <button
          class="flex flex-col items-center justify-center aspect-[4/3] bg-card border-2 border-dashed border-border rounded-lg hover:border-muted-foreground/50 hover:bg-muted/50 transition-colors"
          @click="showNewProjectModal = true"
        >
          <i class="lni lni-plus text-3xl text-muted-foreground mb-2"></i>
          <span class="text-sm font-medium text-muted-foreground">Create new project</span>
        </button>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <i class="lni lni-layers-1 text-3xl text-muted-foreground"></i>
        </div>
        <h3 class="text-lg font-medium text-foreground mb-1">No projects yet</h3>
        <p class="text-sm text-muted-foreground mb-4">Create your first project to get started.</p>
        <button
          class="flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          @click="showNewProjectModal = true"
        >
          <i class="lni lni-plus text-sm"></i>
          Create Project
        </button>
      </div>
    </div>

    <!-- New Project Modal -->
    <ProjectCreate v-model:open="showNewProjectModal" />

    <!-- Delete Project Modal -->
    <ProjectDelete
      v-if="projectToDelete"
      v-model:open="showDeleteModal"
      :project-id="projectToDelete.id"
      :project-title="projectToDelete.title"
      @deleted="handleDeleted"
    />
  </div>
</template>
