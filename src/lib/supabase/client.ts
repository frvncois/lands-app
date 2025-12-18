import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Single client instance for the entire app (connection pooling best practice)
// Using new Supabase publishable key format (sb_publishable_...)
// See: https://github.com/orgs/supabase/discussions/29260
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
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
  db: {
    schema: 'public',
  },
})

// ============================================
// SIMPLE IN-MEMORY CACHE
// ============================================
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry<unknown>>()

/**
 * Get cached data or fetch fresh
 * @param key Cache key
 * @param fetcher Function that returns a promise with the data
 * @param ttl Time to live in ms (default 30 seconds)
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 30000
): Promise<T> {
  const now = Date.now()
  const cached = cache.get(key) as CacheEntry<T> | undefined

  if (cached && now - cached.timestamp < cached.ttl) {
    return cached.data
  }

  const data = await fetcher()
  cache.set(key, { data, timestamp: now, ttl })
  return data
}

/**
 * Invalidate cache entries by prefix
 */
export function invalidateCache(prefix?: string) {
  if (!prefix) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
    }
  }
}

/**
 * Invalidate a specific cache key
 */
export function invalidateCacheKey(key: string) {
  cache.delete(key)
}

