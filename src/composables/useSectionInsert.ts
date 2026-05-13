import { useLandStore } from '@/stores/land'
import { useEditorActions } from '@/composables/useEditorActions'
import {
  sortByPosition,
  generatePositionBefore,
  generatePositionAfter,
  generatePositionBetween,
} from '@/lib/utils/position'
import type { Section, SectionType } from '@/types/section'

export function useSectionInsert() {
  const landStore = useLandStore()
  const { addSection, reorderSection } = useEditorActions()

  function getSorted(): Section[] {
    return sortByPosition(landStore.activeLand?.sections ?? [])
  }

  function calcPosition(sections: Section[], index: number): string {
    const prev = sections[index - 1]?.position ?? null
    const next = sections[index]?.position ?? null
    if (prev === null) return generatePositionBefore(next)
    if (next === null) return generatePositionAfter(prev)
    return generatePositionBetween(prev, next)
  }

  /** Insert a new section at `index`, clamped before footer. */
  function insertAt(type: SectionType, index: number) {
    const s = getSorted()
    const footerIdx = s.findIndex((sec) => sec.type === 'footer')
    const clampedIndex = footerIdx !== -1 ? Math.min(index, footerIdx) : index
    addSection(type, calcPosition(s, clampedIndex))
  }

  /** Insert a new section just before the footer (or at end if no footer). */
  function insertBeforeFooter(type: SectionType) {
    const s = getSorted()
    const footerIdx = s.findIndex((sec) => sec.type === 'footer')
    const insertIdx = footerIdx !== -1 ? footerIdx : s.length
    addSection(type, calcPosition(s, insertIdx))
  }

  /** Move an existing section to `newIndex`, respecting header/footer pins. */
  function moveTo(sectionId: string, newIndex: number) {
    const s = getSorted()
    const oldIndex = s.findIndex((sec) => sec.id === sectionId)
    if (oldIndex === -1 || oldIndex === newIndex) return
    const moved = s[oldIndex]
    if (!moved || moved.type === 'header' || moved.type === 'footer') return
    if (s[newIndex]?.type === 'header' && newIndex === 0) return
    if (s[newIndex]?.type === 'footer' && newIndex === s.length - 1) return
    const remaining = s.filter((_, i) => i !== oldIndex)
    reorderSection(sectionId, calcPosition(remaining, newIndex))
  }

  function moveUp(sectionId: string) {
    const s = getSorted()
    const idx = s.findIndex((sec) => sec.id === sectionId)
    if (idx <= 0) return
    const prev = s[idx - 1]
    if (!prev) return
    reorderSection(sectionId, generatePositionBetween(s[idx - 2]?.position ?? null, prev.position))
  }

  function moveDown(sectionId: string) {
    const s = getSorted()
    const idx = s.findIndex((sec) => sec.id === sectionId)
    if (idx === -1 || idx >= s.length - 1) return
    const next = s[idx + 1]
    if (!next) return
    reorderSection(sectionId, generatePositionBetween(next.position, s[idx + 2]?.position ?? null))
  }

  return { insertAt, insertBeforeFooter, moveTo, moveUp, moveDown }
}
