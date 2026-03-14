<script setup lang="ts">
import { ref } from 'vue'
import { CreditCardIcon } from '@heroicons/vue/24/outline'
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

    <!-- Payment -->
    <div class="p-4 flex flex-col gap-3">
      <p class="text-xs font-medium text-gray-500">Payment</p>
      <template v-if="landStore.isStripeConnected">
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
      </template>
      <template v-else>
        <p class="text-xs text-gray-400 leading-relaxed">Connect Stripe to accept payments for your store items.</p>
        <BaseButton variant="solid" size="sm" @click="connectStripe">Connect Stripe</BaseButton>
      </template>
    </div>

    <!-- Tax -->
    <div class="p-4">
      <BaseToggle size="sm" label="Collect tax" description="Automatically calculate and add tax to orders" v-model="taxEnabled" />
    </div>

    <!-- Orders -->
    <div class="p-4">
      <BaseButton variant="outline" size="sm" class="w-full justify-center" @click="appModals.openDashboardDetail('orders')">
        View Orders
      </BaseButton>
    </div>

  </div>
</template>
