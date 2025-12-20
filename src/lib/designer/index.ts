// Diff engine
export { diffObjects, hasChanges, mergeDiffs } from './diff'

// Save queue
export {
  enqueueSave,
  getLastSnapshot,
  clearProjectQueue,
  clearAllQueue,
  flushQueue,
  initSaveQueue,
  saveQueueState,
  hasPendingSaves,
  pendingSaveCount,
  isSyncing,
  type SaveJob,
  type DesignerState,
} from './saveQueue'

// Offline store
export {
  loadQueue,
  persistQueue,
  saveSnapshot,
  loadSnapshot,
  clearSnapshot,
  hasPendingSaves as hasOfflineSaves,
} from './offlineStore'
