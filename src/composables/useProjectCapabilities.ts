import { computed } from 'vue'
import { PROJECT_NAV } from '@/settings/projectSettings'
import type { SettingsSection } from '@/types/settings'

export function useProjectCapabilities() {
  function canShow(section: SettingsSection): boolean {
    if (!section.routeName) return false
    if (section.visible && !section.visible()) return false
    return true
  }

  const headerNav = computed(() =>
    PROJECT_NAV
      .filter(s => s.showInHeader && canShow(s))
      .map(s => ({
        name: s.routeName!,
        label: s.title,
        icon: s.icon!,
      }))
  )

  const commandNav = computed(() =>
    PROJECT_NAV
      .filter(s => s.showInCommand && canShow(s))
      .map(s => ({
        id: s.id,
        label: s.title,
        icon: s.icon!,
        routeName: s.routeName!,
      }))
  )

  return {
    headerNav,
    commandNav,
  }
}
