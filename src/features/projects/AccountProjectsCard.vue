<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { Card } from '@/components/ui'
import AccountProjectItem from './AccountProjectItem.vue'

const projectsStore = useProjectsStore()
const projects = computed(() => projectsStore.projects)

onMounted(() => {
  projectsStore.fetchProjects()
})
</script>

<template>
  <Card>
    <Card.Header title="Your Projects" icon="lni-folder-1" />
    <Card.Content class="space-y-3">
      <AccountProjectItem
        v-for="project in projects"
        :key="project.id"
        :project="project"
      />

      <!-- Empty State -->
      <div v-show="projects.length === 0" class="py-4 text-center">
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
          <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <p class="text-sm text-muted-foreground">No projects yet</p>
        <p class="text-xs text-muted-foreground mt-1">Create your first project from the sidebar</p>
      </div>
    </Card.Content>
  </Card>
</template>
