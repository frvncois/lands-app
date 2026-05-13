<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { XMarkIcon, CheckCircleIcon, ClipboardIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseModal from '../ui/BaseModal.vue'
import { useLandStore } from '@/stores/land'
import { domainService } from '@/services/domain.service'
import { useClipboardCopy } from '@/composables/useClipboardCopy'

const emit = defineEmits<{ close: [] }>()

const landStore = useLandStore()
const land = computed(() => landStore.activeLand)

// ─── State ───
type Step = 'input' | 'dns' | 'active' | 'error'
const step = ref<Step>('input')
const domain = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const { copy, copied } = useClipboardCopy()
let pollInterval: ReturnType<typeof setInterval> | null = null

// ─── Init from existing land domain ───
onMounted(() => {
  const existing = land.value?.custom_domain
  const status = land.value?.custom_domain_status
  if (existing) {
    domain.value = existing
    if (status === 'active') step.value = 'active'
    else if (status === 'error') step.value = 'error'
    else { step.value = 'dns'; startPolling() }
  }
})

onUnmounted(() => stopPolling())

// ─── Domain helpers ───
const isApex = computed(() => domain.value.trim().split('.').length === 2)

const cnameHost = computed(() => {
  const d = domain.value.trim()
  if (!d.includes('.')) return d
  const parts = d.split('.')
  // Return subdomain part (or @ for apex)
  return parts.length === 2 ? '@' : parts.slice(0, -2).join('.')
})

const isValid = computed(() => {
  const d = domain.value.trim()
  return /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(d)
})

// ─── Connect ───
async function connect() {
  if (!isValid.value || !land.value) return
  isLoading.value = true
  errorMsg.value = ''
  try {
    await domainService.connect(land.value.id, domain.value.trim())
    landStore.updateLand(land.value.id, {
      custom_domain: domain.value.trim(),
      custom_domain_status: 'pending',
    })
    step.value = 'dns'
    startPolling()
  } catch (e) {
    errorMsg.value = (e as Error).message
  } finally {
    isLoading.value = false
  }
}

// ─── Disconnect ───
async function disconnect() {
  if (!land.value) return
  isLoading.value = true
  errorMsg.value = ''
  try {
    await domainService.disconnect(land.value.id)
    landStore.updateLand(land.value.id, { custom_domain: null, custom_domain_status: null })
    domain.value = ''
    step.value = 'input'
  } catch (e) {
    errorMsg.value = (e as Error).message
  } finally {
    isLoading.value = false
  }
}

// ─── Polling ───
function startPolling() {
  stopPolling()
  checkStatus()
  pollInterval = setInterval(checkStatus, 10_000)
}

function stopPolling() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null }
}

async function checkStatus() {
  if (!land.value) return
  try {
    const { status } = await domainService.verify(land.value.id)
    landStore.updateLand(land.value.id, { custom_domain_status: status })
    if (status === 'active') {
      step.value = 'active'
      stopPolling()
    } else if (status === 'error') {
      step.value = 'error'
      stopPolling()
    }
  } catch { /* silent — keep polling */ }
}

</script>

<template>
  <BaseModal @close="emit('close')">
    <div>

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <Transition name="modal-title" mode="out-in">
          <h3 :key="step" class="text-lg font-semibold text-gray-900">
            <span v-if="step === 'input'">Connect a domain</span>
            <span v-else-if="step === 'dns'">Add DNS record</span>
            <span v-else-if="step === 'active'">Domain connected</span>
            <span v-else>Connection error</span>
          </h3>
        </Transition>
        <button class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100" @click="emit('close')">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <Transition name="modal-forward" mode="out-in">

        <!-- ── Step 1: Input domain ── -->
        <div v-if="step === 'input'" key="input" class="space-y-4">
          <p class="text-sm text-gray-400 leading-relaxed">
            Enter the domain you own and want to connect to this land.
          </p>
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-gray-700">Domain</label>
            <input
              v-model="domain"
              type="text"
              placeholder="yourdomain.com or app.yourdomain.com"
              class="w-full px-4 py-3 text-base border border-gray-200 rounded-xl bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-black/[0.04]"
              @keydown.enter="connect"
            />
          </div>
          <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>
          <div class="flex justify-end gap-3 pt-2">
            <BaseButton @click="emit('close')">Cancel</BaseButton>
            <BaseButton variant="solid" :disabled="!isValid || isLoading" @click="connect">
              {{ isLoading ? 'Connecting…' : 'Continue' }}
            </BaseButton>
          </div>
        </div>

        <!-- ── Step 2: DNS record ── -->
        <div v-else-if="step === 'dns'" key="dns" class="space-y-4">
          <p class="text-sm text-gray-400 leading-relaxed">
            Add the following DNS record at your registrar (GoDaddy, Namecheap, Cloudflare, etc.), then wait for it to propagate. This usually takes a few minutes.
          </p>

          <!-- Subdomain: CNAME record -->
          <template v-if="!isApex">
            <div class="flex flex-col bg-gray-50 rounded-xl overflow-hidden border border-gray-100 text-xs font-mono">
              <div class="flex items-center justify-between px-4 py-3">
                <span class="text-gray-400 font-sans text-xs">Type</span>
                <div class="flex items-center gap-2">
                  <span class="text-gray-900 font-semibold">CNAME</span>
                  <button class="text-gray-400 hover:text-gray-700 transition-colors" @click="copy('CNAME', 'type')">
                    <CheckCircleIcon v-if="copied === 'type'" class="h-3.5 w-3.5 text-green-500" />
                    <ClipboardIcon v-else class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span class="text-gray-400 font-sans text-xs">Name / Host</span>
                <div class="flex items-center gap-2">
                  <span class="text-gray-900 font-semibold">{{ cnameHost }}</span>
                  <button class="text-gray-400 hover:text-gray-700 transition-colors" @click="copy(cnameHost, 'host')">
                    <CheckCircleIcon v-if="copied === 'host'" class="h-3.5 w-3.5 text-green-500" />
                    <ClipboardIcon v-else class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span class="text-gray-400 font-sans text-xs">Value / Points to</span>
                <div class="flex items-center gap-2">
                  <span class="text-gray-900 font-semibold">cname.vercel-dns.com</span>
                  <button class="text-gray-400 hover:text-gray-700 transition-colors" @click="copy('cname.vercel-dns.com', 'value')">
                    <CheckCircleIcon v-if="copied === 'value'" class="h-3.5 w-3.5 text-green-500" />
                    <ClipboardIcon v-else class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span class="text-gray-400 font-sans text-xs">TTL</span>
                <span class="text-gray-900 font-semibold">Auto</span>
              </div>
            </div>
          </template>

          <!-- Apex domain: A record + CNAME -->
          <template v-else>
            <div class="flex flex-col bg-gray-50 rounded-xl overflow-hidden border border-gray-100 text-xs font-mono">
              <div class="flex items-center justify-between px-4 py-3">
                <span class="text-gray-400 font-sans text-xs">Type</span>
                <div class="flex items-center gap-2">
                  <span class="text-gray-900 font-semibold">A</span>
                  <button class="text-gray-400 hover:text-gray-700 transition-colors" @click="copy('A', 'a-type')">
                    <CheckCircleIcon v-if="copied === 'a-type'" class="h-3.5 w-3.5 text-green-500" />
                    <ClipboardIcon v-else class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span class="text-gray-400 font-sans text-xs">Name / Host</span>
                <div class="flex items-center gap-2">
                  <span class="text-gray-900 font-semibold">@</span>
                  <button class="text-gray-400 hover:text-gray-700 transition-colors" @click="copy('@', 'a-host')">
                    <CheckCircleIcon v-if="copied === 'a-host'" class="h-3.5 w-3.5 text-green-500" />
                    <ClipboardIcon v-else class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span class="text-gray-400 font-sans text-xs">Value / IP Address</span>
                <div class="flex items-center gap-2">
                  <span class="text-gray-900 font-semibold">76.76.21.21</span>
                  <button class="text-gray-400 hover:text-gray-700 transition-colors" @click="copy('76.76.21.21', 'a-value')">
                    <CheckCircleIcon v-if="copied === 'a-value'" class="h-3.5 w-3.5 text-green-500" />
                    <ClipboardIcon v-else class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span class="text-gray-400 font-sans text-xs">TTL</span>
                <span class="text-gray-900 font-semibold">Auto</span>
              </div>
            </div>

            <div class="flex flex-col bg-gray-50 rounded-xl overflow-hidden border border-gray-100 text-xs font-mono">
              <div class="flex items-center justify-between px-4 py-3">
                <span class="text-gray-400 font-sans text-xs">Type</span>
                <div class="flex items-center gap-2">
                  <span class="text-gray-900 font-semibold">CNAME</span>
                  <button class="text-gray-400 hover:text-gray-700 transition-colors" @click="copy('CNAME', 'cname-type')">
                    <CheckCircleIcon v-if="copied === 'cname-type'" class="h-3.5 w-3.5 text-green-500" />
                    <ClipboardIcon v-else class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span class="text-gray-400 font-sans text-xs">Name / Host</span>
                <div class="flex items-center gap-2">
                  <span class="text-gray-900 font-semibold">www</span>
                  <button class="text-gray-400 hover:text-gray-700 transition-colors" @click="copy('www', 'cname-host')">
                    <CheckCircleIcon v-if="copied === 'cname-host'" class="h-3.5 w-3.5 text-green-500" />
                    <ClipboardIcon v-else class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span class="text-gray-400 font-sans text-xs">Value / Points to</span>
                <div class="flex items-center gap-2">
                  <span class="text-gray-900 font-semibold">cname.vercel-dns.com</span>
                  <button class="text-gray-400 hover:text-gray-700 transition-colors" @click="copy('cname.vercel-dns.com', 'cname-value')">
                    <CheckCircleIcon v-if="copied === 'cname-value'" class="h-3.5 w-3.5 text-green-500" />
                    <ClipboardIcon v-else class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span class="text-gray-400 font-sans text-xs">TTL</span>
                <span class="text-gray-900 font-semibold">Auto</span>
              </div>
            </div>
          </template>

          <!-- Polling indicator -->
          <div class="flex items-center gap-2 text-xs text-gray-400">
            <ArrowPathIcon class="h-3.5 w-3.5 animate-spin" />
            Checking propagation automatically…
          </div>

          <!-- Help card -->
          <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
            <p class="text-xs font-semibold text-gray-700">Need help?</p>
            <p class="text-xs text-gray-400 leading-relaxed">Automatic connection is coming soon. In the meantime, if you need help, we offer free assistance for your domain connection.</p>
            <BaseButton size="sm" variant="outline" @click="() => {}">Chat with us</BaseButton>
          </div>

          <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>

          <div class="flex justify-between gap-3 pt-2">
            <BaseButton variant="outline" @click="disconnect" :disabled="isLoading">Remove domain</BaseButton>
            <BaseButton variant="solid" :disabled="isLoading" @click="checkStatus">
              {{ isLoading ? 'Checking…' : 'Check now' }}
            </BaseButton>
          </div>
        </div>

        <!-- ── Step 3: Active ── -->
        <div v-else-if="step === 'active'" key="active" class="space-y-5">
          <div class="flex flex-col items-center gap-3 py-4 text-center">
            <div class="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircleIcon class="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">{{ domain }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Connected and serving with SSL</p>
            </div>
          </div>
          <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>
          <div class="flex justify-between gap-3 pt-2">
            <BaseButton variant="remove" :disabled="isLoading" @click="disconnect">
              {{ isLoading ? 'Removing…' : 'Disconnect domain' }}
            </BaseButton>
            <BaseButton variant="solid" @click="emit('close')">Done</BaseButton>
          </div>
        </div>

        <!-- ── Step 4: Error ── -->
        <div v-else key="error" class="space-y-5">
          <div class="flex flex-col items-center gap-3 py-4 text-center">
            <div class="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon class="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">Connection failed</p>
              <p class="text-xs text-gray-400 mt-0.5 leading-relaxed">
                We couldn't verify <strong>{{ domain }}</strong>. Double-check that the DNS record is correct and try again.
              </p>
            </div>
          </div>
          <div class="flex justify-between gap-3 pt-2">
            <BaseButton variant="remove" :disabled="isLoading" @click="disconnect">Remove domain</BaseButton>
            <BaseButton variant="solid" @click="() => { step = 'dns'; startPolling() }">Try again</BaseButton>
          </div>
        </div>

      </Transition>
    </div>
  </BaseModal>
</template>
