<script setup lang="ts">
import { ref } from 'vue'
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseModal from '@/shared/ui/BaseModal.vue'
import { useLandStore } from '@/features/lands/stores/land'
import { useToast } from '@/shared/composables/useToast'
import { PLAN_DETAILS } from '@/features/plan/types'
import { stripeService } from '@/features/integrations/services/stripe.service'

const emit = defineEmits<{ close: [] }>()

const landStore = useLandStore()
const { addToast } = useToast()

const billing = ref<'monthly' | 'yearly'>('monthly')
const isLoading = ref(false)

const PRICE_MONTHLY = PLAN_DETAILS.paid.price_monthly
const PRICE_YEARLY  = PLAN_DETAILS.paid.price_yearly

const FEATURES = [
  'Custom domain',
  'Advanced analytics',
  'Campaign integrations',
  'Collaborators',
  'Unlimited collections & items',
  'Unlimited sections',
  'Remove Lands branding',
]

async function upgrade() {
  const land = landStore.activeLand
  if (!land) return
  isLoading.value = true
  try {
    const url = await stripeService.createSubscriptionCheckout(land.id, billing.value)
    window.location.href = url
  } catch (e) {
    addToast((e as Error).message || 'Failed to start checkout', 'error')
    isLoading.value = false
  }
}

async function manageSubscription() {
  const land = landStore.activeLand
  if (!land) return
  isLoading.value = true
  try {
    const url = await stripeService.createBillingPortal(land.id)
    window.location.href = url
  } catch (e) {
    addToast((e as Error).message || 'Failed to open billing portal', 'error')
    isLoading.value = false
  }
}
</script>

<template>
  <BaseModal @close="emit('close')">
    <div class="flex flex-col gap-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Upgrade to Pro</h3>
          <p class="text-xs text-gray-400 mt-0.5">Unlock the full power of Lands</p>
        </div>
        <button class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100" @click="emit('close')">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>



      <!-- Pro card -->
      <div class="flex flex-col gap-4 p-2 border-1 border-gray-200 bg-gray-50 rounded-xl">

        <div class="flex justify-between">
        <!-- Pricing — animated on billing change -->
        <div class="overflow-hidden">
          <Transition name="billing-slide" mode="out-in">
            <div :key="billing" class="flex flex-col gap-0.5 p-1 pl-2">
              <div class="flex items-baseline gap-1">
                <p class="text-2xl font-bold text-gray-900">{{ billing === 'monthly' ? `$${PRICE_MONTHLY}` : `$${PRICE_YEARLY}` }}</p>
                <span class="text-xs text-gray-400">{{ billing === 'monthly' ? '/mo' : '/yr' }}</span>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Billing toggle -->
        <div class="flex items-center gap-1 p-1 bg-gray-900 rounded-xl text-xs font-medium self-start">
            <button
              class="px-3 py-1.5 rounded-lg transition-colors"
              :class="billing === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-300 hover:text-gray-100'"
              @click="billing = 'monthly'"
            >Monthly</button>
            <button
              class="px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              :class="billing === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-300 hover:text-gray-100'"
              @click="billing = 'yearly'"
            >
              Yearly
            </button>
          </div>
          </div>

        <!-- Features -->
        <ul class="flex flex-col gap-2">
          <li v-for="f in FEATURES" :key="f" class="flex items-center gap-2 text-xs">
            <CheckIcon class="h-3.5 w-3.5 text-gray-900 shrink-0" />
            <span class="text-gray-700">{{ f }}</span>
          </li>
        </ul>

        <!-- CTA -->
        <template v-if="landStore.activeLand?.plan !== 'paid'">
          <Transition name="billing-slide" mode="out-in">
            <BaseButton
              :key="billing"
              variant="solid"
              size="sm"
              class="w-full justify-center"
              :disabled="isLoading"
              @click="upgrade"
            >{{ isLoading ? 'Redirecting…' : `Upgrade — $${billing === 'monthly' ? PRICE_MONTHLY : PRICE_YEARLY}/${billing === 'monthly' ? 'mo' : 'yr'}` }}</BaseButton>
          </Transition>
        </template>
        <template v-else>
          <div class="text-xs text-center text-gray-500 py-1 font-medium">Current plan</div>
          <BaseButton
            variant="outline"
            size="sm"
            class="w-full justify-center"
            :disabled="isLoading"
            @click="manageSubscription"
          >{{ isLoading ? 'Loading…' : 'Manage subscription' }}</BaseButton>
        </template>

      </div>

    </div>
  </BaseModal>
</template>

<style scoped>
.billing-slide-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.billing-slide-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.billing-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.billing-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
