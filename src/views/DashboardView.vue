<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useUserStore } from '@/stores/user'
import type { Project } from '@/types/project'
import ProjectCreate from '@/components/modal/ProjectCreate.vue'
import ProjectDelete from '@/components/modal/ProjectDelete.vue'
import { Button, Card, Badge, Skeleton, Spinner, Header, Dropdown } from '@/components/ui'

const router = useRouter()
const projectsStore = useProjectsStore()
const userStore = useUserStore()

const projects = computed(() => projectsStore.projects)
const userName = computed(() => userStore.settings.profile?.name?.split(' ')[0] || 'there')
const isLoading = computed(() => projectsStore.isLoading)

const showNewProjectModal = ref(false)
const showDeleteModal = ref(false)
const projectToDelete = ref<Project | null>(null)
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
}

function confirmDelete(project: Project) {
  projectToDelete.value = project
  showDeleteModal.value = true
}

function handleDeleted() {
  projectToDelete.value = null
}

async function publishProject(project: Project) {
  publishingProjectId.value = project.id

  // First fetch the project content if not already loaded
  if (!projectsStore.getProjectContent(project.id)) {
    await projectsStore.fetchProjectContent(project.id)
  }

  await projectsStore.publishProject(project.id)
  publishingProjectId.value = null
}

async function unpublishProject(project: Project) {
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
}
</script>

<template>
  <div class="flex-1 h-full overflow-y-auto bg-background">
    <div class="max-w-6xl mx-auto p-8">
      <!-- Header (hidden when no projects) -->
      <Header
        v-if="isLoading || projects.length > 0"
        :title="`Welcome, ${userName}`"
        description="Manage and create your landing pages."
        button="New Project"
        button-icon="lni-plus"
        @button-click="showNewProjectModal = true"
      />

      <!-- Loading State (Skeleton) -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="i in 6" :key="i" padded>
          <Skeleton class="aspect-video rounded-xl mb-3" />
          <div class="space-y-3">
            <div class="space-y-2">
              <Skeleton class="h-4 w-3/4" />
              <Skeleton class="h-3 w-1/2" />
            </div>
            <div class="flex items-center gap-3">
              <Skeleton class="h-5 w-16 rounded-full" />
              <Skeleton class="h-3 w-20" />
            </div>
          </div>
        </Card>
      </div>

      <!-- Projects Grid -->
      <div v-else-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          v-for="project in projects"
          :key="project.id"
          class="group"
          variant="ghost"
        >
          <!-- Thumbnail -->
          <Card.Thumbnail
            :src="project.thumbnail"
            :alt="project.title"
            aspect-ratio="4/3"
            class="cursor-pointer"
            @click="editProject(project.id)"
          >
            <template #overlay>
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center backdrop-blur-xs justify-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  @click.stop="editProject(project.id)"
                >
                  <i class="lni lni-pencil-1 text-xs"></i>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  class="bg-white/10 text-white hover:bg-white/20"
                  @click.stop="openSettings(project.id)"
                >
                  <i class="lni lni-gear-1 text-xs"></i>
                  Settings
                </Button>
              </div>
            </template>
          </Card.Thumbnail>

          <!-- Content -->
          <Card.Content>
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <h3 class="text-md font-medium text-foreground truncate">{{ project.title }}</h3>
                <p class="text-xxs font-mono uppercase text-muted-foreground mt-0.5">{{ project.slug }}.lands.app</p>
              </div>

              <!-- Dropdown Menu -->
              <Dropdown icon="lni-menu-meatballs-1">
                <Dropdown.Item icon="lni-pencil-1" @click="editProject(project.id)">
                  Edit
                </Dropdown.Item>
                <Dropdown.Item icon="lni-gear-1" @click="openSettings(project.id)">
                  Settings
                </Dropdown.Item>
                <Dropdown.Item icon="lni-bar-chart-4" @click="openAnalytics(project.id)">
                  Analytics
                </Dropdown.Item>
                <Dropdown.Item icon="lni-file-multiple" @click="duplicateProject(project)">
                  Duplicate
                </Dropdown.Item>
                <Dropdown.Divider />
                <template v-if="!project.isPublished">
                  <Dropdown.Item
                    icon="lni-cloud-upload"
                    :disabled="publishingProjectId === project.id"
                    @click="publishProject(project)"
                  >
                    {{ publishingProjectId === project.id ? 'Publishing...' : 'Publish' }}
                  </Dropdown.Item>
                </template>
                <template v-else>
                  <Dropdown.Item icon="lni-link-1" @click="openPublishedSite(project)">
                    View Site
                  </Dropdown.Item>
                  <Dropdown.Item
                    icon="lni-cloud-download"
                    :disabled="publishingProjectId === project.id"
                    @click="unpublishProject(project)"
                  >
                    {{ publishingProjectId === project.id ? 'Unpublishing...' : 'Unpublish' }}
                  </Dropdown.Item>
                </template>
                <Dropdown.Divider />
                <Dropdown.Item icon="lni-trash-3" destructive @click="confirmDelete(project)">
                  Delete
                </Dropdown.Item>
              </Dropdown>
            </div>

            <!-- Footer with badges -->
            <div class="flex items-center justify-between gap-3 mt-3">
              <!-- Publishing indicator -->
              <Badge v-if="publishingProjectId === project.id" variant="secondary" size="sm">
                <Spinner size="xs" />
                Publishing...
              </Badge>
              <!-- Published badge (clickable) -->
              <Badge
                v-else-if="project.isPublished"
                variant="success"
                size="xs"
                dot
                class="cursor-pointer hover:opacity-80"
                @click="openPublishedSite(project)"
              >
                Published
              </Badge>
              <!-- Draft badge -->
              <Badge v-else variant="secondary" size="xs" dot>
                Draft
              </Badge>
              <span class="text-[10px] text-muted-foreground">Updated {{ formatDate(project.updatedAt) }}</span>
            </div>
          </Card.Content>
        </Card>

        <!-- New Project Card -->
        <Card variant="ghost" class="border-2 border-dashed border-border hover:border-muted-foreground/50 hover:bg-muted/50 transition-colors">
          <button
            class="flex flex-col items-center justify-center w-full aspect-[4/3]"
            @click="showNewProjectModal = true"
          >
            <i class="lni lni-plus text-3xl text-muted-foreground mb-2"></i>
            <span class="text-sm font-medium text-muted-foreground">Create new project</span>
          </button>
        </Card>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <i class="lni lni-layers-1 text-3xl text-muted-foreground"></i>
        </div>
        <h3 class="text-lg font-medium text-foreground mb-1">No projects yet</h3>
        <p class="text-sm text-muted-foreground mb-4">Create your first project to get started.</p>
        <Button @click="showNewProjectModal = true">
          <i class="lni lni-plus text-sm"></i>
          Create Project
        </Button>
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
