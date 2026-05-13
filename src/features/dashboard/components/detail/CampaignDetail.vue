<script setup lang="ts">
import { ref } from 'vue'
import { MegaphoneIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/shared/ui/BaseButton.vue'
import SetupCampaignSettings from '@/features/editor/components/settings/SetupCampaignSettings.vue'
import { CAMPAIGN_PROVIDERS } from '@/features/integrations/types/campaign'
import { useCampaignStore } from '@/features/integrations/stores/campaign'

const campaignStore = useCampaignStore()
const showSetupModal = ref(false)
</script>

<template>
  <div class="flex flex-col gap-4 p-4">

    <!-- Not connected: setup card -->
    <div v-if="!campaignStore.isConnected" class="rounded-xl border border-gray-200 flex flex-col items-center gap-4 py-8 px-4 text-center">
      <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
        <MegaphoneIcon class="h-5 w-5 text-gray-900" />
      </div>
      <p class="text-sm font-semibold text-gray-900">Campaign</p>
      <p class="text-xs text-gray-400 leading-relaxed">Grow your audience by connecting Mailchimp, FloDesk or Brevo to collect email subscribers.</p>
      <BaseButton variant="solid" size="sm" @click="showSetupModal = true">Set up Campaign</BaseButton>
    </div>

    <!-- Connected: provider card + stats -->
    <template v-else>
      <div class="rounded-xl bg-white border border-gray-100 p-4">
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <MegaphoneIcon class="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p class="text-xs font-medium text-gray-900">
              {{ CAMPAIGN_PROVIDERS.find(p => p.id === campaignStore.integration?.provider)?.label }}
            </p>
            <p class="text-xs text-gray-400">Email provider</p>
          </div>
          <div class="ml-auto flex items-center gap-1 text-green-600">
            <CheckCircleIcon class="h-4 w-4" />
            <span class="text-xs font-medium">Connected</span>
          </div>
        </div>
        <BaseButton variant="outline" size="sm" class="w-full justify-center mt-3" @click="showSetupModal = true">
          Manage integration
        </BaseButton>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
          <p class="text-xs text-gray-400">Subscribers</p>
          <p class="text-xl font-semibold text-gray-900 leading-tight">0</p>
          <p class="text-xs text-gray-400">total</p>
        </div>
        <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
          <p class="text-xs text-gray-400">Sent</p>
          <p class="text-xl font-semibold text-gray-900 leading-tight">0</p>
          <p class="text-xs text-gray-400">campaigns</p>
        </div>
      </div>

      <div class="rounded-xl bg-white border border-gray-100 p-3">
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs font-medium text-gray-500">Campaigns</p>
          <BaseButton variant="solid" size="xs">New campaign</BaseButton>
        </div>
        <div class="flex flex-col items-center gap-2 py-6 text-center">
          <div class="h-10 w-10 rounded-xl bg-gray-200 flex items-center justify-center">
            <MegaphoneIcon class="h-5 w-5 text-gray-400" />
          </div>
          <p class="text-xs text-gray-400">No campaigns yet.</p>
          <p class="text-xs text-gray-300">Add a Campaign section to your land to start collecting subscribers.</p>
        </div>
      </div>
    </template>

  </div>

  <Teleport to="body">
    <Transition name="modal-center">
      <SetupCampaignSettings v-if="showSetupModal" @close="showSetupModal = false" />
    </Transition>
  </Teleport>
</template>
