<script setup lang="ts">
import { ref } from 'vue'
import { MegaphoneIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/components/ui/BaseButton.vue'
import SetupCampaignModal from '@/components/modals/SetupCampaignModal.vue'
import { CAMPAIGN_PROVIDERS } from '@/types/campaign'
import { useCampaignStore } from '@/stores/campaign'

const campaignStore = useCampaignStore()
const showSetupModal = ref(false)
</script>

<template>
  <div class="flex flex-col gap-5 p-4">

    <!-- Provider connection card -->
    <div class="rounded-xl bg-white border border-gray-100 p-4">
      <div class="flex items-center gap-3 mb-2">
        <div class="h-8 w-8 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
          <MegaphoneIcon class="h-4 w-4 text-gray-600" />
        </div>
        <div>
          <p class="text-xs font-medium text-gray-900">Email provider</p>
          <p class="text-xs text-gray-400">Campaign integration</p>
        </div>
        <div v-if="campaignStore.isConnected" class="ml-auto flex items-center gap-1 text-green-600">
          <CheckCircleIcon class="h-4 w-4" />
          <span class="text-xs font-medium">Connected</span>
        </div>
      </div>

      <template v-if="campaignStore.isConnected">
        <p class="text-xs text-gray-500 mb-2">
          {{ CAMPAIGN_PROVIDERS.find(p => p.id === campaignStore.connection.provider)?.label }}
        </p>
        <BaseButton variant="outline" size="sm" class="w-full justify-center" @click="showSetupModal = true">
          Manage integration
        </BaseButton>
      </template>
      <template v-else>
        <p class="text-xs text-gray-400 leading-relaxed mb-2">
          Connect Mailchimp, Flodesk, Brevo and more to capture emails directly from your land.
        </p>
        <BaseButton variant="solid" size="sm" class="w-full justify-center" @click="showSetupModal = true">
          Connect email provider
        </BaseButton>
      </template>
    </div>

    <!-- Stats — only shown when connected -->
    <template v-if="campaignStore.isConnected">
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
      <SetupCampaignModal v-if="showSetupModal" @close="showSetupModal = false" />
    </Transition>
  </Teleport>
</template>
