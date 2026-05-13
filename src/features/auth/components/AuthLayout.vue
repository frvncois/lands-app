<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import LandsLogo from '@/assets/LandsLogo.vue'
import { useAuthAnimation } from '@/features/auth/composables/useAuthAnimation'

const { signingIn } = useAuthAnimation()
const expanded = ref(false)

onMounted(() => {
  expanded.value = false
  signingIn.value = false
})

watch(signingIn, (val) => {
  if (val) expanded.value = true
})
</script>

<template>
  <main class="flex w-screen h-screen">
    <!-- Outer: animates width, clips content via overflow-hidden -->
    <div
      class="shrink-0 overflow-hidden bg-white relative z-2 transition-[width] ease-in-out duration-700"
      :class="expanded ? 'w-screen' : 'w-2xl'"
    >
      <!-- Inner: fixed width with padding, always full height -->
      <div class="flex flex-col p-16 h-full w-2xl">
        <LandsLogo class="mb-8 shrink-0" />
        <div class="flex flex-col flex-1">
          <RouterView v-slot="{ Component }">
            <Transition name="auth" mode="out-in">
              <component :is="Component" :key="$route.path" />
            </Transition>
          </RouterView>
        </div>
      </div>
    </div>
    <div class="flex-1 bg-neutral-900 fixed inset-0 z-1">
      Welcome
    </div>
  </main>
</template>

<style>
/* ── Route transitions within auth ── */
.auth-enter-active {
  transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.auth-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
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
