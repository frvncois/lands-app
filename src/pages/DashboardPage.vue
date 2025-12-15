<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useUserStore } from '@/stores/user'
import type { Project } from '@/types/project'

import { Header } from '@/components/ui'
import { ProjectsGrid, ProjectsEmpty, ProjectsSkeleton } from '@/features/projects'
import ProjectCreate from '@/components/modal/ProjectCreate.vue'
import ProjectDelete from '@/components/modal/ProjectDelete.vue'

const projectsStore = useProjectsStore()
const userStore = useUserStore()

const projects = computed(() => projectsStore.projects)
const isLoading = computed(() => projectsStore.isLoading)
const userName = computed(
  () => userStore.settings.profile?.name?.split(' ')[0] ?? 'there'
)

// Modal state
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const projectToDelete = ref<Project | null>(null)

onMounted(() => {
  projectsStore.fetchProjects()
})

function handleCreate() {
  showCreateModal.value = true
}

function handleDelete(project: Project) {
  projectToDelete.value = project
  showDeleteModal.value = true
}

function handleDeleted() {
  projectToDelete.value = null
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-10">
    <!-- Header (shown when loading or has projects) -->
    <Header
      v-if="isLoading || projects.length"
      :title="`Welcome, ${userName}`"
      description="Manage and create your landing pages."
      button="New Project"
      @button-click="handleCreate"
    />

    <!-- Loading State -->
    <ProjectsSkeleton v-if="isLoading" />

    <!-- Projects Grid -->
    <ProjectsGrid
      v-else-if="projects.length"
      :projects="projects"
      @create="handleCreate"
      @delete="handleDelete"
    />

    <!-- Empty State -->
    <ProjectsEmpty v-else @create="handleCreate" />
  </div>

  <!-- Modals -->
  <ProjectCreate v-model:open="showCreateModal" />

  <ProjectDelete
    v-if="projectToDelete"
    v-model:open="showDeleteModal"
    :project-id="projectToDelete.id"
    :project-title="projectToDelete.title"
    @deleted="handleDeleted"
  />
</template>
