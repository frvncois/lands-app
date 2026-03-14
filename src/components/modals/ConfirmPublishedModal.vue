<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const props = defineProps<{ handle: string; status: 'loading' | 'done' | 'error' }>()
const emit = defineEmits<{ close: [] }>()

const url = `https://${props.handle}.lands.app`

const copied = ref(false)

function viewLive() {
  window.open(url, '_blank')
}

async function share() {
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank')
  }
}
</script>

<template>
  <BaseModal overlay="dark" max-width="max-w-sm" padding="p-8" @close="$emit('close')">
    <div class="text-center">

        <!-- Loading state -->
        <Transition name="publish-fade" mode="out-in">

          <div v-if="status === 'loading'" key="loading" class="flex flex-col items-center gap-4">
            <div class="relative w-16 h-16">
              <!-- Track -->
              <svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" stroke-width="4" />
              </svg>
              <!-- Fill -->
              <svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="#18181b"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-dasharray="175.9"
                  class="publish-ring"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Publishing…</p>
              <p class="text-xs text-gray-400 mt-0.5">Building your page</p>
            </div>
          </div>

          <!-- Error state -->
          <div v-else-if="status === 'error'" key="error" class="flex flex-col items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <svg class="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Publish failed</p>
              <p class="text-xs text-gray-400 mt-0.5">Please try again</p>
            </div>
            <BaseButton variant="solid" size="sm" class="w-full justify-center" @click="$emit('close')">
              Close
            </BaseButton>
          </div>

          <!-- Done state -->
          <div v-else key="done" class="flex flex-col items-center gap-5">
            <div class="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center">
              <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900">Published!</h3>
              <p class="text-sm text-gray-400 mt-1">{{ handle }}.lands.app</p>
            </div>

            <div class="flex flex-col gap-2 w-full">
              <BaseButton variant="solid" size="md" class="w-full justify-center" @click="viewLive">
                View live
              </BaseButton>
              <BaseButton variant="outline" size="md" class="w-full justify-center" @click="share">
                {{ copied ? 'Link copied!' : 'Copy link' }}
              </BaseButton>
              <BaseButton variant="ghost" size="md" class="w-full justify-center text-gray-700" @click="$emit('close')">
                Back to dashboard
              </BaseButton>
            </div>
          </div>

        </Transition>
    </div>
  </BaseModal>
</template>

<style scoped>
.publish-ring {
  stroke-dashoffset: 175.9;
  animation: ring-fill 2.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes ring-fill {
  0%   { stroke-dashoffset: 175.9; }
  75%  { stroke-dashoffset: 22; }
  100% { stroke-dashoffset: 22; }
}

.publish-fade-enter-active,
.publish-fade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.publish-fade-enter-from   { opacity: 0; transform: scale(0.95); }
.publish-fade-leave-to     { opacity: 0; transform: scale(1.05); }
</style>
