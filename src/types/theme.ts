export const THEME_PRESETS = {
  minimal: 'minimal',
  bold: 'bold',
  editorial: 'editorial',
} as const

export type ThemePreset = typeof THEME_PRESETS[keyof typeof THEME_PRESETS]

export const TYPOGRAPHY_STYLES = {
  sans: 'sans',
  serif: 'serif',
  mono: 'mono',
} as const

export type TypographyStyle = typeof TYPOGRAPHY_STYLES[keyof typeof TYPOGRAPHY_STYLES]

export interface LandTheme {
  theme_preset: ThemePreset
  color_main: string    // Primary brand color — headings, buttons, strong emphasis
  color_accent: string  // Secondary highlight — links, hover states, active indicators
  color_surface: string // Tertiary tint — card backgrounds, subtle fills, section backgrounds
  typography_style: TypographyStyle
}
