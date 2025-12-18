<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
</script>

<template>
  <div class="flex flex-col h-screen bg-background font-sans">
    <AppHeader />
    <main class="flex-1 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>
