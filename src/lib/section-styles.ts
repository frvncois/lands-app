/**
 * SECTION STYLES UTILITY
 *
 * Canonical style resolver for all section components.
 * Provides consistent field and section style resolution.
 */

import type { FieldStyles, FieldStyleProperties, SectionStyleProperties } from '@/types/sections'

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
