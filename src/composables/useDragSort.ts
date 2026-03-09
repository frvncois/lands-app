import { ref } from 'vue'
import {
  generatePositionBetween,
  generatePositionBefore,
  generatePositionAfter,
} from '@/lib/utils/position'

interface Positionable {
  id: string
  position: string
}

/**
 * Composable for drag-and-drop reordering with fractional indexing.
 *
 * `getItems` should return items in their current (post-drag) order.
 * vuedraggable mutates the bound array before firing @end, so getItems()
 * already reflects the new visual order when onDragEnd is called.
 *
 * `onReorder` receives the item id and its recalculated position string.
 */
export function useDragSort<T extends Positionable>(
  getItems: () => T[],
  onReorder: (itemId: string, newPosition: string) => void,
) {
  const isDragging = ref(false)

  function onDragStart() {
    isDragging.value = true
  }

  function onDragEnd(event: { oldIndex: number; newIndex: number }) {
    isDragging.value = false

    const { oldIndex, newIndex } = event
    if (oldIndex === newIndex) return

    const items = getItems()
    const draggedItem = items[newIndex]
    if (!draggedItem) return

    let newPosition: string

    if (newIndex === 0) {
      const nextItem = items[1]
      newPosition = nextItem
        ? generatePositionBefore(nextItem.position)
        : generatePositionAfter(null)
    } else if (newIndex === items.length - 1) {
      const prevItem = items[newIndex - 1]!
      newPosition = generatePositionAfter(prevItem.position)
    } else {
      const prevItem = items[newIndex - 1]!
      const nextItem = items[newIndex + 1]!
      newPosition = generatePositionBetween(prevItem.position, nextItem.position)
    }

    onReorder(draggedItem.id, newPosition)
  }

  return { isDragging, onDragStart, onDragEnd }
}
