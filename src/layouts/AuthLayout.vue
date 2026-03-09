<script setup lang="ts">
import LandsLogo from '@/assets/LandsLogo.vue'
</script>

<template>
  <main class="flex w-screen h-screen">
    <div class="flex flex-col w-2xl p-16 overflow-hidden">
      <LandsLogo class="mb-8 shrink-0" />
      <RouterView v-slot="{ Component }">
        <Transition name="auth" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </Transition>
      </RouterView>
    </div>
    <div class="flex-1 bg-neutral-900">
      Welcome
    </div>
  </main>
</template>

<style>
.auth-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.auth-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.auth-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.auth-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
