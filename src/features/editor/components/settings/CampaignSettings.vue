<script setup lang="ts">
import { ref } from 'vue'
import { MegaphoneIcon, PuzzlePieceIcon } from '@heroicons/vue/24/outline'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseToggle from '@/shared/ui/BaseToggle.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import SetupCampaignSettings from './SetupCampaignSettings.vue'
import type { CampaignSection } from '@/features/sections/types'
import { useSectionForm } from '@/features/editor/composables/useSectionForm'
import { useThemePreset } from '@/features/theme/composables/useThemePreset'
import { useAppModals } from '@/features/modals/composables/useAppModals'
import { useCampaignStore } from '@/features/integrations/stores/campaign'
import { usePlan } from '@/features/plan/composables/usePlan'

const props = defineProps<{ section: CampaignSection }>()

const appModals = useAppModals()
const campaignStore = useCampaignStore()
const { canUseCampaign } = usePlan()
const { isMinimalTheme } = useThemePreset()
const { contentField, settingsField } = useSectionForm(() => props.section)

const campaignTitle = contentField('title', '')
const campaignDescription = contentField('description', '')
const campaignButtonLabel = contentField('button_label', '')
const campaignPlaceholder = contentField('placeholder', '')
const campaignShowNameField = settingsField('show_name_field', false)
const showSetupCampaignSettings = ref(false)
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <!-- Not connected -->
    <template v-if="!campaignStore.isConnected">
      <div class="rounded-xl border border-gray-200 flex flex-col items-center gap-4 py-8 px-4 text-center">
        <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <MegaphoneIcon class="h-5 w-5 text-gray-900" />
        </div>
        <p class="text-sm font-semibold text-gray-900">Campaign</p>
        <p class="text-xs text-gray-400 leading-relaxed">Grow your audience by connecting Mailchimp, FloDesk or Brevo to collect email subscribers.</p>
        <BaseButton v-if="canUseCampaign" variant="solid" size="sm" @click="showSetupCampaignSettings = true">Set up Campaign</BaseButton>
        <BaseButton v-else variant="solid" size="sm" @click="appModals.openUpgrade()">Upgrade to Pro</BaseButton>
      </div>
    </template>

    <!-- Connected -->
    <template v-else>
      <BaseInput size="sm" label="Title" v-model="campaignTitle" />
      <BaseInput size="sm" label="Description" v-model="campaignDescription" />
      <BaseInput size="sm" label="Email placeholder" v-model="campaignPlaceholder" />
      <BaseInput size="sm" label="Button label" v-model="campaignButtonLabel" />
      <div v-if="!isMinimalTheme" class="border-t border-gray-100 pt-3">
        <BaseToggle size="sm" label="Name field" description="Add a name field above the email" v-model="campaignShowNameField" />
      </div>
      <BaseCard :icon="PuzzlePieceIcon" title="Campaign">
        <div class="grid grid-cols-2 gap-2">
          <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
            <p class="text-xs text-gray-400">Subscribers</p>
            <p class="text-xl font-semibold text-gray-900 leading-tight">0</p>
            <p class="text-xs text-gray-400">total</p>
          </div>
          <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
            <p class="text-xs text-gray-400">New</p>
            <p class="text-xl font-semibold text-gray-900 leading-tight">0</p>
            <p class="text-xs text-gray-400">this month</p>
          </div>
        </div>
        <template #actions>
          <BaseButton size="sm" variant="outline" class="w-full justify-center" @click="appModals.openDashboardDetail('campaign')">View details</BaseButton>
        </template>
      </BaseCard>
    </template>
  </div>

  <Teleport to="body">
    <Transition name="modal-center">
      <SetupCampaignSettings v-if="showSetupCampaignSettings" @close="showSetupCampaignSettings = false" />
    </Transition>
  </Teleport>
</template>
