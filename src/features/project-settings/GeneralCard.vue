<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { Card, Input, Textarea, FormField } from '@/components/ui'

const projectStore = useProjectStore()
const settings = computed(() => projectStore.settings)
</script>

<template>
  <Card>
    <Card.Header title="General" icon="lni-gear-1" />
    <Card.Content class="space-y-4">
      <FormField label="Project Title">
        <Input
          :model-value="settings.title"
          placeholder="My Project"
          @update:model-value="projectStore.updateTitle($event as string)"
        />
      </FormField>

      <FormField label="Project Slug">
        <Input
          :model-value="settings.slug"
          placeholder="my-project"
          suffix=".lands.app"
          @update:model-value="projectStore.updateSlug($event as string)"
        />
      </FormField>

      <FormField label="Description">
        <Textarea
          :model-value="settings.description"
          placeholder="A brief description..."
          :rows="2"
          @update:model-value="projectStore.updateSettings({ description: $event })"
        />
      </FormField>
    </Card.Content>
  </Card>
</template>
