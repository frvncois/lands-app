import { ref, computed, onUnmounted, type Ref } from 'vue'
import type { SectionBlock, GridSettings } from '@/types/designer'
import { useDesignerStore } from '@/stores/designer'

/**
 * Composable for grid column resizing
 * Allows dragging handles between columns to adjust their widths
 */
export function useGridResize(block: Ref<SectionBlock>) {
  const designerStore = useDesignerStore()

  // Resize state
  const isResizing = ref(false)
  const resizeColumnIndex = ref<number | null>(null)
  const resizeStartX = ref(0)
  const resizeStartWidths = ref<number[]>([])

  // Get grid settings (only valid for grid blocks)
  const gridSettings = computed(() =>
    block.value.type === 'grid' ? block.value.settings as GridSettings : null
  )

  // Compute grid template columns with custom widths support
  const gridTemplateColumns = computed(() => {
    if (!gridSettings.value) return 'repeat(2, minmax(0, 1fr))'
    const columns = gridSettings.value.columns || 2
    const customWidths = gridSettings.value.columnWidths

    if (customWidths && customWidths.length === columns) {
      return customWidths.map(w => `${w}fr`).join(' ')
    }
    return `repeat(${columns}, minmax(0, 1fr))`
  })

  /**
   * Get grid item styles for a child block (column/row span)
   */
  function getGridItemStyles(child: SectionBlock): Record<string, string> {
    const settings = child.settings as Record<string, unknown>
    const styles: Record<string, string> = {}

    // Column span
    const colSpan = parseInt(String(settings.gridColumnSpan || 1), 10)
    if (!isNaN(colSpan) && colSpan > 1) {
      styles['grid-column'] = `span ${colSpan}`
    }

    // Row span
    const rowSpan = parseInt(String(settings.gridRowSpan || 1), 10)
    if (!isNaN(rowSpan) && rowSpan > 1) {
      styles['grid-row'] = `span ${rowSpan}`
    }

    return styles
  }

  /**
   * Start resizing a column
   */
  function startResize(columnIndex: number, event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()

    if (!gridSettings.value) return

    isResizing.value = true
    resizeColumnIndex.value = columnIndex
    resizeStartX.value = event.clientX

    // Initialize widths array if not set
    const columns = gridSettings.value.columns || 2
    const currentWidths = gridSettings.value.columnWidths || Array(columns).fill(1)
    resizeStartWidths.value = [...currentWidths]

    // Add listeners
    document.addEventListener('mousemove', onResize)
    document.addEventListener('mouseup', endResize)
  }

  /**
   * Handle resize movement
   */
  function onResize(event: MouseEvent) {
    if (!isResizing.value || resizeColumnIndex.value === null || !gridSettings.value) return

    const deltaX = event.clientX - resizeStartX.value
    const gridElement = document.querySelector(`[data-block-id="${block.value.id}"]`) as HTMLElement
    if (!gridElement) return

    const gridWidth = gridElement.offsetWidth
    const totalFr = resizeStartWidths.value.reduce((a, b) => a + b, 0)
    const frToPixels = gridWidth / totalFr
    const deltaFr = deltaX / frToPixels

    const newWidths = [...resizeStartWidths.value]
    const colIndex = resizeColumnIndex.value

    // Get current widths at the indices
    const leftWidth = newWidths[colIndex]
    const rightWidth = newWidths[colIndex + 1]

    // Ensure we have valid widths at the indices
    if (leftWidth === undefined || rightWidth === undefined) return

    // Adjust the column to the left of the handle
    const newLeftWidth = Math.max(0.5, leftWidth + deltaFr)
    // Adjust the column to the right of the handle
    const newRightWidth = Math.max(0.5, rightWidth - deltaFr)

    newWidths[colIndex] = Math.round(newLeftWidth * 10) / 10
    newWidths[colIndex + 1] = Math.round(newRightWidth * 10) / 10

    // Update the grid settings
    designerStore.updateBlockSettings(block.value.id, { columnWidths: newWidths })
  }

  /**
   * End resize operation
   */
  function endResize() {
    isResizing.value = false
    resizeColumnIndex.value = null
    document.removeEventListener('mousemove', onResize)
    document.removeEventListener('mouseup', endResize)
  }

  /**
   * Calculate position of column resize handle as percentage
   */
  function getHandlePosition(columnIndex: number): string {
    if (!gridSettings.value) return '50%'

    const columns = gridSettings.value.columns || 2
    const customWidths = gridSettings.value.columnWidths || Array(columns).fill(1)
    const totalFr = customWidths.reduce((a, b) => a + b, 0)

    // Sum of widths up to and including this column
    let sumFr = 0
    for (let i = 0; i <= columnIndex; i++) {
      sumFr += customWidths[i] || 1
    }

    // Account for gaps: each column has gap after it except the last
    const gap = parseFloat(gridSettings.value.gap || '16')
    const gapCount = columnIndex + 1 // number of gaps before this handle

    // Position = (sum of fr values / total fr) * 100%
    // We need to add half a gap to position the handle in the middle of the gap
    const percentPosition = (sumFr / totalFr) * 100

    return `calc(${percentPosition}% + ${gapCount * gap - gap / 2}px)`
  }

  // Cleanup on unmount
  onUnmounted(() => {
    document.removeEventListener('mousemove', onResize)
    document.removeEventListener('mouseup', endResize)
  })

  return {
    // State
    isResizing,
    resizeColumnIndex,
    gridTemplateColumns,

    // Methods
    getGridItemStyles,
    startResize,
    getHandlePosition,
  }
}
