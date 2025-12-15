<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useProjectSettings } from './useProjectSettings'
import { useProjectPublishing } from './useProjectPublishing'
import PlanUpgrade from '@/components/modal/PlanUpgrade.vue'
import { Card, ToggleItem, Badge, Alert, Spinner } from '@/components/ui'

const projectStore = useProjectStore()
const settings = computed(() => projectStore.settings)
const projectId = computed(() => projectStore.currentProjectId || '')

const { canUseAnalytics } = useProjectSettings()
const publishing = computed(() => useProjectPublishing(projectId.value))

const showUpgradeModal = ref(false)
</script>

<template>
  <Card>
    <Card.Header title="Analytics" icon="lni-bar-chart-4" />
    <Card.Content class="space-y-4">
      <ToggleItem
        :model-value="settings.analytics.umamiEnabled || false"
        :disabled="publishing.isSettingUpAnalytics.value || !canUseAnalytics"
        @update:model-value="publishing.toggleAnalytics"
      >
        <template #label>
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium text-foreground">Site Analytics</p>
            <Badge v-if="!canUseAnalytics" variant="secondary" size="xs">Pro</Badge>
          </div>
        </template>
        <template #description>
          <p class="text-xs text-muted-foreground">
            {{ !canUseAnalytics ? 'Upgrade to Pro to enable analytics' : 'Track visitors, page views, and more' }}
          </p>
        </template>
      </ToggleItem>

      <button
        v-if="!canUseAnalytics"
        class="text-xs text-primary hover:underline"
        @click="showUpgradeModal = true"
      >
        Upgrade to Pro to enable analytics
      </button>

      <div v-if="publishing.isSettingUpAnalytics.value" class="flex items-center gap-2 text-xs text-muted-foreground">
        <Spinner size="xs" />
        {{ settings.analytics.umamiEnabled ? 'Disabling analytics...' : 'Setting up analytics...' }}
      </div>

      <Alert v-if="settings.analytics.umamiEnabled && settings.analytics.umamiSiteId" variant="success">
        Analytics is active and tracking visitors
      </Alert>

      <p v-if="canUseAnalytics" class="text-xs text-muted-foreground">
        Privacy-focused analytics powered by Umami. No cookies, GDPR compliant.
      </p>
    </Card.Content>

    <PlanUpgrade
      v-model:open="showUpgradeModal"
      :project-id="projectId"
    />
  </Card>
</template>
