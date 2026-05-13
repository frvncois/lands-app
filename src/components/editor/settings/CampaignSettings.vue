<script setup lang="ts">
import { ref, watch } from 'vue'
import { MegaphoneIcon, PuzzlePieceIcon } from '@heroicons/vue/24/outline'
import BaseInput from '../../ui/BaseInput.vue'
import BaseButton from '../../ui/BaseButton.vue'
import BaseToggle from '../../ui/BaseToggle.vue'
import BaseCard from '../../ui/BaseCard.vue'
import SetupCampaignSettings from './SetupCampaignSettings.vue'
import type { Section, CampaignContent, CampaignSettings } from '@/types/section'
import { useEditorActions } from '@/composables/useEditorActions'
import { useThemePreset } from '@/composables/useThemePreset'
import { useAppModals } from '@/stores/appModals'
import { useCampaignStore } from '@/stores/campaign'
import { usePlan } from '@/composables/usePlan'

const props = defineProps<{ section: Section }>()

const appModals = useAppModals()
const campaignStore = useCampaignStore()
const { canUseCampaign } = usePlan()
const { isMinimalTheme } = useThemePreset()

const { updateSectionContent, updateSectionSettings } = useEditorActions()

const campaignTitle = ref('')
const campaignDescription = ref('')
const campaignButtonLabel = ref('')
const campaignPlaceholder = ref('')
const campaignShowNameField = ref(false)
const showSetupCampaignSettings = ref(false)

function sync() {
  const c = props.section.content as CampaignContent | null
  const s = props.section.settings_json as CampaignSettings
  campaignTitle.value = c?.title ?? ''
  campaignDescription.value = c?.description ?? ''
  campaignButtonLabel.value = c?.button_label ?? ''
  campaignPlaceholder.value = c?.placeholder ?? ''
  campaignShowNameField.value = s?.show_name_field ?? false
}

sync()
watch(() => props.section.id, sync)

function saveContent() {
  updateSectionContent(props.section.id, {
    title: campaignTitle.value,
    description: campaignDescription.value,
    button_label: campaignButtonLabel.value,
    placeholder: campaignPlaceholder.value,
  })
}

function saveSettings() {
  updateSectionSettings(props.section.id, { show_name_field: campaignShowNameField.value })
}
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
      <BaseInput size="sm" label="Title" v-model="campaignTitle" @update:modelValue="saveContent" />
      <BaseInput size="sm" label="Description" v-model="campaignDescription" @update:modelValue="saveContent" />
      <BaseInput size="sm" label="Email placeholder" v-model="campaignPlaceholder" @update:modelValue="saveContent" />
      <BaseInput size="sm" label="Button label" v-model="campaignButtonLabel" @update:modelValue="saveContent" />
      <div v-if="!isMinimalTheme" class="border-t border-gray-100 pt-3">
        <BaseToggle size="sm" label="Name field" description="Add a name field above the email" v-model="campaignShowNameField" @update:modelValue="saveSettings" />
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
