<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import ProjectDelete from '@/components/modal/ProjectDelete.vue'
import { Card, Button } from '@/components/ui'

const projectStore = useProjectStore()
const settings = computed(() => projectStore.settings)
const projectId = computed(() => projectStore.currentProjectId || '')

const showDeleteModal = ref(false)
</script>

<template>
  <Card variant="destructive">
    <Card.Header :border-bottom="false">
      <template #icon>
        <i class="lni lni-xmark-circle text-sm" />
      </template>
      <h2 class="text-xs font-medium text-destructive">
        Danger Zone
      </h2>
      <template #action>
        <Button
          variant="destructive"
          size="sm"
          @click="showDeleteModal = true"
        >
          Delete Project
        </Button>
      </template>
    </Card.Header>

    <ProjectDelete
      v-model:open="showDeleteModal"
      :project-id="projectId"
      :project-title="settings.title"
    />
  </Card>
</template>
