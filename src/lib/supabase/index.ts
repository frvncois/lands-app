export { supabase, cachedFetch, invalidateCache, invalidateCacheKey } from './client'
export {
  connectionState,
  getConnectionState,
  isHealthy,
  isRecovering,
  registerVisibilityHandler,
  type ConnectionState,
} from './connection'
export type { Database, Tables, InsertTables, UpdateTables, Json } from './types'
