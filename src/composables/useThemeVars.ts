import { watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { ThemePreset, TypographyStyle } from '@/types/theme'

const DEFAULT_FONT_MAP: Record<TypographyStyle, string> = {
  sans: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
  mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace',
}

const EDITORIAL_FONT_MAP: Record<TypographyStyle, string> = {
  serif: '"Gambarino-Regular", ui-serif, Georgia, serif',
  sans: '"Switzer-Regular", ui-sans-serif, system-ui, sans-serif',
  mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace',
}

function resolveFont(preset: ThemePreset, style: TypographyStyle): string {
  if (preset === 'editorial') return EDITORIAL_FONT_MAP[style]
  return DEFAULT_FONT_MAP[style]
}

export function useThemeVars() {
  const themeStore = useThemeStore()

  function applyVars() {
    const t = themeStore.theme
    if (!t) return
    const root = document.documentElement
    root.style.setProperty('--theme-main', t.color_main)
    root.style.setProperty('--theme-accent', t.color_accent)
    root.style.setProperty('--theme-surface', t.color_surface)
    root.style.setProperty('--theme-font', resolveFont(t.theme_preset, t.typography_style))
  }

  // Apply CSS vars whenever theme changes (land → themeStore sync handled by setActiveLand)
  watch(() => themeStore.theme, applyVars, { deep: true, immediate: true })
}
