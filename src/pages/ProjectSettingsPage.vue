<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { Header, Button } from '@/components/ui'
import SettingsRenderer from '@/components/settings/SettingsRenderer.vue'
import { PROJECT_SETTINGS } from '@/settings/projectSettings'

const route = useRoute()
const projectStore = useProjectStore()

const projectId = computed(() => route.params.projectId as string)

watch(
  projectId,
  async (id) => {
    if (id) {
      await projectStore.loadProject(id)
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex-1 h-full overflow-y-auto bg-background">
    <div class="max-w-6xl mx-auto p-8">
      <Header
        title="Project Settings"
        description="Manage your project configuration and publishing options."
      >
        <template #actions>
          <Button
            :disabled="!projectStore.hasUnsavedChanges"
            :loading="projectStore.isSaving"
            @click="projectStore.saveToDatabase()"
          >
            Save
          </Button>
        </template>
      </Header>

      <SettingsRenderer :sections="PROJECT_SETTINGS" />
    </div>
  </div>
</template>
