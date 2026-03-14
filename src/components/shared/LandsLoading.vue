<script setup lang="ts">
import LandsLogo from '@/assets/LandsLogo.vue'
</script>

<template>
  <div class="flex h-full items-center justify-center">
    <div class="relative flex items-center justify-center">

      <!-- Ring -->
      <svg class="absolute" width="64" height="64" viewBox="0 0 64 64">
        <circle
          cx="32" cy="32" r="28"
          fill="none"
          stroke="#e5e7eb"
          stroke-width="2"
        />
        <circle
          cx="32" cy="32" r="28"
          fill="none"
          stroke="#18181b"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray="175.9"
          stroke-dashoffset="175.9"
          transform="rotate(-90 32 32)"
          class="ring-fill"
        />
      </svg>

      <!-- Logo -->
      <LandsLogo class="text-gray-900 w-5 h-auto relative z-10" />

    </div>
  </div>
</template>

<style scoped>
.ring-fill {
  animation: fill-ring 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes fill-ring {
  0%   { stroke-dashoffset: 175.9; opacity: 1; }
  70%  { stroke-dashoffset: 0;     opacity: 1; }
  85%  { stroke-dashoffset: 0;     opacity: 0; }
  100% { stroke-dashoffset: 175.9; opacity: 0; }
}
</style>
