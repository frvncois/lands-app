import { ref } from 'vue'
import { useEditorActions } from './useEditorActions'
import type { Section } from '@/types/section'

interface SectionSnapshot {
  content: unknown
  settings_json: unknown
  style_variant: string
}

export function useSectionSnapshot(getSection: () => Section) {
  const { restoreSectionSnapshot } = useEditorActions()
  const snapshot = ref<SectionSnapshot | null>(null)

  function capture() {
    const s = getSection()
    snapshot.value = {
      content: structuredClone(s.content ?? {}),
      settings_json: structuredClone(s.settings_json ?? {}),
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
