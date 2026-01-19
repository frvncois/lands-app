<script setup lang="ts">
import LandsLogo from '@/assets/LandsLogo.vue'
</script>

<template>
  <div class="min-h-screen bg-background font-sans flex items-center justify-center">
    <div class="w-full max-w-[300px] p-6 sm:p-10">
      <div class="flex items-center justify-center gap-2 mb-8">
        <LandsLogo />
        <span class="text-xl font-semibold text-foreground">Lands</span>
      </div>
      <RouterView />
    </div>
  </div>
</template>
