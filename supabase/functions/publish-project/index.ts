import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CLOUDFLARE_API_TOKEN = Deno.env.get('CLOUDFLARE_API_TOKEN')
const CLOUDFLARE_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')
const CLOUDFLARE_KV_NAMESPACE_ID = Deno.env.get('CLOUDFLARE_KV_NAMESPACE_ID')
const UMAMI_API_URL = Deno.env.get('UMAMI_API_URL') || 'https://cloud.umami.is'

interface RequestBody {
  projectId: string
  action: 'publish' | 'unpublish'
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================
// STYLE COLLECTOR - Manages CSS classes and styles
// ============================================

interface CSSRule {
  selector: string
  properties: Record<string, string>
  mediaQuery?: string
}

class StyleCollector {
  private rules: CSSRule[] = []
  private usedIds: Set<string> = new Set()

  // Generate a unique 4-character random ID (letters and numbers)
  private generateId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let id: string
    do {
      id = ''
      for (let i = 0; i < 4; i++) {
        id += chars[Math.floor(Math.random() * chars.length)]
      }
    } while (this.usedIds.has(id))
    this.usedIds.add(id)
    return id
  }

  // Create class name following pattern: ld-[block]-[id]
  // Every block gets its own unique class with 4 random characters
  createClassName(blockType: string, _element: string = 'block'): string {
    return `ld-${blockType}-${this.generateId()}`
  }

  // Add a CSS rule
  addRule(selector: string, properties: Record<string, string>, mediaQuery?: string) {
    // Only add if there are properties
    if (Object.keys(properties).length > 0) {
      this.rules.push({ selector, properties, mediaQuery })
    }
  }

  // Generate the complete CSS stylesheet
  generateCSS(): string {
    const normalRules: CSSRule[] = []
    const mediaRules: Map<string, CSSRule[]> = new Map()

    // Separate normal rules from media query rules
    for (const rule of this.rules) {
      if (rule.mediaQuery) {
        if (!mediaRules.has(rule.mediaQuery)) {
          mediaRules.set(rule.mediaQuery, [])
        }
        mediaRules.get(rule.mediaQuery)!.push(rule)
      } else {
        normalRules.push(rule)
      }
    }

    // CSS Reset - normalize browser defaults
    let css = `/* CSS Reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { line-height: 1.5; -webkit-text-size-adjust: 100%; }
body { margin: 0; }
h1, h2, h3, h4, h5, h6, p { margin: 0; }
img, video { display: block; max-width: 100%; }
button, input, select, textarea { font: inherit; }
a { color: inherit; text-decoration: inherit; }

`

    // Generate normal rules
    for (const rule of normalRules) {
      css += this.ruleToString(rule)
    }

    // Generate media query rules
    for (const [query, rules] of mediaRules) {
      css += `\n${query} {\n`
      for (const rule of rules) {
        css += '  ' + this.ruleToString(rule).replace(/\n/g, '\n  ')
      }
      css += '}\n'
    }

    return css
  }

  private ruleToString(rule: CSSRule): string {
    const props = Object.entries(rule.properties)
      .map(([key, value]) => `  ${this.camelToKebab(key)}: ${value};`)
      .join('\n')
    return `.${rule.selector} {\n${props}\n}\n`
  }

  private camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
  }
}

// ============================================
// STYLE BUILDERS - Convert block styles to CSS properties
// ============================================

function buildSpacingCSS(spacing: any, property: 'padding' | 'margin'): Record<string, string> {
  if (!spacing) return {}
  const props: Record<string, string> = {}

  // Only add non-zero values
  if (spacing.top && spacing.top !== '0' && spacing.top !== '0px') props[`${property}Top`] = spacing.top
  if (spacing.bottom && spacing.bottom !== '0' && spacing.bottom !== '0px') props[`${property}Bottom`] = spacing.bottom
  if (spacing.left && spacing.left !== '0' && spacing.left !== '0px') props[`${property}Left`] = spacing.left
  if (spacing.right && spacing.right !== '0' && spacing.right !== '0px') props[`${property}Right`] = spacing.right

  return props
}

function buildBorderCSS(border: any): Record<string, string> {
  if (!border) return {}
  const props: Record<string, string> = {}

  if (border.width && border.width !== '0' && border.width !== '0px') {
    props.borderWidth = border.width
    props.borderStyle = border.style || 'solid'
    if (border.color) props.borderColor = border.color
  }
  // Only add border radius if non-zero
  if (border.radius && border.radius !== '0' && border.radius !== '0px') {
    props.borderRadius = border.radius
  }

  return props
}

function buildShadowCSS(shadow: any): Record<string, string> {
  if (!shadow || !shadow.enabled) return {}

  const x = shadow.x || '0px'
  const y = shadow.y || '4px'
  const blur = shadow.blur || '6px'
  const color = shadow.color || 'rgba(0,0,0,0.1)'

  return { boxShadow: `${x} ${y} ${blur} ${color}` }
}

function buildTypographyCSS(styles: any): Record<string, string> {
  const props: Record<string, string> = {}

  if (styles.fontFamily) props.fontFamily = `'${styles.fontFamily}', system-ui, sans-serif`
  if (styles.fontSize) props.fontSize = mapFontSize(styles.fontSize)
  if (styles.fontWeight) props.fontWeight = mapFontWeight(styles.fontWeight)
  if (styles.fontStyle && styles.fontStyle !== 'normal') props.fontStyle = styles.fontStyle
  if (styles.lineHeight) props.lineHeight = styles.lineHeight
  if (styles.letterSpacing) props.letterSpacing = styles.letterSpacing
  if (styles.textAlign) props.textAlign = styles.textAlign
  if (styles.color) props.color = styles.color
  if (styles.textDecoration && styles.textDecoration !== 'none') props.textDecoration = styles.textDecoration

  return props
}

function buildBaseBlockCSS(styles: any): Record<string, string> {
  const props: Record<string, string> = {}

  if (styles.backgroundColor) props.backgroundColor = styles.backgroundColor

  Object.assign(props, buildSpacingCSS(styles.padding, 'padding'))
  Object.assign(props, buildSpacingCSS(styles.margin, 'margin'))
  Object.assign(props, buildBorderCSS(styles.border))
  Object.assign(props, buildShadowCSS(styles.shadow))

  if (styles.opacity && styles.opacity !== '1') props.opacity = styles.opacity
  if (styles.mixBlendMode && styles.mixBlendMode !== 'normal') props.mixBlendMode = styles.mixBlendMode

  // Flex child properties
  if (styles.flexGrow && styles.flexGrow !== '0') props.flexGrow = styles.flexGrow
  if (styles.flexShrink && styles.flexShrink !== '1') props.flexShrink = styles.flexShrink
  if (styles.flexBasis && styles.flexBasis !== 'auto') props.flexBasis = styles.flexBasis

  // Position properties (z-index requires a positioned element)
  const hasZIndex = styles.zIndex !== undefined && styles.zIndex !== ''
  if (styles.position && (styles.position !== 'relative' || hasZIndex)) {
    props.position = styles.position
  }
  if (hasZIndex) {
    props.zIndex = String(styles.zIndex)
  }
  if (styles.top !== undefined && styles.top !== '') props.top = styles.top
  if (styles.right !== undefined && styles.right !== '') props.right = styles.right
  if (styles.bottom !== undefined && styles.bottom !== '') props.bottom = styles.bottom
  if (styles.left !== undefined && styles.left !== '') props.left = styles.left

  return props
}

function mapFontSize(size: string): string {
  const sizeMap: Record<string, string> = {
    'xs': '0.75rem',
    'sm': '0.875rem',
    'base': '1rem',
    'lg': '1.125rem',
    'xl': '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  }
  return sizeMap[size] || size
}

function mapFontWeight(weight: string): string {
  const weightMap: Record<string, string> = {
    'normal': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700',
  }
  return weightMap[weight] || weight
}

// ============================================
// HTML GENERATORS
// ============================================

interface GeneratorContext {
  collector: StyleCollector
  pageSettings: any
}

function generateHTML(project: any, content: any, settings: any, umamiSiteId?: string): { html: string, css: string } {
  const { pageSettings, blocks } = content
  const seo = settings || {}
  const collector = new StyleCollector()

  const title = seo.meta_title || project.title
  const description = seo.meta_description || project.description || ''
  const ogImage = seo.og_image || ''
  const favicon = seo.favicon || ''
  const keywords = seo.keywords || ''

  // Generate Umami analytics script for Pro/Business plans
  const umamiScript = umamiSiteId
    ? `\n  <!-- Umami Analytics -->\n  <script defer src="${UMAMI_API_URL}/script.js" data-website-id="${umamiSiteId}"></script>`
    : ''

  // Create context for generation
  const ctx: GeneratorContext = {
    collector,
    pageSettings,
  }

  // Generate blocks HTML
  const blocksHTML = blocks.map((block: any) => generateBlockHTML(block, ctx)).join('\n')

  // Generate CSS
  const generatedCSS = collector.generateCSS()

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}">` : ''}

  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://${project.slug}.lands.app">
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ''}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}">` : ''}

  ${favicon ? `<link rel="icon" href="${escapeHtml(favicon)}">` : ''}
  ${umamiScript}

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(pageSettings.fontFamily || 'Inter')}:wght@400;500;600;700&display=swap" rel="stylesheet">

  <style>
/* Base Reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: '${pageSettings.fontFamily || 'Inter'}', system-ui, sans-serif;
  background-color: ${pageSettings.backgroundColor || '#ffffff'};
  color: ${pageSettings.textColor || '#09090b'};
  line-height: 1.6;
  min-height: 100vh;
}
img { max-width: 100%; height: auto; display: block; }
a { color: inherit; }
button { font-family: inherit; }

/* Generated Styles */
${generatedCSS}
  </style>
</head>
<body>
${blocksHTML}

  <!-- Powered by Lands -->
  <div class="ld-watermark">
    <a href="https://lands.app" target="_blank" rel="noopener">
      Built with Lands
    </a>
  </div>
</body>
</html>`

  return { html, css: generatedCSS }
}

function generateBlockHTML(block: any, ctx: GeneratorContext): string {
  const { collector, pageSettings } = ctx
  const styles = block.styles || {}
  const settings = block.settings || {}

  // Check if block is hidden
  if (settings.isHidden) return ''

  switch (block.type) {
    case 'header':
      return generateHeaderHTML(block, ctx)
    case 'footer':
      return generateFooterHTML(block, ctx)
    case 'container':
      return generateContainerHTML(block, ctx)
    case 'grid':
      return generateGridHTML(block, ctx)
    case 'stack':
      return generateStackHTML(block, ctx)
    case 'heading':
      return generateHeadingHTML(block, ctx)
    case 'text':
      return generateTextHTML(block, ctx)
    case 'image':
      return generateImageHTML(block, ctx)
    case 'video':
      return generateVideoHTML(block, ctx)
    case 'button':
      return generateButtonHTML(block, ctx)
    case 'icon':
      return generateIconHTML(block, ctx)
    case 'divider':
      return generateDividerHTML(block, ctx)
    case 'form':
      return generateFormHTML(block, ctx)
    default:
      return `<!-- Unknown block type: ${block.type} -->`
  }
}

// ============================================
// LAYOUT BLOCK GENERATORS
// ============================================

function generateHeaderHTML(block: any, ctx: GeneratorContext): string {
  const { collector } = ctx
  const styles = block.styles || {}
  const settings = block.settings || {}

  if (settings.isHidden) return ''

  const className = collector.createClassName('header', 'block')

  // Build CSS properties
  const cssProps: Record<string, string> = {
    display: 'flex',
    alignItems: styles.alignItems || 'center',
    justifyContent: styles.justifyContent || 'space-between',
    width: '100%',
    ...buildBaseBlockCSS(styles),
  }

  if (settings.height) cssProps.height = `${settings.height}px`
  if (settings.gap) cssProps.gap = `${settings.gap}px`
  if (settings.sticky) {
    cssProps.position = 'sticky'
    cssProps.top = '0'
    cssProps.zIndex = '50'
  }

  collector.addRule(className, cssProps)

  // Generate children
  const childrenHTML = (block.children || [])
    .map((child: any) => generateBlockHTML(child, ctx))
    .join('\n')

  return `<header class="${className}">${childrenHTML}</header>`
}

function generateFooterHTML(block: any, ctx: GeneratorContext): string {
  const { collector } = ctx
  const styles = block.styles || {}
  const settings = block.settings || {}

  if (settings.isHidden) return ''

  const className = collector.createClassName('footer', 'block')

  const cssProps: Record<string, string> = {
    display: 'flex',
    alignItems: styles.alignItems || 'center',
    justifyContent: styles.justifyContent || 'space-between',
    width: '100%',
    ...buildBaseBlockCSS(styles),
  }

  if (settings.gap) cssProps.gap = `${settings.gap}px`

  collector.addRule(className, cssProps)

  const childrenHTML = (block.children || [])
    .map((child: any) => generateBlockHTML(child, ctx))
    .join('\n')

  return `<footer class="${className}">${childrenHTML}</footer>`
}

function generateContainerHTML(block: any, ctx: GeneratorContext): string {
  const { collector } = ctx
  const styles = block.styles || {}
  const settings = block.settings || {}

  const className = collector.createClassName('container', 'block')

  const cssProps: Record<string, string> = {
    display: 'flex',
    flexDirection: styles.flexDirection || 'column',
    alignItems: styles.alignItems || 'stretch',
    justifyContent: styles.justifyContent || 'flex-start',
    width: '100%',
    ...buildBaseBlockCSS(styles),
  }

  if (settings.maxWidth) cssProps.maxWidth = `${settings.maxWidth}px`
  if (settings.gap) cssProps.gap = `${settings.gap}px`
  if (styles.flexWrap) cssProps.flexWrap = styles.flexWrap
  if (settings.height && settings.height !== 'auto') {
    cssProps.minHeight = settings.height === 'full' ? '100vh' : settings.height === 'half' ? '50vh' : settings.height
  }

  // Center the container
  cssProps.marginLeft = 'auto'
  cssProps.marginRight = 'auto'

  collector.addRule(className, cssProps)

  const childrenHTML = (block.children || [])
    .map((child: any) => generateBlockHTML(child, ctx))
    .join('\n')

  return `<section class="${className}">${childrenHTML}</section>`
}

function generateGridHTML(block: any, ctx: GeneratorContext): string {
  const { collector } = ctx
  const styles = block.styles || {}
  const settings = block.settings || {}

  const className = collector.createClassName('grid', 'block')
  const columns = settings.columns || 2
  const gap = settings.gap || 16

  const cssProps: Record<string, string> = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gridAutoRows: 'minmax(80px, auto)',
    gap: `${gap}px`,
    width: '100%',
    ...buildBaseBlockCSS(styles),
  }

  collector.addRule(className, cssProps)

  // Grid children - each child gets its own unique class
  const childrenHTML = (block.children || []).map((child: any, index: number) => {
    // Generate wrapper for grid item positioning if spans are set
    const itemSettings = child.settings || {}
    const colSpan = itemSettings.gridColumnSpan || 1
    const rowSpan = itemSettings.gridRowSpan || 1

    if (colSpan > 1 || rowSpan > 1) {
      const itemClassName = collector.createClassName('grid', 'item')
      const itemCss: Record<string, string> = {}
      if (colSpan > 1) itemCss.gridColumn = `span ${colSpan}`
      if (rowSpan > 1) itemCss.gridRow = `span ${rowSpan}`
      collector.addRule(itemClassName, itemCss)

      return `<div class="${itemClassName}">${generateBlockHTML(child, ctx)}</div>`
    }

    return generateBlockHTML(child, ctx)
  }).join('\n')

  return `<div class="${className}">${childrenHTML}</div>`
}

function generateStackHTML(block: any, ctx: GeneratorContext): string {
  const { collector } = ctx
  const styles = block.styles || {}
  const settings = block.settings || {}

  // Every stack gets its own unique class
  const className = collector.createClassName('stack', 'block')

  const direction = settings.direction || 'column'

  const cssProps: Record<string, string> = {
    display: 'flex',
    flexDirection: direction,
    alignItems: styles.alignItems || (direction === 'row' ? 'center' : 'stretch'),
    justifyContent: styles.justifyContent || 'flex-start',
    ...buildBaseBlockCSS(styles),
  }

  if (settings.gap) cssProps.gap = `${settings.gap}px`
  if (styles.flexWrap) cssProps.flexWrap = styles.flexWrap
  if (settings.width === 'full') cssProps.width = '100%'

  collector.addRule(className, cssProps)

  const childrenHTML = (block.children || [])
    .map((child: any) => generateBlockHTML(child, ctx))
    .join('\n')

  return `<div class="${className}">${childrenHTML}</div>`
}

// ============================================
// CONTENT BLOCK GENERATORS
// ============================================

function generateHeadingHTML(block: any, ctx: GeneratorContext): string {
  const { collector } = ctx
  const styles = block.styles || {}
  const settings = block.settings || {}

  // Every heading gets its own unique class
  const className = collector.createClassName('heading', 'block')

  const cssProps: Record<string, string> = {
    ...buildTypographyCSS(styles),
    ...buildBaseBlockCSS(styles),
  }

  collector.addRule(className, cssProps)

  const tag = settings.level || 'h2'
  const content = escapeHtml(settings.content || '')

  return `<${tag} class="${className}">${content}</${tag}>`
}

function generateTextHTML(block: any, ctx: GeneratorContext): string {
  const { collector } = ctx
  const styles = block.styles || {}
  const settings = block.settings || {}

  // Every text block gets its own unique class
  const className = collector.createClassName('text', 'block')

  const cssProps: Record<string, string> = {
    ...buildTypographyCSS(styles),
    ...buildBaseBlockCSS(styles),
  }

  collector.addRule(className, cssProps)

  const content = escapeHtml(settings.content || '')

  return `<p class="${className}">${content}</p>`
}

function generateImageHTML(block: any, ctx: GeneratorContext): string {
  const { collector } = ctx
  const styles = block.styles || {}
  const settings = block.settings || {}

  if (!settings.source) return ''

  // Every image gets its own unique class
  const className = collector.createClassName('image', 'block')

  const cssProps: Record<string, string> = {
    ...buildBaseBlockCSS(styles),
    maxWidth: '100%',
    height: 'auto',
  }

  if (settings.aspectRatio && settings.aspectRatio !== 'auto') {
    const ratioMap: Record<string, string> = {
      '1:1': '1 / 1',
      '4:3': '4 / 3',
      '3:4': '3 / 4',
      '16:9': '16 / 9',
      '9:16': '9 / 16',
    }
    cssProps.aspectRatio = ratioMap[settings.aspectRatio] || 'auto'
    cssProps.objectFit = settings.objectFit || 'cover'
  }

  if (settings.width) cssProps.width = settings.width
  if (styles.borderRadius || styles.border?.radius) {
    cssProps.borderRadius = styles.borderRadius || styles.border?.radius
  }

  collector.addRule(className, cssProps)

  const alt = escapeHtml(settings.alt || '')
  const src = escapeHtml(settings.source)

  return `<img class="${className}" src="${src}" alt="${alt}" loading="lazy">`
}

function generateVideoHTML(block: any, ctx: GeneratorContext): string {
  const { collector } = ctx
  const styles = block.styles || {}
  const settings = block.settings || {}

  if (!settings.source) return ''

  const className = collector.createClassName('video', 'block')

  const cssProps: Record<string, string> = {
    ...buildBaseBlockCSS(styles),
    width: '100%',
    height: 'auto',
  }

  if (settings.aspectRatio && settings.aspectRatio !== 'auto') {
    const ratioMap: Record<string, string> = {
      '1:1': '1 / 1',
      '4:3': '4 / 3',
      '16:9': '16 / 9',
    }
    cssProps.aspectRatio = ratioMap[settings.aspectRatio] || '16 / 9'
    cssProps.objectFit = 'cover'
  }

  collector.addRule(className, cssProps)

  const src = escapeHtml(settings.source)
  const autoplay = settings.autoplay ? 'autoplay' : ''
  const loop = settings.loop ? 'loop' : ''
  const muted = settings.muted ? 'muted' : ''
  const controls = settings.controls !== false ? 'controls' : ''

  return `<video class="${className}" src="${src}" ${autoplay} ${loop} ${muted} ${controls} playsinline></video>`
}

function generateButtonHTML(block: any, ctx: GeneratorContext): string {
  const { collector, pageSettings } = ctx
  const styles = block.styles || {}
  const settings = block.settings || {}

  // Every button gets its own unique class
  const className = collector.createClassName('button', 'block')

  const variant = settings.variant || 'primary'
  const size = settings.size || 'md'

  const sizeStyles: Record<string, Record<string, string>> = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' },
  }

  const cssProps: Record<string, string> = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.2s, transform 0.2s',
    ...sizeStyles[size] || sizeStyles.md,
    ...buildBaseBlockCSS(styles),
  }

  // Variant styles
  const primaryColor = pageSettings?.primaryColor || '#000000'
  const bgColor = pageSettings?.backgroundColor || '#ffffff'

  switch (variant) {
    case 'primary':
      cssProps.backgroundColor = styles.backgroundColor || primaryColor
      cssProps.color = styles.color || bgColor
      break
    case 'secondary':
      cssProps.backgroundColor = styles.backgroundColor || bgColor
      cssProps.color = styles.color || primaryColor
      cssProps.border = `1px solid ${primaryColor}`
      break
    case 'outline':
      cssProps.backgroundColor = 'transparent'
      cssProps.color = styles.color || primaryColor
      cssProps.border = `1px solid currentColor`
      break
    case 'ghost':
      cssProps.backgroundColor = 'transparent'
      cssProps.color = styles.color || primaryColor
      break
  }

  if (!cssProps.borderRadius) cssProps.borderRadius = '0.5rem'

  collector.addRule(className, cssProps)
  collector.addRule(`${className}:hover`, { opacity: '0.9' })

  const href = settings.url || '#'
  const label = escapeHtml(settings.label || 'Button')
  const target = settings.openInNewTab ? ' target="_blank" rel="noopener"' : ''

  return `<a class="${className}" href="${escapeHtml(href)}"${target}>${label}</a>`
}

function generateIconHTML(block: any, ctx: GeneratorContext): string {
  const { collector } = ctx
  const styles = block.styles || {}
  const settings = block.settings || {}

  const className = collector.createClassName('icon', 'block')

  const size = settings.size || 24
  const cssProps: Record<string, string> = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${size}px`,
    height: `${size}px`,
    ...buildBaseBlockCSS(styles),
  }

  if (styles.color) cssProps.color = styles.color

  collector.addRule(className, cssProps)

  // For now, return empty div - icons would need icon library integration
  return `<span class="${className}"></span>`
}

function generateDividerHTML(block: any, ctx: GeneratorContext): string {
  const { collector } = ctx
  const styles = block.styles || {}
  const settings = block.settings || {}

  const className = collector.createClassName('divider', 'block')

  const dividerStyle = settings.style || 'line'
  const cssProps: Record<string, string> = {
    width: '100%',
    ...buildBaseBlockCSS(styles),
  }

  if (dividerStyle === 'space') {
    cssProps.height = settings.height || '32px'
  } else {
    cssProps.height = '0'
    cssProps.borderBottom = dividerStyle === 'dashed'
      ? `1px dashed ${styles.color || '#e5e7eb'}`
      : dividerStyle === 'dotted'
      ? `1px dotted ${styles.color || '#e5e7eb'}`
      : `1px solid ${styles.color || '#e5e7eb'}`
  }

  collector.addRule(className, cssProps)

  return `<hr class="${className}">`
}

function generateFormHTML(block: any, ctx: GeneratorContext): string {
  const { collector } = ctx
  const styles = block.styles || {}
  const settings = block.settings || {}

  const className = collector.createClassName('form', 'block')

  const cssProps: Record<string, string> = {
    display: 'flex',
    flexDirection: 'column',
    gap: `${settings.gap || 16}px`,
    width: '100%',
    ...buildBaseBlockCSS(styles),
  }

  if (settings.maxWidth) cssProps.maxWidth = `${settings.maxWidth}px`

  collector.addRule(className, cssProps)

  const childrenHTML = (block.children || [])
    .map((child: any) => generateFormFieldHTML(child, ctx))
    .join('\n')

  const action = settings.action || '#'
  const method = settings.method || 'POST'

  return `<form class="${className}" action="${escapeHtml(action)}" method="${method}">${childrenHTML}</form>`
}

function generateFormFieldHTML(field: any, ctx: GeneratorContext): string {
  const { collector } = ctx
  const settings = field.settings || {}
  const styles = field.styles || {}

  switch (field.type) {
    case 'form-input':
    case 'form-textarea':
    case 'form-select': {
      const className = collector.createClassName('form', 'field')
      const inputClassName = collector.createClassName('form', 'input')

      collector.addRule(className, {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      })

      collector.addRule(inputClassName, {
        padding: '0.75rem 1rem',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        width: '100%',
        ...buildBaseBlockCSS(styles),
      })

      const label = settings.label ? `<label>${escapeHtml(settings.label)}</label>` : ''
      const placeholder = settings.placeholder || ''
      const name = settings.name || settings.label?.toLowerCase().replace(/\s+/g, '_') || 'field'
      const required = settings.required ? 'required' : ''

      if (field.type === 'form-textarea') {
        return `<div class="${className}">${label}<textarea class="${inputClassName}" name="${name}" placeholder="${escapeHtml(placeholder)}" ${required}></textarea></div>`
      } else if (field.type === 'form-select') {
        const options = (settings.options || [])
          .map((opt: any) => `<option value="${escapeHtml(opt.value)}">${escapeHtml(opt.label)}</option>`)
          .join('')
        return `<div class="${className}">${label}<select class="${inputClassName}" name="${name}" ${required}>${options}</select></div>`
      } else {
        const type = settings.type || 'text'
        return `<div class="${className}">${label}<input class="${inputClassName}" type="${type}" name="${name}" placeholder="${escapeHtml(placeholder)}" ${required}></div>`
      }
    }

    case 'form-button': {
      const className = collector.createClassName('form', 'submit')

      collector.addRule(className, {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: 'none',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
        ...buildBaseBlockCSS(styles),
      })

      const label = escapeHtml(settings.label || 'Submit')
      return `<button class="${className}" type="submit">${label}</button>`
    }

    case 'stack':
      return generateStackHTML(field, ctx)

    default:
      return ''
  }
}

// ============================================
// UTILITIES
// ============================================

function escapeHtml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ============================================
// CLOUDFLARE KV STORAGE
// ============================================

async function storeInKV(key: string, value: string): Promise<void> {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_KV_NAMESPACE_ID) {
    console.log('Cloudflare credentials not configured, skipping KV storage')
    return
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'text/html',
    },
    body: value,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to store in KV: ${error}`)
  }
}

async function deleteFromKV(key: string): Promise<void> {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_KV_NAMESPACE_ID) {
    console.log('Cloudflare credentials not configured, skipping KV deletion')
    return
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`

  console.log(`Deleting from KV: ${key}`)

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    },
  })

  const responseText = await response.text()
  console.log(`KV delete response: ${response.status} - ${responseText}`)

  if (!response.ok) {
    throw new Error(`Failed to delete from KV: ${responseText}`)
  }

  console.log(`Successfully deleted ${key} from KV`)
}

// ============================================
// MAIN SERVER
// ============================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { projectId, action } = await req.json() as RequestBody

    if (!projectId || !action) {
      return new Response(JSON.stringify({ error: 'Missing projectId or action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    if (action === 'publish') {
      // Fetch project content
      const { data: content, error: contentError } = await supabase
        .from('project_content')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (contentError || !content) {
        return new Response(JSON.stringify({ error: 'Project content not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      // Fetch project settings (SEO, etc.)
      const { data: settings } = await supabase
        .from('project_settings')
        .select('*')
        .eq('project_id', projectId)
        .single()

      // Get Umami site ID for Pro/Business plans
      const umamiSiteId = project.plan !== 'free' && settings?.umami_site_id
        ? settings.umami_site_id
        : undefined

      // Generate static HTML with CSS classes
      const { html } = generateHTML(project, {
        pageSettings: content.page_settings,
        blocks: content.blocks,
      }, settings, umamiSiteId)

      // Store in Cloudflare KV using slug as key
      await storeInKV(project.slug, html)

      // Update project as published
      const publishedUrl = `https://${project.slug}.lands.app`
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          is_published: true,
          published_url: publishedUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)

      if (updateError) {
        throw updateError
      }

      // Update project_settings with published_at
      await supabase
        .from('project_settings')
        .upsert({
          project_id: projectId,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'project_id' })

      console.log(`Project ${project.slug} published to ${publishedUrl}`)

      return new Response(JSON.stringify({
        success: true,
        publishedUrl,
        message: 'Project published successfully'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })

    } else if (action === 'unpublish') {
      // Delete from Cloudflare KV
      await deleteFromKV(project.slug)

      // Update project as unpublished
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          is_published: false,
          published_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)

      if (updateError) {
        throw updateError
      }

      console.log(`Project ${project.slug} unpublished`)

      return new Response(JSON.stringify({
        success: true,
        message: 'Project unpublished successfully'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

  } catch (error) {
    console.error('Error publishing project:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
