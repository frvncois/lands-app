import { ref, readonly } from 'vue'
import { supabase } from './client'

// ============================================
// CONNECTION STATE MACHINE
// ============================================

export type ConnectionState = 'healthy' | 'recovering' | 'unhealthy'

const state = ref<ConnectionState>('healthy')
let recoveryPromise: Promise<boolean> | null = null
let lastRecoveryAttempt = 0
let consecutiveFailures = 0

// Configuration
const RECOVERY_COOLDOWN = 10000      // 10 seconds between recovery attempts
const RECOVERY_TIMEOUT = 8000        // 8 second timeout for recovery
const MAX_CONSECUTIVE_FAILURES = 3   // After this, stop auto-recovering
const IDLE_THRESHOLD = 5 * 60 * 1000 // 5 minutes - only recover if tab was hidden this long

// Track when tab was hidden
let tabHiddenAt: number | null = null

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
 * Lightweight connection test
 * Uses a simple auth check instead of database query
 */
async function testConnection(): Promise<boolean> {
  try {
    // Just check if we can get the session - doesn't hit the database
    const { data, error } = await supabase.auth.getSession()

    // Session exists and no error = connection works
    if (error) {
      console.warn('[Connection] Session check failed:', error.message)
      return false
    }

    // If we have a session, we're good
    // If no session, user might be logged out - that's still "connected"
    return true
  } catch (e) {
    console.warn('[Connection] Connection test failed:', e)
    return false
  }
}

/**
 * Recover connection after idle/wake
 * With timeout, cooldown, and failure limiting
 */
export async function recoverConnection(): Promise<boolean> {
  const now = Date.now()

  // If already recovering, wait for existing recovery
  if (recoveryPromise) {
    return recoveryPromise
  }

  // Cooldown - don't spam recovery attempts
  if (now - lastRecoveryAttempt < RECOVERY_COOLDOWN) {
    // If we're healthy, just return true
    if (state.value === 'healthy') {
      return true
    }
    // If unhealthy/recovering but in cooldown, skip and return false
    console.info('[Connection] Recovery in cooldown, skipping')
    return false
  }

  // Stop auto-recovering after too many failures
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    console.warn('[Connection] Too many failures, manual refresh required')
    state.value = 'unhealthy'
    return false
  }

  // Start recovery
  state.value = 'recovering'
  lastRecoveryAttempt = now

  recoveryPromise = (async () => {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Recovery timeout')), RECOVERY_TIMEOUT)
      })

      // Race between recovery and timeout
      const success = await Promise.race([
        testConnection(),
        timeoutPromise,
      ])

      if (success) {
        state.value = 'healthy'
        consecutiveFailures = 0
        console.info('[Connection] Connection verified')
        return true
      } else {
        consecutiveFailures++
        state.value = consecutiveFailures >= MAX_CONSECUTIVE_FAILURES ? 'unhealthy' : 'healthy'
        console.warn('[Connection] Connection test failed, failures:', consecutiveFailures)
        return false
      }
    } catch (err) {
      consecutiveFailures++
      // Don't mark as unhealthy on first few failures - might be transient
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        state.value = 'unhealthy'
      } else {
        // Assume healthy to avoid blocking the user
        state.value = 'healthy'
      }
      console.warn('[Connection] Recovery error:', err, 'failures:', consecutiveFailures)
      return consecutiveFailures < MAX_CONSECUTIVE_FAILURES
    } finally {
      recoveryPromise = null
    }
  })()

  return recoveryPromise
}

/**
 * Mark connection as unhealthy
 * Call this when a write fails unexpectedly
 */
export function markUnhealthy(): void {
  consecutiveFailures++
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    state.value = 'unhealthy'
  }
}

/**
 * Reset connection state (call after successful operation)
 */
export function markHealthy(): void {
  state.value = 'healthy'
  consecutiveFailures = 0
}

/**
 * Ensure connection is healthy before proceeding
 * Only triggers recovery if actually unhealthy
 */
export async function ensureHealthy(): Promise<boolean> {
  // If healthy, just return true - don't trigger unnecessary recovery
  if (state.value === 'healthy') {
    return true
  }

  // If unhealthy or recovering, try to recover
  return recoverConnection()
}

// ============================================
// VISIBILITY CHANGE HANDLER
// ============================================

let visibilityHandlerRegistered = false

/**
 * Register visibility change handler
 * Only triggers recovery if tab was hidden for a while (idle)
 */
export function registerVisibilityHandler(): void {
  if (visibilityHandlerRegistered || typeof document === 'undefined') {
    return
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // Tab is being hidden - record the time
      tabHiddenAt = Date.now()
    } else if (document.visibilityState === 'visible') {
      // Tab became visible
      const wasHiddenFor = tabHiddenAt ? Date.now() - tabHiddenAt : 0
      tabHiddenAt = null

      // Only recover if tab was hidden for a significant time (5+ minutes)
      // This avoids recovery on quick tab switches
      if (wasHiddenFor > IDLE_THRESHOLD) {
        console.info('[Connection] Tab was idle for', Math.round(wasHiddenFor / 1000), 'seconds, checking connection')
        recoverConnection()
      } else if (state.value === 'unhealthy') {
        // If already unhealthy, try to recover on any visibility change
        recoverConnection()
      }
      // Otherwise, don't do anything - connection is probably fine
    }
  })

  // Recover on browser coming back online
  window.addEventListener('online', () => {
    console.info('[Connection] Browser came online')
    consecutiveFailures = 0 // Reset failures when coming online
    state.value = 'healthy' // Optimistically mark healthy
  })

  window.addEventListener('offline', () => {
    console.info('[Connection] Browser went offline')
    // Don't mark as unhealthy - just note it
    // The save queue handles offline separately
  })

  visibilityHandlerRegistered = true
}
