<script setup lang="ts">
import { ref, reactive } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseBadge from '../ui/BaseBadge.vue'
import BaseInput from '../ui/BaseInput.vue'
import { CAMPAIGN_PROVIDERS, type CampaignProviderType, type CampaignConnection } from '@/types/campaign'

// Mock connection state (per land, persisted in module scope for dev)
const connection = reactive<Partial<CampaignConnection>>({})
const connecting = ref<CampaignProviderType | null>(null)

// Form state
const formApiKey = ref('')
const formAudienceId = ref('')
const formScript = ref('')
const formError = ref('')

function openConnect(id: CampaignProviderType) {
  connecting.value = id
  formApiKey.value = connection.provider === id ? connection.api_key ?? '' : ''
  formAudienceId.value = connection.provider === id ? connection.audience_id ?? '' : ''
  formScript.value = connection.provider === id ? connection.script ?? '' : ''
  formError.value = ''
}

function cancelConnect() {
  connecting.value = null
  formError.value = ''
}

function saveConnect() {
  const provider = CAMPAIGN_PROVIDERS.find(p => p.id === connecting.value)!
  if (provider.fields.includes('api_key') && !formApiKey.value.trim()) {
    formError.value = 'API key is required.'
    return
  }
  if (provider.fields.includes('script') && !formScript.value.trim()) {
    formError.value = 'Script is required.'
    return
  }
  connection.provider = connecting.value!
  connection.api_key = formApiKey.value.trim()
  connection.audience_id = formAudienceId.value.trim()
  connection.script = formScript.value.trim()
  connecting.value = null
}

function disconnect() {
  delete connection.provider
  delete connection.api_key
  delete connection.audience_id
  delete connection.script
}
</script>

<template>

  <!-- Connect form (inline sub-view) -->
  <template v-if="connecting">
    <div class="flex flex-col gap-4 p-4">
      <div class="flex items-center justify-between">
        <p class="text-xs font-medium text-gray-500">
          Connect {{ CAMPAIGN_PROVIDERS.find(p => p.id === connecting)?.label }}
        </p>
        <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="cancelConnect">
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>

      <template v-for="p in CAMPAIGN_PROVIDERS.filter(p => p.id === connecting)" :key="p.id">
        <BaseInput v-if="p.fields.includes('api_key')" size="sm" label="API Key" v-model="formApiKey" placeholder="sk-..." />
        <BaseInput v-if="p.fields.includes('audience_id')" size="sm" label="Audience / Form ID" v-model="formAudienceId" placeholder="abc123" />
        <div v-if="p.fields.includes('script')" class="flex flex-col gap-2">
          <span class="text-xs text-gray-700">Script</span>
          <textarea
            v-model="formScript"
            rows="4"
            placeholder="<script>...</script>"
            class="text-xs text-gray-900 bg-transparent border border-gray-300 focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5 outline-none transition-colors rounded-xl p-2 resize-none font-mono"
          />
        </div>
      </template>

      <p v-if="formError" class="text-xs text-red-500">{{ formError }}</p>

      <div class="flex gap-2">
        <BaseButton class="flex-1" variant="outline" size="xs" @click="cancelConnect">Cancel</BaseButton>
        <BaseButton class="flex-1" variant="solid" size="xs" @click="saveConnect">Connect</BaseButton>
      </div>
    </div>
  </template>

  <!-- Provider list -->
  <template v-else>
    <!-- Connected banner -->
    <div v-if="connection.provider" class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-green-50">
      <div class="flex items-center gap-2">
        <BaseBadge variant="success" size="xs" dot>Connected</BaseBadge>
        <span class="text-xs font-medium text-gray-700">
          {{ CAMPAIGN_PROVIDERS.find(p => p.id === connection.provider)?.label }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <BaseButton variant="outline" size="xs" @click="openConnect(connection.provider!)">Edit</BaseButton>
        <BaseButton variant="outline" size="xs" @click="disconnect">Disconnect</BaseButton>
      </div>
    </div>

    <div class="flex flex-col gap-2 p-4">
      <p class="text-xs font-medium text-gray-500 mb-1">Connect a service</p>
      <div
        v-for="provider in CAMPAIGN_PROVIDERS"
        :key="provider.id"
        class="flex items-center justify-between p-2 rounded-xl border transition-colors"
        :class="connection.provider === provider.id
          ? 'border-green-200 bg-green-50'
          : 'border-gray-100 hover:bg-gray-50'"
      >
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-gray-900">{{ provider.label }}</p>
          <p class="text-xs text-gray-400 truncate">{{ provider.description }}</p>
        </div>
        <BaseButton
          variant="outline"
          size="xs"
          @click="openConnect(provider.id)"
        >
          {{ connection.provider === provider.id ? 'Edit' : 'Connect' }}
        </BaseButton>
      </div>
    </div>
  </template>

</template>
