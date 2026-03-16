<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CurrencyDollarIcon } from '@heroicons/vue/24/outline'
import NumberFlow from '@number-flow/vue'
import { monetizeStats, monetizeCollections, recentSubscribers } from '@/lib/mock/monetize'

const displaySubscribers = ref(0)
const displayRevenue = ref(0)

onMounted(() => {
  setTimeout(() => {
    displaySubscribers.value = monetizeStats.subscribers
    displayRevenue.value = monetizeStats.revenueMonthly
  }, 200)
})
</script>

<template>
  <div class="flex flex-col gap-5 p-4">

    <!-- Summary tiles -->
    <div class="flex gap-2">
      <div class="flex-1 rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
        <p class="text-xs text-gray-400">Subscribers</p>
        <NumberFlow :value="displaySubscribers" class="text-xl font-semibold text-gray-900 leading-tight" />
        <p class="text-xs text-gray-400">total</p>
      </div>
      <div class="flex-1 rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
        <p class="text-xs text-gray-400">Revenue</p>
        <NumberFlow
          :value="displayRevenue"
          :format="{ style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }"
          class="text-xl font-semibold text-gray-900 leading-tight"
        />
        <p class="text-xs text-gray-400">this month</p>
      </div>
    </div>

    <!-- Collections -->
    <div class="rounded-xl bg-white border border-gray-100 overflow-hidden">
      <div class="px-3 py-2.5 border-b border-gray-100">
        <p class="text-xs font-medium text-gray-500">Collections</p>
      </div>
      <div v-if="monetizeCollections.length" class="flex flex-col divide-y divide-gray-100">
        <div
          v-for="col in monetizeCollections"
          :key="col.id"
          class="flex items-center justify-between px-3 py-2.5"
        >
          <div class="min-w-0">
            <p class="text-xs font-medium text-gray-900 truncate">{{ col.name }}</p>
            <p class="text-xs text-gray-400">${{ col.price }}/{{ col.billing }}</p>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-xs font-semibold text-gray-900">{{ col.subscribers }}</span>
            <span class="text-xs text-gray-400">subs</span>
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col items-center gap-2 py-6 text-center">
        <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <CurrencyDollarIcon class="h-5 w-5 text-gray-400" />
        </div>
        <p class="text-xs text-gray-400">No collections yet.</p>
      </div>
    </div>

    <!-- Recent subscribers -->
    <div class="rounded-xl bg-white border border-gray-100 overflow-hidden">
      <div class="px-3 py-2.5 border-b border-gray-100">
        <p class="text-xs font-medium text-gray-500">Recent subscribers</p>
      </div>
      <div v-if="recentSubscribers.length" class="flex flex-col divide-y divide-gray-100">
        <div
          v-for="sub in recentSubscribers"
          :key="sub.email"
          class="flex items-center justify-between px-3 py-2.5"
        >
          <div class="min-w-0">
            <p class="text-xs font-medium text-gray-900 truncate">{{ sub.name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ sub.plan }}</p>
          </div>
          <span class="text-xs text-gray-400 shrink-0">{{ sub.since }}</span>
        </div>
      </div>
      <div v-else class="flex flex-col items-center gap-2 py-6 text-center">
        <p class="text-xs text-gray-400">No subscribers yet.</p>
      </div>
    </div>

  </div>
</template>
