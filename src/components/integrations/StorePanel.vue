<script setup lang="ts">
import { ref } from 'vue'
import { CreditCardIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseItem from '../ui/BaseItem.vue'
import BaseToggle from '../ui/BaseToggle.vue'
import { useLandStore } from '@/stores/land'
import { stripeService } from '@/services/stripe.service'
import { useToast } from '@/composables/useToast'
import { useAppModals } from '@/stores/appModals'

const landStore = useLandStore()
const { addToast } = useToast()
const appModals = useAppModals()

const taxEnabled = ref(false)
const isDisconnecting = ref(false)

function connectStripe() {
  const landId = landStore.activeLand?.id
  if (!landId) return
  try {
    window.location.href = stripeService.connectUrl(landId)
  } catch {
    addToast('Stripe is not configured — set VITE_STRIPE_CLIENT_ID', 'error')
  }
}

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
  <div class="flex flex-col divide-y divide-gray-100">

    <!-- Not connected: full-panel empty state -->
    <div v-if="!landStore.isStripeConnected" class="flex flex-col items-center gap-3 py-8 px-4 text-center">
      <div class="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center">
        <CurrencyDollarIcon class="h-4 w-4 text-gray-400" />
      </div>
      <div class="flex flex-col gap-1">
        <p class="text-sm font-semibold text-gray-900">Sell & Monetize</p>
        <p class="text-xs text-gray-400 leading-relaxed">Connect your Stripe account and start selling products, classes and exclusive content.</p>
      </div>
      <BaseButton variant="solid" size="sm" @click="connectStripe">
        <CreditCardIcon class="h-3.5 w-3.5" /> Connect Stripe
      </BaseButton>
    </div>

    <!-- Connected: settings -->
    <div v-if="landStore.isStripeConnected" class="p-4 flex flex-col gap-3">
      <p class="text-xs font-medium text-gray-500">Payment</p>
      <BaseItem
        :icon="CreditCardIcon"
        title="Stripe"
        :description="landStore.activeLand?.stripe_account_name ?? landStore.activeLand?.stripe_account_id ?? 'Connected'"
        action="Settings"
        size="sm"
        @action="openStripeSettings"
      />
      <BaseButton variant="outline" size="sm" :disabled="isDisconnecting" @click="disconnectStripe">
        {{ isDisconnecting ? 'Disconnecting…' : 'Disconnect' }}
      </BaseButton>
    </div>

    <!-- Tax -->
    <div v-if="landStore.isStripeConnected" class="p-4">
      <BaseToggle size="sm" label="Collect tax" description="Automatically calculate and add tax to orders" v-model="taxEnabled" />
    </div>

    <!-- Orders -->
    <div v-if="landStore.isStripeConnected" class="p-4">
      <BaseButton variant="outline" size="sm" class="w-full justify-center" @click="appModals.openDashboardDetail('orders')">
        View Orders
      </BaseButton>
    </div>

  </div>
</template>
