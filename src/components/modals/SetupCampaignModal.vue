<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { XMarkIcon, ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseModal from '../ui/BaseModal.vue'
import { CAMPAIGN_PROVIDERS, type CampaignProviderMeta, type CampaignConfig } from '@/types/campaign'
import { useCampaignStore } from '@/stores/campaign'
import { useLandStore } from '@/stores/land'
import { integrationService } from '@/services/integration.service'
import { useToast } from '@/composables/useToast'

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
  step.value = 'connect'
}

function back() {
  step.value = 'pick'
  selectedProvider.value = null
  formError.value = ''
}

// ─── Form state ───────────────────────────────────────────────────────────────

const formConfig = ref<CampaignConfig>({})
const customHeaders = ref<{ key: string; value: string }[]>([])
const formError = ref('')
const isSaving = ref(false)

const isCustomProvider = computed(() => selectedProvider.value?.id === 'custom')

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

  for (const field of p.fields) {
    if (field.required) {
      const val = formConfig.value[field.key] as string | undefined
      if (!val?.trim()) {
        formError.value = `${field.label} is required.`
        return
      }
    }
  }

  if (isCustomProvider.value) {
    const headers: Record<string, string> = {}
    for (const h of customHeaders.value) {
      if (h.key.trim()) headers[h.key.trim()] = h.value
    }
    formConfig.value.headers = Object.keys(headers).length ? headers : undefined
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
            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">How to get your credentials</p>
            <div
              v-for="(step, i) in selectedProvider!.instructions"
              :key="i"
              class="flex items-start gap-2"
            >
              <span class="flex-shrink-0 h-4 w-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-500">
                {{ i + 1 }}
              </span>
              <p class="text-xs text-gray-500 leading-relaxed">
                {{ step.text }}
                <a
                  v-if="step.url"
                  :href="step.url"
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 hover:underline ml-1"
                >↗</a>
              </p>
            </div>
          </div>

          <!-- Fields -->
          <div class="space-y-3">
            <BaseInput
              v-for="field in selectedProvider!.fields"
              :key="field.key"
              :label="field.label"
              :placeholder="field.placeholder"
              :type="field.type === 'password' ? 'password' : 'text'"
              size="sm"
              :modelValue="(formConfig[field.key] as string | undefined) ?? ''"
              @update:modelValue="(formConfig as Record<string, string>)[field.key] = $event"
            />

            <!-- Custom headers (custom provider only) -->
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
                  <input
                    v-model="h.key"
                    placeholder="Key"
                    class="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400 bg-white"
                  />
                  <input
                    v-model="h.value"
                    placeholder="Value"
                    class="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400 bg-white"
                  />
                  <button class="text-gray-300 hover:text-red-400 transition-colors shrink-0" @click="removeHeader(i)">
                    <TrashIcon class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
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
