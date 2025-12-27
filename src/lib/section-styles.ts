/**
 * SECTION STYLES UTILITY
 *
 * Canonical style resolver for all section components.
 * Provides consistent field and section style resolution.
 */

import type {
  FieldStyles,
  FieldStyleProperties,
  SectionStyleProperties,
  ItemStyleProperties,
  RepeaterStyleKey,
} from '@/types/sections'

export interface RepeaterGroupStyles {
  spaceBetween?: number
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
}

type RepeaterStyleSuffix = 'SpaceBetween' | 'BackgroundColor' | 'BorderColor' | 'BorderWidth'

export function normalizeRepeaterStylePrefix(fieldKey: string): string {
  return fieldKey
    .split('.')
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('')
}

export function getRepeaterStylePropertyKey(fieldKey: string, suffix: RepeaterStyleSuffix): RepeaterStyleKey {
  return `${normalizeRepeaterStylePrefix(fieldKey)}${suffix}` as RepeaterStyleKey
}

export function resolveRepeaterGroupStyles(
  sectionStyles: SectionStyleProperties | undefined,
  fieldKey: string
): RepeaterGroupStyles {
  if (!sectionStyles) return {}
  const prefix = normalizeRepeaterStylePrefix(fieldKey)

  const getNumber = (suffix: RepeaterStyleSuffix): number | undefined => {
    const value = sectionStyles[`${prefix}${suffix}`]
    return typeof value === 'number' ? value : undefined
  }

  const getString = (suffix: RepeaterStyleSuffix): string | undefined => {
    const value = sectionStyles[`${prefix}${suffix}`]
    return typeof value === 'string' ? value : undefined
  }

  return {
    spaceBetween: getNumber('SpaceBetween'),
    backgroundColor: getString('BackgroundColor'),
    borderColor: getString('BorderColor'),
    borderWidth: getNumber('BorderWidth'),
  }
}

/**
 * Resolve field styles for a given field path
 * Supports both top-level fields (e.g., "headline") and repeater fields (e.g., "items.0.headline")
 */
export function resolveFieldStyles(
  fieldStyles: FieldStyles | undefined,
  fieldPath: string
): FieldStyleProperties {
  if (!fieldStyles) return {}
  return fieldStyles[fieldPath] || {}
}

/**
 * Convert text/richText field styles to CSS style object
 */
export function textStyleToCss(
  styles: FieldStyleProperties,
  defaultFont: string = '--font-body'
): Record<string, string> {
  const result: Record<string, string> = { fontFamily: `var(${defaultFont})` }

  if (styles.fontSize) result.fontSize = `${styles.fontSize}px`
  if (styles.lineHeight) result.lineHeight = String(styles.lineHeight)
  if (styles.color) result.color = styles.color
  if (styles.spacingY !== undefined) {
    result.marginTop = `${styles.spacingY}px`
    result.marginBottom = `${styles.spacingY}px`
  }
  if (styles.spacingX !== undefined) {
    result.marginLeft = `${styles.spacingX}px`
    result.marginRight = `${styles.spacingX}px`
  }

  return result
}

/**
 * Convert button/link field styles to CSS style object
 */
export function buttonStyleToCss(
  styles: FieldStyleProperties,
  defaultFont: string = '--font-body'
): Record<string, string> {
  const result: Record<string, string> = { fontFamily: `var(${defaultFont})` }

  if (styles.fontSize) result.fontSize = `${styles.fontSize}px`
  if (styles.backgroundColor) result.backgroundColor = styles.backgroundColor
  if (styles.color) result.color = styles.color
  if (styles.borderRadius !== undefined) result.borderRadius = `${styles.borderRadius}px`
  if (styles.spacingX !== undefined) {
    result.paddingLeft = `${styles.spacingX}px`
    result.paddingRight = `${styles.spacingX}px`
  }
  if (styles.spacingY !== undefined) {
    result.paddingTop = `${styles.spacingY}px`
    result.paddingBottom = `${styles.spacingY}px`
  }
  // Button border styles
  if (styles.borderWidth !== undefined && styles.borderWidth > 0) {
    result.borderStyle = 'solid'
    result.borderWidth = `${styles.borderWidth}px`
    if (styles.borderColor) {
      result.borderColor = styles.borderColor
    }
  }

  return result
}

/**
 * Convert image field styles to CSS style object
 */
export function imageStyleToCss(styles: FieldStyleProperties): Record<string, string> {
  const result: Record<string, string> = {}

  if (styles.width) {
    result.width = `${styles.width}px`
    result.height = 'auto'
  }
  if (styles.borderRadius !== undefined) result.borderRadius = `${styles.borderRadius}px`
  if (styles.spacingY !== undefined) {
    result.marginTop = `${styles.spacingY}px`
    result.marginBottom = `${styles.spacingY}px`
  }
  if (styles.spacingX !== undefined) {
    result.marginLeft = `${styles.spacingX}px`
    result.marginRight = `${styles.spacingX}px`
  }

  return result
}

/**
 * Convert media field styles to CSS style object
 */
export function mediaStyleToCss(styles: FieldStyleProperties): Record<string, string> {
  const result: Record<string, string> = {}

  if (styles.borderRadius !== undefined) result.borderRadius = `${styles.borderRadius}px`
  if (styles.spacingY !== undefined) {
    result.marginTop = `${styles.spacingY}px`
    result.marginBottom = `${styles.spacingY}px`
  }
  if (styles.spacingX !== undefined) {
    result.marginLeft = `${styles.spacingX}px`
    result.marginRight = `${styles.spacingX}px`
  }

  return result
}

/**
 * Resolve section-level styles to CSS style object
 */
export function resolveSectionStyles(
  sectionStyles: SectionStyleProperties | undefined
): Record<string, string> {
  if (!sectionStyles) return {}

  const result: Record<string, string> = {}
  if (sectionStyles.backgroundColor) result.backgroundColor = sectionStyles.backgroundColor
  if (sectionStyles.spacingY !== undefined) {
    result.paddingTop = `${sectionStyles.spacingY}px`
    result.paddingBottom = `${sectionStyles.spacingY}px`
  }
  if (sectionStyles.spacingX !== undefined) {
    result.paddingLeft = `${sectionStyles.spacingX}px`
    result.paddingRight = `${sectionStyles.spacingX}px`
  }

  return result
}

interface SectionButtonStyleConfig {
  widthKey: string
  fontSizeKey: string
  paddingXKey: string
  paddingYKey: string
  radiusKey: string
  backgroundColorKey: string
  textColorKey: string
  defaults?: {
    width?: 'auto' | 'full'
    fontSize?: number
    paddingX?: number
    paddingY?: number
    radius?: number
    backgroundColor?: string
    textColor?: string
  }
}

export function resolveSectionButtonStyles(
  sectionStyles: SectionStyleProperties | undefined,
  config: SectionButtonStyleConfig
): { width: 'auto' | 'full'; style: Record<string, string> } {
  const styles = sectionStyles ?? {}

  const width = (styles[config.widthKey] as 'auto' | 'full' | undefined) ?? config.defaults?.width ?? 'auto'
  const fontSize = (styles[config.fontSizeKey] as number | undefined) ?? config.defaults?.fontSize ?? 14
  const paddingX = (styles[config.paddingXKey] as number | undefined) ?? config.defaults?.paddingX ?? 16
  const paddingY = (styles[config.paddingYKey] as number | undefined) ?? config.defaults?.paddingY ?? 10
  const radius = (styles[config.radiusKey] as number | undefined) ?? config.defaults?.radius ?? 8
  const backgroundColor =
    (styles[config.backgroundColorKey] as string | undefined) ?? config.defaults?.backgroundColor ?? 'var(--color-primary)'
  const textColor =
    (styles[config.textColorKey] as string | undefined) ?? config.defaults?.textColor ?? 'var(--color-primary-fg)'

  const style: Record<string, string> = {
    fontSize: `${fontSize}px`,
    padding: `${paddingY}px ${paddingX}px`,
    borderRadius: `${radius}px`,
    backgroundColor,
    color: textColor,
    width: width === 'full' ? '100%' : 'auto',
    border: 'none',
  }

  return {
    width,
    style,
  }
}

/**
 * Helper to get text field style for a given path
 */
export function getTextStyle(
  fieldStyles: FieldStyles | undefined,
  fieldPath: string,
  defaultFont: string = '--font-body'
): Record<string, string> {
  const styles = resolveFieldStyles(fieldStyles, fieldPath)
  return textStyleToCss(styles, defaultFont)
}

/**
 * Helper to get button field style for a given path
 */
export function getButtonStyle(
  fieldStyles: FieldStyles | undefined,
  fieldPath: string,
  defaultFont: string = '--font-body'
): Record<string, string> {
  const styles = resolveFieldStyles(fieldStyles, fieldPath)
  return buttonStyleToCss(styles, defaultFont)
}

/**
 * Helper to get image field style for a given path
 */
export function getImageStyle(
  fieldStyles: FieldStyles | undefined,
  fieldPath: string
): Record<string, string> {
  const styles = resolveFieldStyles(fieldStyles, fieldPath)
  return imageStyleToCss(styles)
}

/**
 * Helper to get media field style for a given path
 */
export function getMediaStyle(
  fieldStyles: FieldStyles | undefined,
  fieldPath: string
): Record<string, string> {
  const styles = resolveFieldStyles(fieldStyles, fieldPath)
  return mediaStyleToCss(styles)
}

// ============================================
// ITEM STYLE HELPERS
// ============================================

export function resolveItemTypographyStyles(
  itemStyles: ItemStyleProperties | undefined,
  defaultFont: string = '--font-body'
): Record<string, string> {
  const result: Record<string, string> = { fontFamily: `var(${defaultFont})` }

  if (!itemStyles) return result

  if (itemStyles.fontSize) result.fontSize = `${itemStyles.fontSize}px`
  if (itemStyles.lineHeight) result.lineHeight = String(itemStyles.lineHeight)
  if (itemStyles.color) result.color = itemStyles.color
  return result
}

export function resolveItemPaddingStyles(itemStyles: ItemStyleProperties | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  if (!itemStyles) return result

  if (itemStyles.spacingX !== undefined) {
    result.paddingLeft = `${itemStyles.spacingX}px`
    result.paddingRight = `${itemStyles.spacingX}px`
  }
  if (itemStyles.spacingY !== undefined) {
    result.paddingTop = `${itemStyles.spacingY}px`
    result.paddingBottom = `${itemStyles.spacingY}px`
  }
  return result
}

interface ItemContainerOptions {
  includePadding?: boolean
  groupStyles?: RepeaterGroupStyles
}

export function resolveItemContainerStyles(
  itemStyles: ItemStyleProperties | undefined,
  options: ItemContainerOptions = {}
): Record<string, string> {
  const result: Record<string, string> = {}
  const group = options.groupStyles || {}

  const backgroundColor = itemStyles?.backgroundColor ?? group.backgroundColor
  if (backgroundColor) {
    result.backgroundColor = backgroundColor
  }

  if (itemStyles?.borderRadius !== undefined) {
    result.borderRadius = `${itemStyles.borderRadius}px`
  }

  const borderWidth = itemStyles?.borderWidth ?? group.borderWidth
  const borderColor = itemStyles?.borderColor ?? group.borderColor
  if (borderWidth !== undefined && borderWidth > 0) {
    result.borderWidth = `${borderWidth}px`
    result.borderStyle = 'solid'
    if (borderColor) {
      result.borderColor = borderColor
    }
  }

  if (itemStyles?.boxShadow) result.boxShadow = itemStyles.boxShadow

  if (options.includePadding !== false && itemStyles) {
    Object.assign(result, resolveItemPaddingStyles(itemStyles))
  }

  return result
}

// ============================================
// SHARED CARD STYLES (section-level, applies to ALL cards)
// ============================================

export type CardMediaAspect = 'square' | 'portrait' | 'paysage'

/**
 * Get aspect ratio CSS value from mediaAspect option
 */
export function getCardMediaAspectRatio(aspect: CardMediaAspect | undefined): string {
  switch (aspect) {
    case 'square': return '1 / 1'
    case 'portrait': return '3 / 4'
    case 'paysage': return '4 / 3'
    default: return '16 / 9'
  }
}

/**
 * Resolve shared card container styles from sectionStyles
 */
export function resolveSharedCardContainerStyles(sectionStyles: SectionStyleProperties | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  if (!sectionStyles) return result

  const styles = sectionStyles as Record<string, unknown>

  if (styles.cardPaddingX !== undefined) {
    result.paddingLeft = `${styles.cardPaddingX}px`
    result.paddingRight = `${styles.cardPaddingX}px`
  }
  if (styles.cardPaddingY !== undefined) {
    result.paddingTop = `${styles.cardPaddingY}px`
    result.paddingBottom = `${styles.cardPaddingY}px`
  }
  if (styles.cardBackgroundColor) {
    result.backgroundColor = styles.cardBackgroundColor as string
  }
  // Card border styles (shared across all cards)
  if (styles.cardBorderWidth !== undefined && (styles.cardBorderWidth as number) > 0) {
    result.borderWidth = `${styles.cardBorderWidth}px`
    result.borderStyle = 'solid'
    if (styles.cardBorderColor) {
      result.borderColor = styles.cardBorderColor as string
    }
  }
  // Card border radius (shared across all cards)
  if (styles.cardRadius !== undefined) {
    result.borderRadius = `${styles.cardRadius}px`
  }

  return result
}

/**
 * Resolve shared card inner gap from sectionStyles
 */
export function resolveSharedCardInnerGap(sectionStyles: SectionStyleProperties | undefined): string {
  const styles = sectionStyles as Record<string, unknown> | undefined
  const gap = styles?.cardInnerSpaceBetween
  return gap !== undefined ? `${gap}px` : 'var(--spacing-xs)'
}

/**
 * Resolve shared card media styles from sectionStyles
 */
export function resolveSharedCardMediaStyles(sectionStyles: SectionStyleProperties | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  if (!sectionStyles) return result

  const styles = sectionStyles as Record<string, unknown>

  if (styles.cardMediaRadius !== undefined) {
    result.borderRadius = `${styles.cardMediaRadius}px`
  }
  if (styles.cardMediaAspect) {
    result.aspectRatio = getCardMediaAspectRatio(styles.cardMediaAspect as CardMediaAspect)
  }

  return result
}

/**
 * Resolve shared card text field styles (headline, subheadline, paragraph)
 */
export function resolveSharedCardTextStyles(
  sectionStyles: SectionStyleProperties | undefined,
  fieldType: 'Headline' | 'Subheadline' | 'Paragraph',
  defaultFont: string = '--font-body'
): Record<string, string> {
  const result: Record<string, string> = { fontFamily: `var(${defaultFont})` }
  if (!sectionStyles) return result

  const styles = sectionStyles as Record<string, unknown>
  const fontSizeKey = `card${fieldType}FontSize`
  const paddingXKey = `card${fieldType}PaddingX`
  const paddingYKey = `card${fieldType}PaddingY`
  const colorKey = `card${fieldType}TextColor`

  if (styles[fontSizeKey] !== undefined) {
    result.fontSize = `${styles[fontSizeKey]}px`
  }
  if (styles[paddingXKey] !== undefined) {
    result.marginLeft = `${styles[paddingXKey]}px`
    result.marginRight = `${styles[paddingXKey]}px`
  }
  if (styles[paddingYKey] !== undefined) {
    result.marginTop = `${styles[paddingYKey]}px`
    result.marginBottom = `${styles[paddingYKey]}px`
  }
  if (styles[colorKey]) {
    result.color = styles[colorKey] as string
  }

  return result
}

/**
 * Resolve shared card button styles from sectionStyles
 */
export function resolveSharedCardButtonStyles(sectionStyles: SectionStyleProperties | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  if (!sectionStyles) return result

  const styles = sectionStyles as Record<string, unknown>

  if (styles.cardButtonFontSize !== undefined) {
    result.fontSize = `${styles.cardButtonFontSize}px`
  }
  if (styles.cardButtonPaddingX !== undefined) {
    result.paddingLeft = `${styles.cardButtonPaddingX}px`
    result.paddingRight = `${styles.cardButtonPaddingX}px`
  }
  if (styles.cardButtonPaddingY !== undefined) {
    result.paddingTop = `${styles.cardButtonPaddingY}px`
    result.paddingBottom = `${styles.cardButtonPaddingY}px`
  }
  if (styles.cardButtonRadius !== undefined) {
    result.borderRadius = `${styles.cardButtonRadius}px`
  }
  if (styles.cardButtonBorderWidth !== undefined && (styles.cardButtonBorderWidth as number) > 0) {
    result.borderWidth = `${styles.cardButtonBorderWidth}px`
    result.borderStyle = 'solid'
    if (styles.cardButtonBorderColor) {
      result.borderColor = styles.cardButtonBorderColor as string
    }
  }
  if (styles.cardButtonTextColor) {
    result.color = styles.cardButtonTextColor as string
  }
  if (styles.cardButtonBackgroundColor) {
    result.backgroundColor = styles.cardButtonBackgroundColor as string
  }

  return result
}

// ============================================
// SHARED PRODUCT STYLES (section-level, applies to ALL products)
// ============================================

export type ProductMediaAspect = 'square' | 'portrait' | 'paysage'

/**
 * Get aspect ratio CSS value from mediaAspect option
 */
export function getProductMediaAspectRatio(aspect: ProductMediaAspect | undefined): string {
  switch (aspect) {
    case 'square': return '1 / 1'
    case 'portrait': return '3 / 4'
    case 'paysage': return '4 / 3'
    default: return '1 / 1' // Products default to square
  }
}

/**
 * Resolve shared product container styles from sectionStyles
 */
export function resolveSharedProductContainerStyles(sectionStyles: SectionStyleProperties | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  if (!sectionStyles) return result

  const styles = sectionStyles as Record<string, unknown>

  if (styles.productPaddingX !== undefined) {
    result.paddingLeft = `${styles.productPaddingX}px`
    result.paddingRight = `${styles.productPaddingX}px`
  }
  if (styles.productPaddingY !== undefined) {
    result.paddingTop = `${styles.productPaddingY}px`
    result.paddingBottom = `${styles.productPaddingY}px`
  }
  if (styles.productBackgroundColor) {
    result.backgroundColor = styles.productBackgroundColor as string
  }
  // Product border styles (shared across all products)
  if (styles.productBorderWidth !== undefined && (styles.productBorderWidth as number) > 0) {
    result.borderWidth = `${styles.productBorderWidth}px`
    result.borderStyle = 'solid'
    if (styles.productBorderColor) {
      result.borderColor = styles.productBorderColor as string
    }
  }
  // Product border radius (shared across all products)
  if (styles.productRadius !== undefined) {
    result.borderRadius = `${styles.productRadius}px`
  }

  return result
}

/**
 * Resolve shared product inner gap from sectionStyles
 */
export function resolveSharedProductInnerGap(sectionStyles: SectionStyleProperties | undefined): string {
  const styles = sectionStyles as Record<string, unknown> | undefined
  const gap = styles?.productInnerSpaceBetween
  return gap !== undefined ? `${gap}px` : 'var(--spacing-xs)'
}

/**
 * Resolve shared product media styles from sectionStyles
 */
export function resolveSharedProductMediaStyles(sectionStyles: SectionStyleProperties | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  if (!sectionStyles) return result

  const styles = sectionStyles as Record<string, unknown>

  if (styles.productMediaRadius !== undefined) {
    result.borderRadius = `${styles.productMediaRadius}px`
  }
  if (styles.productMediaAspect) {
    result.aspectRatio = getProductMediaAspectRatio(styles.productMediaAspect as ProductMediaAspect)
  }

  return result
}

/**
 * Resolve shared product text field styles (headline, subheadline, paragraph)
 */
export function resolveSharedProductTextStyles(
  sectionStyles: SectionStyleProperties | undefined,
  fieldType: 'Headline' | 'Subheadline' | 'Paragraph',
  defaultFont: string = '--font-body'
): Record<string, string> {
  const result: Record<string, string> = { fontFamily: `var(${defaultFont})` }
  if (!sectionStyles) return result

  const styles = sectionStyles as Record<string, unknown>
  const fontSizeKey = `product${fieldType}FontSize`
  const paddingXKey = `product${fieldType}PaddingX`
  const paddingYKey = `product${fieldType}PaddingY`
  const colorKey = `product${fieldType}TextColor`

  if (styles[fontSizeKey] !== undefined) {
    result.fontSize = `${styles[fontSizeKey]}px`
  }
  if (styles[paddingXKey] !== undefined) {
    result.marginLeft = `${styles[paddingXKey]}px`
    result.marginRight = `${styles[paddingXKey]}px`
  }
  if (styles[paddingYKey] !== undefined) {
    result.marginTop = `${styles[paddingYKey]}px`
    result.marginBottom = `${styles[paddingYKey]}px`
  }
  if (styles[colorKey]) {
    result.color = styles[colorKey] as string
  }

  return result
}

/**
 * Resolve shared product button styles from sectionStyles
 */
export function resolveSharedProductButtonStyles(sectionStyles: SectionStyleProperties | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  if (!sectionStyles) return result

  const styles = sectionStyles as Record<string, unknown>

  if (styles.productButtonFontSize !== undefined) {
    result.fontSize = `${styles.productButtonFontSize}px`
  }
  if (styles.productButtonPaddingX !== undefined) {
    result.paddingLeft = `${styles.productButtonPaddingX}px`
    result.paddingRight = `${styles.productButtonPaddingX}px`
  }
  if (styles.productButtonPaddingY !== undefined) {
    result.paddingTop = `${styles.productButtonPaddingY}px`
    result.paddingBottom = `${styles.productButtonPaddingY}px`
  }
  if (styles.productButtonRadius !== undefined) {
    result.borderRadius = `${styles.productButtonRadius}px`
  }
  if (styles.productButtonBorderWidth !== undefined && (styles.productButtonBorderWidth as number) > 0) {
    result.borderWidth = `${styles.productButtonBorderWidth}px`
    result.borderStyle = 'solid'
    if (styles.productButtonBorderColor) {
      result.borderColor = styles.productButtonBorderColor as string
    }
  }
  if (styles.productButtonTextColor) {
    result.color = styles.productButtonTextColor as string
  }
  if (styles.productButtonBackgroundColor) {
    result.backgroundColor = styles.productButtonBackgroundColor as string
  }

  return result
}

// ============================================
// SHARED ACCORDION STYLES (section-level, applies to ALL accordion items)
// ============================================

/**
 * Resolve shared accordion item container styles from sectionStyles
 */
export function resolveSharedAccordionContainerStyles(sectionStyles: SectionStyleProperties | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  if (!sectionStyles) return result

  const styles = sectionStyles as Record<string, unknown>

  if (styles.accordionPaddingX !== undefined) {
    result.paddingLeft = `${styles.accordionPaddingX}px`
    result.paddingRight = `${styles.accordionPaddingX}px`
  }
  if (styles.accordionPaddingY !== undefined) {
    result.paddingTop = `${styles.accordionPaddingY}px`
    result.paddingBottom = `${styles.accordionPaddingY}px`
  }
  if (styles.accordionBackgroundColor) {
    result.backgroundColor = styles.accordionBackgroundColor as string
  }
  if (styles.accordionBorderWidth !== undefined && (styles.accordionBorderWidth as number) > 0) {
    result.borderWidth = `${styles.accordionBorderWidth}px`
    result.borderStyle = 'solid'
    if (styles.accordionBorderColor) {
      result.borderColor = styles.accordionBorderColor as string
    }
  }
  if (styles.accordionRadius !== undefined) {
    result.borderRadius = `${styles.accordionRadius}px`
  }

  return result
}

/**
 * Resolve shared accordion text styles from sectionStyles
 */
export function resolveSharedAccordionTextStyles(
  sectionStyles: SectionStyleProperties | undefined,
  fieldType: 'Headline' | 'Content',
  defaultFont: string = '--font-body'
): Record<string, string> {
  const result: Record<string, string> = { fontFamily: `var(${defaultFont})` }
  if (!sectionStyles) return result

  const styles = sectionStyles as Record<string, unknown>
  const fontSizeKey = `accordion${fieldType}FontSize`
  const colorKey = `accordion${fieldType}TextColor`

  if (styles[fontSizeKey] !== undefined) {
    result.fontSize = `${styles[fontSizeKey]}px`
  }
  if (styles[colorKey]) {
    result.color = styles[colorKey] as string
  }

  return result
}

// ============================================
// SHARED LINKS STYLES (section-level, applies to ALL link items)
// ============================================

/**
 * Resolve shared link item container styles from sectionStyles
 */
export function resolveSharedLinkContainerStyles(sectionStyles: SectionStyleProperties | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  if (!sectionStyles) return result

  const styles = sectionStyles as Record<string, unknown>

  if (styles.linkPaddingX !== undefined) {
    result.paddingLeft = `${styles.linkPaddingX}px`
    result.paddingRight = `${styles.linkPaddingX}px`
  }
  if (styles.linkPaddingY !== undefined) {
    result.paddingTop = `${styles.linkPaddingY}px`
    result.paddingBottom = `${styles.linkPaddingY}px`
  }
  if (styles.linkBackgroundColor) {
    result.backgroundColor = styles.linkBackgroundColor as string
  }
  if (styles.linkBorderWidth !== undefined && (styles.linkBorderWidth as number) > 0) {
    result.borderWidth = `${styles.linkBorderWidth}px`
    result.borderStyle = 'solid'
    if (styles.linkBorderColor) {
      result.borderColor = styles.linkBorderColor as string
    }
  }
  if (styles.linkRadius !== undefined) {
    result.borderRadius = `${styles.linkRadius}px`
  }

  return result
}

/**
 * Resolve shared link text styles from sectionStyles
 */
export function resolveSharedLinkTextStyles(
  sectionStyles: SectionStyleProperties | undefined,
  fieldType: 'Label' | 'Description',
  defaultFont: string = '--font-body'
): Record<string, string> {
  const result: Record<string, string> = { fontFamily: `var(${defaultFont})` }
  if (!sectionStyles) return result

  const styles = sectionStyles as Record<string, unknown>
  const fontSizeKey = `link${fieldType}FontSize`
  const colorKey = `link${fieldType}TextColor`

  if (styles[fontSizeKey] !== undefined) {
    result.fontSize = `${styles[fontSizeKey]}px`
  }
  if (styles[colorKey]) {
    result.color = styles[colorKey] as string
  }

  return result
}

// ============================================
// CONTACT FORM INPUT STYLES (Group Children)
// ============================================

/**
 * Resolve shared styles for Contact form inputs
 * Applied to all form fields from sectionStyles
 */
export function resolveSharedFormInputStyles(sectionStyles: SectionStyleProperties | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  if (!sectionStyles) return result

  const styles = sectionStyles as Record<string, unknown>

  if (styles.formInputPaddingX !== undefined) {
    result.paddingLeft = `${styles.formInputPaddingX}px`
    result.paddingRight = `${styles.formInputPaddingX}px`
  }
  if (styles.formInputPaddingY !== undefined) {
    result.paddingTop = `${styles.formInputPaddingY}px`
    result.paddingBottom = `${styles.formInputPaddingY}px`
  }
  if (styles.formInputBackgroundColor) {
    result.backgroundColor = styles.formInputBackgroundColor as string
  }
  if (styles.formInputBorderWidth !== undefined && (styles.formInputBorderWidth as number) > 0) {
    result.borderWidth = `${styles.formInputBorderWidth}px`
    result.borderStyle = 'solid'
    if (styles.formInputBorderColor) {
      result.borderColor = styles.formInputBorderColor as string
    }
  }
  if (styles.formInputRadius !== undefined) {
    result.borderRadius = `${styles.formInputRadius}px`
  }
  if (styles.formInputFontSize !== undefined) {
    result.fontSize = `${styles.formInputFontSize}px`
  }
  if (styles.formInputTextColor) {
    result.color = styles.formInputTextColor as string
  }

  return result
}
