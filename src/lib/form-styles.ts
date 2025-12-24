import type { SectionStyleProperties } from '@/types/sections'

type StyleRecord = Record<string, string>

function toPx(value: unknown): string | undefined {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return `${value}px`
  }
  const parsed = Number(value)
  if (!Number.isNaN(parsed)) {
    return `${parsed}px`
  }
  return undefined
}

export function resolveFormInputStyle(sectionStyles?: SectionStyleProperties): StyleRecord {
  const styles = sectionStyles?.formInput as Record<string, unknown> | undefined
  const result: StyleRecord = { fontFamily: 'var(--font-body)' }

  if (!styles) return result

  if (styles.backgroundColor) result.backgroundColor = String(styles.backgroundColor)
  if (styles.color) result.color = String(styles.color)
  if (styles.borderColor) result.borderColor = String(styles.borderColor)
  const borderWidth = toPx(styles.borderWidth)
  if (borderWidth) result.borderWidth = borderWidth
  const borderRadius = toPx(styles.borderRadius)
  if (borderRadius) result.borderRadius = borderRadius
  const fontSize = toPx(styles.fontSize)
  if (fontSize) result.fontSize = fontSize
  const lineHeight = styles.lineHeight
  if (typeof lineHeight === 'number' || typeof lineHeight === 'string') {
    result.lineHeight = String(lineHeight)
  }
  const padding = toPx(styles.padding)
  if (padding) result.padding = padding

  return result
}

export function resolveFormButtonStyle(sectionStyles?: SectionStyleProperties): StyleRecord {
  const styles = sectionStyles?.formButton as Record<string, unknown> | undefined
  const result: StyleRecord = { fontFamily: 'var(--font-body)', fontWeight: 'var(--btn-weight)' }

  if (!styles) return result

  if (styles.backgroundColor) result.backgroundColor = String(styles.backgroundColor)
  if (styles.color) result.color = String(styles.color)
  const borderRadius = toPx(styles.borderRadius)
  if (borderRadius) result.borderRadius = borderRadius
  const fontSize = toPx(styles.fontSize)
  if (fontSize) result.fontSize = fontSize

  const paddingY = toPx(styles.paddingY)
  const paddingX = toPx(styles.paddingX)
  const padding = toPx(styles.padding)

  if (paddingY) {
    result.paddingTop = paddingY
    result.paddingBottom = paddingY
  }
  if (paddingX) {
    result.paddingLeft = paddingX
    result.paddingRight = paddingX
  }
  if (!paddingX && !paddingY && padding) {
    result.padding = padding
  }

  return result
}
