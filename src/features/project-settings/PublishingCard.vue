<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useProjectPublishing } from './useProjectPublishing'
import ProjectUnpublish from '@/components/modal/ProjectUnpublish.vue'
import { Card, FormField, Input, ToggleItem, Alert, Button } from '@/components/ui'

const projectStore = useProjectStore()
const settings = computed(() => projectStore.settings)
const projectId = computed(() => projectStore.currentProjectId || '')

const publishing = computed(() => useProjectPublishing(projectId.value))

const showUnpublishModal = ref(false)
const passwordChanged = ref(false)
const savedPassword = ref('')

// Track saved password state on load
watch(
  () => settings.value.publish.password,
  (newPassword) => {
    if (!passwordChanged.value) {
      savedPassword.value = newPassword || ''
    }
  },
  { immediate: true }
)

async function handlePublishToggle() {
  if (publishing.value.isPublishing.value) return

  if (settings.value.publish.isPublished) {
    showUnpublishModal.value = true
  } else {
    await doPublish()
  }
}

async function doPublish() {
  await publishing.value.publish()
  savedPassword.value = settings.value.publish.password || ''
  passwordChanged.value = false
}

async function handleUnpublishConfirm() {
  await publishing.value.unpublish()
  showUnpublishModal.value = false
}

async function handlePasswordProtectionToggle() {
  if (publishing.value.isPublishing.value) return

  const isCurrentlyProtected = settings.value.publish.visibility === 'password'

  if (isCurrentlyProtected) {
    projectStore.updatePublish({ visibility: 'public', password: '' })

    if (settings.value.publish.isPublished) {
      await doPublish()
    }
  } else {
    projectStore.updatePublish({ visibility: 'password' })
  }
}

function handlePasswordInput(value: string) {
  projectStore.updatePublish({ password: value })
  passwordChanged.value = value !== savedPassword.value
}
</script>

<template>
  <Card>
    <Card.Header
      title="Publishing"
      icon="lni-globe-1"
    />
    <Card.Content class="space-y-4">
      <ToggleItem
        :model-value="settings.publish.isPublished"
        label="Publish Status"
        :description="publishing.isPublishing.value ? (settings.publish.isPublished ? 'Unpublishing...' : 'Publishing...') : 'Make your project live'"
        :disabled="publishing.isPublishing.value"
        @update:model-value="handlePublishToggle"
      />

      <ToggleItem
        :model-value="settings.publish.visibility === 'password'"
        label="Password Protection"
        description="Require a password to view your site"
        :disabled="publishing.isPublishing.value"
        @update:model-value="handlePasswordProtectionToggle"
      />

      <div
        v-if="settings.publish.visibility === 'password'"
        class="space-y-3"
      >
        <FormField label="Password">
          <Input
            :model-value="settings.publish.password"
            placeholder="Enter password"
            @update:model-value="handlePasswordInput($event as string)"
          />
        </FormField>

        <Alert
          v-if="passwordChanged && settings.publish.isPublished"
          variant="warning"
        >
          <div class="flex items-center justify-between">
            <span>Update your site to apply password protection</span>
            <Button
              size="xs"
              :loading="publishing.isPublishing.value"
              @click="doPublish"
            >
              {{ publishing.isPublishing.value ? 'Updating...' : 'Update' }}
            </Button>
          </div>
        </Alert>
      </div>

      <div
        v-if="settings.publish.publishedAt"
        class="flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <i class="lni lni-calendar-5 text-xs" />
        Last published: {{ new Date(settings.publish.publishedAt).toLocaleDateString() }}
      </div>
    </Card.Content>

    <ProjectUnpublish
      v-model:open="showUnpublishModal"
      :project-title="settings.title"
      @confirm="handleUnpublishConfirm"
    />
  </Card>
</template>
