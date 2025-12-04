<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  projectTitle: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': []
}>()

const isUnpublishing = ref(false)

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    isUnpublishing.value = false
  }
})

function close() {
  if (!isUnpublishing.value) {
    emit('update:open', false)
  }
}

function confirm() {
  isUnpublishing.value = true
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50"
        @click="close"
      ></div>

      <!-- Modal -->
      <div class="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-foreground">Unpublish Project</h2>
            <p class="text-sm text-muted-foreground">Your site will go offline.</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
            <p class="text-sm text-foreground">
              Are you sure you want to unpublish <span class="font-semibold">{{ projectTitle }}</span>?
            </p>
            <ul class="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Your site will no longer be accessible</li>
              <li>Visitors will see a "Site not available" page</li>
              <li>You can republish anytime</li>
            </ul>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 mt-6">
          <button
            class="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            :disabled="isUnpublishing"
            @click="close"
          >
            Cancel
          </button>
          <button
            class="h-9 px-4 bg-amber-500 text-white text-sm font-medium rounded-md hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            :disabled="isUnpublishing"
            @click="confirm"
          >
            <svg v-if="isUnpublishing" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isUnpublishing ? 'Unpublishing...' : 'Unpublish' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
