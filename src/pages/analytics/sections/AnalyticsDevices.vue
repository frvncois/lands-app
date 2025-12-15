<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

interface DeviceData {
  type: string
  percentage: number
  color: string
}

interface CountryData {
  name: string
  visits: number
  percentage: number
}

const isLoading = ref(false)
const devices = ref<DeviceData[]>([])
const countries = ref<CountryData[]>([])

async function fetchDevices() {
  isLoading.value = true
  try {
    // TODO: Replace with actual Umami API call
    devices.value = []
    countries.value = []
  } catch (e) {
    console.error('Failed to fetch devices:', e)
    devices.value = []
    countries.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchDevices)
watch(() => route.params.projectId, fetchDevices)
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <!-- Devices -->
    <div class="bg-card border border-border rounded-lg p-5">
      <h2 class="text-sm font-medium text-foreground mb-4">Devices</h2>

      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <svg class="w-6 h-6 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <template v-else-if="devices.length">
        <div class="flex items-center gap-2 mb-3">
          <div
            v-for="device in devices"
            :key="device.type"
            class="h-2 rounded-full transition-all"
            :class="device.color"
            :style="{ width: `${device.percentage}%` }"
          />
        </div>
        <div class="flex items-center justify-between text-xs">
          <div
            v-for="device in devices"
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

      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <svg class="w-6 h-6 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div v-else-if="countries.length" class="space-y-2">
        <div
          v-for="country in countries.slice(0, 4)"
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
</template>
