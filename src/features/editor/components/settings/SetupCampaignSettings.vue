<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { XMarkIcon, ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseModal from '@/shared/ui/BaseModal.vue'
import { CAMPAIGN_PROVIDERS, type CampaignProviderMeta, type CampaignConfig } from '@/features/integrations/types/campaign'
import { useCampaignStore } from '@/features/integrations/stores/campaign'
import { useLandStore } from '@/features/lands/stores/land'
import { integrationService, type ProviderList } from '@/features/integrations/services/integration.service'
import { useToast } from '@/shared/composables/useToast'

const emit = defineEmits<{ close: [] }>()

const campaignStore = useCampaignStore()
const landStore = useLandStore()
const { addToast } = useToast()

// ─── Step state ───────────────────────────────────────────────────────────────

const step = ref<'pick' | 'connect'>('pick')
const selectedProvider = ref<CampaignProviderMeta | null>(null)

function pickProvider(p: CampaignProviderMeta) {
  if (p.comingSoon) return
  selectedProvider.value = p

  // Pre-fill if already connected to this provider
  const existing = campaignStore.integration
  if (existing?.provider === p.id) {
    formConfig.value = { ...existing.config }
  } else {
    formConfig.value = {}
  }
  customHeaders.value = []
  formError.value = ''
  fetchedLists.value = []
  fetchListsError.value = ''
  // Pre-fill list selection if reconnecting with same provider
  selectedListId.value = existing?.provider === p.id ? (existing.config.list_id ?? '') : ''
  step.value = 'connect'
}

function back() {
  step.value = 'pick'
  selectedProvider.value = null
  formError.value = ''
  fetchedLists.value = []
  fetchListsError.value = ''
  selectedListId.value = ''
}

// ─── Form state ───────────────────────────────────────────────────────────────

const formConfig = ref<CampaignConfig>({})
const customHeaders = ref<{ key: string; value: string }[]>([])
const formError = ref('')
const isSaving = ref(false)

const isWebhookProvider = computed(() => selectedProvider.value?.id === 'webhook' || selectedProvider.value?.id === 'custom')
const isCustomProvider = computed(() => selectedProvider.value?.id === 'custom')
const hasListPicker = computed(() => !isWebhookProvider.value && !!selectedProvider.value?.listLabel)

// ─── List picker state ────────────────────────────────────────────────────────

const fetchedLists = ref<ProviderList[]>([])
const selectedListId = ref('')
const isFetchingLists = ref(false)
const fetchListsError = ref('')

async function fetchLists() {
  if (!formConfig.value.api_key?.trim()) return
  isFetchingLists.value = true
  fetchListsError.value = ''
  fetchedLists.value = []
  selectedListId.value = ''
  try {
    fetchedLists.value = await integrationService.fetchProviderLists(
      selectedProvider.value!.id,
      formConfig.value.api_key.trim(),
    )
    if (!fetchedLists.value.length) {
      fetchListsError.value = `No ${selectedProvider.value!.listLabel?.toLowerCase()}s found.`
    }
  } catch (err: unknown) {
    fetchListsError.value = err instanceof Error ? err.message : 'Failed to load lists.'
  } finally {
    isFetchingLists.value = false
  }
}

function addHeader() {
  customHeaders.value.push({ key: '', value: '' })
}

function removeHeader(i: number) {
  customHeaders.value.splice(i, 1)
}

// ─── Connect ──────────────────────────────────────────────────────────────────

async function connect() {
  const p = selectedProvider.value!
  formError.value = ''

  if (isWebhookProvider.value) {
    if (!formConfig.value.webhook_url?.trim()) {
      formError.value = 'Endpoint URL is required.'
      return
    }
    if (isCustomProvider.value) {
      const headers: Record<string, string> = {}
      for (const h of customHeaders.value) {
        if (h.key.trim()) headers[h.key.trim()] = h.value
      }
      formConfig.value.headers = Object.keys(headers).length ? headers : undefined
    }
  } else {
    if (!formConfig.value.api_key?.trim()) {
      formError.value = 'API Key is required.'
      return
    }
    if (p.listRequired && !selectedListId.value) {
      formError.value = `Please select a ${p.listLabel?.toLowerCase()}.`
      return
    }
    if (selectedListId.value) {
      formConfig.value.list_id = selectedListId.value
      formConfig.value.list_name = fetchedLists.value.find(l => l.id === selectedListId.value)?.name
    } else {
      formConfig.value.list_id = undefined
      formConfig.value.list_name = undefined
    }
  }

  isSaving.value = true
  try {
    const integration = { provider: p.id, config: { ...formConfig.value } }
    await integrationService.saveCampaignIntegration(landStore.activeLandId!, integration)
    campaignStore.setIntegration(integration)
    addToast(`${p.label} connected`)
    emit('close')
  } catch {
    formError.value = 'Failed to save. Please try again.'
  } finally {
    isSaving.value = false
  }
}

// ─── Height animation ─────────────────────────────────────────────────────────

const body = ref<HTMLElement>()

function onBeforeLeave() {
  if (!body.value) return
  body.value.style.height = body.value.scrollHeight + 'px'
}

function onEnter(el: Element) {
  if (!body.value) return
  nextTick(() => {
    body.value!.style.height = (el as HTMLElement).scrollHeight + 'px'
  })
}

function onAfterEnter() {
  if (!body.value) return
  body.value.style.height = ''
}

async function disconnect() {
  isSaving.value = true
  try {
    await integrationService.removeCampaignIntegration(landStore.activeLandId!)
    campaignStore.clearIntegration()
    addToast('Campaign disconnected')
    emit('close')
  } catch {
    addToast('Failed to disconnect', 'error')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <BaseModal @close="emit('close')">
    <div class="w-full">

      <!-- Header -->
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-2">
          <button
            v-if="step === 'connect'"
            class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            @click="back"
          >
            <ArrowLeftIcon class="h-4 w-4" />
          </button>
          <Transition name="modal-title" mode="out-in">
            <h3 :key="step" class="text-sm font-semibold text-gray-900">
              {{ step === 'pick' ? 'Connect email provider' : selectedProvider?.label }}
            </h3>
          </Transition>
        </div>
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          @click="emit('close')"
        >
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>

      <div ref="body" style="overflow: hidden; transition: height 0.22s ease">
      <Transition
        name="modal-forward"
        mode="out-in"
        @before-leave="onBeforeLeave"
        @enter="onEnter"
        @after-enter="onAfterEnter"
      >

        <!-- Step 1: Provider picker -->
        <div v-if="step === 'pick'" key="pick" class="space-y-3">
          <p class="text-xs text-gray-400 leading-relaxed">
            Connect your email marketing platform to collect subscribers from your landing page.
          </p>

          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="p in CAMPAIGN_PROVIDERS"
              :key="p.id"
              class="relative flex flex-col items-start gap-2 p-3 rounded-xl border text-left transition-all"
              :class="[
                p.comingSoon
                  ? 'border-gray-100 opacity-50 cursor-not-allowed'
                  : campaignStore.integration?.provider === p.id
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 cursor-pointer',
              ]"
              :disabled="p.comingSoon"
              @click="pickProvider(p)"
            >
              <!-- Icon badge -->
              <div class="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold" :class="p.color">
                {{ p.letter }}
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-gray-900">{{ p.label }}</p>
                <p class="text-[11px] text-gray-400 leading-relaxed mt-0.5">{{ p.description }}</p>
              </div>

              <!-- Status badges -->
              <span
                v-if="campaignStore.integration?.provider === p.id"
                class="absolute top-2 right-2 text-[10px] font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full"
              >
                Connected
              </span>
              <span
                v-else-if="p.comingSoon"
                class="absolute top-2 right-2 text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full"
              >
                Soon
              </span>
            </button>
          </div>

          <div class="flex items-center justify-between pt-1">
            <button
              v-if="campaignStore.isConnected"
              class="text-xs text-red-400 hover:text-red-600 transition-colors"
              :disabled="isSaving"
              @click="disconnect"
            >
              Disconnect
            </button>
            <span v-else />
            <BaseButton size="sm" @click="emit('close')">Cancel</BaseButton>
          </div>
        </div>

        <!-- Step 2: Connect form -->
        <div v-else key="connect" class="space-y-4">

          <!-- Instructions -->
          <div class="bg-gray-50 rounded-xl p-3 space-y-1.5">
            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">How to get your API key</p>
            <div
              v-for="(instruction, i) in selectedProvider!.instructions"
              :key="i"
              class="flex items-start gap-2"
            >
              <span class="flex-shrink-0 h-4 w-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-500">
                {{ i + 1 }}
              </span>
              <p class="text-xs text-gray-500 leading-relaxed">
                {{ instruction.text }}
                <a
                  v-if="instruction.url"
                  :href="instruction.url"
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 hover:underline ml-1"
                >↗</a>
              </p>
            </div>
          </div>

          <!-- Webhook / Custom fields -->
          <div v-if="isWebhookProvider" class="space-y-3">
            <BaseInput
              label="Endpoint URL"
              placeholder="https://your-app.com/subscribe"
              type="text"
              size="sm"
              v-model="formConfig.webhook_url"
            />
            <template v-if="isCustomProvider">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-medium text-gray-500">Headers <span class="font-normal text-gray-400">(optional)</span></p>
                  <button
                    class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                    @click="addHeader"
                  >
                    <PlusIcon class="h-3 w-3" /> Add header
                  </button>
                </div>
                <div v-for="(h, i) in customHeaders" :key="i" class="flex items-center gap-1.5">
                  <input v-model="h.key" placeholder="Key" class="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400 bg-white" />
                  <input v-model="h.value" placeholder="Value" class="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400 bg-white" />
                  <button class="text-gray-300 hover:text-red-400 transition-colors shrink-0" @click="removeHeader(i)">
                    <TrashIcon class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </template>
          </div>

          <!-- API key providers -->
          <div v-else class="space-y-3">
            <BaseInput
              label="API Key"
              placeholder="Paste your API key…"
              type="password"
              size="sm"
              v-model="formConfig.api_key"
            />

            <!-- List picker -->
            <template v-if="hasListPicker">
              <div class="flex items-center justify-between">
                <p class="text-xs font-medium text-gray-500">
                  {{ selectedProvider!.listLabel }}
                  <span v-if="!selectedProvider!.listRequired" class="font-normal text-gray-400">(optional)</span>
                </p>
                <button
                  class="flex items-center gap-1 text-xs transition-colors"
                  :class="formConfig.api_key?.trim() && !isFetchingLists ? 'text-gray-500 hover:text-gray-800' : 'text-gray-300 cursor-not-allowed'"
                  :disabled="!formConfig.api_key?.trim() || isFetchingLists"
                  @click="fetchLists"
                >
                  <span v-if="isFetchingLists" class="flex items-center gap-1">
                    <svg class="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    Loading…
                  </span>
                  <span v-else>Load {{ selectedProvider!.listLabel?.toLowerCase() }}s</span>
                </button>
              </div>

              <!-- Previously connected list (before loading) -->
              <p v-if="!fetchedLists.length && !isFetchingLists && formConfig.list_name" class="text-xs text-gray-400">
                Currently: {{ formConfig.list_name }}
              </p>

              <!-- Picker -->
              <select
                v-if="fetchedLists.length"
                v-model="selectedListId"
                class="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400 bg-white text-gray-700"
              >
                <option v-if="!selectedProvider!.listRequired" value="">No {{ selectedProvider!.listLabel?.toLowerCase() }}</option>
                <option v-for="l in fetchedLists" :key="l.id" :value="l.id">{{ l.name }}</option>
              </select>

              <p v-if="fetchListsError" class="text-xs text-red-500">{{ fetchListsError }}</p>
            </template>
          </div>

          <p v-if="formError" class="text-xs text-red-500">{{ formError }}</p>

          <div class="flex justify-end gap-2 pt-1">
            <BaseButton size="sm" @click="back">Back</BaseButton>
            <BaseButton variant="solid" size="sm" :disabled="isSaving" @click="connect">
              {{ isSaving ? 'Connecting…' : 'Connect' }}
            </BaseButton>
          </div>
        </div>

      </Transition>
      </div>

    </div>
  </BaseModal>
</template>
