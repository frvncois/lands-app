<script setup lang="ts">
import { CreditCardIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { useLandStore } from '@/features/lands/stores/land'

const landStore = useLandStore()
</script>

<template>
  <div class="flex flex-col gap-5 p-4">

    <!-- Stripe status -->
    <div class="rounded-xl bg-white border border-gray-100 p-4">
      <div class="flex items-center gap-3 mb-2">
        <div class="h-8 w-8 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
          <CreditCardIcon class="h-4 w-4 text-gray-600" />
        </div>
        <div>
          <p class="text-xs font-medium text-gray-900">Stripe</p>
          <p class="text-xs text-gray-400">Payment provider</p>
        </div>
        <div v-if="landStore.isStripeConnected" class="ml-auto flex items-center gap-1 text-green-600">
          <CheckCircleIcon class="h-4 w-4" />
          <span class="text-xs font-medium">Connected</span>
        </div>
      </div>

      <template v-if="landStore.isStripeConnected">
        <p class="text-xs text-gray-500 mb-2">{{ landStore.activeLand?.stripe_account_name }}</p>
        <BaseButton variant="outline" size="sm" class="w-full justify-center">Manage Stripe account</BaseButton>
      </template>
      <template v-else>
        <p class="text-xs text-gray-400 leading-relaxed mb-2">
          Connect Stripe to start accepting payments and sell products directly on your land.
        </p>
        <BaseButton variant="solid" size="sm" class="w-full justify-center">Connect Stripe</BaseButton>
      </template>
    </div>

    <!-- Revenue summary -->
    <div class="grid grid-cols-2 gap-2">
      <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
        <p class="text-xs text-gray-400">Revenue</p>
        <p class="text-xl font-semibold text-gray-900 leading-tight">$0</p>
        <p class="text-xs text-gray-400">this month</p>
      </div>
      <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
        <p class="text-xs text-gray-400">Products</p>
        <p class="text-xl font-semibold text-gray-900 leading-tight">0</p>
        <p class="text-xs text-gray-400">active</p>
      </div>
    </div>

  </div>
</template>
