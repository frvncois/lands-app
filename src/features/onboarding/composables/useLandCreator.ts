import { ref } from 'vue'
import { useLandStore } from '@/features/lands/stores/land'
import { landService } from '@/features/lands/services/land.service'
import { useSlugFromTitle } from '@/features/onboarding/composables/useSlugFromTitle'
import { SECTION_DEFAULTS } from '@/features/sections/defaults'
import { PURPOSE_OPTIONS, buildSectionContent, type Purpose } from '@/features/sections/purpose-defaults'
import { generatePositionAfter } from '@/shared/lib/position'
import type { LandTheme } from '@/features/theme/types'
import type { Section, SectionType } from '@/features/sections/types'
import type { Land } from '@/features/lands/types'

/**
 * Per-instance wizard composable. Owns shared wizard state (title, handle,
 * purpose), the buildSections function (single canonical implementation),
 * and the create() async flow.
 *
 * Theme, colors, and fonts are NOT owned here because the two flows handle
 * them differently (OnboardingView: individual color pickers + font pickers;
 * CreateProjectModal: predefined palette swatches, no font picker).
 * Callers assemble the theme and pass it to create().
 */
export function useLandCreator() {
  const landStore = useLandStore()

  const title = ref('')
  const { handle, onHandleInput } = useSlugFromTitle(title)
  const selectedPurpose = ref<Purpose | null>(null)
  const isLoading = ref(false)
  const error = ref('')

  /**
   * Build seeded sections for a new land.
   *
   * Note: this function iterates over SectionType[] at runtime, so TypeScript
   * cannot statically narrow the discriminant for each section. The
   * `as unknown as Section` cast is intentional and contained here — it is the
   * canonical single location for this pattern.
   */
  function buildSections(types: SectionType[], landId: string, projectTitle: string, purpose: Purpose): Section[] {
    const sections: Section[] = []
    let lastPos: string | null = null
    const countByType: Partial<Record<SectionType, number>> = {}

    for (const type of types) {
      const defaults = SECTION_DEFAULTS[type]
      const pos = generatePositionAfter(lastPos)
      lastPos = pos

      const existingCount = countByType[type] ?? 0
      countByType[type] = existingCount + 1

      let content: Record<string, unknown>
      if (type === 'header') {
        content = { ...(defaults.content ? structuredClone(defaults.content) : {}), title: projectTitle, subtitle: 'A short tagline about what you do' }
      } else {
        const seeded = buildSectionContent(purpose, type, existingCount)
        content = Object.keys(seeded).length > 0 ? seeded : (defaults.content ? structuredClone(defaults.content) : {})
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const section = {
        id: crypto.randomUUID(),
        land_id: landId,
        type,
        position: pos,
        style_variant: defaults.style_variant,
        settings_json: { ...defaults.settings_json },
        content,
        created_at: new Date().toISOString(),
      } as unknown as Section

      // Patch section_id into seeded content using discriminant narrowing
      if (section.type === 'collection' || section.type === 'monetize') {
        const col = section.content?.collections?.[0]
        if (col) col.section_id = section.id
      }
      if (section.type === 'store') {
        const store = section.content?.stores?.[0]
        if (store) store.section_id = section.id
      }
      if (section.type === 'links') {
        section.content?.items?.forEach((item) => { item.section_id = section.id })
      }

      sections.push(section)
    }
    return sections
  }

  /**
   * Core creation flow: createLand → buildSections → save → addLand.
   * Callers assemble and pass the final theme object.
   * Throws on failure so callers can show their own post-error UI.
   */
  async function create(params: {
    title: string
    handle: string
    purposeId: Purpose
    theme: LandTheme
  }): Promise<Land> {
    isLoading.value = true
    error.value = ''
    try {
      const purposeOpt = PURPOSE_OPTIONS.find(p => p.id === params.purposeId)!
      const land = await landService.createLand({ title: params.title, handle: params.handle })
      const sections = buildSections(purposeOpt.sections, land.id, params.title, params.purposeId)
      await landService.save(land.id, { sections, theme: params.theme })
      landStore.addLand({ ...land, sections, theme: params.theme, purpose: params.purposeId })
      return land
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return { title, handle, onHandleInput, selectedPurpose, isLoading, error, create, buildSections }
}
