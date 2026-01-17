<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { PROJECT_NAV } from '@/settings/projectSettings'
import { useFeatureGate } from '@/composables/useFeatureGate'
import { Header } from '@/components/ui'
import SettingsRenderer from '@/components/settings/SettingsRenderer.vue'
import { INTEGRATIONS_SECTIONS } from './IntegrationsSections'
import IntegrationsUpgradeWall from './sections/IntegrationsUpgradeWall.vue'
import IntegrationsConnectModal from './sections/IntegrationsConnectModal.vue'
import IntegrationsDisconnectModal from './sections/IntegrationsDisconnectModal.vue'
import { useIntegrationsState } from './composables/useIntegrationsState'

const route = useRoute()
const projectId = computed(() => route.params.projectId as string)

// Initialize shared state with projectId
useIntegrationsState(projectId.value)

// Feature gate
const integrationSection = PROJECT_NAV.find(s => s.routeName === 'integration')!
const { allowed } = useFeatureGate(integrationSection)

// Get loading state
const { isLoading } = useIntegrationsState()
</script>

<template>
  <div class="flex-1 h-full overflow-y-auto bg-background">
    <div class="max-w-6xl mx-auto p-8">
      <Header
        title="Integrations"
        description="Connect third-party services to enhance your project."
      />

      <IntegrationsUpgradeWall v-if="!allowed" />

      <template v-else>
        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
          <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"/>
        </div>

        <SettingsRenderer
          v-else
          :sections="INTEGRATIONS_SECTIONS"
        />
      </template>
    </div>
  </div>

  <!-- Modals at page root -->
  <IntegrationsConnectModal />
  <IntegrationsDisconnectModal />
</template>
