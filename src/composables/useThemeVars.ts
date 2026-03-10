import { watch } from 'vue'
import { useThemeStore } from '@/stores/theme'

const FONT_MAP = {
  sans: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
  mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace',
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
    root.style.setProperty('--theme-font', FONT_MAP[t.typography_style])
  }

  // Apply CSS vars whenever theme changes (land → themeStore sync handled by setActiveLand)
  watch(() => themeStore.theme, applyVars, { deep: true, immediate: true })
}
