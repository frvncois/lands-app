<script setup lang="ts">
import LandsLogo from '@/assets/LandsLogo.vue'
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-white gap-6 text-center px-4">
    <LandsLogo class="h-8 w-auto opacity-60" />
    <div class="flex flex-col gap-2">
      <p class="text-sm font-semibold text-gray-900">No route found</p>
      <p class="text-xs text-gray-400">This page is not available right now.</p>
    </div>
    <a
      href="https://lands.app"
      class="text-xs font-medium text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      Back to Lands
    </a>
  </div>
</template>
