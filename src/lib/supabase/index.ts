export { supabase, cachedFetch, invalidateCache, invalidateCacheKey } from './client'
export {
  connectionState,
  getConnectionState,
  isHealthy,
  isRecovering,
  recoverConnection,
  ensureHealthy,
  markUnhealthy,
  registerVisibilityHandler,
  type ConnectionState,
} from './connection'
export type { Database, Tables, InsertTables, UpdateTables, Json } from './types'
