<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { Header, Button } from '@/components/ui'
import SettingsRenderer from '@/components/settings/SettingsRenderer.vue'
import {
  SETTINGS_TABS,
  SETTINGS_GENERAL,
  SETTINGS_COLLABORATORS,
  SETTINGS_PLAN,
  PROJECT_NAV,
  type SettingsTab,
} from '@/settings/projectSettings'
import { INTEGRATIONS_SECTIONS } from '@/pages/integrations/IntegrationsSections'
import { useFeatureGate } from '@/composables/useFeatureGate'
import { useIntegrationsState } from '@/pages/integrations/composables/useIntegrationsState'
import IntegrationsUpgradeWall from '@/pages/integrations/sections/IntegrationsUpgradeWall.vue'
import IntegrationsConnectModal from '@/pages/integrations/sections/IntegrationsConnectModal.vue'
import IntegrationsDisconnectModal from '@/pages/integrations/sections/IntegrationsDisconnectModal.vue'

const route = useRoute()
const projectStore = useProjectStore()

const projectId = computed(() => route.params.projectId as string)

// Active tab
const activeTab = ref<SettingsTab>('general')

// Feature gate for integrations
const integrationSection = PROJECT_NAV.find(s => s.id === 'integrations')
const { allowed: integrationsAllowed } = integrationSection
  ? useFeatureGate(integrationSection)
  : { allowed: ref(true) }

// Initialize integrations state
const { isLoading: integrationsLoading } = useIntegrationsState(projectId.value)

// Get sections for current tab
const currentSections = computed(() => {
  switch (activeTab.value) {
    case 'general':
      return SETTINGS_GENERAL
    case 'collaborators':
      return SETTINGS_COLLABORATORS
    case 'plan':
      return SETTINGS_PLAN
    default:
      return []
  }
})

// Show save button only for tabs with saveable content
const showSaveButton = computed(() => {
  return activeTab.value === 'general'
})

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
    <div class="max-w-6xl mx-auto p-10">
      <Header
        title="Project Settings"
        description="Manage your project configuration, publishing, and integrations."
      >
        <template #actions>
          <Button
            v-if="showSaveButton"
            :disabled="!projectStore.hasUnsavedChanges"
            :loading="projectStore.isSaving"
            @click="projectStore.saveToDatabase()"
          >
            Save
          </Button>
        </template>
      </Header>

      <!-- Tabs -->
      <div class="flex items-center gap-1 mb-6 border-b border-border">
        <button
          v-for="tab in SETTINGS_TABS"
          :key="tab.id"
          class="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px"
          :class="activeTab === tab.id
            ? 'border-primary text-foreground'
            : 'border-transparent text-muted-foreground hover:text-foreground'"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <template v-if="activeTab === 'integrations'">
        <IntegrationsUpgradeWall v-if="!integrationsAllowed" />

        <template v-else>
          <!-- Loading State -->
          <div v-if="integrationsLoading" class="flex items-center justify-center py-20">
            <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>

          <SettingsRenderer
            v-else
            :sections="INTEGRATIONS_SECTIONS"
          />
        </template>
      </template>

      <!-- Other tabs use SettingsRenderer -->
      <template v-else>
        <SettingsRenderer :sections="currentSections" />
      </template>
    </div>
  </div>

  <!-- Integrations Modals -->
  <IntegrationsConnectModal />
  <IntegrationsDisconnectModal />
</template>
