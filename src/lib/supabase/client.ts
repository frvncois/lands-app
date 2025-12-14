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

/**
 * Check if Supabase connection is healthy by making a simple query
 * Returns true if healthy, false if there's an issue
 */
export async function checkConnectionHealth(): Promise<boolean> {
  try {
    // Simple query to check connection
    const { error } = await supabase.from('profiles').select('id').limit(1).maybeSingle()

    if (error && (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('fetch'))) {
      console.warn('Supabase connection unhealthy:', error.message)
      isConnectionHealthy = false
      return false
    }

    lastHealthCheck = Date.now()
    isConnectionHealthy = true
    return true
  } catch (e) {
    console.error('Supabase health check failed:', e)
    isConnectionHealthy = false
    return false
  }
}

/**
 * Get current connection health status
 */
export function getConnectionStatus() {
  return {
    isHealthy: isConnectionHealthy,
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
      // If more than 1 minute since last check, re-check
      if (timeSinceCheck > 60000) {
        console.log('Tab became visible, checking connection health...')
        const healthy = await checkConnectionHealth()
        if (!healthy) {
          console.log('Connection unhealthy, attempting session refresh...')
          await refreshSession()
        }
      }
    }
  })

  // Also check on online event (browser coming back online)
  window.addEventListener('online', async () => {
    console.log('Browser came online, checking connection...')
    await checkConnectionHealth()
  })
}
