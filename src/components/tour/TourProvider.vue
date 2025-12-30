<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useTourStore } from '@/stores/tour'
import TourHighlight from './TourHighlight.vue'
import TourStep from './TourStep.vue'

const tour = useTourStore()

function handleNext() {
  tour.nextStep()
}

function handleSkip() {
  tour.skipTour()
}

function handleEscKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && tour.isActive) {
    tour.skipTour()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscKey)
})
</script>

<template>
  <div v-if="tour.isActive && tour.currentStep">
    <TourHighlight :target="tour.currentStep.target" />
    <TourStep
      :step="tour.currentStep"
      :step-number="tour.currentStepIndex + 1"
      :total-steps="5"
      :is-last-step="tour.isLastStep"
      @next="handleNext"
      @skip="handleSkip"
    />
  </div>
</template>
