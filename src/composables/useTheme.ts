import { computed, provide } from 'vue'
import type { ComputedRef } from 'vue'
import type { LandTheme } from '@/types/theme'

function buildCssVars(theme: LandTheme): Record<string, string> {
  return {
    '--land-color-main': theme.color_main,
    '--land-color-accent': theme.color_accent,
    '--land-color-surface': theme.color_surface,
    '--land-bg': '#ffffff',
    '--land-text': '#18181B',
    '--land-text-muted': '#52525B',
    '--land-text-subtle': '#A1A1AA',
    '--land-border': '#E4E4E7',
    '--land-surface': '#F4F4F5',
    '--land-hover': '#F4F4F5',
  }
}

function fontFamilyFor(style: string): string {
  if (style === 'serif') return 'Georgia, "Times New Roman", serif'
  if (style === 'mono') return 'ui-monospace, "Fira Code", monospace'
  return ''
}

/**
 * Call from a component that acts as a theme root (e.g. LandPreview, LandView).
 * Provides the themed context to all descendant display sections via inject.
 * Returns wrapperStyle to apply on the root element.
 */
export function useTheme(theme: ComputedRef<LandTheme | null | undefined>) {
  provide('isThemedContext', true)
  provide('landTheme', theme)

  const wrapperStyle = computed<Record<string, string>>(() => {
    if (!theme.value) return {}
    const vars = buildCssVars(theme.value)
    const font = fontFamilyFor(theme.value.typography_style)
    return {
      ...vars,
      backgroundColor: vars['--land-bg'],
      color: vars['--land-text'],
      ...(font ? { fontFamily: font } : {}),
    }
  })

  return { wrapperStyle }
}
