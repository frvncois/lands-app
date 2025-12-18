/**
 * Editor Save Queue
 *
 * Implements Google-Docs-style saving:
 * - Editor mutations are instant (local state)
 * - Saves are queued and processed serially
 * - Only diffs are sent to the database
 * - Queue survives offline/reload
 * - No autosave timers - watches state changes
 *
 * HARD RULES:
 * - One write at a time
 * - Diff only
 * - Queue survives reload
 * - Network optional
 */

import { ref, readonly, computed } from 'vue'
import { supabase, ensureHealthy, markUnhealthy } from '@/lib/supabase'
import { diffObjects, hasChanges, mergeDiffs } from './diff'
import { loadQueue, persistQueue, saveSnapshot, loadSnapshot } from './offlineStore'
import type { Json } from '@/lib/supabase/types'

// ============================================
// TYPES
// ============================================

export interface SaveJob {
  projectId: string
  diff: Record<string, unknown>
  timestamp: number
}

export interface EditorState {
  blocks: unknown[]
  pageSettings: Record<string, unknown>
  translations?: Record<string, unknown>
  components?: unknown[]
  [key: string]: unknown // Allow index signature for Record<string, unknown> compatibility
}

// ============================================
// STATE
// ============================================

// Queue of pending save jobs (hydrated from localStorage)
const queue = ref<SaveJob[]>(loadQueue())

// Processing state
const isProcessing = ref(false)

// Network state
const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

// Last error (for UI feedback)
const lastError = ref<string | null>(null)

// ============================================
// EXPORTS (reactive)
// ============================================

export const saveQueueState = readonly({
  queue,
  isProcessing,
  isOnline,
  lastError,
})

export const hasPendingSaves = computed(() => queue.value.length > 0)
export const pendingSaveCount = computed(() => queue.value.length)
export const isSyncing = computed(() => isProcessing.value && queue.value.length > 0)

// ============================================
// NETWORK DETECTION
// ============================================

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline.value = true
    console.info('[SaveQueue] Online - processing queue')
    processQueue()
  })

  window.addEventListener('offline', () => {
    isOnline.value = false
    console.info('[SaveQueue] Offline - queue paused')
  })
}

// ============================================
// QUEUE OPERATIONS
// ============================================

/**
 * Enqueue a save job
 * Computes diff between previous and next state
 * Merges with existing pending diff for same project
 */
export function enqueueSave(
  projectId: string,
  prevState: EditorState | null,
  nextState: EditorState
): void {
  // Compute diff
  const diff = diffObjects(prevState, nextState)

  // Skip if no changes
  if (!hasChanges(diff)) {
    return
  }

  // Check if there's already a pending job for this project
  const existingIndex = queue.value.findIndex(job => job.projectId === projectId)

  if (existingIndex !== -1) {
    // Merge diffs (new changes override old)
    const existingJob = queue.value[existingIndex]!
    existingJob.diff = mergeDiffs(existingJob.diff, diff)
    existingJob.timestamp = Date.now()
  } else {
    // Add new job
    queue.value.push({
      projectId,
      diff,
      timestamp: Date.now(),
    })
  }

  // Persist to localStorage
  persistQueue(queue.value)

  // Update snapshot
  saveSnapshot(projectId, nextState)

  // Process queue
  processQueue()
}

/**
 * Get the last saved snapshot for a project
 * Used to initialize diff computation
 */
export function getLastSnapshot(projectId: string): EditorState | null {
  return loadSnapshot(projectId) as EditorState | null
}

/**
 * Clear all pending saves for a project
 * Call this when discarding changes or on successful full reload
 */
export function clearProjectQueue(projectId: string): void {
  queue.value = queue.value.filter(job => job.projectId !== projectId)
  persistQueue(queue.value)
}

/**
 * Clear entire queue
 * Use with caution - will discard all pending saves
 */
export function clearAllQueue(): void {
  queue.value = []
  persistQueue(queue.value)
}

// ============================================
// QUEUE PROCESSING
// ============================================

/**
 * Process the save queue
 * - Single flight only (no concurrent processing)
 * - Pauses when offline
 * - Recovers connection if unhealthy
 * - Retries failed saves (pushed back to queue)
 */
async function processQueue(): Promise<void> {
  // Already processing - let current flight finish
  if (isProcessing.value) {
    return
  }

  // Nothing to process
  if (queue.value.length === 0) {
    return
  }

  // Offline - wait for online event
  if (!isOnline.value) {
    console.info('[SaveQueue] Offline - waiting for connection')
    return
  }

  isProcessing.value = true
  lastError.value = null

  try {
    // Ensure connection is healthy
    const healthy = await ensureHealthy()
    if (!healthy) {
      console.warn('[SaveQueue] Connection unhealthy - retrying later')
      isProcessing.value = false
      // Retry in 5 seconds
      setTimeout(processQueue, 5000)
      return
    }

    // Get the first job (FIFO)
    const job = queue.value[0]
    if (!job) {
      isProcessing.value = false
      return
    }

    // Perform the save
    const { error } = await supabase
      .from('project_content')
      .update({
        blocks: job.diff.blocks as Json | undefined,
        page_settings: job.diff.pageSettings as Json | undefined,
      })
      .eq('project_id', job.projectId)

    if (error) {
      console.error('[SaveQueue] Save failed:', error)
      lastError.value = error.message
      markUnhealthy()

      // Don't remove from queue - will retry
      isProcessing.value = false

      // Retry in 5 seconds
      setTimeout(processQueue, 5000)
      return
    }

    // Success! Remove from queue
    queue.value.shift()
    persistQueue(queue.value)

    console.info('[SaveQueue] Saved successfully, remaining:', queue.value.length)

  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[SaveQueue] Unexpected error:', errorMsg)
    lastError.value = errorMsg
    markUnhealthy()

    // Retry in 5 seconds
    setTimeout(processQueue, 5000)
  } finally {
    isProcessing.value = false
  }

  // Process next job if any
  if (queue.value.length > 0) {
    // Small delay between saves to avoid hammering DB
    setTimeout(processQueue, 100)
  }
}

/**
 * Force process queue (e.g., on beforeunload)
 * Returns true if all saves completed
 */
export async function flushQueue(): Promise<boolean> {
  if (queue.value.length === 0) {
    return true
  }

  // Wait for current processing to finish
  while (isProcessing.value) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Process remaining
  await processQueue()

  // Wait for completion
  while (isProcessing.value) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return queue.value.length === 0
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize save queue
 * Call this on app boot to process any pending saves from previous session
 */
export function initSaveQueue(): void {
  console.info('[SaveQueue] Initialized with', queue.value.length, 'pending saves')

  // Process any pending saves
  if (queue.value.length > 0 && isOnline.value) {
    processQueue()
  }
}
