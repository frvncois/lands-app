<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/shared/AppHeader.vue'
import PlanModal from '@/components/modals/PlanModal.vue'
import { useAppModals } from '@/stores/appModals'

const appModals = useAppModals()

const route = useRoute()
const transitionName = ref('modal-forward')

const routeDepth: Record<string, number> = {
  '/dashboard': 0,
  '/dashboard/account': 1,
  '/dashboard/plans': 1,
}

let prevDepth = routeDepth[route.path] ?? 0

watch(() => route.path, (next, prev) => {
  const nextDepth = routeDepth[next] ?? 0
  const prevD = routeDepth[prev] ?? prevDepth
  transitionName.value = nextDepth >= prevD ? 'modal-forward' : 'modal-back'
  prevDepth = nextDepth
})
</script>

<template>
  <div class="grid h-screen grid-rows-[auto_1fr] overflow-hidden">
    <div class="app-header-enter relative z-50">
      <AppHeader />
    </div>
    <Transition name="app-main" appear>
      <main class="min-h-0 overflow-hidden m-2 mt-0">
        <RouterView v-slot="{ Component }">
          <Transition :name="transitionName" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </main>
    </Transition>
  </div>

  <Teleport to="body">
    <Transition name="modal-center">
      <PlanModal v-if="appModals.activeModal === 'upgrade'" @close="appModals.close()" />
    </Transition>
  </Teleport>
</template>