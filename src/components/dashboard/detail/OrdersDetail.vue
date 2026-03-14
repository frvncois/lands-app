<script setup lang="ts">
import { ShoppingBagIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <div class="flex flex-col gap-5 p-4">

    <!-- Summary -->
    <div class="grid grid-cols-2 gap-2">
      <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
        <p class="text-xs text-gray-400">Revenue</p>
        <p class="text-xl font-semibold text-gray-900 leading-tight">$0</p>
        <p class="text-xs text-gray-400">this month</p>
      </div>
      <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
        <p class="text-xs text-gray-400">Orders</p>
        <p class="text-xl font-semibold text-gray-900 leading-tight">0</p>
        <p class="text-xs text-gray-400">all time</p>
      </div>
    </div>

    <!-- Orders list -->
    <div class="rounded-xl bg-white border border-gray-100 p-3">
      <p class="text-xs font-medium text-gray-500 mb-3">Recent orders</p>
      <div class="flex flex-col items-center gap-2 py-6 text-center">
        <div class="h-10 w-10 rounded-xl bg-gray-200 flex items-center justify-center">
          <ShoppingBagIcon class="h-5 w-5 text-gray-400" />
        </div>
        <p class="text-xs text-gray-400">No orders yet.</p>
        <p class="text-xs text-gray-300">Orders will appear here once customers start buying.</p>
      </div>
    </div>

  </div>
</template>
