import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type {
  SectionBlock,
  BaseBlockStyles,
  CoreBlockStyles,
} from '@/types/editor'
import {
  getResponsiveStyles,
  setViewportStyleOverrides,
} from '@/lib/style-utils'
import { PREBUILT_LIST_NAMES } from '@/stores/editor/helpers'

/**
 * Composable providing common functionality for block inspectors.
 * Handles block selection, settings/styles updates, and responsive styles.
 */
export function useBlockInspector() {
  const editorStore = useEditorStore()

  // Selected block
  const selectedBlock = computed(() => editorStore.selectedBlock)
  const selectedBlockId = computed(() => editorStore.selectedBlockId)
  const currentViewport = computed(() => editorStore.viewport)
  const pageSettings = computed(() => editorStore.pageSettings)

  // Get responsive styles for the current viewport (merged/cascaded)
  const responsiveStyles = computed((): CoreBlockStyles => {
    if (!selectedBlock.value) return {}
    return getResponsiveStyles(selectedBlock.value.styles as BaseBlockStyles, currentViewport.value)
  })

  // Get effective styles for the block (base styles)
  const effectiveBlockStyles = computed(() => {
    if (!selectedBlock.value) return {}
    return selectedBlock.value.styles as Record<string, unknown>
  })

  // Check if selected block is inside a List/Collection
  const isInListCollection = computed(() => {
    if (!selectedBlock.value) return false
    return editorStore.isInsideListCollection(selectedBlock.value.id)
  })

  // Check if selected block is inside a flex container
  const isInFlexContainer = computed(() => {
    if (!selectedBlock.value) return false
    const parent = editorStore.findParentBlock(selectedBlock.value.id)
    return parent?.type === 'stack' || parent?.type === 'container'
  })

  // Check if selected block IS a PREBUILT List/Collection item
  const isListCollectionItem = computed(() => {
    if (!selectedBlock.value) return false
    if (selectedBlock.value.type !== 'stack') return false
    const parent = editorStore.findParentBlock(selectedBlock.value.id)
    if (!parent || parent.type !== 'grid') return false
    return PREBUILT_LIST_NAMES.includes(parent.name)
  })

  // Check if selected block is a direct child of a Grid
  const isChildOfGrid = computed(() => {
    if (!selectedBlock.value) return false
    return editorStore.isDirectChildOfGrid(selectedBlock.value.id)
  })

  // Get the parent grid's column count
  const parentGridColumns = computed(() => {
    if (!selectedBlock.value) return null
    return editorStore.getParentGridColumns(selectedBlock.value.id)
  })

  // Get overwriteStyle setting from selected block
  const hasOverwriteStyle = computed(() => {
    if (!selectedBlock.value) return false
    const settings = selectedBlock.value.settings as Record<string, unknown>
    return !!settings.overwriteStyle
  })

  // Update block settings
  function updateBlockSettings(settings: Record<string, unknown>) {
    if (!selectedBlock.value) return
    editorStore.updateBlockSettings(selectedBlock.value.id, settings)
  }

  // Update block styles (handles viewport-aware updates)
  function updateBlockStyles(styles: Record<string, unknown>) {
    if (!selectedBlock.value) return

    // For core styles, apply viewport-aware update
    const coreStyleKeys = ['padding', 'margin', 'backgroundColor', 'backgroundImage', 'backgroundPosition', 'backgroundSize', 'border', 'shadow']
    const hasCoreStyles = Object.keys(styles).some(key => coreStyleKeys.includes(key))

    if (hasCoreStyles && currentViewport.value !== 'desktop') {
      const currentStyles = (selectedBlock.value.styles || {}) as BaseBlockStyles
      const updatedStyles = setViewportStyleOverrides(currentStyles, currentViewport.value, styles as Partial<CoreBlockStyles>)
      editorStore.updateBlockStyles(selectedBlock.value.id, updatedStyles as Record<string, unknown>, true)
    } else {
      editorStore.updateBlockStyles(selectedBlock.value.id, styles)
    }
  }

  // Toggle overwriteStyle
  function toggleOverwriteStyle(value: boolean) {
    if (!selectedBlock.value) return
    const block = editorStore.findBlockById(selectedBlock.value.id)
    if (block) {
      (block.settings as Record<string, unknown>).overwriteStyle = value
      editorStore.rebuildBlockIndex()
    }
  }

  return {
    // State
    selectedBlock,
    selectedBlockId,
    currentViewport,
    pageSettings,
    // Computed styles
    responsiveStyles,
    effectiveBlockStyles,
    // Computed checks
    isInListCollection,
    isInFlexContainer,
    isListCollectionItem,
    isChildOfGrid,
    parentGridColumns,
    hasOverwriteStyle,
    // Actions
    updateBlockSettings,
    updateBlockStyles,
    toggleOverwriteStyle,
    // Re-export store for direct access
    editorStore,
  }
}
