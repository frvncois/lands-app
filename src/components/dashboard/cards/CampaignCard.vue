<script setup lang="ts">
import { MegaphoneIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useCampaignStore } from '@/stores/campaign'
import { useDashboardDetail } from '@/composables/useDashboardDetail'

defineEmits<{ setupCampaign: [] }>()
const campaignStore = useCampaignStore()
const { openDetail } = useDashboardDetail()
</script>

<template>
  <!-- not connected -->
  <div v-if="!campaignStore.isConnected" class="shrink-0 flex-1 card-appear rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-2 p-4 text-center" style="animation-delay: 500ms">
    <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
      <MegaphoneIcon class="h-4 w-4 text-gray-900" />
    </div>
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-gray-900">Connect email provider</p>
      <p class="text-xs text-gray-400 leading-relaxed">Connect Mailchimp, Flodesk, Brevo and more to start capturing subscribers.</p>
    </div>
    <BaseButton variant="solid" size="sm" @click="$emit('setupCampaign')">
      Set up Campaign
    </BaseButton>
  </div>

  <!-- connected -->
  <BaseCard v-else variant="spaced" :icon="MegaphoneIcon" title="Campaign" class="shrink-0 card-appear" style="animation-delay: 500ms">
    <template #header-action>
      <button
        class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        @click="openDetail('campaign')"
      >
        View More <ArrowRightIcon class="h-3 w-3" />
      </button>
    </template>
    <p class="text-xs text-gray-400">0 subscribers</p>
  </BaseCard>
</template>
