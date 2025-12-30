import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { TOUR_STEPS, TOTAL_STEPS, type TourStep } from '@/lib/tour-steps'

export const useTourStore = defineStore('tour', () => {
  // State
  const isActive = ref(false)
  const currentStepIndex = ref(0)
  const projectId = ref<string | null>(null)

  // Getters
  const currentStep = computed((): TourStep | null => {
    if (!isActive.value || currentStepIndex.value >= TOUR_STEPS.length) {
      return null
    }
    return TOUR_STEPS[currentStepIndex.value] || null
  })

  const isFirstStep = computed(() => currentStepIndex.value === 0)
  const isLastStep = computed(() => currentStepIndex.value === TOTAL_STEPS - 1)
  const progress = computed(() => `${currentStepIndex.value + 1}/${TOTAL_STEPS}`)

  // Actions
  async function checkTourStatus(pid: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('project_settings')
        .select('tour_completed')
        .eq('project_id', pid)
        .maybeSingle()

      if (error) {
        console.error('Failed to check tour status:', error)
        return false
      }

      // If no settings row exists or tour_completed is false/null, tour should be shown
      const tourCompleted = data && 'tour_completed' in data ? (data as { tour_completed?: boolean }).tour_completed : false
      return tourCompleted !== true
    } catch (e) {
      console.error('Failed to check tour status:', e)
      return false
    }
  }

  function startTour(pid: string) {
    projectId.value = pid
    currentStepIndex.value = 0
    isActive.value = true
  }

  function nextStep() {
    if (currentStepIndex.value < TOTAL_STEPS - 1) {
      currentStepIndex.value++
    } else {
      completeTour()
    }
  }

  async function skipTour() {
    isActive.value = false
    currentStepIndex.value = 0
    await saveTourCompletion()
  }

  async function completeTour() {
    isActive.value = false
    currentStepIndex.value = 0
    await saveTourCompletion()
  }

  async function saveTourCompletion() {
    if (!projectId.value) return

    try {
      const { error } = await supabase
        .from('project_settings')
        .upsert(
          {
            project_id: projectId.value,
            tour_completed: true,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'project_id',
          }
        )

      if (error) {
        console.error('Failed to save tour completion:', error)
      }
    } catch (e) {
      console.error('Failed to save tour completion:', e)
    }

    projectId.value = null
  }

  return {
    // State
    isActive,
    currentStepIndex,
    projectId,
    // Getters
    currentStep,
    isFirstStep,
    isLastStep,
    progress,
    // Actions
    checkTourStatus,
    startTour,
    nextStep,
    skipTour,
    completeTour,
  }
})
