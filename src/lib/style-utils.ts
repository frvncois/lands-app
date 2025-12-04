import type { BlockItemStyles, SectionBlockStyles } from '@/types/editor'

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
export function buildInlineStyles(styles: BlockItemStyles | SectionBlockStyles): Record<string, string> {
  const inlineStyles: Record<string, string> = {}

  if (styles.backgroundColor) {
    inlineStyles.backgroundColor = styles.backgroundColor
  }

  if ('textColor' in styles && styles.textColor) {
    inlineStyles.color = styles.textColor
  }

  if (styles.border) {
    if (styles.border.size && styles.border.size !== '0') {
      inlineStyles.borderWidth = `${styles.border.size}px`
      inlineStyles.borderStyle = 'solid'
    }
    if (styles.border.color) {
      inlineStyles.borderColor = styles.border.color
    }
    if (styles.border.radius) {
      inlineStyles.borderRadius = `${styles.border.radius}px`
    }
  }

  if (styles.margin) {
    if (styles.margin.y && styles.margin.y !== '0') {
      inlineStyles.marginTop = `${styles.margin.y}px`
      inlineStyles.marginBottom = `${styles.margin.y}px`
    }
    if (styles.margin.x && styles.margin.x !== '0') {
      inlineStyles.marginLeft = `${styles.margin.x}px`
      inlineStyles.marginRight = `${styles.margin.x}px`
    }
  }

  if (styles.padding) {
    if (styles.padding.y && styles.padding.y !== '0') {
      inlineStyles.paddingTop = `${styles.padding.y}px`
      inlineStyles.paddingBottom = `${styles.padding.y}px`
    }
    if (styles.padding.x && styles.padding.x !== '0') {
      inlineStyles.paddingLeft = `${styles.padding.x}px`
      inlineStyles.paddingRight = `${styles.padding.x}px`
    }
  }

  return inlineStyles
}

// Build Tailwind classes for block item
export function buildItemClasses(styles: BlockItemStyles): string {
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
export function buildSectionClasses(styles: SectionBlockStyles): string {
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
