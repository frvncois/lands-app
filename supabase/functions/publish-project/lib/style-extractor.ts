/**
 * High-level utility that combines class generation, Tailwind parsing,
 * and CSS collection for element rendering.
 */

import { ClassGenerator } from './class-generator.ts'
import { CSSCollector } from './css-collector.ts'
import { parseTailwindClasses, parseInlineStyle } from './tailwind-to-css.ts'

export interface ElementStyle {
  className: string
  tailwindClasses?: string
  inlineStyle?: string
  additionalStyles?: Record<string, string>
}

export interface ThemeColors {
  background: string
  foreground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  border: string
}

export interface Theme {
  colors: ThemeColors
  fonts: {
    heading: string
    body: string
  }
}

export class StyleExtractor {
  private classGen: ClassGenerator
  private cssCollector: CSSCollector
  private theme: Theme | null = null

  constructor() {
    this.classGen = new ClassGenerator()
    this.cssCollector = new CSSCollector()
  }

  /**
   * Set theme for CSS variable resolution
   */
  setTheme(theme: Theme): void {
    this.theme = theme
  }

  /**
   * Resolve CSS variables to actual values
   */
  private resolveValue(value: string): string {
    if (!value.includes('var(')) return value
    if (!this.theme) {
      console.warn('[RESOLVE_VALUE] No theme set, cannot resolve variables:', value)
      return value
    }

    // Standard spacing values (matching common design system)
    const spacingMap: Record<string, string> = {
      '--spacing-section': '4rem',  // 64px
      '--spacing-container': '1.5rem',  // 24px
      '--spacing-2xl': '4rem',  // 64px
      '--spacing-xl': '3rem',  // 48px
      '--spacing-lg': '2rem',  // 32px
      '--spacing-md': '1rem',  // 16px
      '--spacing-sm': '0.5rem',  // 8px
      '--spacing-xs': '0.25rem',  // 4px
    }

    // Text size values
    const textMap: Record<string, string> = {
      '--text-5xl': '4rem',  // 64px
      '--text-4xl': '3.5rem',  // 56px
      '--text-3xl': '3rem',  // 48px
      '--text-2xl': '2rem',  // 32px
      '--text-xl': '1.5rem',  // 24px
      '--text-lg': '1.125rem',  // 18px
      '--text-base': '1rem',  // 16px
      '--text-sm': '0.875rem',  // 14px
      '--text-xs': '0.75rem',  // 12px
    }

    // Button values
    const buttonMap: Record<string, string> = {
      '--btn-py': '0.875rem',  // 14px
      '--btn-px': '2rem',  // 32px
      '--btn-weight': '500',
      '--btn-radius': '0.5rem',  // 8px
    }

    // Radius values
    const radiusMap: Record<string, string> = {
      '--radius-sm': '0.25rem',  // 4px
      '--radius-md': '0.5rem',  // 8px
      '--radius-lg': '0.75rem',  // 12px
      '--radius-xl': '1rem',  // 16px
      '--radius-full': '9999px',
    }

    // Color mappings
    const colorMap: Record<string, string> = {
      '--color-bg': this.theme.colors.background,
      '--color-fg': this.theme.colors.foreground,
      '--color-primary': this.theme.colors.primary,
      '--color-primary-fg': this.theme.colors.primaryForeground,
      '--color-secondary': this.theme.colors.secondary,
      '--color-secondary-fg': this.theme.colors.secondaryForeground,
      '--color-muted': this.theme.colors.muted,
      '--color-muted-fg': this.theme.colors.mutedForeground,
      '--color-accent': this.theme.colors.accent,
      '--color-border': this.theme.colors.border,
      '--color-surface': this.theme.colors.secondary,  // Alias for secondary
    }

    // Font mappings
    const fontMap: Record<string, string> = {
      '--font-heading': this.theme.fonts.heading,
      '--font-body': this.theme.fonts.body,
    }

    // Combine all maps
    const allMappings = {
      ...spacingMap,
      ...textMap,
      ...buttonMap,
      ...radiusMap,
      ...colorMap,
      ...fontMap,
    }

    // Replace all var() references
    let resolved = value
    for (const [varName, varValue] of Object.entries(allMappings)) {
      const varPattern = new RegExp(`var\\(${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g')
      resolved = resolved.replace(varPattern, varValue)
    }

    return resolved
  }

  /**
   * Resolve all values in a styles object
   */
  private resolveStyles(styles: Record<string, string>): Record<string, string> {
    const resolved: Record<string, string> = {}
    for (const [key, value] of Object.entries(styles)) {
      resolved[key] = this.resolveValue(value)
    }
    return resolved
  }

  /**
   * Create a root-level class (e.g., "header_3847")
   */
  createRootClass(prefix: string): string {
    return this.classGen.create(prefix)
  }

  /**
   * Create a child class (e.g., "header_3847_inner")
   */
  createChildClass(parentClass: string, childName: string): string {
    return this.classGen.child(parentClass, childName)
  }

  /**
   * Process an element's styles and register with collector
   * Returns the class name to use in HTML
   */
  processElement(config: ElementStyle): string {
    const { className, tailwindClasses, inlineStyle, additionalStyles } = config

    // Parse Tailwind classes
    const parsed = tailwindClasses
      ? parseTailwindClasses(tailwindClasses)
      : { base: {}, pseudos: {} }

    // Parse inline styles
    const inlineStyles = inlineStyle
      ? parseInlineStyle(inlineStyle)
      : {}

    // Merge all base styles (Tailwind + inline + additional)
    const mergedBase = {
      ...parsed.base,
      ...inlineStyles,
      ...(additionalStyles || {}),
    }

    // Resolve all CSS variables to actual values
    const resolvedBase = this.resolveStyles(mergedBase)

    // Register with collector
    this.cssCollector.addClass(className, resolvedBase)

    // Register pseudo classes (also resolve variables)
    for (const [pseudo, styles] of Object.entries(parsed.pseudos)) {
      const resolvedPseudoStyles = this.resolveStyles(styles)
      this.cssCollector.addPseudoClass(className, pseudo, resolvedPseudoStyles)
    }

    return className
  }

  /**
   * Get generated CSS
   */
  getCSS(): string {
    return this.cssCollector.toCSS()
  }

  /**
   * Reset for new page generation
   */
  reset(): void {
    this.classGen.reset()
    this.cssCollector.reset()
  }
}

// Singleton instance for use across section generators
export const styleExtractor = new StyleExtractor()
