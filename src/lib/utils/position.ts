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
 * Generate N evenly-spaced position keys between two bounds.
 * Useful for initializing a list or bulk inserts.
 * Either parameter can be null to indicate start/end of list.
 */
export function generatePositions(
  count: number,
  before: string | null = null,
  after: string | null = null
): string[] {
  return generateNKeysBetween(before, after, count)
}

/**
 * Sort an array of items by their `position` field (string comparison).
 * Fractional index strings are designed to sort lexicographically.
 */
export function sortByPosition<T extends { position: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.position < b.position ? -1 : a.position > b.position ? 1 : 0))
}
