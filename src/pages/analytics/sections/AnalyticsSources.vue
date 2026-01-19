<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

interface PageData {
  path: string
  views: number
  percentage: number
}

interface ReferrerData {
  source: string
  visits: number
  percentage: number
}

const isLoading = ref(false)
const topPages = ref<PageData[]>([])
const topReferrers = ref<ReferrerData[]>([])

async function fetchSources() {
  isLoading.value = true
  try {
    topPages.value = []
    topReferrers.value = []
  } catch (e) {
    console.error('Failed to fetch sources:', e)
    topPages.value = []
    topReferrers.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchSources)
watch(() => route.params.projectId, fetchSources)
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <!-- Top Pages -->
    <div class="bg-card border border-border rounded-lg p-5">
      <h2 class="text-sm font-medium text-foreground mb-4">
        Top Pages
      </h2>

      <div
        v-if="isLoading"
        class="flex items-center justify-center py-8"
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

      <div
        v-else-if="topPages.length"
        class="space-y-3"
      >
        <div
          v-for="page in topPages"
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

      <p
        v-else
        class="text-sm text-muted-foreground"
      >
        No page data yet
      </p>
    </div>

    <!-- Top Referrers -->
    <div class="bg-card border border-border rounded-lg p-5">
      <h2 class="text-sm font-medium text-foreground mb-4">
        Top Referrers
      </h2>

      <div
        v-if="isLoading"
        class="flex items-center justify-center py-8"
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

      <div
        v-else-if="topReferrers.length"
        class="space-y-3"
      >
        <div
          v-for="referrer in topReferrers"
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

      <p
        v-else
        class="text-sm text-muted-foreground"
      >
        No referrer data yet
      </p>
    </div>
  </div>
</template>
