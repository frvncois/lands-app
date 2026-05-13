import { computed } from 'vue'
import { useLandStore } from '@/stores/land'
import { sortByPosition } from '@/lib/utils/position'
import { sectionPrimitives } from '@/sections/index'
import type { TreeNode } from '@/components/ui/BaseTree.vue'

export const sectionIconMap = Object.fromEntries(sectionPrimitives.map((p) => [p.id, p.icon]))
export const sectionLabelMap = Object.fromEntries(sectionPrimitives.map((p) => [p.id, p.label]))

const FIXED_LABEL_TYPES = new Set(['header', 'footer', 'campaign'])

export function getSectionTitle(s: { type: string; content: unknown }): string | null {
  if (FIXED_LABEL_TYPES.has(s.type)) return null
  const c = s.content as Record<string, any>
  if (s.type === 'collection' || s.type === 'monetize') return c?.collections?.[0]?.title || null
  if (s.type === 'store') return c?.stores?.[0]?.title || null
  return c?.title || null
}

export function useSectionTree() {
  const landStore = useLandStore()

  const nodes = computed<TreeNode[]>(() =>
    sortByPosition(landStore.activeLand?.sections ?? []).map((s) => ({
      id: s.id,
      label: getSectionTitle(s) || (sectionLabelMap[s.type] ?? (s.type.charAt(0).toUpperCase() + s.type.slice(1))),
      icon: sectionIconMap[s.type],
      locked: s.type === 'header' || s.type === 'footer',
    }))
  )

  return { sectionIconMap, sectionLabelMap, getSectionTitle, nodes }
}
