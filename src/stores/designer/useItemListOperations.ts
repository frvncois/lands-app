import { generateId } from '@/lib/designer-utils'
import { deepClone } from './helpers'

/**
 * Generic item list operations for managing arrays of items with IDs.
 * Used for header nav links, footer links, footer social links, etc.
 *
 * @param getItems - Getter function to retrieve the current items array
 * @param setItems - Setter function to update the items array
 * @param createItem - Factory function to create a new default item
 * @param options - Optional callbacks for lifecycle hooks
 */
export interface ItemListOptions<T extends { id: string }> {
  /** Called before any modification */
  onBeforeChange?: () => void
  /** Called after an item is added, with the new item */
  onAfterAdd?: (item: T) => void
  /** Called after an item is removed, with the removed item's id */
  onAfterRemove?: (id: string) => void
  /** Generate a new unique ID (defaults to crypto.randomUUID) */
  generateNewId?: () => string
}

export function useItemListOperations<T extends { id: string }>(
  getItems: () => T[],
  setItems: (items: T[]) => void,
  createItem: () => T,
  options: ItemListOptions<T> = {}
) {
  const {
    onBeforeChange,
    onAfterAdd,
    onAfterRemove,
    generateNewId = () => generateId(),
  } = options

  /**
   * Add a new item to the list
   * @returns The newly created item
   */
  function add(): T {
    onBeforeChange?.()
    const items = getItems()
    const item = createItem()
    setItems([...items, item])
    onAfterAdd?.(item)
    return item
  }

  /**
   * Remove an item from the list by ID
   * @param id - The ID of the item to remove
   * @returns True if item was removed, false if not found
   */
  function remove(id: string): boolean {
    onBeforeChange?.()
    const items = getItems()
    const index = items.findIndex(item => item.id === id)
    if (index === -1) return false

    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
    onAfterRemove?.(id)
    return true
  }

  /**
   * Update an item's properties
   * @param id - The ID of the item to update
   * @param updates - Partial object with properties to update
   * @returns True if item was updated, false if not found
   */
  function update(id: string, updates: Partial<T>): boolean {
    onBeforeChange?.()
    const items = getItems()
    const index = items.findIndex(item => item.id === id)
    if (index === -1) return false

    const newItems = [...items]
    newItems[index] = { ...newItems[index], ...updates } as T
    setItems(newItems)
    return true
  }

  /**
   * Reorder items by moving from one index to another
   * @param fromIndex - Source index
   * @param toIndex - Destination index
   * @returns True if reorder was successful
   */
  function reorder(fromIndex: number, toIndex: number): boolean {
    onBeforeChange?.()
    const items = getItems()
    if (fromIndex < 0 || fromIndex >= items.length) return false
    if (toIndex < 0 || toIndex >= items.length) return false
    if (fromIndex === toIndex) return false

    const newItems = [...items]
    const [moved] = newItems.splice(fromIndex, 1)
    if (!moved) return false
    newItems.splice(toIndex, 0, moved)
    setItems(newItems)
    return true
  }

  /**
   * Duplicate an item and insert it after the original
   * @param id - The ID of the item to duplicate
   * @returns The duplicated item, or null if original not found
   */
  function duplicate(id: string): T | null {
    onBeforeChange?.()
    const items = getItems()
    const index = items.findIndex(item => item.id === id)
    if (index === -1) return null

    const original = items[index]
    const newItem = {
      ...deepClone(original),
      id: generateNewId(),
    } as T

    const newItems = [...items]
    newItems.splice(index + 1, 0, newItem)
    setItems(newItems)
    onAfterAdd?.(newItem)
    return newItem
  }

  /**
   * Get an item by ID
   * @param id - The ID of the item to find
   * @returns The item, or undefined if not found
   */
  function getById(id: string): T | undefined {
    return getItems().find(item => item.id === id)
  }

  /**
   * Get the index of an item by ID
   * @param id - The ID of the item to find
   * @returns The index, or -1 if not found
   */
  function getIndex(id: string): number {
    return getItems().findIndex(item => item.id === id)
  }

  /**
   * Move an item up in the list (decrease index)
   * @param id - The ID of the item to move
   * @returns True if moved, false otherwise
   */
  function moveUp(id: string): boolean {
    const index = getIndex(id)
    if (index <= 0) return false
    return reorder(index, index - 1)
  }

  /**
   * Move an item down in the list (increase index)
   * @param id - The ID of the item to move
   * @returns True if moved, false otherwise
   */
  function moveDown(id: string): boolean {
    const items = getItems()
    const index = getIndex(id)
    if (index === -1 || index >= items.length - 1) return false
    return reorder(index, index + 1)
  }

  return {
    add,
    remove,
    update,
    reorder,
    duplicate,
    getById,
    getIndex,
    moveUp,
    moveDown,
  }
}
