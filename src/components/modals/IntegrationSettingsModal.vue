<script setup lang="ts">
import { ref } from 'vue'
import type { FunctionalComponent } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseToggle from '../ui/BaseToggle.vue'
import BaseInput from '../ui/BaseInput.vue'
import CollaboratorsPanel from '../integrations/CollaboratorsPanel.vue'
import CampaignPanel from '../integrations/CampaignPanel.vue'
import StorePanel from '../integrations/StorePanel.vue'
import { useAppModals } from '@/stores/appModals'

export interface Integration {
  id: string
  title: string
  description: string
  icon: FunctionalComponent
}

defineProps<{ integration: Integration; hideHeader?: boolean }>()
defineEmits<{ back: []; save: [] }>()

const appModals = useAppModals()
const analyticsEnabled = ref(true)
const gaId = ref('')

function viewAnalytics() {
  appModals.openDashboardDetail('analytics')
}
</script>

<template>
  <!-- Panel header -->
  <div v-if="!hideHeader" class="flex items-center justify-between p-4 border-b border-gray-200">
    <div class="flex items-center gap-2">
      <button class="text-gray-400 hover:text-gray-700 transition-colors" @click="$emit('back')">
        <component :is="integration.icon" class="h-4 w-4" />
      </button>
      <h2 class="text-sm font-semibold text-gray-900">{{ integration.title }}</h2>
    </div>
    <div class="flex items-center gap-1">
      <template v-if="['analytics', 'collaborators', 'campaign', 'sell_monetize'].includes(integration.id)">
        <BaseButton variant="outline" size="xs" @click="$emit('back')">Back</BaseButton>
      </template>
      <template v-else>
        <BaseButton variant="outline" size="xs" @click="$emit('back')">Cancel</BaseButton>
        <BaseButton variant="solid" size="xs" @click="$emit('save')">Save</BaseButton>
      </template>
    </div>
  </div>

  <div class="flex flex-col max-h-[70vh] overflow-y-auto" :class="!['collaborators', 'campaign', 'sell_monetize'].includes(integration.id) && 'p-4 gap-4'">

    <!-- ── Analytics ── -->
    <template v-if="integration.id === 'analytics'">
      <BaseToggle size="sm" label="Enable analytics" description="Track visits and engagement on your land" v-model="analyticsEnabled" />
      <BaseInput size="sm" label="Google Analytics ID" v-model="gaId" placeholder="G-XXXXXXXXXX" />
      <BaseButton variant="outline" size="sm" class="w-full justify-center" @click="viewAnalytics">
        View Analytics
      </BaseButton>
    </template>

    <!-- ── Campaign ── -->
    <template v-else-if="integration.id === 'campaign'">
      <CampaignPanel />
    </template>

    <!-- ── Collaborators ── -->
    <template v-else-if="integration.id === 'collaborators'">
      <CollaboratorsPanel />
    </template>

    <!-- ── Sell & Monetize ── -->
    <template v-else-if="integration.id === 'sell_monetize'">
      <StorePanel />
    </template>

    <!-- ── Other integrations — placeholder ── -->
    <template v-else>
      <p class="text-xs text-gray-400">{{ integration.description }}</p>
      <p class="text-xs text-gray-300 italic">Settings coming soon.</p>
    </template>

  </div>
</template>
