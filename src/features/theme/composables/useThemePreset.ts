import { computed } from 'vue'
import { useThemeStore } from '@/features/theme/stores/theme'

export function useThemePreset() {
  const themeStore = useThemeStore()
  const isMinimalTheme = computed(() => ['minimal', 'baseline'].includes(themeStore.theme?.theme_preset ?? ''))
  const isStructureTheme = computed(() => themeStore.theme?.theme_preset === 'structure')
  return { isMinimalTheme, isStructureTheme }
}
