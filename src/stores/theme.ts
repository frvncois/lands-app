import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { LandTheme } from '@/types/theme'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<LandTheme | null>(null)

  function setTheme(themeData: LandTheme) {
    theme.value = themeData
  }

  function updateThemeField<K extends keyof LandTheme>(
    field: K,
    value: LandTheme[K]
  ) {
    if (theme.value) {
      theme.value[field] = value
    }
  }

  function clearTheme() {
    theme.value = null
  }

  return {
    theme,
    setTheme,
    updateThemeField,
    clearTheme,
  }
})
