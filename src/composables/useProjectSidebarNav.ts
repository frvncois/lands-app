import { computed } from 'vue'
import { PROJECT_NAV } from '@/settings/projectSettings'
import type { SettingsSection } from '@/types/settings'

export function useProjectSidebarNav() {
  function canShow(section: SettingsSection): boolean {
    if (!section.routeName) return false
    if (section.visible && !section.visible()) return false
    return true
  }

  const navItems = computed(() =>
    PROJECT_NAV.filter(canShow).map(section => ({
      name: section.routeName!,
      label: section.title,
      icon: section.icon!,
    }))
  )

  return { navItems }
}
