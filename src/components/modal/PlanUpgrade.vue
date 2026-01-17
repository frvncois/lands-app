<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { PLAN_DEFINITIONS } from '@/types/project'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui'

const props = defineProps<{
  open: boolean
  projectId: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const projectStore = useProjectStore()
const isProcessing = ref(false)

const proPlan = computed(() => PLAN_DEFINITIONS.pro)

// Feature comparison for the modal
const featureComparison = [
  { feature: 'Lands subdomain', free: true, pro: true },
  { feature: 'Custom domain', free: false, pro: true },
  { feature: 'No watermark', free: false, pro: true },
  { feature: 'Analytics dashboard', free: false, pro: true },
  { feature: 'Email integrations', free: false, pro: true },
  { feature: 'Payment integrations', free: false, pro: true },
  { feature: 'Priority support', free: false, pro: true },
]

function close() {
  emit('update:open', false)
}

async function handleUpgrade() {
  isProcessing.value = true

  try {
    // For now, just update the plan (demo mode)
    projectStore.updatePlan('pro')
    close()
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <Modal
    :open="open"
    size="lg"
    title="Upgrade to Pro"
    :description="proPlan.description"
    :persistent="isProcessing"
    :closable="!isProcessing"
    @update:open="emit('update:open', $event)"
  >
    <div class="space-y-6">
      <!-- Price -->
      <div class="flex items-baseline gap-1">
        <span class="text-4xl font-bold text-foreground">${{ proPlan.price }}</span>
        <span class="text-muted-foreground">/month</span>
      </div>

      <!-- Feature Comparison -->
      <div class="space-y-3">
        <div class="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
          <span>Feature</span>
          <span class="text-center">Free</span>
          <span class="text-center">Pro</span>
        </div>

        <div
          v-for="item in featureComparison"
          :key="item.feature"
          class="grid grid-cols-3 gap-2 items-center py-1.5"
        >
          <span class="text-sm text-foreground">{{ item.feature }}</span>
          <div class="flex justify-center">
            <svg v-if="item.free" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-5 h-5 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div class="flex justify-center">
            <svg v-if="item.pro" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-5 h-5 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="w-full space-y-3">
        <Button
          class="w-full"
          size="lg"
          :loading="isProcessing"
          @click="handleUpgrade"
        >
          {{ isProcessing ? 'Processing...' : 'Upgrade Now' }}
        </Button>
        <p class="text-xs text-center text-muted-foreground">
          Cancel anytime. No long-term commitment required.
        </p>
      </div>
    </template>
  </Modal>
</template>
