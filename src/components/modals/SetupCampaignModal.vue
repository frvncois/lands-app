<script setup lang="ts">
import { ref } from 'vue'
import { XMarkIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseModal from '../ui/BaseModal.vue'
import { CAMPAIGN_PROVIDERS, type CampaignProviderMeta } from '@/types/campaign'
import { useCampaignStore } from '@/stores/campaign'
import { useToast } from '@/composables/useToast'

const { addToast } = useToast()

const emit = defineEmits<{ close: [] }>()

const campaignStore = useCampaignStore()

const step = ref<'pick' | 'connect'>('pick')
const selectedProvider = ref<CampaignProviderMeta | null>(null)
const formApiKey = ref('')
const formAudienceId = ref('')
const formWebhookUrl = ref('')
const formError = ref('')

function pickProvider(p: CampaignProviderMeta) {
  selectedProvider.value = p
  const existing = campaignStore.connection
  formApiKey.value = existing.provider === p.id ? (existing.api_key ?? '') : ''
  formAudienceId.value = existing.provider === p.id ? (existing.audience_id ?? '') : ''
  formWebhookUrl.value = existing.provider === p.id ? (existing.webhook_url ?? '') : ''
  formError.value = ''
  step.value = 'connect'
}

function back() {
  step.value = 'pick'
  selectedProvider.value = null
  formError.value = ''
}

function connect() {
  const p = selectedProvider.value!
  if (p.fields.includes('api_key') && !formApiKey.value.trim()) {
    formError.value = 'API key is required.'
    return
  }
  if (p.fields.includes('webhook_url') && !formWebhookUrl.value.trim()) {
    formError.value = 'Webhook URL is required.'
    return
  }
  campaignStore.setConnection({
    provider: p.id,
    api_key: formApiKey.value.trim(),
    audience_id: formAudienceId.value.trim(),
    webhook_url: formWebhookUrl.value.trim(),
  })
  addToast(`${p.label} connected`)
  emit('close')
}
</script>

<template>
  <BaseModal @close="emit('close')">
    <div>

      <div class="flex items-center justify-between mb-4">
        <Transition name="modal-title" mode="out-in">
          <h3 :key="step" class="text-lg font-semibold text-gray-900">
            {{ step === 'pick' ? 'Connect email provider' : selectedProvider?.label }}
          </h3>
        </Transition>
        <button class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100" @click="emit('close')">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <Transition name="modal-forward" mode="out-in">

        <!-- Step 1: Pick provider -->
        <div v-if="step === 'pick'" class="space-y-4">
          <p class="text-sm text-gray-400 leading-relaxed">
            Choose your email marketing platform to collect subscribers directly from your landing page.
          </p>
          <div class="flex flex-col gap-2">
            <button
              v-for="p in CAMPAIGN_PROVIDERS"
              :key="p.id"
              class="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-left w-full"
              :class="campaignStore.connection.provider === p.id ? 'border-green-200 bg-green-50' : ''"
              @click="pickProvider(p)"
            >
              <div>
                <p class="text-sm font-medium text-gray-900">{{ p.label }}</p>
                <p class="text-xs text-gray-400">{{ p.description }}</p>
              </div>
              <ChevronRightIcon class="h-4 w-4 text-gray-300 shrink-0" />
            </button>
          </div>
          <div class="flex justify-end pt-2">
            <BaseButton @click="emit('close')">Cancel</BaseButton>
          </div>
        </div>

        <!-- Step 2: Enter credentials -->
        <div v-else class="space-y-4">
          <p class="text-sm text-gray-400 leading-relaxed">
            {{ selectedProvider?.description }}
          </p>
          <div class="space-y-3">
            <BaseInput
              v-if="selectedProvider?.fields.includes('api_key')"
              label="API Key"
              v-model="formApiKey"
              placeholder="sk-..."
            />
            <BaseInput
              v-if="selectedProvider?.fields.includes('audience_id')"
              :label="selectedProvider?.audienceLabel ?? 'Audience ID'"
              v-model="formAudienceId"
              placeholder="abc123"
            />
            <BaseInput
              v-if="selectedProvider?.fields.includes('webhook_url')"
              label="Webhook URL"
              v-model="formWebhookUrl"
              placeholder="https://your-endpoint.com/subscribe"
            />
          </div>
          <p v-if="formError" class="text-xs text-red-500">{{ formError }}</p>
          <div class="flex justify-end gap-3 pt-2">
            <BaseButton @click="back">Back</BaseButton>
            <BaseButton variant="solid" @click="connect">Connect</BaseButton>
          </div>
        </div>

      </Transition>
    </div>
  </BaseModal>
</template>
