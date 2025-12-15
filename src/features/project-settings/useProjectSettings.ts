import { computed } from 'vue'
import { PLAN_DEFINITIONS, planHasFeature } from '@/types/project'
import { useProjectStore } from '@/stores/project'

export function useProjectSettings() {
  const store = useProjectStore()
  const settings = computed(() => store.settings)

  return {
    settings,
    currentPlan: computed(() => PLAN_DEFINITIONS[settings.value.plan]),
    canUseCustomDomain: computed(() => planHasFeature(settings.value.plan, 'customDomain')),
    canUseAnalytics: computed(() => planHasFeature(settings.value.plan, 'analytics')),
    canUseCollaborators: computed(() => planHasFeature(settings.value.plan, 'collaborators')),
  }
}
