<script setup lang="ts">
import BaseChart from '@/components/ui/BaseChart.vue'
import { visitData, totalViews, avgPerDay, referrers, topClicked } from '@/lib/mock/analytics'
</script>

<template>
  <div class="flex flex-col gap-5 p-4">

    <!-- Summary -->
    <div class="grid grid-cols-2 gap-2 card-appear" style="animation-delay: 0ms">
      <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
        <p class="text-xs text-gray-400">Total views</p>
        <p class="text-xl font-semibold text-gray-900 leading-tight">{{ totalViews.toLocaleString() }}</p>
        <p class="text-xs text-gray-400">last 30 days</p>
      </div>
      <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
        <p class="text-xs text-gray-400">Daily avg</p>
        <p class="text-xl font-semibold text-gray-900 leading-tight">{{ avgPerDay }}</p>
        <p class="text-xs text-gray-400">views / day</p>
      </div>
    </div>

    <!-- Chart -->
    <div class="rounded-xl bg-white border border-gray-100 p-3 card-appear" style="animation-delay: 100ms">
      <p class="text-xs font-medium text-gray-500 mb-2">Views — last 30 days</p>
      <BaseChart :data="visitData" :height="100" />
    </div>

    <!-- Referrers -->
    <div class="rounded-xl bg-white border border-gray-100 p-3 card-appear" style="animation-delay: 200ms">
      <p class="text-xs font-medium text-gray-500 mb-2">Referrers</p>
      <div class="flex flex-col gap-2">
        <div v-for="r in referrers" :key="r.label" class="flex items-center gap-2">
          <span class="text-xs text-gray-600 w-20 truncate">{{ r.label }}</span>
          <div class="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              class="h-full rounded-full bg-gray-700"
              :style="{ width: r.value + '%' }"
            />
          </div>
          <span class="text-xs text-gray-400 w-8 text-right">{{ r.value }}%</span>
        </div>
      </div>
    </div>

    <!-- Top clicked links -->
    <div class="rounded-xl bg-white border border-gray-100 p-3 card-appear" style="animation-delay: 300ms">
      <p class="text-xs font-medium text-gray-500 mb-2">Top clicked links</p>
      <div class="flex flex-col divide-y divide-gray-50">
        <div v-for="link in topClicked" :key="link.label" class="flex items-center justify-between py-2">
          <span class="text-xs text-gray-700">{{ link.label }}</span>
          <span class="text-xs font-medium text-gray-400">{{ link.clicks }} clicks</span>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.card-appear {
  animation: card-fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes card-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
