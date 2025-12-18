import { ref, readonly } from 'vue'
import { supabase } from './client'

// ============================================
// CONNECTION STATE MACHINE
// ============================================

export type ConnectionState = 'healthy' | 'recovering' | 'unhealthy'

const state = ref<ConnectionState>('healthy')
let recoveryPromise: Promise<boolean> | null = null
let lastRecoveryTime = 0

// Minimum time between recovery attempts (5 seconds)
const RECOVERY_COOLDOWN = 5000

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

// ============================================
// WARMUP & RECOVERY
// ============================================

/**
 * Lightweight database warmup query
 * Uses profiles table with minimal data transfer
 */
async function warmupDatabase(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .maybeSingle()

    return !error
  } catch {
    return false
  }
}

/**
 * Recover connection after idle/wake
 * - Refreshes auth session
 * - Warms up database connection
 * - Returns true if recovery successful
 */
export async function recoverConnection(): Promise<boolean> {
  // If already recovering, wait for existing recovery
  if (recoveryPromise) {
    return recoveryPromise
  }

  // Cooldown to prevent spam
  const now = Date.now()
  if (now - lastRecoveryTime < RECOVERY_COOLDOWN && state.value === 'healthy') {
    return true
  }

  state.value = 'recovering'
  lastRecoveryTime = now

  recoveryPromise = (async () => {
    try {
      // Step 1: Refresh auth session
      const { error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.warn('[Supabase] Session refresh failed:', sessionError.message)
      }

      // Step 2: Warm up database connection
      const dbHealthy = await warmupDatabase()

      if (dbHealthy) {
        state.value = 'healthy'
        console.info('[Supabase] Connection recovered')
        return true
      } else {
        state.value = 'unhealthy'
        console.warn('[Supabase] Database warmup failed')
        return false
      }
    } catch (err) {
      state.value = 'unhealthy'
      console.error('[Supabase] Recovery failed:', err)
      return false
    } finally {
      recoveryPromise = null
    }
  })()

  return recoveryPromise
}

/**
 * Force mark connection as unhealthy
 * Call this when a write fails unexpectedly
 */
export function markUnhealthy(): void {
  if (state.value === 'healthy') {
    state.value = 'unhealthy'
  }
}

/**
 * Ensure connection is healthy before proceeding
 * Automatically triggers recovery if needed
 * Returns true if ready for writes, false if recovery failed
 */
export async function ensureHealthy(): Promise<boolean> {
  if (state.value === 'healthy') {
    return true
  }

  return recoverConnection()
}

// ============================================
// VISIBILITY CHANGE HANDLER
// ============================================

let visibilityHandlerRegistered = false

/**
 * Register visibility change handler
 * Call this once during app initialization
 */
export function registerVisibilityHandler(): void {
  if (visibilityHandlerRegistered || typeof document === 'undefined') {
    return
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Tab became visible - recover connection
      recoverConnection()
    }
  })

  // Also recover on browser coming back online
  window.addEventListener('online', () => {
    console.info('[Supabase] Browser came online, recovering...')
    recoverConnection()
  })

  visibilityHandlerRegistered = true
}
