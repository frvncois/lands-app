<script setup lang="ts">
import { CurrencyDollarIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<template>
  <div class="flex flex-col gap-5 p-4">

    <!-- Summary -->
    <div class="grid grid-cols-2 gap-2">
      <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
        <p class="text-xs text-gray-400">Subscribers</p>
        <p class="text-xl font-semibold text-gray-900 leading-tight">0</p>
        <p class="text-xs text-gray-400">total</p>
      </div>
      <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
        <p class="text-xs text-gray-400">Revenue</p>
        <p class="text-xl font-semibold text-gray-900 leading-tight">$0</p>
        <p class="text-xs text-gray-400">this month</p>
      </div>
    </div>

    <!-- Plans -->
    <div class="rounded-xl bg-white border border-gray-100 p-3">
      <div class="flex items-center justify-between mb-3">
        <p class="text-xs font-medium text-gray-500">Plans</p>
        <BaseButton variant="solid" size="xs">New plan</BaseButton>
      </div>
      <div class="flex flex-col items-center gap-2 py-6 text-center">
        <div class="h-10 w-10 rounded-xl bg-gray-200 flex items-center justify-center">
          <CurrencyDollarIcon class="h-5 w-5 text-gray-400" />
        </div>
        <p class="text-xs text-gray-400">No plans yet.</p>
        <p class="text-xs text-gray-300">Create a paid plan to start monetizing your audience.</p>
      </div>
    </div>

    <!-- Subscribers list -->
    <div class="rounded-xl bg-white border border-gray-100 p-3">
      <p class="text-xs font-medium text-gray-500 mb-3">Recent subscribers</p>
      <div class="flex flex-col items-center gap-2 py-6 text-center">
        <p class="text-xs text-gray-400">No subscribers yet.</p>
      </div>
    </div>

  </div>
</template>
