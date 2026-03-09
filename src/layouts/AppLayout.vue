<script setup lang="ts">
import AppHeader from '@/components/shared/AppHeader.vue';
</script>

<template>
  <div class="grid h-screen grid-rows-[auto_1fr] overflow-hidden">
    <AppHeader />
    <main class="min-h-0 overflow-y-auto bg-neutral-100 rounded-xl m-2 mt-0">
      <RouterView />
    </main>
  </div>
</template>