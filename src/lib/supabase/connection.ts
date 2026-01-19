import { ref, readonly } from 'vue'

// ============================================
// CONNECTION STATE & TAB LIFECYCLE HANDLERS
// ============================================

const DEBUG_AUTH = import.meta.env.DEV && import.meta.env.VITE_DEBUG_AUTH === 'true'

export type ConnectionState = 'healthy' | 'recovering' | 'unhealthy'

const state = ref<ConnectionState>('healthy')

/**
 * Get current connection state (reactive)
 */
export const connectionState = readonly(state)

/**
 * Get current connection state (non-reactive)
 */
export function getConnectionState(): ConnectionState {
  return state.value
}

/**
 * Check if connection is healthy
 */
export function isHealthy(): boolean {
  return state.value === 'healthy'
}

/**
 * Check if recovery is in progress
 */
export function isRecovering(): boolean {
  return state.value === 'recovering'
}

/**
 * Register visibility change handler
 * Handles tab switching, bfcache restoration, and window focus
 * FIRE-AND-FORGET: All handlers are non-blocking
 */
export function registerVisibilityHandler(): void {
  let authStore: any = null

  // Lazy-load auth store to avoid circular dependency
  const getAuthStore = () => {
    if (!authStore) {
      // Dynamic import to break circular dependency
      import('@/stores/user').then(module => {
        authStore = module.useUserStore()
      })
    }
    return authStore
  }

  // Handle tab visibility changes
  // CRITICAL: No await - fire-and-forget only
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      const store = getAuthStore()
      if (!store) return

      state.value = 'recovering'

      // FIRE-AND-FORGET: Start hydration without blocking
      store.ensureHydrationStarted()

      // Connection state will resolve when auth resolves
      // Use a short delay to update UI optimistically
      setTimeout(() => {
        state.value = 'healthy'
      }, 100)
    }
  })

  // Handle window focus (redundant with visibility but catches some edge cases)
  // CRITICAL: No await - fire-and-forget only
  window.addEventListener('focus', () => {
    const store = getAuthStore()
    if (!store) return

    state.value = 'recovering'

    // FIRE-AND-FORGET: Start hydration without blocking
    store.ensureHydrationStarted()

    setTimeout(() => {
      state.value = 'healthy'
    }, 100)
  })

  // Handle page restoration from bfcache (critical for tab switching bug)
  // CRITICAL: No await - fire-and-forget only
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      const store = getAuthStore()
      if (!store) return

      state.value = 'recovering'

      // FIRE-AND-FORGET: Start hydration without blocking
      store.ensureHydrationStarted()

      setTimeout(() => {
        state.value = 'healthy'
      }, 100)
    }
  })

  // Handle page hide (log for debugging)
  window.addEventListener('pagehide', () => {
    // No logging needed
  })
}
