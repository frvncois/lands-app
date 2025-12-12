import { shallowRef, computed, type Ref } from 'vue'
import type { SectionBlock, PageSettings } from '@/types/editor'
import { deepClone } from './helpers'

// History configuration
const MAX_HISTORY_SIZE = 100

// History snapshot type
export interface HistorySnapshot {
  blocks: SectionBlock[]
  pageSettings: PageSettings
  selectedBlockId: string | null
  selectedItemId: string | null
}

export interface UseHistoryOptions {
  blocks: Ref<SectionBlock[]>
  pageSettings: Ref<PageSettings>
  selectedBlockId: Ref<string | null>
  selectedItemId: Ref<string | null>
  onRestore?: (snapshot: HistorySnapshot) => void
}

export function useHistory(options: UseHistoryOptions) {
  const { blocks, pageSettings, selectedBlockId, selectedItemId, onRestore } = options

  // Undo/redo stacks
  const undoStack = shallowRef<HistorySnapshot[]>([])
  const redoStack = shallowRef<HistorySnapshot[]>([])

  // Check if undo/redo is available
  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  // Create a snapshot of current state
  function createSnapshot(): HistorySnapshot {
    return {
      blocks: deepClone(blocks.value),
      pageSettings: deepClone(pageSettings.value),
      selectedBlockId: selectedBlockId.value,
      selectedItemId: selectedItemId.value,
    }
  }

  // Push current state to undo stack before making changes
  function pushToHistory() {
    const snapshot = createSnapshot()
    const newStack = [...undoStack.value, snapshot]

    // Keep only the last MAX_HISTORY_SIZE items
    if (newStack.length > MAX_HISTORY_SIZE) {
      newStack.shift()
    }

    undoStack.value = newStack
    // Clear redo stack when new action is performed
    redoStack.value = []
  }

  // Apply a snapshot to current state
  function applySnapshot(snapshot: HistorySnapshot) {
    blocks.value = snapshot.blocks
    pageSettings.value = snapshot.pageSettings
    selectedBlockId.value = snapshot.selectedBlockId
    selectedItemId.value = snapshot.selectedItemId
    onRestore?.(snapshot)
  }

  // Undo last action
  function undo() {
    if (!canUndo.value) return

    // Save current state to redo stack
    const currentSnapshot = createSnapshot()
    redoStack.value = [...redoStack.value, currentSnapshot]

    // Pop and apply the last undo state
    const newUndoStack = [...undoStack.value]
    const snapshot = newUndoStack.pop()!
    undoStack.value = newUndoStack

    // Apply snapshot
    applySnapshot(snapshot)
  }

  // Redo last undone action
  function redo() {
    if (!canRedo.value) return

    // Save current state to undo stack
    const currentSnapshot = createSnapshot()
    undoStack.value = [...undoStack.value, currentSnapshot]

    // Pop and apply the last redo state
    const newRedoStack = [...redoStack.value]
    const snapshot = newRedoStack.pop()!
    redoStack.value = newRedoStack

    // Apply snapshot
    applySnapshot(snapshot)
  }

  // Clear history (when loading a new project)
  function clearHistory() {
    undoStack.value = []
    redoStack.value = []
  }

  return {
    undoStack,
    redoStack,
    canUndo,
    canRedo,
    pushToHistory,
    undo,
    redo,
    clearHistory,
  }
}
