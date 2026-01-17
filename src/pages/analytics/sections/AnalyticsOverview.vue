<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

interface OverviewData {
  pageviews: number
  visitors: number
  bounceRate: number
  avgTime: string
}

const isLoading = ref(false)
const data = ref<OverviewData | null>(null)
const liveVisitors = ref(0)
let pollInterval: ReturnType<typeof setInterval> | null = null

async function fetchOverview() {
  isLoading.value = true
  try {
    data.value = null
  } catch (e) {
    console.error('Failed to fetch overview:', e)
    data.value = null
  } finally {
    isLoading.value = false
  }
}

async function fetchLiveVisitors() {
  try {
    liveVisitors.value = 0
  } catch (e) {
    console.error('Failed to fetch live visitors:', e)
  }
}

onMounted(() => {
  fetchOverview()
  fetchLiveVisitors()
  pollInterval = setInterval(fetchLiveVisitors, 30000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

watch(() => route.params.projectId, () => {
  fetchOverview()
  fetchLiveVisitors()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Live indicator -->
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"/>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"/>
        </span>
        <span class="text-xs font-medium text-green-600">{{ liveVisitors }} live</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-3">
        <svg class="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <p class="text-sm text-muted-foreground">Loading analytics...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!data" class="flex items-center justify-center py-12">
      <div class="text-center max-w-md">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-foreground mb-2">No analytics data yet</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Analytics will appear here once your site starts receiving traffic.
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

    <!-- Stats Cards -->
    <div v-else class="grid grid-cols-4 gap-4">
      <div class="bg-card border border-border rounded-lg p-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-muted-foreground">Pageviews</p>
          <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <p class="text-2xl font-semibold text-foreground mt-2">{{ data.pageviews.toLocaleString() }}</p>
      </div>
      <div class="bg-card border border-border rounded-lg p-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-muted-foreground">Unique Visitors</p>
          <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p class="text-2xl font-semibold text-foreground mt-2">{{ data.visitors.toLocaleString() }}</p>
      </div>
      <div class="bg-card border border-border rounded-lg p-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-muted-foreground">Bounce Rate</p>
          <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <p class="text-2xl font-semibold text-foreground mt-2">{{ data.bounceRate }}%</p>
      </div>
      <div class="bg-card border border-border rounded-lg p-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-muted-foreground">Avg. Visit Time</p>
          <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-2xl font-semibold text-foreground mt-2">{{ data.avgTime }}</p>
      </div>
    </div>
  </div>
</template>
