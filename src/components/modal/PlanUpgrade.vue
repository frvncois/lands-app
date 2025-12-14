<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { PLAN_DEFINITIONS } from '@/types/project'
import { Button, Badge } from '@/components/ui'

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
    // TODO: Implement Stripe checkout or payment flow
    // For now, just update the plan (demo mode)
    await projectStore.updatePlan('pro')
    close()
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50"
        @click="close"
      />

      <!-- Modal -->
      <div class="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <!-- Header -->
        <div class="px-6 pt-6 pb-4 border-b border-border">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-foreground">Upgrade to Pro</h2>
              <p class="text-sm text-muted-foreground mt-1">{{ proPlan.description }}</p>
            </div>
            <button
              class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              @click="close"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-5">
          <!-- Price -->
          <div class="flex items-baseline gap-1 mb-6">
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

        <!-- Footer -->
        <div class="px-6 py-4 bg-muted/30 border-t border-border">
          <Button
            class="w-full"
            size="lg"
            :loading="isProcessing"
            @click="handleUpgrade"
          >
            {{ isProcessing ? 'Processing...' : 'Upgrade Now' }}
          </Button>
          <p class="text-xs text-center text-muted-foreground mt-3">
            Cancel anytime. No long-term commitment required.
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
