import { ref } from 'vue'
import { useEditorMutations } from './useEditorMutations'
import type { Section } from '@/features/sections/types'

interface SectionSnapshot {
  content: unknown
  settings_json: unknown
  style_variant: string
}

export function useSectionSnapshot(getSection: () => Section) {
  const { restoreSectionSnapshot } = useEditorMutations()
  const snapshot = ref<SectionSnapshot | null>(null)

  function capture() {
    const s = getSection()
    snapshot.value = {
      content: JSON.parse(JSON.stringify(s.content ?? {})),
      settings_json: JSON.parse(JSON.stringify(s.settings_json ?? {})),
      style_variant: s.style_variant,
    }
  }

  function restore() {
    if (snapshot.value) {
      restoreSectionSnapshot(getSection().id, snapshot.value)
    }
  }

  return { snapshot, capture, restore }
}
