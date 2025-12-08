import type { BaseBlockStyles, CoreBlockStyles, ViewportSize, Spacing, BorderStyle, ShadowStyle } from '@/types/editor'

// Define local types for this utility
interface StylesWithText extends BaseBlockStyles {
  textColor?: string
  fontSize?: string
  fontWeight?: string
  lineHeight?: string
  textAlign?: string
  aspectRatio?: string
  effect?: string
  align?: string
}

// Convert spacing value to Tailwind class
function spacingToClass(prefix: string, value: string | undefined): string {
  if (!value || value === '0') return ''
  return `${prefix}-[${value}px]`
}

// Convert alignment to Tailwind class
function alignToClass(align: string | undefined): string {
  switch (align) {
    case 'left': return 'items-start'
    case 'center': return 'items-center'
    case 'right': return 'items-end'
    default: return ''
  }
}

// Convert text alignment to Tailwind class
function textAlignToClass(align: string | undefined): string {
  switch (align) {
    case 'left': return 'text-left'
    case 'center': return 'text-center'
    case 'right': return 'text-right'
    default: return ''
  }
}

// Convert font size to Tailwind class
function fontSizeToClass(size: string | undefined): string {
  if (!size) return ''
  return `text-${size}`
}

// Convert font weight to Tailwind class
function fontWeightToClass(weight: string | undefined): string {
  switch (weight) {
    case 'normal': return 'font-normal'
    case 'medium': return 'font-medium'
    case 'semibold': return 'font-semibold'
    case 'bold': return 'font-bold'
    default: return ''
  }
}

// Convert line height to Tailwind class
function lineHeightToClass(lineHeight: string | undefined): string {
  switch (lineHeight) {
    case 'tight': return 'leading-tight'
    case 'normal': return 'leading-normal'
    case 'relaxed': return 'leading-relaxed'
    case 'loose': return 'leading-loose'
    default: return ''
  }
}

// Convert aspect ratio to Tailwind class
function aspectRatioToClass(ratio: string | undefined): string {
  switch (ratio) {
    case '1:1': return 'aspect-square'
    case '4:3': return 'aspect-[4/3]'
    case '3:4': return 'aspect-[3/4]'
    case '16:9': return 'aspect-video'
    case '9:16': return 'aspect-[9/16]'
    default: return ''
  }
}

// Convert effect to animation class
function effectToClass(effect: string | undefined): string {
  switch (effect) {
    case 'fade-in': return 'animate-fade-in'
    case 'slide-up': return 'animate-slide-up'
    case 'slide-down': return 'animate-slide-down'
    case 'scale-in': return 'animate-scale-in'
    default: return ''
  }
}

// Build inline styles for colors and borders
export function buildInlineStyles(styles: StylesWithText): Record<string, string> {
  const inlineStyles: Record<string, string> = {}

  if (styles.backgroundColor) {
    inlineStyles.backgroundColor = styles.backgroundColor
  }

  if ('textColor' in styles && styles.textColor) {
    inlineStyles.color = styles.textColor
  }

  if (styles.border) {
    const borderWidth = styles.border.width && styles.border.width !== '0' ? `${styles.border.width}px` : '0'
    const borderStyle = styles.border.style || 'solid'
    const borderColor = styles.border.color || 'transparent'
    const sides = styles.border.sides?.split(',') || ['top', 'right', 'bottom', 'left']

    if (borderWidth !== '0') {
      // Apply border to specific sides
      if (sides.includes('top')) {
        inlineStyles.borderTopWidth = borderWidth
        inlineStyles.borderTopStyle = borderStyle
        inlineStyles.borderTopColor = borderColor
      }
      if (sides.includes('right')) {
        inlineStyles.borderRightWidth = borderWidth
        inlineStyles.borderRightStyle = borderStyle
        inlineStyles.borderRightColor = borderColor
      }
      if (sides.includes('bottom')) {
        inlineStyles.borderBottomWidth = borderWidth
        inlineStyles.borderBottomStyle = borderStyle
        inlineStyles.borderBottomColor = borderColor
      }
      if (sides.includes('left')) {
        inlineStyles.borderLeftWidth = borderWidth
        inlineStyles.borderLeftStyle = borderStyle
        inlineStyles.borderLeftColor = borderColor
      }
    }
    if (styles.border.radius && styles.border.radius !== '0') {
      inlineStyles.borderRadius = `${styles.border.radius}px`
    }
  }

  if (styles.margin) {
    if (styles.margin.top && styles.margin.top !== '0') {
      inlineStyles.marginTop = `${styles.margin.top}px`
    }
    if (styles.margin.bottom && styles.margin.bottom !== '0') {
      inlineStyles.marginBottom = `${styles.margin.bottom}px`
    }
    if (styles.margin.left && styles.margin.left !== '0') {
      inlineStyles.marginLeft = `${styles.margin.left}px`
    }
    if (styles.margin.right && styles.margin.right !== '0') {
      inlineStyles.marginRight = `${styles.margin.right}px`
    }
  }

  if (styles.padding) {
    if (styles.padding.top && styles.padding.top !== '0') {
      inlineStyles.paddingTop = `${styles.padding.top}px`
    }
    if (styles.padding.bottom && styles.padding.bottom !== '0') {
      inlineStyles.paddingBottom = `${styles.padding.bottom}px`
    }
    if (styles.padding.left && styles.padding.left !== '0') {
      inlineStyles.paddingLeft = `${styles.padding.left}px`
    }
    if (styles.padding.right && styles.padding.right !== '0') {
      inlineStyles.paddingRight = `${styles.padding.right}px`
    }
  }

  return inlineStyles
}

// Build Tailwind classes for block item
export function buildItemClasses(styles: StylesWithText): string {
  const classes: string[] = []

  // Text styles
  if (styles.fontSize) classes.push(fontSizeToClass(styles.fontSize))
  if (styles.fontWeight) classes.push(fontWeightToClass(styles.fontWeight))
  if (styles.lineHeight) classes.push(lineHeightToClass(styles.lineHeight))
  if (styles.textAlign) classes.push(textAlignToClass(styles.textAlign))

  // Aspect ratio
  if (styles.aspectRatio && styles.aspectRatio !== 'auto') {
    classes.push(aspectRatioToClass(styles.aspectRatio))
  }

  // Effect
  if (styles.effect && styles.effect !== 'none') {
    classes.push(effectToClass(styles.effect))
  }

  return classes.filter(Boolean).join(' ')
}

// Build Tailwind classes for section block
export function buildSectionClasses(styles: StylesWithText): string {
  const classes: string[] = ['flex', 'flex-col']

  // Alignment
  if (styles.align) classes.push(alignToClass(styles.align))

  // Effect
  if (styles.effect && styles.effect !== 'none') {
    classes.push(effectToClass(styles.effect))
  }

  return classes.filter(Boolean).join(' ')
}

// Get justify class for item alignment within section
export function getJustifyClass(align: string | undefined): string {
  switch (align) {
    case 'left': return 'justify-start'
    case 'center': return 'justify-center'
    case 'right': return 'justify-end'
    default: return 'justify-start'
  }
}

// Get self alignment class for individual items
export function getSelfAlignClass(align: string | undefined): string {
  switch (align) {
    case 'left': return 'self-start'
    case 'center': return 'self-center'
    case 'right': return 'self-end'
    default: return ''
  }
}

// ============================================
// RESPONSIVE STYLE UTILITIES
// ============================================

/**
 * Deep merge two objects, with source values overriding target values
 */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (sourceValue === undefined) {
      continue
    }

    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      // Recursively merge nested objects
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[Extract<keyof T, string>]
    } else {
      // Override with source value
      result[key] = sourceValue as T[Extract<keyof T, string>]
    }
  }

  return result
}

/**
 * Get the effective styles for a given viewport.
 * Implements the cascade: Desktop → Tablet → Mobile
 * - Desktop: uses base styles only
 * - Tablet: merges base with tablet overrides
 * - Mobile: merges base with tablet, then mobile overrides
 */
export function getResponsiveStyles(
  styles: BaseBlockStyles | undefined,
  viewport: ViewportSize
): CoreBlockStyles {
  if (!styles) return {}

  // Extract core styles (without tablet/mobile overrides)
  const { tablet, mobile, animation, ...baseStyles } = styles

  if (viewport === 'desktop') {
    return baseStyles
  }

  if (viewport === 'tablet') {
    // Tablet inherits from desktop, then applies tablet overrides
    return tablet ? deepMerge(baseStyles, tablet) : baseStyles
  }

  // Mobile: cascade desktop → tablet → mobile
  let result = baseStyles
  if (tablet) {
    result = deepMerge(result, tablet)
  }
  if (mobile) {
    result = deepMerge(result, mobile)
  }

  return result
}

/**
 * Get the styles object for a specific viewport (for editing in inspector).
 * Returns only the overrides for that viewport, not the merged result.
 */
export function getViewportStyleOverrides(
  styles: BaseBlockStyles | undefined,
  viewport: ViewportSize
): Partial<CoreBlockStyles> {
  if (!styles) return {}

  if (viewport === 'desktop') {
    // Return base styles (without responsive keys)
    const { tablet, mobile, animation, ...baseStyles } = styles
    return baseStyles
  }

  if (viewport === 'tablet') {
    return styles.tablet || {}
  }

  return styles.mobile || {}
}

/**
 * Update styles for a specific viewport.
 * For desktop, updates the base styles.
 * For tablet/mobile, updates only the overrides.
 */
export function setViewportStyleOverrides(
  currentStyles: BaseBlockStyles,
  viewport: ViewportSize,
  updates: Partial<CoreBlockStyles>
): BaseBlockStyles {
  if (viewport === 'desktop') {
    // Merge updates into base styles (preserve tablet/mobile)
    const { tablet, mobile, animation } = currentStyles
    return {
      ...currentStyles,
      ...updates,
      tablet,
      mobile,
      animation,
    }
  }

  if (viewport === 'tablet') {
    return {
      ...currentStyles,
      tablet: {
        ...currentStyles.tablet,
        ...updates,
      },
    }
  }

  // Mobile
  return {
    ...currentStyles,
    mobile: {
      ...currentStyles.mobile,
      ...updates,
    },
  }
}

/**
 * Check if a specific style property has an override for the given viewport
 */
export function hasViewportOverride(
  styles: BaseBlockStyles | undefined,
  viewport: ViewportSize,
  property: keyof CoreBlockStyles
): boolean {
  if (!styles || viewport === 'desktop') return false

  if (viewport === 'tablet') {
    return styles.tablet?.[property] !== undefined
  }

  return styles.mobile?.[property] !== undefined
}

/**
 * Remove a style override for a specific viewport
 * This causes the property to inherit from the parent viewport
 */
export function removeViewportOverride(
  currentStyles: BaseBlockStyles,
  viewport: ViewportSize,
  property: keyof CoreBlockStyles
): BaseBlockStyles {
  if (viewport === 'desktop') {
    // Can't remove desktop - it's the base
    return currentStyles
  }

  if (viewport === 'tablet' && currentStyles.tablet) {
    const { [property]: _, ...rest } = currentStyles.tablet
    return {
      ...currentStyles,
      tablet: Object.keys(rest).length > 0 ? rest : undefined,
    }
  }

  if (viewport === 'mobile' && currentStyles.mobile) {
    const { [property]: _, ...rest } = currentStyles.mobile
    return {
      ...currentStyles,
      mobile: Object.keys(rest).length > 0 ? rest : undefined,
    }
  }

  return currentStyles
}

/**
 * Get the inherited value for a property at a given viewport.
 * Useful for showing what value will be used if no override is set.
 */
export function getInheritedValue<K extends keyof CoreBlockStyles>(
  styles: BaseBlockStyles | undefined,
  viewport: ViewportSize,
  property: K
): CoreBlockStyles[K] | undefined {
  if (!styles) return undefined

  const { tablet, mobile, animation, ...baseStyles } = styles

  if (viewport === 'desktop') {
    return baseStyles[property]
  }

  if (viewport === 'tablet') {
    // Inherit from desktop
    return baseStyles[property]
  }

  // Mobile: inherit from tablet if set, otherwise from desktop
  return tablet?.[property] ?? baseStyles[property]
}
