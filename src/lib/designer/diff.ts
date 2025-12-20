/**
 * Shallow diff engine for editor state
 *
 * Compares two objects and returns only the changed keys.
 * Intentionally shallow - deep diffs are expensive and unnecessary
 * since we're comparing top-level editor state properties.
 */

/**
 * Compare two objects and return only changed properties
 * Uses JSON.stringify for value comparison (handles nested objects)
 */
export function diffObjects<T extends Record<string, unknown>>(
  prev: T | null | undefined,
  next: T
): Partial<T> {
  const diff: Partial<T> = {}

  // Handle null/undefined previous state (first save)
  if (!prev) {
    return { ...next }
  }

  // Compare each key in next state
  for (const key in next) {
    const prevValue = prev[key]
    const nextValue = next[key]

    // Use JSON.stringify for deep equality check
    if (JSON.stringify(prevValue) !== JSON.stringify(nextValue)) {
      diff[key] = nextValue
    }
  }

  return diff
}

/**
 * Check if diff has any changes
 */
export function hasChanges(diff: Record<string, unknown>): boolean {
  return Object.keys(diff).length > 0
}

/**
 * Merge multiple diffs into one (later diffs override earlier)
 */
export function mergeDiffs<T extends Record<string, unknown>>(
  ...diffs: Partial<T>[]
): Partial<T> {
  return Object.assign({}, ...diffs)
}
