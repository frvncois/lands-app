<script setup lang="ts">
import { CurrencyDollarIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { useStripeConnect } from '@/features/dashboard/composables/useStripeConnect'

const { connectStripe, isConnecting } = useStripeConnect()
</script>

<template>
  <div class="shrink-0 card-appear rounded-xl border border-gray-200 flex flex-col justify-center items-center gap-3 py-8 px-4 text-center" style="animation-delay: 200ms">
    <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
      <CurrencyDollarIcon class="h-5 w-5 text-gray-900" />
    </div>
    <p class="text-sm font-semibold text-gray-900">Sell & Monetize</p>
    <p class="text-xs text-gray-400 leading-relaxed">Connect your Stripe account and start selling products, classes and exclusive content.</p>
    <BaseButton variant="solid" size="sm" :disabled="isConnecting" @click="connectStripe">
      <Transition name="stripe-btn" mode="out-in">
        <span v-if="isConnecting" key="loading" class="flex items-center gap-1.5">
          <span class="stripe-spinner" />
          Connecting…
        </span>
        <span v-else key="idle" class="flex items-center gap-1.5">
          Connect Stripe
        </span>
      </Transition>
    </BaseButton>
  </div>
</template>

<style scoped>
/* Stripe button content swap */
.stripe-btn-enter-active,
.stripe-btn-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.stripe-btn-enter-from { opacity: 0; transform: scale(0.9); }
.stripe-btn-leave-to   { opacity: 0; transform: scale(1.05); }

/* Spinner */
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

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
