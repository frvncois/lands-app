<script setup lang="ts">
import BaseButton from '../ui/BaseButton.vue'
import BaseToggle from '../ui/BaseToggle.vue'
import { ref } from 'vue'

const stripeConnected = ref(false)
const taxEnabled = ref(false)
</script>

<template>
  <div class="flex flex-col divide-y divide-gray-100">

    <!-- Payment -->
    <div class="p-4 flex flex-col gap-3">
      <p class="text-xs font-medium text-gray-500">Payment</p>
      <template v-if="stripeConnected">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-900">Stripe connected</p>
            <p class="text-xs text-gray-400">Payments are active</p>
          </div>
          <BaseButton variant="outline" size="xs" @click="stripeConnected = false">Disconnect</BaseButton>
        </div>
      </template>
      <template v-else>
        <p class="text-xs text-gray-400 leading-relaxed">Connect Stripe to accept payments for your store items.</p>
        <BaseButton variant="solid" size="sm" @click="stripeConnected = true">Connect Stripe</BaseButton>
      </template>
    </div>

    <!-- Tax -->
    <div class="p-4">
      <BaseToggle size="sm" label="Collect tax" description="Automatically calculate and add tax to orders" v-model="taxEnabled" />
    </div>

    <!-- Orders -->
    <div class="p-4 flex flex-col gap-2">
      <p class="text-xs font-medium text-gray-500">Orders</p>
      <p class="text-xs text-gray-400">No orders yet.</p>
    </div>

  </div>
</template>
