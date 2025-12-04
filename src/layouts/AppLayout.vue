<script setup lang="ts">
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppHeader from '@/components/common/AppHeader.vue'
</script>

<template>
  <div class="flex h-screen bg-background font-sans">
    <AppSidebar />
    <div class="flex flex-col flex-1 overflow-hidden">
      <AppHeader />
      <main class="flex-1 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
