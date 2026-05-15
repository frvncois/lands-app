import { ref } from 'vue'
import { useLandStore } from '@/features/lands/stores/land'
import { landService } from '@/features/lands/services/land.service'
import { useSlugFromTitle } from '@/features/onboarding/composables/useSlugFromTitle'
import { SECTION_DEFAULTS, DEFAULT_LAND_SECTIONS, createDefaultContent } from '@/features/sections/defaults'
import { generatePositionAfter } from '@/shared/lib/position'
import type { LandTheme } from '@/features/theme/types'
import type { Section } from '@/features/sections/types'
import type { Land } from '@/features/lands/types'

/**
 * Per-instance wizard composable. Owns shared wizard state (title, handle),
 * the buildSections function (single canonical implementation),
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
  const isLoading = ref(false)
  const error = ref('')

  /**
   * Build default sections for a new land.
   *
   * Note: this function iterates over SectionType[] at runtime, so TypeScript
   * cannot statically narrow the discriminant for each section. The
   * `as unknown as Section` cast is intentional and contained here — it is the
   * canonical single location for this pattern.
   */
  function buildSections(landId: string, projectTitle: string): Section[] {
    const sections: Section[] = []
    let lastPos: string | null = null

    for (const type of DEFAULT_LAND_SECTIONS) {
      const defaults = SECTION_DEFAULTS[type]
      const pos = generatePositionAfter(lastPos)
      lastPos = pos

      let content: Record<string, unknown>
      if (type === 'header') {
        content = { ...(defaults.content ? structuredClone(defaults.content) : {}), title: projectTitle, subtitle: 'A short tagline about what you do' }
      } else {
        content = createDefaultContent(type)
      }

      // Building a section from a runtime SectionType string — TypeScript can't narrow the
      // discriminant at compile time here, so we cast via unknown. Safe: all fields match the
      // discriminated union shape for every SectionType value.
      const section = {
        id: crypto.randomUUID(),
        land_id: landId,
        type,
        position: pos,
        style_variant: defaults.style_variant,
        settings_json: { ...defaults.settings_json },
        content,
        created_at: new Date().toISOString(),
        visible: true,
      } as unknown as Section

      // Patch section_id into seeded content using discriminant narrowing
      if (section.type === 'post' || section.type === 'releases' || section.type === 'concert' || section.type === 'videos') {
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
    theme: LandTheme
  }): Promise<Land> {
    isLoading.value = true
    error.value = ''
    try {
      const land = await landService.createLand({ title: params.title, handle: params.handle })
      const sections = buildSections(land.id, params.title)
      await landService.save(land.id, { sections, theme: params.theme })
      landStore.addLand({ ...land, sections, theme: params.theme })
      return land
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return { title, handle, onHandleInput, isLoading, error, create, buildSections }
}
