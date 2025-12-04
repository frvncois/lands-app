import { watch, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

export function useTheme() {
  const userStore = useUserStore()
  const { preferences } = storeToRefs(userStore)

  let mediaQuery: MediaQueryList | null = null

  function applyTheme(theme: 'light' | 'dark' | 'system') {
    const root = document.documentElement

    if (theme === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }

  function handleSystemThemeChange(e: MediaQueryListEvent) {
    if (preferences.value.theme === 'system') {
      document.documentElement.classList.toggle('dark', e.matches)
    }
  }

  function initTheme() {
    // Apply current theme
    applyTheme(preferences.value.theme)

    // Listen for system theme changes
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemThemeChange)
  }

  function cleanupTheme() {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }

  // Watch for theme preference changes
  watch(
    () => preferences.value.theme,
    (newTheme) => {
      applyTheme(newTheme)
    }
  )

  onMounted(() => {
    initTheme()
  })

  onUnmounted(() => {
    cleanupTheme()
  })

  return {
    applyTheme,
    initTheme,
    cleanupTheme,
  }
}
