import { computed } from 'vue'
import type { WritableComputedRef } from 'vue'
import { useEditorActions } from './useEditorActions'
import type { Section } from '@/types/section'

/**
 * Returns factory functions for WritableComputedRef bindings that read
 * directly from the section prop and write via editor mutations.
 * No local state — eliminates the sync()/watch() anti-pattern.
 */
export function useSectionForm<S extends Section>(getSection: () => S) {
  const { updateSectionContent, updateSectionSettings } = useEditorActions()

  function contentField<V>(key: string, fallback: V): WritableComputedRef<V> {
    return computed<V>({
      get: () => ((getSection().content as unknown as Record<string, unknown>)?.[key] as V) ?? fallback,
      set: (v) => updateSectionContent(getSection().id, { [key]: v }),
    })
  }

  function settingsField<V>(key: string, fallback: V): WritableComputedRef<V> {
    return computed<V>({
      get: () => ((getSection().settings_json as Record<string, unknown>)?.[key] as V) ?? fallback,
      set: (v) => updateSectionSettings(getSection().id, { [key]: v }),
    })
  }

  function patchContent(patch: Record<string, unknown>) {
    updateSectionContent(getSection().id, patch)
  }

  return { contentField, settingsField, patchContent }
}
