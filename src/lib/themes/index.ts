/**
 * THEME SYSTEM
 * Theme registry and CSS variable injection
 *
 * Adding a new theme requires ONLY:
 * 1. Create a theme file with Theme type
 * 2. Import and add to registry here
 */

import type { Theme, ThemeTokens, SectionPreset } from '@/types/sections'
import { modernTheme } from './modern'
import { boldTheme } from './bold'
import { softTheme } from './soft'
import { editorialTheme } from './editorial'
import { classicTheme } from './classic'

// ============================================
// THEME REGISTRY
// ============================================

/**
 * All available themes
 */
export const themeRegistry: Map<string, Theme> = new Map([
  ['modern', modernTheme],
  ['bold', boldTheme],
  ['soft', softTheme],
  ['editorial', editorialTheme],
  ['classic', classicTheme],
])

/**
 * Get a theme by ID
 */
export function getTheme(id: string): Theme | undefined {
  return themeRegistry.get(id)
}

/**
 * Get all themes
 */
export function getAllThemes(): Theme[] {
  return Array.from(themeRegistry.values())
}

/**
 * Get default theme
 */
export function getDefaultTheme(): Theme {
  return modernTheme
}

// ============================================
// CSS VARIABLE INJECTION
// ============================================

/**
 * Convert tokens to CSS variable declarations
 */
function tokensToCssVars(tokens: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {}

  // Colors
  vars['--color-bg'] = tokens.colors.background
  vars['--color-fg'] = tokens.colors.foreground
  vars['--color-primary'] = tokens.colors.primary
  vars['--color-primary-fg'] = tokens.colors.primaryForeground
  vars['--color-secondary'] = tokens.colors.secondary
  vars['--color-secondary-fg'] = tokens.colors.secondaryForeground
  vars['--color-muted'] = tokens.colors.muted
  vars['--color-muted-fg'] = tokens.colors.mutedForeground
  vars['--color-accent'] = tokens.colors.accent
  vars['--color-accent-fg'] = tokens.colors.accentForeground
  vars['--color-border'] = tokens.colors.border

  // Fonts
  vars['--font-heading'] = tokens.fonts.heading
  vars['--font-body'] = tokens.fonts.body
  if (tokens.fonts.mono) {
    vars['--font-mono'] = tokens.fonts.mono
  }

  // Font scale
  vars['--text-xs'] = tokens.fontScale.xs
  vars['--text-sm'] = tokens.fontScale.sm
  vars['--text-base'] = tokens.fontScale.base
  vars['--text-lg'] = tokens.fontScale.lg
  vars['--text-xl'] = tokens.fontScale.xl
  vars['--text-2xl'] = tokens.fontScale['2xl']
  vars['--text-3xl'] = tokens.fontScale['3xl']
  vars['--text-4xl'] = tokens.fontScale['4xl']
  vars['--text-5xl'] = tokens.fontScale['5xl']

  // Spacing
  vars['--spacing-section'] = tokens.spacing.section
  vars['--spacing-container'] = tokens.spacing.container
  vars['--spacing-xs'] = tokens.spacing.xs
  vars['--spacing-sm'] = tokens.spacing.sm
  vars['--spacing-md'] = tokens.spacing.md
  vars['--spacing-lg'] = tokens.spacing.lg
  vars['--spacing-xl'] = tokens.spacing.xl
  vars['--spacing-2xl'] = tokens.spacing['2xl']

  // Radius
  vars['--radius-none'] = tokens.radius.none
  vars['--radius-sm'] = tokens.radius.sm
  vars['--radius-md'] = tokens.radius.md
  vars['--radius-lg'] = tokens.radius.lg
  vars['--radius-xl'] = tokens.radius.xl
  vars['--radius-full'] = tokens.radius.full

  // Button
  vars['--btn-radius'] = tokens.button.borderRadius
  vars['--btn-px'] = tokens.button.paddingX
  vars['--btn-py'] = tokens.button.paddingY
  vars['--btn-weight'] = tokens.button.fontWeight

  return vars
}

/**
 * Apply theme to preview container only
 * This scopes theme variables so editor UI is not affected
 */
export function applyTheme(theme: Theme): void {
  // Find or create the preview theme style element
  let styleEl = document.getElementById('preview-theme-vars') as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'preview-theme-vars'
    document.head.appendChild(styleEl)
  }

  const vars = tokensToCssVars(theme.tokens)

  // Generate CSS for preview scope only
  const cssVars = Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n    ')

  styleEl.textContent = `
  .page-editor__preview {
    ${cssVars}
    color-scheme: ${theme.isDark ? 'dark' : 'light'};
    background-color: var(--color-bg);
    color: var(--color-fg);
  }
  `

  // Store current theme ID on document for reference
  document.documentElement.dataset.theme = theme.id
}

/**
 * Apply theme by ID
 */
export function applyThemeById(id: string): boolean {
  const theme = getTheme(id)
  if (!theme) return false
  applyTheme(theme)
  return true
}

/**
 * Get current theme ID from document
 */
export function getCurrentThemeId(): string | undefined {
  return document.documentElement.dataset.theme
}

/**
 * Get section preset for a section type from a theme
 */
export function getSectionPreset(theme: Theme, sectionType: string): SectionPreset | undefined {
  return theme.sectionPresets?.[sectionType]
}

/**
 * Get effective variant for a section (respecting theme presets)
 */
export function getEffectiveVariant(
  theme: Theme,
  sectionType: string,
  requestedVariant: string,
  availableVariants: string[]
): string {
  const preset = getSectionPreset(theme, sectionType)

  // Check if variant is allowed by theme
  if (preset?.allowedVariants && !preset.allowedVariants.includes(requestedVariant)) {
    // Fall back to theme default or first allowed
    return preset.defaultVariant || preset.allowedVariants[0] || requestedVariant
  }

  // Check if variant exists
  if (availableVariants.includes(requestedVariant)) {
    return requestedVariant
  }

  // Fall back to theme default
  return preset?.defaultVariant || availableVariants[0] || requestedVariant
}

// Re-export themes for direct access
export { modernTheme } from './modern'
export { boldTheme } from './bold'
export { softTheme } from './soft'
export { editorialTheme } from './editorial'
export { classicTheme } from './classic'
