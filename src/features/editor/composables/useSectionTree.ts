import { computed } from 'vue'
import type { FunctionalComponent } from 'vue'
import { useLandStore } from '@/features/lands/stores/land'
import { sortByPosition } from '@/shared/lib/position'
import { sectionPrimitives } from '@/features/sections/index'
import type { TreeNode } from '@/shared/ui/BaseTree.vue'

// Lazy memoized maps — NOT computed at module init time.
// Deferring past module init breaks the TDZ cycle:
//   registry → settingsPanel → BaseLinkPicker → useSectionTree → sections/index → registry
let _iconMap: Record<string, FunctionalComponent> | null = null
let _labelMap: Record<string, string> | null = null
function getSectionIconMap() {
  return (_iconMap ??= Object.fromEntries(sectionPrimitives.map((p) => [p.id, p.icon])))
}
function getSectionLabelMap() {
  return (_labelMap ??= Object.fromEntries(sectionPrimitives.map((p) => [p.id, p.label])))
}

const FIXED_LABEL_TYPES = new Set(['header', 'footer', 'campaign'])

export function getSectionTitle(s: { type: string; content: unknown }): string | null {
  if (FIXED_LABEL_TYPES.has(s.type)) return null
  const c = s.content as Record<string, any>
  if (s.type === 'collection') return c?.collections?.[0]?.title || null
  if (s.type === 'store') return c?.stores?.[0]?.title || null
  return c?.title || null
}

export function useSectionTree() {
  const landStore = useLandStore()
  const sectionIconMap = getSectionIconMap()
  const sectionLabelMap = getSectionLabelMap()

  const nodes = computed<TreeNode[]>(() =>
    sortByPosition(landStore.activeLand?.sections ?? []).map((s) => ({
      id: s.id,
      label: getSectionTitle(s) || (sectionLabelMap[s.type] ?? (s.type.charAt(0).toUpperCase() + s.type.slice(1))),
      icon: sectionIconMap[s.type],
      locked: s.type === 'header' || s.type === 'footer',
      visible: s.visible,
    }))
  )

  return { sectionIconMap, sectionLabelMap, getSectionTitle, nodes }
}
