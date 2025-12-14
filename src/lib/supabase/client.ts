import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Using new Supabase publishable key format (sb_publishable_...)
// See: https://github.com/orgs/supabase/discussions/29260
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-client-info': 'lands-app',
    },
  },
})

// Connection health check utility
let lastHealthCheck = Date.now()
let isConnectionHealthy = true
let isRecovering = false

// Listeners for connection state changes
type ConnectionListener = (isHealthy: boolean) => void
const connectionListeners = new Set<ConnectionListener>()

export function onConnectionChange(listener: ConnectionListener) {
  connectionListeners.add(listener)
  return () => connectionListeners.delete(listener)
}

function notifyConnectionChange(isHealthy: boolean) {
  connectionListeners.forEach(listener => listener(isHealthy))
}

/**
 * Check if Supabase connection is healthy by making a simple query
 * Returns true if healthy, false if there's an issue
 */
export async function checkConnectionHealth(): Promise<boolean> {
  try {
    // Create timeout promise
    const timeoutPromise = new Promise<{ error: { message: string; code: string } }>((_, reject) => {
      setTimeout(() => reject(new Error('Health check timed out')), 10000)
    })

    // Simple query to check connection
    const queryPromise = supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .maybeSingle()

    // Race between query and timeout
    const { error } = await Promise.race([queryPromise, timeoutPromise])

    if (error && (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('fetch'))) {
      console.warn('Supabase connection unhealthy:', error.message)
      if (isConnectionHealthy) {
        isConnectionHealthy = false
        notifyConnectionChange(false)
      }
      return false
    }

    lastHealthCheck = Date.now()
    if (!isConnectionHealthy) {
      isConnectionHealthy = true
      notifyConnectionChange(true)
    }
    return true
  } catch (e) {
    console.error('Supabase health check failed:', e)
    if (isConnectionHealthy) {
      isConnectionHealthy = false
      notifyConnectionChange(false)
    }
    return false
  }
}

/**
 * Get current connection health status
 */
export function getConnectionStatus() {
  return {
    isHealthy: isConnectionHealthy,
    isRecovering,
    lastCheck: lastHealthCheck,
    timeSinceCheck: Date.now() - lastHealthCheck,
  }
}

/**
 * Force refresh the auth session
 * Call this when operations start failing
 */
export async function refreshSession(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      console.error('Failed to refresh session:', error)
      return false
    }
    console.log('Session refreshed successfully')
    return !!data.session
  } catch (e) {
    console.error('Session refresh error:', e)
    return false
  }
}

/**
 * Full connection recovery - refresh session and verify connection
 * Returns true if recovery successful
 */
export async function recoverConnection(): Promise<boolean> {
  if (isRecovering) {
    console.log('Recovery already in progress...')
    return false
  }

  isRecovering = true
  console.log('Starting connection recovery...')

  try {
    // Step 1: Try to refresh the session
    const refreshed = await refreshSession()
    if (!refreshed) {
      console.warn('Session refresh failed during recovery')
    }

    // Step 2: Reconnect realtime channels
    try {
      await supabase.realtime.disconnect()
      await new Promise(resolve => setTimeout(resolve, 500))
      await supabase.realtime.connect()
      console.log('Realtime reconnected')
    } catch (e) {
      console.warn('Realtime reconnection error:', e)
    }

    // Step 3: Verify connection is healthy
    const healthy = await checkConnectionHealth()

    if (healthy) {
      console.log('Connection recovery successful')
      return true
    } else {
      console.warn('Connection still unhealthy after recovery attempt')
      return false
    }
  } finally {
    isRecovering = false
  }
}

// Periodic health check (every 2 minutes when tab is visible)
let healthCheckInterval: ReturnType<typeof setInterval> | null = null

function startHealthCheckInterval() {
  if (healthCheckInterval) return

  healthCheckInterval = setInterval(async () => {
    if (document.visibilityState === 'visible') {
      await checkConnectionHealth()
    }
  }, 120000) // 2 minutes
}

function stopHealthCheckInterval() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval)
    healthCheckInterval = null
  }
}

// Start health checks when module loads
if (typeof window !== 'undefined') {
  startHealthCheckInterval()

  // Re-check connection when tab becomes visible after being hidden
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      const timeSinceCheck = Date.now() - lastHealthCheck
      // If more than 30 seconds since last check, do full recovery
      if (timeSinceCheck > 30000) {
        console.log('Tab became visible after being idle, recovering connection...')
        await recoverConnection()
      }
    }
  })

  // Also check on online event (browser coming back online)
  window.addEventListener('online', async () => {
    console.log('Browser came online, recovering connection...')
    // Wait a moment for network to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000))
    await recoverConnection()
  })
}
