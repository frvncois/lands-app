export const THEME_PRESETS = {
  minimal: 'minimal',
  bold: 'bold',
  editorial: 'editorial',
  structure: 'structure',
} as const

export type ThemePreset = typeof THEME_PRESETS[keyof typeof THEME_PRESETS]

export interface LandTheme {
  theme_preset: ThemePreset
  color_main: string    // Primary brand color — headings, buttons, strong emphasis
  color_accent: string  // Secondary highlight — links, hover states, active indicators
  color_surface: string // Tertiary tint — card backgrounds, subtle fills, section backgrounds
  font_title: string    // CSS font-family stack for headings
  font_body: string     // CSS font-family stack for body text
}
