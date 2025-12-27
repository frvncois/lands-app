<script setup lang="ts">
import { computed } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { Badge } from '@/components/ui'

const emit = defineEmits<{
  select: [projectId: string]
}>()

const projectsStore = useProjectsStore()

// Get all projects sorted by most recent
const projects = computed(() => {
  return [...projectsStore.projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5) // Max 5 projects
})

const hasMoreProjects = computed(() => {
  return projectsStore.projects.length > 5
})

function handleSelect(projectId: string) {
  emit('select', projectId)
}
</script>

<template>
  <div class="space-y-2">
    <button
      v-for="project in projects"
      :key="project.id"
      class="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary transition-colors text-left"
      @click="handleSelect(project.id)"
    >
      <div
        v-if="project.thumbnail"
        class="w-10 h-10 rounded bg-cover bg-center shrink-0 border border-border"
        :style="{ backgroundImage: `url(${project.thumbnail})` }"
      ></div>
      <div
        v-else
        class="w-10 h-10 rounded bg-secondary flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0"
      >
        {{ project.title.charAt(0).toUpperCase() }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">{{ project.title }}</p>
        <div class="flex items-center gap-1.5 mt-0.5">
          <Badge :variant="project.isPublished ? 'success' : 'secondary'" size="xs" dot>
            {{ project.isPublished ? 'Published' : 'Draft' }}
          </Badge>
        </div>
      </div>
    </button>

    <p v-if="hasMoreProjects" class="text-xs text-muted-foreground text-center pt-1">
      Showing 5 most recent projects
    </p>

    <p v-if="projects.length === 0" class="text-sm text-muted-foreground text-center py-4">
      No projects yet. Create your first one!
    </p>
  </div>
</template>
