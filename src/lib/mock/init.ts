import { useUserStore } from '@/stores/user'
import { useLandStore } from '@/stores/land'
import { useThemeStore } from '@/stores/theme'
import { mockState } from './provider'

/**
 * Initialize all stores with mock data.
 * Call this in App.vue's onMounted.
 */
export function initMockData() {
  const userStore = useUserStore()
  const landStore = useLandStore()
  const themeStore = useThemeStore()

  userStore.setUser(mockState.user)
  landStore.setLands(mockState.lands)

  if (landStore.activeLand?.theme) {
    themeStore.setTheme(landStore.activeLand.theme)
  }
}
