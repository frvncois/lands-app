import { ref, onUnmounted } from 'vue'
import type { CanvasSettings, CanvasChildPosition } from '@/types/designer'
import { useDesignerStore } from '@/stores/designer'

/**
 * Composable for canvas child drag positioning
 * Allows dragging children within a canvas block to position them
 */
export function useCanvasDrag() {
  const designerStore = useDesignerStore()

  // Drag state
  const isDragging = ref(false)
  const dragStartX = ref(0)
  const dragStartY = ref(0)
  const startPosX = ref(0)
  const startPosY = ref(0)
  const currentBlockId = ref<string | null>(null)
  const currentParentId = ref<string | null>(null)

  /**
   * Get child position for current viewport (cascading: mobile -> tablet -> desktop)
   */
  function getResponsiveChildPosition(settings: CanvasSettings, childId: string): CanvasChildPosition {
    const positions = settings.childPositions
    const viewport = designerStore.viewport
    const defaultPos: CanvasChildPosition = { x: 10, y: 10 }

    // Cascade: check current viewport, then fall back to larger viewports
    if (viewport === 'mobile') {
      return positions.mobile?.[childId] || positions.tablet?.[childId] || positions.desktop?.[childId] || defaultPos
    } else if (viewport === 'tablet') {
      return positions.tablet?.[childId] || positions.desktop?.[childId] || defaultPos
    }
    // Desktop
    return positions.desktop?.[childId] || defaultPos
  }

  /**
   * Start dragging a canvas child
   */
  function startDrag(event: MouseEvent, blockId: string, parentId: string) {
    event.preventDefault()
    event.stopPropagation()

    isDragging.value = true
    currentBlockId.value = blockId
    currentParentId.value = parentId
    dragStartX.value = event.clientX
    dragStartY.value = event.clientY

    // Get current position from parent's settings (viewport-aware)
    const parent = designerStore.findParentBlock(blockId)
    if (parent && parent.type === 'canvas') {
      const parentSettings = parent.settings as CanvasSettings
      const currentPos = getResponsiveChildPosition(parentSettings, blockId)
      startPosX.value = currentPos.x
      startPosY.value = currentPos.y
    }

    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', endDrag)
  }

  /**
   * Handle drag movement
   */
  function onDrag(event: MouseEvent) {
    if (!isDragging.value || !currentBlockId.value || !currentParentId.value) return

    const parent = designerStore.findParentBlock(currentBlockId.value)
    if (!parent || parent.type !== 'canvas') return

    // Find the canvas container element to get its dimensions
    const canvasEl = document.querySelector(`[data-block-id="${parent.id}"]`) as HTMLElement
    if (!canvasEl) return

    const rect = canvasEl.getBoundingClientRect()
    const deltaX = event.clientX - dragStartX.value
    const deltaY = event.clientY - dragStartY.value

    // Convert pixel delta to percentage of container
    const deltaXPercent = (deltaX / rect.width) * 100
    const deltaYPercent = (deltaY / rect.height) * 100

    // Calculate new position
    const newX = Math.max(0, Math.min(95, startPosX.value + deltaXPercent))
    const newY = Math.max(0, Math.min(95, startPosY.value + deltaYPercent))

    // Update the parent's childPositions for current viewport
    const parentSettings = parent.settings as CanvasSettings
    const viewport = designerStore.viewport
    const currentPositions = parentSettings.childPositions || { desktop: {} }
    const viewportPositions = currentPositions[viewport] || {}
    const currentPos = viewportPositions[currentBlockId.value] || getResponsiveChildPosition(parentSettings, currentBlockId.value)

    designerStore.updateBlockSettings(parent.id, {
      childPositions: {
        ...currentPositions,
        [viewport]: {
          ...viewportPositions,
          [currentBlockId.value]: {
            ...currentPos,
            x: Math.round(newX * 10) / 10,
            y: Math.round(newY * 10) / 10,
          }
        }
      }
    })
  }

  /**
   * End drag operation
   */
  function endDrag() {
    isDragging.value = false
    currentBlockId.value = null
    currentParentId.value = null
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', endDrag)
  }

  // Cleanup on unmount
  onUnmounted(() => {
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', endDrag)
  })

  return {
    // State
    isDragging,

    // Methods
    startDrag,
    getResponsiveChildPosition,
  }
}
