<script setup lang="ts">
import { ref } from 'vue'
import { CreditCardIcon, CurrencyDollarIcon, Cog6ToothIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseDropdownMenu from '../ui/BaseDropdownMenu.vue'
import type { DropdownMenuItem } from '../ui/BaseDropdownMenu.vue'
import { useLandStore } from '@/stores/land'
import { stripeService } from '@/services/stripe.service'
import { useToast } from '@/composables/useToast'
import { useAppModals } from '@/stores/appModals'
import { useStripeConnect } from '@/composables/useStripeConnect'

const landStore = useLandStore()
const { addToast } = useToast()
const appModals = useAppModals()

const isDisconnecting = ref(false)
const { connectStripe, isConnecting } = useStripeConnect()

const stripeMenuItems: DropdownMenuItem[] = [
  { label: 'Settings', icon: Cog6ToothIcon, action: openStripeSettings },
  { label: 'Disconnect', icon: XMarkIcon, danger: true, action: disconnectStripe },
]

async function disconnectStripe() {
  const land = landStore.activeLand
  if (!land) return
  isDisconnecting.value = true
  try {
    await stripeService.disconnect(land.id)
    landStore.updateLand(land.id, { stripe_account_id: null, stripe_account_name: null })
    addToast('Stripe disconnected')
  } catch {
    addToast('Failed to disconnect Stripe', 'error')
  } finally {
    isDisconnecting.value = false
  }
}

function openStripeSettings() {
  window.open('https://dashboard.stripe.com', '_blank')
}
</script>

<template>
  <div class="flex flex-col">

    <!-- Not connected: full-panel empty state -->
    <div v-if="!landStore.isStripeConnected" class="flex flex-col items-center gap-2 py-8 px-4 text-center">
      <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
        <CurrencyDollarIcon class="h-4 w-4 text-gray-900" />
      </div>
      <div class="flex flex-col gap-1">
        <p class="text-sm font-semibold text-gray-900">Sell & Monetize</p>
        <p class="text-xs text-gray-400 leading-relaxed">Connect your Stripe account and start selling products, classes and exclusive content.</p>
      </div>
      <BaseButton variant="solid" size="sm" :disabled="isConnecting" @click="connectStripe">
        <Transition name="stripe-btn" mode="out-in">
          <span v-if="isConnecting" key="loading" class="flex items-center gap-1.5">
            <span class="stripe-spinner" /> Connecting…
          </span>
          <span v-else key="idle" class="flex items-center gap-1.5">
            <CreditCardIcon class="h-3.5 w-3.5" /> Connect Stripe
          </span>
        </Transition>
      </BaseButton>
    </div>

    <!-- Connected: settings -->
    <div v-if="landStore.isStripeConnected" class="p-4 flex flex-col gap-2">
      <p class="text-xs font-medium text-gray-500">Payment</p>
      <div class="flex items-center rounded-xl border border-gray-200 p-1.5 gap-2">
        <div class="shrink-0 flex items-center justify-center h-7 w-7 rounded-md bg-gray-900 text-gray-100">
          <CreditCardIcon class="h-3.5 w-3.5" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-gray-900">Stripe</p>
          <p class="text-xs text-gray-400 truncate">{{ landStore.activeLand?.stripe_account_name ?? landStore.activeLand?.stripe_account_id ?? 'Connected' }}</p>
        </div>
        <BaseDropdownMenu :items="stripeMenuItems" />
      </div>
    </div>

    <!-- Orders -->
    <div v-if="landStore.isStripeConnected" class="p-4 pt-0">
      <BaseButton variant="solid" size="sm" class="w-full justify-center" @click="appModals.openDashboardDetail('orders')">
        View Orders
      </BaseButton>
    </div>

  </div>
</template>

<style scoped>
.stripe-btn-enter-active, .stripe-btn-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.stripe-btn-enter-from { opacity: 0; transform: scale(0.9); }
.stripe-btn-leave-to   { opacity: 0; transform: scale(1.05); }

.stripe-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 1.5px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  opacity: 0.6;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
