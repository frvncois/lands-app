/**
 * Collects CSS rules during HTML generation and outputs final CSS.
 */

export class CSSCollector {
  private rules: Map<string, Record<string, string>> = new Map()
  private pseudoRules: Map<string, Map<string, Record<string, string>>> = new Map()

  /**
   * Add base styles for a class
   */
  addClass(className: string, styles: Record<string, string>): void {
    const existing = this.rules.get(className) || {}
    this.rules.set(className, { ...existing, ...styles })
  }

  /**
   * Add pseudo-class styles (hover, focus, etc.)
   */
  addPseudoClass(
    className: string,
    pseudo: string,
    styles: Record<string, string>
  ): void {
    if (!this.pseudoRules.has(className)) {
      this.pseudoRules.set(className, new Map())
    }
    const classPseudos = this.pseudoRules.get(className)!
    const existing = classPseudos.get(pseudo) || {}
    classPseudos.set(pseudo, { ...existing, ...styles })
  }

  /**
   * Convert camelCase to kebab-case
   */
  private toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }

  /**
   * Convert styles object to CSS string
   */
  private stylesToCSS(styles: Record<string, string>, indent: string = '  '): string {
    return Object.entries(styles)
      .map(([prop, value]) => `${indent}${this.toKebabCase(prop)}: ${value};`)
      .join('\n')
  }

  /**
   * Generate final CSS output
   */
  toCSS(): string {
    const lines: string[] = []

    // Base rules
    for (const [className, styles] of this.rules) {
      if (Object.keys(styles).length === 0) continue
      lines.push(`.${className} {`)
      lines.push(this.stylesToCSS(styles))
      lines.push('}')
      lines.push('')
    }

    // Pseudo rules
    for (const [className, pseudoMap] of this.pseudoRules) {
      for (const [pseudo, styles] of pseudoMap) {
        if (Object.keys(styles).length === 0) continue
        lines.push(`.${className}:${pseudo} {`)
        lines.push(this.stylesToCSS(styles))
        lines.push('}')
        lines.push('')
      }
    }

    return lines.join('\n')
  }

  /**
   * Reset collector for new page
   */
  reset(): void {
    this.rules.clear()
    this.pseudoRules.clear()
  }
}
