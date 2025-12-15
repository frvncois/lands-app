import { computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { planHasFeature } from '@/types/project'
import type { SettingsSection } from '@/types/settings'

export function useFeatureGate(section: SettingsSection) {
  const projectStore = useProjectStore()

  const allowed = computed(() => {
    if (!section.requiresFeature) return true
    return planHasFeature(projectStore.settings.plan, section.requiresFeature)
  })

  return { allowed }
}
