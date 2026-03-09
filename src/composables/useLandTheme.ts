import { inject, computed } from 'vue'
import type { LandTheme } from '@/types/theme'

/**
 * Use inside display section components to access the Land theme.
 * Returns undefined values when not inside a ThemeProvider (e.g., in the editor preview).
 */
export function useLandTheme() {
  const isThemedContext = inject<boolean>('isThemedContext', false)
  const landTheme = inject<LandTheme | null>('landTheme', null)

  const textColor = computed(() =>
    isThemedContext ? 'var(--land-text)' : undefined
  )

  const textMutedColor = computed(() =>
    isThemedContext ? 'var(--land-text-muted)' : undefined
  )

  const textSubtleColor = computed(() =>
    isThemedContext ? 'var(--land-text-subtle)' : undefined
  )

  const borderColor = computed(() =>
    isThemedContext ? 'var(--land-border)' : undefined
  )

  const surfaceColor = computed(() =>
    isThemedContext ? 'var(--land-surface)' : undefined
  )

  const hoverColor = computed(() =>
    isThemedContext ? 'var(--land-hover)' : undefined
  )

  const colorMain = computed(() =>
    isThemedContext ? 'var(--land-color-main)' : undefined
  )

  const colorAccent = computed(() =>
    isThemedContext ? 'var(--land-color-accent)' : undefined
  )

  const colorSurface = computed(() =>
    isThemedContext ? 'var(--land-color-surface)' : undefined
  )

  return {
    isThemedContext,
    landTheme,
    textColor,
    textMutedColor,
    textSubtleColor,
    borderColor,
    surfaceColor,
    hoverColor,
    colorMain,
    colorAccent,
    colorSurface,
  }
}
