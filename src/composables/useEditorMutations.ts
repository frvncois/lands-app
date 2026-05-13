import { computed } from 'vue'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { useThemeStore } from '@/stores/theme'
import { useToast } from '@/composables/useToast'
import { landService } from '@/services/land.service'
import type { Section, SectionSettings } from '@/types/section'
import type { LandTheme } from '@/types/theme'

export function useEditorMutations() {
  const landStore = useLandStore()
  const editorStore = useEditorStore()
  const themeStore = useThemeStore()
  const { addToast } = useToast()

  const activeLand = computed(() => landStore.activeLand)

  // ─── Internal helpers ───

  function patchSection(sectionId: string, updater: (s: Section) => Section) {
    if (!activeLand.value) return
    const updatedSections = activeLand.value.sections.map((s) =>
      s.id === sectionId ? updater(s) : s
    )
    landStore.updateLand(activeLand.value.id, { sections: updatedSections })
    if (editorStore.activeSection?.id === sectionId) {
      editorStore.setActiveSection(updatedSections.find((s) => s.id === sectionId) ?? null)
    }
    editorStore.markDirty()
  }

  // ─── Section Content/Settings ───

  function updateSectionContent(sectionId: string, content: Record<string, unknown>) {
    patchSection(sectionId, (s) => ({ ...s, content: { ...(s.content ?? {}), ...content } }) as unknown as Section)
  }

  function updateSectionSettings(sectionId: string, settings: Record<string, unknown>) {
    patchSection(sectionId, (s) => ({ ...s, settings_json: { ...s.settings_json, ...settings } }) as unknown as Section)
  }

  function updateSectionStyleVariant(sectionId: string, variant: string) {
    patchSection(sectionId, (s) => ({ ...s, style_variant: variant }))
  }

  // ─── Section Snapshot Restore ───

  function restoreSectionSnapshot(sectionId: string, data: {
    content: unknown
    settings_json: unknown
    style_variant: string
  }) {
    patchSection(sectionId, (s) => ({ ...s, content: data.content, style_variant: data.style_variant, settings_json: data.settings_json }) as unknown as Section)
  }

  // ─── Land Images ───

  function updateLandImages(data: { cover_image?: string; avatar_image?: string }) {
    if (!activeLand.value) return
    landStore.updateLand(activeLand.value.id, data)
    landService.updateLand(activeLand.value.id, data).catch((e) => {
      console.error('[editor] Failed to save image:', e)
      addToast('Failed to save image', 'error')
    })
  }

  // ─── Theme ───

  function updateTheme(data: Partial<LandTheme>) {
    if (!activeLand.value) return
    const updatedTheme = { ...activeLand.value.theme, ...data }
    themeStore.setTheme(updatedTheme)
    landStore.updateLand(activeLand.value.id, { theme: updatedTheme })
    editorStore.markDirty()
  }

  // ─── Land Settings ───

  function updateLandSettings(data: { handle?: string; title?: string; description?: string }) {
    if (!activeLand.value) return
    landStore.updateLand(activeLand.value.id, data)
    landService.updateLand(activeLand.value.id, data)
      .then(() => addToast('Settings saved'))
      .catch((e) => {
        console.error('[editor] Failed to save settings:', e)
        addToast('Failed to save settings', 'error')
      })
  }

  return {
    updateSectionContent,
    updateSectionSettings,
    updateSectionStyleVariant,
    restoreSectionSnapshot,
    updateLandImages,
    updateTheme,
    updateLandSettings,
  }
}
