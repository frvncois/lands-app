import type { Land } from '@/types/land'

export function isValidLand(land: Partial<Land>): boolean {
  return Boolean(land.id && land.user_id && land.title)
}
