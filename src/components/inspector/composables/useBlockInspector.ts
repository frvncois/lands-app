import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type {
  BaseBlockStyles,
  CoreBlockStyles,
} from '@/types/editor'
import {
  getResponsiveStyles,
  setViewportStyleOverrides,
} from '@/lib/style-utils'

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

  // Check if selected block is inside a flex container
  const isInFlexContainer = computed(() => {
    if (!selectedBlock.value) return false
    const parent = editorStore.findParentBlock(selectedBlock.value.id)
    return parent?.type === 'stack' || parent?.type === 'container'
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

  // Update block settings
  function updateBlockSettings(settings: Record<string, unknown>) {
    if (!selectedBlock.value) return
    editorStore.updateBlockSettings(selectedBlock.value.id, settings)
  }

  // Update block styles (handles viewport-aware updates)
  function updateBlockStyles(styles: Record<string, unknown>) {
    if (!selectedBlock.value) return

    // For core styles, apply viewport-aware update
    const coreStyleKeys = ['padding', 'margin', 'backgroundColor', 'backgroundImage', 'backgroundPosition', 'backgroundSize', 'border', 'shadow', 'width', 'height']
    const hasCoreStyles = Object.keys(styles).some(key => coreStyleKeys.includes(key))

    if (hasCoreStyles && currentViewport.value !== 'desktop') {
      const currentStyles = (selectedBlock.value.styles || {}) as BaseBlockStyles
      const updatedStyles = setViewportStyleOverrides(currentStyles, currentViewport.value, styles as Partial<CoreBlockStyles>)
      editorStore.updateBlockStyles(selectedBlock.value.id, updatedStyles as Record<string, unknown>, true)
    } else {
      editorStore.updateBlockStyles(selectedBlock.value.id, styles)
    }
  }

  // Update block styles continuously (for sliders, color pickers during drag)
  // Creates only one undo entry per interaction session
  function updateBlockStylesContinuous(styles: Record<string, unknown>) {
    if (!selectedBlock.value) return

    const coreStyleKeys = ['padding', 'margin', 'backgroundColor', 'backgroundImage', 'backgroundPosition', 'backgroundSize', 'border', 'shadow', 'width', 'height', 'opacity', 'blur']
    const hasCoreStyles = Object.keys(styles).some(key => coreStyleKeys.includes(key))

    if (hasCoreStyles && currentViewport.value !== 'desktop') {
      const currentStyles = (selectedBlock.value.styles || {}) as BaseBlockStyles
      const updatedStyles = setViewportStyleOverrides(currentStyles, currentViewport.value, styles as Partial<CoreBlockStyles>)
      editorStore.updateBlockStylesContinuous(selectedBlock.value.id, updatedStyles as Record<string, unknown>, true)
    } else {
      editorStore.updateBlockStylesContinuous(selectedBlock.value.id, styles)
    }
  }

  // Update block settings continuously (for sliders, pickers during drag)
  function updateBlockSettingsContinuous(settings: Record<string, unknown>) {
    if (!selectedBlock.value) return
    editorStore.updateBlockSettingsContinuous(selectedBlock.value.id, settings)
  }

  // Finalize continuous update (call on mouseup/blur after slider drag)
  // This syncs shared styles and ensures final state is saved properly
  function finalizeContinuousUpdate() {
    if (!selectedBlock.value) return
    editorStore.finalizeContinuousUpdate(selectedBlock.value.id)
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
    isInFlexContainer,
    isChildOfGrid,
    parentGridColumns,
    // Actions
    updateBlockSettings,
    updateBlockStyles,
    // Continuous update actions (for sliders, color pickers)
    updateBlockStylesContinuous,
    updateBlockSettingsContinuous,
    finalizeContinuousUpdate,
    // Re-export store for direct access
    editorStore,
  }
}
