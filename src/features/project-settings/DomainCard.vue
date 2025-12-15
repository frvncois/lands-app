<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useProjectSettings } from './useProjectSettings'
import { useProjectPublishing } from './useProjectPublishing'
import PlanUpgrade from '@/components/modal/PlanUpgrade.vue'
import { Card, Input, Badge, Button, Alert, FormField } from '@/components/ui'

const projectStore = useProjectStore()
const settings = computed(() => projectStore.settings)
const projectId = computed(() => projectStore.currentProjectId || '')

const { canUseCustomDomain } = useProjectSettings()
const publishing = computed(() => useProjectPublishing(projectId.value))

const showUpgradeModal = ref(false)
const domainChanged = ref(false)
const savedDomain = ref({ subdomain: '', customDomain: '' })

// Track saved domain state on load
watch(
  settings,
  (newSettings) => {
    if (!domainChanged.value) {
      savedDomain.value = {
        subdomain: newSettings.domain.subdomain || '',
        customDomain: newSettings.domain.customDomain || ''
      }
    }
  },
  { immediate: true }
)

function handleSubdomainInput(value: string) {
  projectStore.updateDomain({ subdomain: value })
  checkDomainChanged()
}

function handleCustomDomainInput(value: string) {
  projectStore.updateDomain({ customDomain: value })
  checkDomainChanged()
}

function checkDomainChanged() {
  const currentSubdomain = settings.value.domain.subdomain || ''
  const currentCustomDomain = settings.value.domain.customDomain || ''
  domainChanged.value =
    currentSubdomain !== savedDomain.value.subdomain ||
    currentCustomDomain !== savedDomain.value.customDomain
}

async function handleUpdate() {
  await publishing.value.publish()
  savedDomain.value = {
    subdomain: settings.value.domain.subdomain || '',
    customDomain: settings.value.domain.customDomain || ''
  }
  domainChanged.value = false
}
</script>

<template>
  <Card>
    <Card.Header title="Domain" icon="lni-globe-1" />
    <Card.Content class="space-y-4">
      <FormField label="Subdomain">
        <Input
          :model-value="settings.domain.subdomain"
          placeholder="mysite"
          suffix=".lands.app"
          @update:model-value="handleSubdomainInput($event as string)"
        />
      </FormField>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium text-muted-foreground">Custom Domain</label>
          <Badge v-if="!canUseCustomDomain" variant="secondary" size="xs">Pro</Badge>
        </div>
        <Input
          :model-value="settings.domain.customDomain"
          placeholder="www.example.com"
          :disabled="!canUseCustomDomain"
          @update:model-value="handleCustomDomainInput($event as string)"
        />
        <button
          v-if="!canUseCustomDomain"
          class="text-xs text-primary hover:underline"
          @click="showUpgradeModal = true"
        >
          Upgrade to Pro to use custom domains
        </button>
      </div>

      <div v-if="settings.domain.customDomain && canUseCustomDomain" class="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
        <Badge :variant="settings.domain.customDomainVerified ? 'success' : 'warning'" size="sm">
          {{ settings.domain.customDomainVerified ? 'Verified' : 'Pending' }}
        </Badge>
        <Button
          v-if="!settings.domain.customDomainVerified"
          variant="link"
          size="xs"
          class="ml-auto"
        >
          Verify
        </Button>
      </div>

      <Alert v-if="domainChanged && settings.publish.isPublished" variant="warning">
        <div class="flex items-center justify-between">
          <span>Update your site to apply domain changes</span>
          <Button size="xs" :loading="publishing.isPublishing.value" @click="handleUpdate">
            {{ publishing.isPublishing.value ? 'Updating...' : 'Update' }}
          </Button>
        </div>
      </Alert>
    </Card.Content>

    <PlanUpgrade
      v-model:open="showUpgradeModal"
      :project-id="projectId"
    />
  </Card>
</template>
