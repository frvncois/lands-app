import type { Component } from 'vue'
import type { ThemePreset } from '@/types/theme'
import type { SectionType } from '@/types/section'

import HeaderMinimalSettings from '@/components/editor/settings/header/HeaderMinimalSettings.vue'
import HeaderStructureSettings from '@/components/editor/settings/header/HeaderStructureSettings.vue'
import HeaderDefaultSettings from '@/components/editor/settings/header/HeaderDefaultSettings.vue'
import FooterMinimalSettings from '@/components/editor/settings/footer/FooterMinimalSettings.vue'
import FooterDefaultSettings from '@/components/editor/settings/footer/FooterDefaultSettings.vue'

type ThemeSettingsMap = { default: Component } & Partial<Record<ThemePreset, Component>>

// Maps section type + theme preset to the settings component to render.
// To add a new theme variant: create the component, import it above, add it here.
export const SECTION_SETTINGS_CONFIG: Partial<Record<SectionType, ThemeSettingsMap>> = {
  header: {
    default: HeaderDefaultSettings,
    minimal: HeaderMinimalSettings,
    baseline: HeaderMinimalSettings,
    structure: HeaderStructureSettings,
  },
  footer: {
    default: FooterDefaultSettings,
    minimal: FooterMinimalSettings,
    baseline: FooterMinimalSettings,
  },
}

export function resolveSettingsComponent(map: ThemeSettingsMap, preset: string): Component {
  return (map as Record<string, Component>)[preset] ?? map.default
}
