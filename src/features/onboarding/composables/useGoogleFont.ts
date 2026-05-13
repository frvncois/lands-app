import { watch } from 'vue'
import type { Ref } from 'vue'
import { THEME_PRESET_DEFINITIONS } from '@/features/theme/presets'
import { loadGoogleFont } from '@/shared/lib/fonts'
import type { ThemePreset } from '@/features/theme/types'

/**
 * Watches font refs and loads the matching Google font when the active theme
 * defines one for the selected font pair. Guards against null theme to avoid
 * runtime crashes when the theme hasn't been selected yet.
 */
export function useGoogleFont(
  fontTitle: Ref<string>,
  fontBody: Ref<string>,
  selectedTheme: Ref<ThemePreset | null>,
) {
  watch(fontTitle, (val) => {
    if (!selectedTheme.value) return
    const opt = THEME_PRESET_DEFINITIONS[selectedTheme.value].pairings.find(o => o.titleFont === val)
    if (opt?.titleGoogleFont) loadGoogleFont(opt.titleGoogleFont)
  })

  watch(fontBody, (val) => {
    if (!selectedTheme.value) return
    const opt = THEME_PRESET_DEFINITIONS[selectedTheme.value].pairings.find(o => o.bodyFont === val)
    if (opt?.bodyGoogleFont) loadGoogleFont(opt.bodyGoogleFont)
  })
}
