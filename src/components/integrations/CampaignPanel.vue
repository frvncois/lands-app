<script setup lang="ts">
import { ref } from 'vue'
import { MegaphoneIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseBadge from '../ui/BaseBadge.vue'
import BasePlanGate from '../ui/BasePlanGate.vue'
import SetupCampaignSettings from '../editor/settings/SetupCampaignSettings.vue'
import { CAMPAIGN_PROVIDERS } from '@/types/campaign'
import { useCampaignStore } from '@/stores/campaign'
import { useToast } from '@/composables/useToast'
import { usePlan } from '@/composables/usePlan'

const campaignStore = useCampaignStore()
const { addToast } = useToast()
const { canUseCampaign } = usePlan()
const showSetupModal = ref(false)

function disconnect() {
  campaignStore.clearIntegration()
  addToast('Campaign disconnected')
}
</script>

<template>

  <!-- Plan gate -->
  <BasePlanGate
    v-if="!canUseCampaign"
    title="Campaign requires a paid plan"
    description="Upgrade to connect Mailchimp, Brevo, Flodesk and more."
  />

  <!-- Connected state -->
  <template v-else-if="campaignStore.isConnected">
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-green-50">
      <div class="flex items-center gap-2">
        <BaseBadge variant="success" size="xs" dot>Connected</BaseBadge>
        <span class="text-xs font-medium text-gray-700">
          {{ CAMPAIGN_PROVIDERS.find(p => p.id === campaignStore.integration?.provider)?.label }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <BaseButton variant="outline" size="xs" @click="showSetupModal = true">Edit</BaseButton>
        <BaseButton variant="outline" size="xs" @click="disconnect">Disconnect</BaseButton>
      </div>
    </div>
  </template>

  <!-- Not connected state -->
  <template v-else-if="!campaignStore.isConnected">
    <div class="flex flex-col items-center gap-3 py-8 px-4 text-center">
      <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
        <MegaphoneIcon class="h-4 w-4 text-gray-900" />
      </div>
      <div class="flex flex-col gap-1">
        <p class="text-sm font-semibold text-gray-900">Grow your audience</p>
        <p class="text-xs text-gray-400 leading-relaxed">Connect Mailchimp, Flodesk, Brevo and more to capture emails directly from your land.</p>
      </div>
      <BaseButton variant="solid" size="sm" @click="showSetupModal = true">
        Set up Campaign
      </BaseButton>
    </div>
  </template>

  <Teleport to="body">
    <Transition name="modal-center">
      <SetupCampaignSettings v-if="showSetupModal" @close="showSetupModal = false" />
    </Transition>
  </Teleport>

</template>
