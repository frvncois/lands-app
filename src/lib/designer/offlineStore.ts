/**
 * Offline persistence for editor save queue
 *
 * Stores pending saves in localStorage so they survive:
 * - Page refreshes
 * - Browser crashes
 * - Tab closes
 *
 * Queue is hydrated on boot and processed when online.
 */

import type { SaveJob } from './saveQueue'

const QUEUE_KEY = 'lands-editor-save-queue'
const SNAPSHOT_KEY_PREFIX = 'lands-editor-snapshot-'

/**
 * Load pending save jobs from localStorage
 */
export function loadQueue(): SaveJob[] {
  if (typeof localStorage === 'undefined') return []

  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
  } catch (e) {
    console.warn('[OfflineStore] Failed to load queue:', e)
    return []
  }
}

/**
 * Persist save queue to localStorage
 */
export function persistQueue(queue: SaveJob[]): void {
  if (typeof localStorage === 'undefined') return

  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch (e) {
    console.warn('[OfflineStore] Failed to persist queue:', e)
  }
}

/**
 * Clear the persisted queue
 */
export function clearQueue(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(QUEUE_KEY)
}

/**
 * Save a snapshot of editor state for a project
 * Used to compute diffs on subsequent saves
 */
export function saveSnapshot(projectId: string, state: Record<string, unknown>): void {
  if (typeof localStorage === 'undefined') return

  try {
    localStorage.setItem(
      `${SNAPSHOT_KEY_PREFIX}${projectId}`,
      JSON.stringify(state)
    )
  } catch (e) {
    console.warn('[OfflineStore] Failed to save snapshot:', e)
  }
}

/**
 * Load the last persisted snapshot for a project
 */
export function loadSnapshot(projectId: string): Record<string, unknown> | null {
  if (typeof localStorage === 'undefined') return null

  try {
    const raw = localStorage.getItem(`${SNAPSHOT_KEY_PREFIX}${projectId}`)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.warn('[OfflineStore] Failed to load snapshot:', e)
    return null
  }
}

/**
 * Clear snapshot for a project
 */
export function clearSnapshot(projectId: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(`${SNAPSHOT_KEY_PREFIX}${projectId}`)
}

/**
 * Check if there are any pending offline saves
 */
export function hasPendingSaves(): boolean {
  const queue = loadQueue()
  return queue.length > 0
}
