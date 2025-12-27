<script setup lang="ts">
import type { Project } from '@/types/project'
import ProjectCard from './ProjectCard.vue'

defineProps<{
  projects: Project[]
}>()

const emit = defineEmits<{
  delete: [project: Project]
}>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <ProjectCard
      v-for="project in projects"
      :key="project.id"
      :project="project"
      @delete="emit('delete', $event)"
    />
  </div>
</template>
