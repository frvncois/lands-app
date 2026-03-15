<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { HomeIcon, PuzzlePieceIcon, PencilSquareIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'

const STEPS = [
  {
    icon: HomeIcon,
    title: 'Your dashboard',
    description: 'This is where all your projects live. Switch between lands, track visits, and manage everything from here.',
  },
  {
    icon: PuzzlePieceIcon,
    title: 'Plugins & integrations',
    description: 'Connect your tools — email platforms, analytics, payment providers and more — right from the editor.',
  },
  {
    icon: PencilSquareIcon,
    title: 'Start editing',
    description: 'Click the Edit button in the header to open the editor. Customise sections, theme, colors, and fonts.',
  },
]

const visible = ref(false)
const currentStep = ref(0)

const current = computed(() => STEPS[currentStep.value])
const isLast = computed(() => currentStep.value === STEPS.length - 1)

onMounted(() => {
  if (sessionStorage.getItem('lands_tour_pending') === 'true') {
    sessionStorage.removeItem('lands_tour_pending')
    visible.value = true
  }
})

function next() {
  if (isLast.value) {
    visible.value = false
  } else {
    currentStep.value++
  }
}

function dismiss() {
  visible.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="tour-fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-end justify-center pb-8 pointer-events-none">
        <!-- Card -->
        <div class="pointer-events-auto w-full max-w-sm mx-4 bg-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden">
          <!-- Progress bar -->
          <div class="flex gap-1 p-4 pb-0">
            <div
              v-for="(_, i) in STEPS"
              :key="i"
              class="h-0.5 flex-1 rounded-full transition-colors duration-300"
              :class="i <= currentStep ? 'bg-white' : 'bg-white/20'"
            />
          </div>

          <div class="p-5">
            <div v-if="current" class="flex items-start gap-4">
              <div class="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
                <component :is="current.icon" class="h-5 w-5 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold mb-1">{{ current.title }}</p>
                <p class="text-xs text-gray-400 leading-relaxed">{{ current.description }}</p>
              </div>
              <button
                class="shrink-0 flex items-center justify-center w-6 h-6 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                @click="dismiss"
              >
                <XMarkIcon class="h-3.5 w-3.5" />
              </button>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-xs text-gray-500">{{ currentStep + 1 }} / {{ STEPS.length }}</span>
              <button
                class="flex items-center gap-1.5 text-xs font-medium bg-white text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                @click="next"
              >
                <span>{{ isLast ? 'Got it' : 'Next' }}</span>
                <ArrowRightIcon v-if="!isLast" class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.tour-fade-enter-active,
.tour-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.tour-fade-enter-from,
.tour-fade-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
