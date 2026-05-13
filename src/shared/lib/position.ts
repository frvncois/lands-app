import { generateKeyBetween, generateNKeysBetween } from 'fractional-indexing'

/**
 * Generate a position key for inserting at the end of a list.
 * Pass the current last item's position, or null if the list is empty.
 */
export function generatePositionAfter(lastPosition: string | null): string {
  return generateKeyBetween(lastPosition, null)
}

/**
 * Generate a position key for inserting at the beginning of a list.
 * Pass the current first item's position, or null if the list is empty.
 */
export function generatePositionBefore(firstPosition: string | null): string {
  return generateKeyBetween(null, firstPosition)
}

/**
 * Generate a position key for inserting between two items.
 * Either parameter can be null to indicate start/end of list.
 */
export function generatePositionBetween(
  before: string | null,
  after: string | null
): string {
  return generateKeyBetween(before, after)
}


/**
 * Calculate the new position key when reordering an item within a sorted list.
 * Pass the full sorted array, the old index, and the target new index.
 */
export function generateReorderPosition<T extends { position: string }>(
  items: T[],
  oldIndex: number,
  newIndex: number,
): string {
  const remaining = items.filter((_, i) => i !== oldIndex)
  const prevPos = remaining[newIndex - 1]?.position ?? null
  const nextPos = remaining[newIndex]?.position ?? null
  return prevPos === null
    ? generatePositionBefore(nextPos)
    : nextPos === null
      ? generatePositionAfter(prevPos)
      : generatePositionBetween(prevPos, nextPos)
}

/**
 * Sort an array of items by their `position` field (string comparison).
 * Fractional index strings are designed to sort lexicographically.
 */
export function sortByPosition<T extends { position: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.position < b.position ? -1 : a.position > b.position ? 1 : 0))
}
