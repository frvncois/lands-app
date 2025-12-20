/**
 * AI Context Analyzer
 * Extracts project branding, styles, and patterns for AI consistency
 */

import type { SectionBlock, PageSettings } from '@/types/designer'

export interface ProjectContext {
  branding: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    backgroundColor: string
    textColor: string
    fontFamily: string
  }
  stylePatterns: {
    commonPadding: string[]
    commonGap: string[]
    sectionPadding: { top: string; bottom: string }
    headingSizes: Record<string, string>
    textSizes: string[]
    fontWeights: string[]
    borderRadius: string[]
    shadows: string[]
    backgroundColors: string[]
    textColors: string[]
    alignments: string[]
    directions: string[]
    maxWidths: string[]
  }
  buttonStyles: {
    primary: Record<string, unknown>
    secondary?: Record<string, unknown>
    common: Record<string, unknown>
  }
  cardStyles: {
    background: string
    border: Record<string, unknown>
    padding: Record<string, unknown>
    borderRadius: string
  }
  animationPatterns: {
    types: string[]
    duration: number
    easing: string
    hasAnimations: boolean
  }
  contentPatterns: {
    headlineLength: 'short' | 'medium' | 'long'
    tone: 'professional' | 'casual' | 'bold' | 'friendly'
    hasEmojis: boolean
    ctaStyle: 'action' | 'benefit' | 'urgency'
  }
  structure: {
    totalSections: number
    blockTypes: Record<string, number>
    averageDepth: number
    usesGrid: boolean
    usesStack: boolean
  }
  seo: {
    hasH1: boolean
    headingHierarchy: string[]
    imageCount: number
    imagesWithAlt: number
  }
}

export function analyzeProjectContext(
  blocks: SectionBlock[],
  pageSettings: PageSettings,
  _seoSettings?: Record<string, unknown>
): ProjectContext {
  const branding = extractBranding(pageSettings)
  const allBlocks = flattenBlocks(blocks)
  const stylePatterns = extractStylePatterns(allBlocks)
  const buttonStyles = extractButtonStyles(allBlocks)
  const cardStyles = extractCardStyles(allBlocks)
  const animationPatterns = extractAnimationPatterns(allBlocks)
  const contentPatterns = extractContentPatterns(allBlocks)
  const structure = analyzeStructure(blocks, allBlocks)
  const seo = analyzeSEO(allBlocks)

  return {
    branding,
    stylePatterns,
    buttonStyles,
    cardStyles,
    animationPatterns,
    contentPatterns,
    structure,
    seo,
  }
}

function extractBranding(pageSettings: PageSettings): ProjectContext['branding'] {
  return {
    primaryColor: pageSettings.primaryColor || '#171717',
    secondaryColor: pageSettings.secondaryColor || '#f5f5f5',
    accentColor: pageSettings.accentColor || '#3b82f6',
    backgroundColor: pageSettings.backgroundColor || '#ffffff',
    textColor: pageSettings.textColor || '#171717',
    fontFamily: pageSettings.fontFamily || 'Inter',
  }
}

function flattenBlocks(blocks: SectionBlock[], result: SectionBlock[] = []): SectionBlock[] {
  for (const block of blocks) {
    result.push(block)
    if (block.children?.length) {
      flattenBlocks(block.children, result)
    }
  }
  return result
}

function extractStylePatterns(blocks: SectionBlock[]): ProjectContext['stylePatterns'] {
  const patterns: ProjectContext['stylePatterns'] = {
    commonPadding: [],
    commonGap: [],
    sectionPadding: { top: '64', bottom: '64' },
    headingSizes: {},
    textSizes: [],
    fontWeights: [],
    borderRadius: [],
    shadows: [],
    backgroundColors: [],
    textColors: [],
    alignments: [],
    directions: [],
    maxWidths: [],
  }

  for (const block of blocks) {
    const styles = block.styles as Record<string, unknown>
    const settings = block.settings as Record<string, unknown>

    // Extract padding
    if (styles.padding) {
      const p = styles.padding as Record<string, string>
      if (block.type === 'container' && p.top) {
        patterns.sectionPadding.top = p.top
        patterns.sectionPadding.bottom = p.bottom || p.top
      }
    }

    // Extract gap
    if (settings.gap) {
      const gap = String(settings.gap)
      if (!patterns.commonGap.includes(gap)) patterns.commonGap.push(gap)
    }

    // Extract heading sizes
    if (block.type === 'heading' && styles.fontSize) {
      const level = (settings.level as string) || 'h2'
      patterns.headingSizes[level] = String(styles.fontSize)
    }

    // Extract text sizes
    if (block.type === 'text' && styles.fontSize) {
      const size = String(styles.fontSize)
      if (!patterns.textSizes.includes(size)) patterns.textSizes.push(size)
    }

    // Extract font weights
    if (styles.fontWeight) {
      const weight = String(styles.fontWeight)
      if (!patterns.fontWeights.includes(weight)) patterns.fontWeights.push(weight)
    }

    // Extract border radius
    if (styles.borderRadius) {
      const radius = String(styles.borderRadius)
      if (!patterns.borderRadius.includes(radius)) patterns.borderRadius.push(radius)
    }
    if (styles.border && (styles.border as Record<string, unknown>).radius) {
      const radius = String((styles.border as Record<string, unknown>).radius)
      if (!patterns.borderRadius.includes(radius)) patterns.borderRadius.push(radius)
    }

    // Extract shadows
    if (styles.boxShadow && styles.boxShadow !== 'none') {
      const shadow = String(styles.boxShadow)
      if (!patterns.shadows.includes(shadow)) patterns.shadows.push(shadow)
    }

    // Extract colors
    if (styles.backgroundColor && styles.backgroundColor !== 'transparent') {
      const bg = String(styles.backgroundColor)
      if (!patterns.backgroundColors.includes(bg)) patterns.backgroundColors.push(bg)
    }
    if (styles.color) {
      const color = String(styles.color)
      if (!patterns.textColors.includes(color)) patterns.textColors.push(color)
    }

    // Extract alignments
    if (settings.align) {
      const align = String(settings.align)
      if (!patterns.alignments.includes(align)) patterns.alignments.push(align)
    }
    if (styles.textAlign) {
      const align = String(styles.textAlign)
      if (!patterns.alignments.includes(align)) patterns.alignments.push(align)
    }

    // Extract directions
    if (settings.direction) {
      const dir = String(settings.direction)
      if (!patterns.directions.includes(dir)) patterns.directions.push(dir)
    }

    // Extract max widths
    if (styles.maxWidth) {
      const mw = String(styles.maxWidth)
      if (!patterns.maxWidths.includes(mw)) patterns.maxWidths.push(mw)
    }
  }

  return patterns
}

function extractButtonStyles(blocks: SectionBlock[]): ProjectContext['buttonStyles'] {
  const buttons = blocks.filter(b => b.type === 'button')

  const defaultStyles: ProjectContext['buttonStyles'] = {
    primary: {
      backgroundColor: '#171717',
      color: '#ffffff',
      padding: { top: '12', bottom: '12', left: '24', right: '24' },
      borderRadius: '8',
      fontWeight: '600',
    },
    common: {},
  }

  if (buttons.length === 0) return defaultStyles

  const firstButton = buttons[0]!
  const styles = firstButton.styles as Record<string, unknown>

  defaultStyles.primary = {
    backgroundColor: styles.backgroundColor || '#171717',
    color: styles.color || '#ffffff',
    padding: styles.padding || { top: '12', bottom: '12', left: '24', right: '24' },
    borderRadius: styles.borderRadius || (styles.border as Record<string, unknown>)?.radius || '8',
    fontWeight: styles.fontWeight || '600',
    fontSize: styles.fontSize || '16',
  }

  if (buttons.length > 1) {
    const secondButton = buttons[1]!
    const secondStyles = secondButton.styles as Record<string, unknown>
    if (secondStyles.backgroundColor !== styles.backgroundColor) {
      defaultStyles.secondary = {
        backgroundColor: secondStyles.backgroundColor || 'transparent',
        color: secondStyles.color || '#171717',
        padding: secondStyles.padding || styles.padding,
        borderRadius: secondStyles.borderRadius || styles.borderRadius,
        border: secondStyles.border,
      }
    }
  }

  return defaultStyles
}

function extractCardStyles(blocks: SectionBlock[]): ProjectContext['cardStyles'] {
  const cards = blocks.filter(b => {
    if (b.type !== 'stack' && b.type !== 'container') return false
    const styles = b.styles as Record<string, unknown>
    return styles.border || styles.boxShadow || styles.backgroundColor
  })

  const defaultCard: ProjectContext['cardStyles'] = {
    background: '#ffffff',
    border: { width: '1', style: 'solid', color: '#e5e5e5', radius: '12' },
    padding: { top: '24', bottom: '24', left: '24', right: '24' },
    borderRadius: '12',
  }

  if (cards.length === 0) return defaultCard

  const firstCard = cards[0]!
  const styles = firstCard.styles as Record<string, unknown>

  return {
    background: String(styles.backgroundColor || '#ffffff'),
    border: (styles.border as Record<string, unknown>) || defaultCard.border,
    padding: (styles.padding as Record<string, unknown>) || defaultCard.padding,
    borderRadius: String(styles.borderRadius || (styles.border as Record<string, unknown>)?.radius || '12'),
  }
}

function extractAnimationPatterns(blocks: SectionBlock[]): ProjectContext['animationPatterns'] {
  const animations = blocks
    .map(b => (b.styles as Record<string, unknown>).animation as Record<string, unknown>)
    .filter(Boolean)

  if (animations.length === 0) {
    return { types: [], duration: 500, easing: 'ease-out', hasAnimations: false }
  }

  const types = [...new Set(animations.map(a => String(a.type)).filter(Boolean))]
  const durations = animations.map(a => Number(a.duration) || 500)
  const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)

  return {
    types,
    duration: avgDuration,
    easing: 'ease-out',
    hasAnimations: true,
  }
}

function extractContentPatterns(blocks: SectionBlock[]): ProjectContext['contentPatterns'] {
  const headings = blocks.filter(b => b.type === 'heading')
  const buttons = blocks.filter(b => b.type === 'button')

  const headlineTexts = headings.map(h => String((h.settings as Record<string, unknown>).content || ''))
  const avgHeadlineWords = headlineTexts.length > 0
    ? headlineTexts.reduce((sum, t) => sum + t.split(/\s+/).length, 0) / headlineTexts.length
    : 6

  const headlineLength: 'short' | 'medium' | 'long' =
    avgHeadlineWords < 5 ? 'short' : avgHeadlineWords > 10 ? 'long' : 'medium'

  const allContent = headlineTexts.join(' ').toLowerCase()
  let tone: 'professional' | 'casual' | 'bold' | 'friendly' = 'professional'
  if (allContent.includes('!') || allContent.includes('amazing')) tone = 'bold'
  else if (allContent.includes('hey') || allContent.includes("let's")) tone = 'friendly'

  const emojiRegex = /[\u{1F600}-\u{1F64F}]/u
  const hasEmojis = emojiRegex.test(allContent)

  const ctaTexts = buttons.map(b => String((b.settings as Record<string, unknown>).label || '').toLowerCase())
  let ctaStyle: 'action' | 'benefit' | 'urgency' = 'action'
  if (ctaTexts.some(t => t.includes('now') || t.includes('today'))) ctaStyle = 'urgency'
  else if (ctaTexts.some(t => t.includes('free') || t.includes('get'))) ctaStyle = 'benefit'

  return { headlineLength, tone, hasEmojis, ctaStyle }
}

function analyzeStructure(rootBlocks: SectionBlock[], allBlocks: SectionBlock[]): ProjectContext['structure'] {
  const blockTypes: Record<string, number> = {}
  for (const block of allBlocks) {
    blockTypes[block.type] = (blockTypes[block.type] || 0) + 1
  }

  return {
    totalSections: rootBlocks.length,
    blockTypes,
    averageDepth: 2,
    usesGrid: (blockTypes['grid'] || 0) > 0,
    usesStack: (blockTypes['stack'] || 0) > 0,
  }
}

function analyzeSEO(blocks: SectionBlock[]): ProjectContext['seo'] {
  const headings = blocks.filter(b => b.type === 'heading')
  const images = blocks.filter(b => b.type === 'image')

  const headingLevels = headings.map(h => String((h.settings as Record<string, unknown>).level || 'h2'))
  const imagesWithAlt = images.filter(img => {
    const settings = img.settings as Record<string, unknown>
    return settings.alt && String(settings.alt).trim().length > 0
  })

  return {
    hasH1: headingLevels.includes('h1'),
    headingHierarchy: headingLevels,
    imageCount: images.length,
    imagesWithAlt: imagesWithAlt.length,
  }
}

export function formatContextForAI(context: ProjectContext): string {
  const lines: string[] = []

  lines.push('## PROJECT BRANDING')
  lines.push(`- Primary: ${context.branding.primaryColor}`)
  lines.push(`- Secondary: ${context.branding.secondaryColor}`)
  lines.push(`- Accent: ${context.branding.accentColor}`)
  lines.push(`- Background: ${context.branding.backgroundColor}`)
  lines.push(`- Text: ${context.branding.textColor}`)
  lines.push(`- Font: ${context.branding.fontFamily}`)

  lines.push('\n## STYLE PATTERNS')
  lines.push(`- Section Padding: ${context.stylePatterns.sectionPadding.top}px top/bottom`)
  lines.push(`- Gap: ${context.stylePatterns.commonGap.join(', ') || '24'}px`)
  lines.push(`- Border Radius: ${context.stylePatterns.borderRadius.join(', ') || '8, 12'}px`)
  lines.push(`- Alignments: ${context.stylePatterns.alignments.join(', ') || 'center'}`)

  if (Object.keys(context.stylePatterns.headingSizes).length > 0) {
    lines.push('\n## HEADING SIZES')
    for (const [level, size] of Object.entries(context.stylePatterns.headingSizes)) {
      lines.push(`- ${level}: ${size}px`)
    }
  }

  lines.push('\n## BUTTON STYLE')
  lines.push(`- Background: ${context.buttonStyles.primary.backgroundColor}`)
  lines.push(`- Text: ${context.buttonStyles.primary.color}`)
  lines.push(`- Border Radius: ${context.buttonStyles.primary.borderRadius}px`)

  lines.push('\n## CONTENT STYLE')
  lines.push(`- Headline: ${context.contentPatterns.headlineLength}`)
  lines.push(`- Tone: ${context.contentPatterns.tone}`)
  lines.push(`- Emojis: ${context.contentPatterns.hasEmojis ? 'yes' : 'no'}`)

  if (context.animationPatterns.hasAnimations) {
    lines.push('\n## ANIMATIONS')
    lines.push(`- Types: ${context.animationPatterns.types.join(', ')}`)
    lines.push(`- Duration: ${context.animationPatterns.duration}ms`)
  }

  return lines.join('\n')
}

export function generateStyleInstructions(context: ProjectContext): string {
  return `
MANDATORY STYLES - USE EXACTLY:

COLORS:
- Primary actions/buttons: "${context.branding.primaryColor}"
- Secondary backgrounds: "${context.branding.secondaryColor}"
- Accents: "${context.branding.accentColor}"
- Section backgrounds: "${context.branding.backgroundColor}"
- Text: "${context.branding.textColor}"

SPACING:
- Section padding: ${context.stylePatterns.sectionPadding.top}px top/bottom
- Content gap: ${context.stylePatterns.commonGap[0] || '24'}px
- Border radius: ${context.stylePatterns.borderRadius[0] || '12'}px

BUTTONS:
- Background: ${context.buttonStyles.primary.backgroundColor}
- Text: ${context.buttonStyles.primary.color}
- Border radius: ${context.buttonStyles.primary.borderRadius}px
- Font weight: ${context.buttonStyles.primary.fontWeight}

CONTENT:
- ${context.contentPatterns.headlineLength} headlines, ${context.contentPatterns.tone} tone
- ${context.contentPatterns.hasEmojis ? 'Emojis OK' : 'NO emojis'}
- CTAs: ${context.contentPatterns.ctaStyle}-focused

${context.animationPatterns.hasAnimations
    ? `ANIMATIONS: Use ${context.animationPatterns.types[0] || 'fade-up'}, ${context.animationPatterns.duration}ms`
    : 'ANIMATIONS: None (do not add unless asked)'}
`
}
