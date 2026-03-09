<script setup lang="ts">
import { ref, computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'

const emit = defineEmits<{ close: [] }>()

const domain = ref('')
const step = ref<'setup' | 'verify'>('setup')

const isValid = computed(() => {
  const d = domain.value.trim()
  return d.length > 0 && d.includes('.')
})

function next() {
  if (!isValid.value) return
  step.value = 'verify'
}

function done() {
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/50 backdrop-blur-lg">
    <div class="modal-card w-full mx-4 bg-white rounded-3xl p-6 max-w-[400px]">

      <div class="flex items-center justify-between mb-4">
        <Transition name="modal-title" mode="out-in">
          <h3 :key="step" class="text-lg font-semibold text-gray-900">
            {{ step === 'setup' ? 'Connect a domain' : 'Verify ownership' }}
          </h3>
        </Transition>
        <button class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100" @click="emit('close')">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <Transition name="modal-forward" mode="out-in">

        <!-- Step 1: Setup -->
        <div v-if="step === 'setup'" class="space-y-4">
          <p class="text-sm text-gray-400 leading-relaxed">
            Enter the domain you own and want to connect to this Land. You'll then need to add a DNS record to point it here.
          </p>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Domain</label>
            <input
              v-model="domain"
              type="text"
              placeholder="yourdomain.com"
              class="w-full px-4 py-3 text-base border border-gray-200 rounded-xl bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-black/[0.04]"
              @keydown.enter="next"
            />
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <BaseButton @click="emit('close')">Cancel</BaseButton>
            <BaseButton variant="solid" :disabled="!isValid" @click="next">Continue</BaseButton>
          </div>
        </div>

        <!-- Step 2: Verify -->
        <div v-else class="space-y-4">
          <p class="text-sm text-gray-400 leading-relaxed">
            Add the following DNS record to your domain registrar, then click Verify. It may take a few minutes to propagate.
          </p>
          <div class="flex flex-col gap-3 bg-gray-50 rounded-xl p-4 text-xs font-mono">
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Type</span>
              <span class="text-gray-900 font-semibold">CNAME</span>
            </div>
            <div class="flex justify-between items-center border-t border-gray-100 pt-3">
              <span class="text-gray-400">Name</span>
              <span class="text-gray-900 font-semibold">{{ domain }}</span>
            </div>
            <div class="flex justify-between items-center border-t border-gray-100 pt-3">
              <span class="text-gray-400">Value</span>
              <span class="text-gray-900 font-semibold">cname.lands.app</span>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <BaseButton @click="step = 'setup'">Back</BaseButton>
            <BaseButton variant="solid" @click="done">Verify</BaseButton>
          </div>
        </div>

      </Transition>
    </div>
  </div>
</template>
