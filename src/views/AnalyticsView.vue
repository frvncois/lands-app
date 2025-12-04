<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const projectId = computed(() => route.params.projectId as string)

// Analytics data types
interface AnalyticsData {
  pageviews: number
  visitors: number
  bounceRate: number
  avgTime: string
  topPages: { path: string; views: number; percentage: number }[]
  topReferrers: { source: string; visits: number; percentage: number }[]
  devices: { type: string; percentage: number; color: string }[]
  countries: { name: string; visits: number; percentage: number }[]
  chartData: { day: string; views: number; visitors: number }[]
}

// State
const analyticsData = ref<AnalyticsData | null>(null)
const isLoading = ref(false)
const liveVisitors = ref(0)
const selectedPeriod = ref('7d')

const periodOptions = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
]

const maxChartValue = computed(() => {
  if (!analyticsData.value?.chartData) return 0
  return Math.max(...analyticsData.value.chartData.map(d => d.views))
})

// Fetch analytics data from Umami
async function fetchAnalytics() {
  isLoading.value = true
  try {
    // TODO: Replace with actual Umami API call
    // const response = await fetch(`/api/analytics/${projectId.value}?period=${selectedPeriod.value}`)
    // const data = await response.json()
    // analyticsData.value = data

    // For now, set to null to show empty state
    analyticsData.value = null
  } catch (e) {
    console.error('Failed to fetch analytics:', e)
    analyticsData.value = null
  } finally {
    isLoading.value = false
  }
}

// Fetch live visitors count
async function fetchLiveVisitors() {
  try {
    // TODO: Replace with actual Umami realtime API call
    // const response = await fetch(`/api/analytics/${projectId.value}/realtime`)
    // const data = await response.json()
    // liveVisitors.value = data.visitors
    liveVisitors.value = 0
  } catch (e) {
    console.error('Failed to fetch live visitors:', e)
  }
}

onMounted(() => {
  fetchAnalytics()
  fetchLiveVisitors()
  // Poll for live visitors every 30 seconds
  const interval = setInterval(fetchLiveVisitors, 30000)
  return () => clearInterval(interval)
})

// Refetch when period changes
watch(selectedPeriod, () => {
  fetchAnalytics()
})

// Refetch when project changes
watch(projectId, () => {
  fetchAnalytics()
  fetchLiveVisitors()
})
</script>

<template>
  <div class="flex-1 h-full overflow-y-auto bg-background">
    <div class="max-w-6xl mx-auto p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl text-foreground">Analytics</h1>
          <p class="text-sm text-muted-foreground mt-1">Track your site's performance and visitor data.</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Live indicator -->
          <div class="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span class="text-xs font-medium text-green-600">{{ liveVisitors }} live</span>
          </div>
          <!-- Period selector -->
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
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <svg class="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!analyticsData" class="flex items-center justify-center py-20">
        <div class="text-center max-w-md">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-foreground mb-2">No analytics data yet</h3>
          <p class="text-sm text-muted-foreground mb-4">
            Analytics will appear here once your site starts receiving traffic. Make sure your site is published and the tracking script is installed.
          </p>
          <div class="p-4 bg-muted rounded-lg text-left">
            <p class="text-xs font-medium text-foreground mb-2">Quick setup:</p>
            <ol class="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Publish your site</li>
              <li>Add the Umami tracking script</li>
              <li>Wait for visitors to start browsing</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- Analytics Content -->
      <template v-else>
        <!-- Stats Cards -->
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div class="bg-card border border-border rounded-lg p-4">
            <div class="flex items-center justify-between">
              <p class="text-sm text-muted-foreground">Pageviews</p>
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <p class="text-2xl font-semibold text-foreground mt-2">{{ analyticsData.pageviews.toLocaleString() }}</p>
          </div>
          <div class="bg-card border border-border rounded-lg p-4">
            <div class="flex items-center justify-between">
              <p class="text-sm text-muted-foreground">Unique Visitors</p>
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p class="text-2xl font-semibold text-foreground mt-2">{{ analyticsData.visitors.toLocaleString() }}</p>
          </div>
          <div class="bg-card border border-border rounded-lg p-4">
            <div class="flex items-center justify-between">
              <p class="text-sm text-muted-foreground">Bounce Rate</p>
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p class="text-2xl font-semibold text-foreground mt-2">{{ analyticsData.bounceRate }}%</p>
          </div>
          <div class="bg-card border border-border rounded-lg p-4">
            <div class="flex items-center justify-between">
              <p class="text-sm text-muted-foreground">Avg. Visit Time</p>
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-2xl font-semibold text-foreground mt-2">{{ analyticsData.avgTime }}</p>
          </div>
        </div>

        <!-- Main Chart -->
        <div class="bg-card border border-border rounded-lg p-5 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-medium text-foreground">Traffic Overview</h2>
            <div class="flex items-center gap-4 text-xs">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span class="text-muted-foreground">Pageviews</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span class="text-muted-foreground">Visitors</span>
              </div>
            </div>
          </div>
          <div v-if="analyticsData.chartData?.length" class="flex items-end gap-3 h-48">
            <div
              v-for="data in analyticsData.chartData"
              :key="data.day"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <div class="w-full flex gap-1 items-end" :style="{ height: '100%' }">
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
          <div v-else class="h-48 flex items-center justify-center text-sm text-muted-foreground">
            No chart data available
          </div>
        </div>

        <!-- Bottom Grid -->
        <div class="grid grid-cols-3 gap-6">
          <!-- Top Pages -->
          <div class="bg-card border border-border rounded-lg p-5">
            <h2 class="text-sm font-medium text-foreground mb-4">Top Pages</h2>
            <div v-if="analyticsData.topPages?.length" class="space-y-3">
              <div
                v-for="page in analyticsData.topPages"
                :key="page.path"
                class="group"
              >
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-sm text-foreground group-hover:text-primary transition-colors">{{ page.path }}</span>
                  <span class="text-xs text-muted-foreground">{{ page.views.toLocaleString() }}</span>
                </div>
                <div class="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary rounded-full transition-all"
                    :style="{ width: `${page.percentage}%` }"
                  />
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground">No page data yet</p>
          </div>

          <!-- Top Referrers -->
          <div class="bg-card border border-border rounded-lg p-5">
            <h2 class="text-sm font-medium text-foreground mb-4">Top Referrers</h2>
            <div v-if="analyticsData.topReferrers?.length" class="space-y-3">
              <div
                v-for="referrer in analyticsData.topReferrers"
                :key="referrer.source"
                class="group"
              >
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-sm text-foreground group-hover:text-primary transition-colors">{{ referrer.source }}</span>
                  <span class="text-xs text-muted-foreground">{{ referrer.visits.toLocaleString() }}</span>
                </div>
                <div class="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    class="h-full bg-blue-500 rounded-full transition-all"
                    :style="{ width: `${referrer.percentage}%` }"
                  />
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground">No referrer data yet</p>
          </div>

          <!-- Devices & Countries -->
          <div class="space-y-6">
            <!-- Devices -->
            <div class="bg-card border border-border rounded-lg p-5">
              <h2 class="text-sm font-medium text-foreground mb-4">Devices</h2>
              <template v-if="analyticsData.devices?.length">
                <div class="flex items-center gap-2 mb-3">
                  <div
                    v-for="device in analyticsData.devices"
                    :key="device.type"
                    class="h-2 rounded-full transition-all"
                    :class="device.color"
                    :style="{ width: `${device.percentage}%` }"
                  />
                </div>
                <div class="flex items-center justify-between text-xs">
                  <div
                    v-for="device in analyticsData.devices"
                    :key="device.type"
                    class="flex items-center gap-1.5"
                  >
                    <span class="w-2 h-2 rounded-full" :class="device.color"></span>
                    <span class="text-muted-foreground">{{ device.type }} {{ device.percentage }}%</span>
                  </div>
                </div>
              </template>
              <p v-else class="text-sm text-muted-foreground">No device data yet</p>
            </div>

            <!-- Countries -->
            <div class="bg-card border border-border rounded-lg p-5">
              <h2 class="text-sm font-medium text-foreground mb-4">Countries</h2>
              <div v-if="analyticsData.countries?.length" class="space-y-2">
                <div
                  v-for="country in analyticsData.countries.slice(0, 4)"
                  :key="country.name"
                  class="flex items-center justify-between text-sm"
                >
                  <span class="text-foreground">{{ country.name }}</span>
                  <span class="text-xs text-muted-foreground">{{ country.percentage }}%</span>
                </div>
              </div>
              <p v-else class="text-sm text-muted-foreground">No country data yet</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
