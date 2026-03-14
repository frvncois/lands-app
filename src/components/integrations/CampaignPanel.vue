<script setup lang="ts">
import { ref } from 'vue'
import { MegaphoneIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseBadge from '../ui/BaseBadge.vue'
import BaseCard from '../ui/BaseCard.vue'
import BasePlanGate from '../ui/BasePlanGate.vue'
import SetupCampaignModal from '../modals/SetupCampaignModal.vue'
import { CAMPAIGN_PROVIDERS } from '@/types/campaign'
import { useCampaignStore } from '@/stores/campaign'
import { useToast } from '@/composables/useToast'
import { usePlan } from '@/composables/usePlan'

const campaignStore = useCampaignStore()
const { addToast } = useToast()
const { canUseCampaign } = usePlan()
const showSetupModal = ref(false)

function disconnect() {
  campaignStore.clearConnection()
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
          {{ CAMPAIGN_PROVIDERS.find(p => p.id === campaignStore.connection.provider)?.label }}
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
    <div class="flex flex-col gap-4 p-4">
      <BaseCard :icon="MegaphoneIcon" title="Campaign">
        Grow your audience by integrating Mailchimp, FloDesk or Brevo.
        <template #actions>
          <BaseButton size="sm" variant="solid" class="w-full justify-center" @click="showSetupModal = true">
            Set up Campaign
          </BaseButton>
        </template>
      </BaseCard>
    </div>
  </template>

  <Teleport to="body">
    <Transition name="modal-center">
      <SetupCampaignModal v-if="showSetupModal" @close="showSetupModal = false" />
    </Transition>
  </Teleport>

</template>
