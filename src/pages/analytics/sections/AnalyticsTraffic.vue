<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

interface ChartData {
  day: string
  views: number
  visitors: number
}

const isLoading = ref(false)
const chartData = ref<ChartData[]>([])
const selectedPeriod = ref('7d')

const periodOptions = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
]

const maxChartValue = computed(() => {
  if (!chartData.value.length) return 0
  return Math.max(...chartData.value.map(d => d.views))
})

async function fetchTraffic() {
  isLoading.value = true
  try {
    chartData.value = []
  } catch (e) {
    console.error('Failed to fetch traffic:', e)
    chartData.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchTraffic)
watch(selectedPeriod, fetchTraffic)
watch(() => route.params.projectId, fetchTraffic)
</script>

<template>
  <div class="bg-card border border-border rounded-lg p-5">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-medium text-foreground">
        Traffic Overview
      </h2>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-4 text-xs">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-primary" />
            <span class="text-muted-foreground">Pageviews</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span class="text-muted-foreground">Visitors</span>
          </div>
        </div>
        <div class="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <button
            v-for="period in periodOptions"
            :key="period.value"
            class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
            :class="selectedPeriod === period.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'"
            @click="selectedPeriod = period.value"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="h-48 flex items-center justify-center"
    >
      <svg
        class="w-6 h-6 text-primary animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>

    <!-- Chart -->
    <div
      v-else-if="chartData.length"
      class="flex items-end gap-3 h-48"
    >
      <div
        v-for="data in chartData"
        :key="data.day"
        class="flex-1 flex flex-col items-center gap-1"
      >
        <div
          class="w-full flex gap-1 items-end"
          :style="{ height: '100%' }"
        >
          <div
            class="flex-1 bg-primary rounded-t transition-all hover:opacity-80"
            :style="{ height: `${(data.views / maxChartValue) * 100}%` }"
          />
          <div
            class="flex-1 bg-blue-500 rounded-t transition-all hover:opacity-80"
            :style="{ height: `${(data.visitors / maxChartValue) * 100}%` }"
          />
        </div>
        <span class="text-xs text-muted-foreground">{{ data.day }}</span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="h-48 flex items-center justify-center text-sm text-muted-foreground"
    >
      No chart data available
    </div>
  </div>
</template>
