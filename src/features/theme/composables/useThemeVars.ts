import { watch } from 'vue'
import { useThemeStore } from '@/features/theme/stores/theme'

export function useThemeVars() {
  const themeStore = useThemeStore()

  function applyVars() {
    const t = themeStore.theme
    if (!t) return
    const root = document.documentElement
    root.style.setProperty('--theme-main', t.color_main)
    root.style.setProperty('--theme-accent', t.color_accent)
    root.style.setProperty('--theme-surface', t.color_surface)
    root.style.setProperty('--theme-font-title', t.font_title)
    root.style.setProperty('--theme-font-body', t.font_body)
    // Keep --theme-font as alias for body font (used in EditorPreview / LandsPreview)
    root.style.setProperty('--theme-font', t.font_body)
  }

  watch(() => themeStore.theme, applyVars, { deep: true, immediate: true })
}
