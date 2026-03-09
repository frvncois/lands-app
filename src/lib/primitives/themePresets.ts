import { THEME_PRESETS, TYPOGRAPHY_STYLES, type ThemePreset, type LandTheme } from '@/types/theme'

export interface ThemePresetDefinition {
  label: string
  description: string
  defaults: Omit<LandTheme, 'id' | 'land_id'>
}

export const THEME_PRESET_DEFINITIONS: Record<ThemePreset, ThemePresetDefinition> = {
  [THEME_PRESETS.minimal]: {
    label: 'Minimal',
    description: 'Clean and simple. Content speaks for itself.',
    defaults: {
      theme_preset: THEME_PRESETS.minimal,
      color_main: '#18181B',
      color_accent: '#6366F1',
      color_surface: '#F4F4F5',
      typography_style: TYPOGRAPHY_STYLES.sans,
    },
  },
  [THEME_PRESETS.bold]: {
    label: 'Bold',
    description: 'Strong presence. High contrast.',
    defaults: {
      theme_preset: THEME_PRESETS.bold,
      color_main: '#2563EB',
      color_accent: '#F59E0B',
      color_surface: '#1E293B',
      typography_style: TYPOGRAPHY_STYLES.sans,
    },
  },
  [THEME_PRESETS.editorial]: {
    label: 'Editorial',
    description: 'Refined and typographic. Great for writers.',
    defaults: {
      theme_preset: THEME_PRESETS.editorial,
      color_main: '#1E1E1E',
      color_accent: '#B45309',
      color_surface: '#FAF9F6',
      typography_style: TYPOGRAPHY_STYLES.serif,
    },
  },
}
