/**
 * Converts Tailwind CSS classes to CSS property objects.
 * Handles:
 * - Static classes: "flex" → { display: "flex" }
 * - Arbitrary values: "bg-[var(--color-bg)]" → { backgroundColor: "var(--color-bg)" }
 * - Pseudo classes: "hover:opacity-90" → { pseudo: "hover", styles: { opacity: "0.9" } }
 */

// Static Tailwind class mappings
const STATIC_MAP: Record<string, Record<string, string>> = {
  // Display
  'flex': { display: 'flex' },
  'inline-flex': { display: 'inline-flex' },
  'block': { display: 'block' },
  'inline-block': { display: 'inline-block' },
  'hidden': { display: 'none' },
  'grid': { display: 'grid' },

  // Flex alignment
  'items-center': { alignItems: 'center' },
  'items-start': { alignItems: 'flex-start' },
  'items-end': { alignItems: 'flex-end' },
  'items-stretch': { alignItems: 'stretch' },
  'justify-center': { justifyContent: 'center' },
  'justify-between': { justifyContent: 'space-between' },
  'justify-start': { justifyContent: 'flex-start' },
  'justify-end': { justifyContent: 'flex-end' },
  'flex-col': { flexDirection: 'column' },
  'flex-row': { flexDirection: 'row' },
  'flex-wrap': { flexWrap: 'wrap' },
  'flex-1': { flex: '1 1 0%' },
  'flex-shrink-0': { flexShrink: '0' },
  'shrink-0': { flexShrink: '0' },

  // Position
  'relative': { position: 'relative' },
  'absolute': { position: 'absolute' },
  'fixed': { position: 'fixed' },
  'sticky': { position: 'sticky' },
  'inset-0': { top: '0', right: '0', bottom: '0', left: '0' },
  'top-0': { top: '0' },
  'left-0': { left: '0' },
  'right-0': { right: '0' },
  'bottom-0': { bottom: '0' },

  // Width/Height
  'w-full': { width: '100%' },
  'w-auto': { width: 'auto' },
  'h-full': { height: '100%' },
  'h-auto': { height: 'auto' },
  'h-screen': { height: '100vh' },
  'min-h-screen': { minHeight: '100vh' },
  'min-w-0': { minWidth: '0' },
  'min-h-0': { minHeight: '0' },

  // Margin
  'mx-auto': { marginLeft: 'auto', marginRight: 'auto' },
  'm-0': { margin: '0' },

  // Text
  'text-center': { textAlign: 'center' },
  'text-left': { textAlign: 'left' },
  'text-right': { textAlign: 'right' },
  'font-bold': { fontWeight: '700' },
  'font-semibold': { fontWeight: '600' },
  'font-medium': { fontWeight: '500' },
  'font-normal': { fontWeight: '400' },
  'italic': { fontStyle: 'italic' },
  'uppercase': { textTransform: 'uppercase' },
  'lowercase': { textTransform: 'lowercase' },
  'capitalize': { textTransform: 'capitalize' },
  'underline': { textDecoration: 'underline' },
  'line-through': { textDecoration: 'line-through' },
  'no-underline': { textDecoration: 'none' },
  'truncate': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  'whitespace-nowrap': { whiteSpace: 'nowrap' },
  'whitespace-pre-wrap': { whiteSpace: 'pre-wrap' },
  'break-words': { wordBreak: 'break-word' },
  'leading-tight': { lineHeight: '1.25' },
  'leading-snug': { lineHeight: '1.375' },
  'leading-normal': { lineHeight: '1.5' },
  'leading-relaxed': { lineHeight: '1.625' },
  'leading-loose': { lineHeight: '2' },

  // Overflow
  'overflow-hidden': { overflow: 'hidden' },
  'overflow-auto': { overflow: 'auto' },
  'overflow-scroll': { overflow: 'scroll' },
  'overflow-x-auto': { overflowX: 'auto' },
  'overflow-y-auto': { overflowY: 'auto' },

  // Object fit
  'object-cover': { objectFit: 'cover' },
  'object-contain': { objectFit: 'contain' },
  'object-center': { objectPosition: 'center' },

  // Transitions
  'transition': { transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)' },
  'transition-all': { transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)' },
  'transition-colors': { transition: 'color, background-color, border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)' },
  'transition-opacity': { transition: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)' },
  'transition-transform': { transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)' },
  'duration-150': { transitionDuration: '150ms' },
  'duration-200': { transitionDuration: '200ms' },
  'duration-300': { transitionDuration: '300ms' },

  // Cursor
  'cursor-pointer': { cursor: 'pointer' },
  'cursor-default': { cursor: 'default' },

  // Pointer events
  'pointer-events-none': { pointerEvents: 'none' },
  'pointer-events-auto': { pointerEvents: 'auto' },

  // Z-index
  'z-0': { zIndex: '0' },
  'z-10': { zIndex: '10' },
  'z-20': { zIndex: '20' },
  'z-50': { zIndex: '50' },

  // Border
  'border': { borderWidth: '1px', borderStyle: 'solid' },
  'border-0': { borderWidth: '0' },
  'border-2': { borderWidth: '2px' },
  'border-solid': { borderStyle: 'solid' },
  'border-none': { borderStyle: 'none' },

  // Outline
  'outline-none': { outline: 'none' },
  'outline-0': { outline: 'none' },

  // Opacity
  'opacity-0': { opacity: '0' },
  'opacity-50': { opacity: '0.5' },
  'opacity-75': { opacity: '0.75' },
  'opacity-90': { opacity: '0.9' },
  'opacity-100': { opacity: '1' },

  // Visibility
  'visible': { visibility: 'visible' },
  'invisible': { visibility: 'hidden' },

  // Background
  'bg-transparent': { backgroundColor: 'transparent' },
  'bg-cover': { backgroundSize: 'cover' },
  'bg-center': { backgroundPosition: 'center' },
  'bg-no-repeat': { backgroundRepeat: 'no-repeat' },

  // Utility classes (no CSS output needed)
  'group': {},
  'select-none': { userSelect: 'none' },
}

// Arbitrary value patterns
const ARBITRARY_PATTERNS: Array<{
  regex: RegExp
  extract: (match: RegExpMatchArray) => Record<string, string>
}> = [
  // bg-[value]
  {
    regex: /^bg-\[(.+)\]$/,
    extract: (m) => ({ backgroundColor: m[1] })
  },
  // text-[value] for color
  {
    regex: /^text-\[(?!length:)(.+)\]$/,
    extract: (m) => ({ color: m[1] })
  },
  // text-[length:value] for font-size
  {
    regex: /^text-\[length:(.+)\]$/,
    extract: (m) => ({ fontSize: m[1] })
  },
  // font-[value]
  {
    regex: /^font-\[(.+)\]$/,
    extract: (m) => ({ fontWeight: m[1] })
  },
  // p-[value]
  {
    regex: /^p-\[(.+)\]$/,
    extract: (m) => ({ padding: m[1] })
  },
  // px-[value]
  {
    regex: /^px-\[(.+)\]$/,
    extract: (m) => ({ paddingLeft: m[1], paddingRight: m[1] })
  },
  // py-[value]
  {
    regex: /^py-\[(.+)\]$/,
    extract: (m) => ({ paddingTop: m[1], paddingBottom: m[1] })
  },
  // pt-[value], pb-[value], pl-[value], pr-[value]
  { regex: /^pt-\[(.+)\]$/, extract: (m) => ({ paddingTop: m[1] }) },
  { regex: /^pb-\[(.+)\]$/, extract: (m) => ({ paddingBottom: m[1] }) },
  { regex: /^pl-\[(.+)\]$/, extract: (m) => ({ paddingLeft: m[1] }) },
  { regex: /^pr-\[(.+)\]$/, extract: (m) => ({ paddingRight: m[1] }) },
  // m-[value], mx-[value], my-[value], mt-[value], etc.
  { regex: /^m-\[(.+)\]$/, extract: (m) => ({ margin: m[1] }) },
  { regex: /^mx-\[(.+)\]$/, extract: (m) => ({ marginLeft: m[1], marginRight: m[1] }) },
  { regex: /^my-\[(.+)\]$/, extract: (m) => ({ marginTop: m[1], marginBottom: m[1] }) },
  { regex: /^mt-\[(.+)\]$/, extract: (m) => ({ marginTop: m[1] }) },
  { regex: /^mb-\[(.+)\]$/, extract: (m) => ({ marginBottom: m[1] }) },
  { regex: /^ml-\[(.+)\]$/, extract: (m) => ({ marginLeft: m[1] }) },
  { regex: /^mr-\[(.+)\]$/, extract: (m) => ({ marginRight: m[1] }) },
  // gap-[value]
  {
    regex: /^gap-\[(.+)\]$/,
    extract: (m) => ({ gap: m[1] })
  },
  // gap-x-[value], gap-y-[value]
  { regex: /^gap-x-\[(.+)\]$/, extract: (m) => ({ columnGap: m[1] }) },
  { regex: /^gap-y-\[(.+)\]$/, extract: (m) => ({ rowGap: m[1] }) },
  // w-[value], h-[value]
  { regex: /^w-\[(.+)\]$/, extract: (m) => ({ width: m[1] }) },
  { regex: /^h-\[(.+)\]$/, extract: (m) => ({ height: m[1] }) },
  { regex: /^min-w-\[(.+)\]$/, extract: (m) => ({ minWidth: m[1] }) },
  { regex: /^min-h-\[(.+)\]$/, extract: (m) => ({ minHeight: m[1] }) },
  { regex: /^max-w-\[(.+)\]$/, extract: (m) => ({ maxWidth: m[1] }) },
  { regex: /^max-h-\[(.+)\]$/, extract: (m) => ({ maxHeight: m[1] }) },
  // rounded-[value]
  {
    regex: /^rounded-\[(.+)\]$/,
    extract: (m) => ({ borderRadius: m[1] })
  },
  // border-[value] for color
  {
    regex: /^border-\[(.+)\]$/,
    extract: (m) => ({ borderColor: m[1] })
  },
  // top-[value], left-[value], etc.
  { regex: /^top-\[(.+)\]$/, extract: (m) => ({ top: m[1] }) },
  { regex: /^bottom-\[(.+)\]$/, extract: (m) => ({ bottom: m[1] }) },
  { regex: /^left-\[(.+)\]$/, extract: (m) => ({ left: m[1] }) },
  { regex: /^right-\[(.+)\]$/, extract: (m) => ({ right: m[1] }) },
  // grid-cols-[value]
  { regex: /^grid-cols-\[(.+)\]$/, extract: (m) => ({ gridTemplateColumns: m[1] }) },
  // leading-[value] (line-height)
  { regex: /^leading-\[(.+)\]$/, extract: (m) => ({ lineHeight: m[1] }) },
  // tracking-[value] (letter-spacing)
  { regex: /^tracking-\[(.+)\]$/, extract: (m) => ({ letterSpacing: m[1] }) },
]

export interface ParsedClass {
  styles: Record<string, string>
  pseudo?: string // 'hover', 'focus', etc.
}

/**
 * Parse a single Tailwind class into CSS properties
 */
export function parseTailwindClass(className: string): ParsedClass | null {
  // Strip responsive prefixes (sm:, md:, lg:, xl:, 2xl:) - we don't use media queries
  let baseClass = className.replace(/^(sm|md|lg|xl|2xl):/, '')

  // Check for pseudo-class prefix (hover:, focus:, etc.)
  let pseudo: string | undefined

  const pseudoMatch = baseClass.match(/^(hover|focus|active|disabled|group-hover):(.+)$/)
  if (pseudoMatch) {
    pseudo = pseudoMatch[1]
    baseClass = pseudoMatch[2]
  }

  // Check static map first
  if (STATIC_MAP[baseClass]) {
    return { styles: { ...STATIC_MAP[baseClass] }, pseudo }
  }

  // Check arbitrary patterns
  for (const pattern of ARBITRARY_PATTERNS) {
    const match = baseClass.match(pattern.regex)
    if (match) {
      return { styles: pattern.extract(match), pseudo }
    }
  }

  // Handle numeric utilities (gap-4, p-2, etc.)
  const numericPatterns: Array<{
    regex: RegExp
    extract: (value: string) => Record<string, string>
  }> = [
    { regex: /^gap-(\d+)$/, extract: (v) => ({ gap: `${parseInt(v) * 0.25}rem` }) },
    { regex: /^p-(\d+)$/, extract: (v) => ({ padding: `${parseInt(v) * 0.25}rem` }) },
    { regex: /^px-(\d+)$/, extract: (v) => ({ paddingLeft: `${parseInt(v) * 0.25}rem`, paddingRight: `${parseInt(v) * 0.25}rem` }) },
    { regex: /^py-(\d+)$/, extract: (v) => ({ paddingTop: `${parseInt(v) * 0.25}rem`, paddingBottom: `${parseInt(v) * 0.25}rem` }) },
    { regex: /^m-(\d+)$/, extract: (v) => ({ margin: `${parseInt(v) * 0.25}rem` }) },
    { regex: /^mx-(\d+)$/, extract: (v) => ({ marginLeft: `${parseInt(v) * 0.25}rem`, marginRight: `${parseInt(v) * 0.25}rem` }) },
    { regex: /^my-(\d+)$/, extract: (v) => ({ marginTop: `${parseInt(v) * 0.25}rem`, marginBottom: `${parseInt(v) * 0.25}rem` }) },
    { regex: /^mt-(\d+)$/, extract: (v) => ({ marginTop: `${parseInt(v) * 0.25}rem` }) },
    { regex: /^mb-(\d+)$/, extract: (v) => ({ marginBottom: `${parseInt(v) * 0.25}rem` }) },
    { regex: /^ml-(\d+)$/, extract: (v) => ({ marginLeft: `${parseInt(v) * 0.25}rem` }) },
    { regex: /^mr-(\d+)$/, extract: (v) => ({ marginRight: `${parseInt(v) * 0.25}rem` }) },
    { regex: /^w-(\d+)$/, extract: (v) => ({ width: `${parseInt(v) * 0.25}rem` }) },
    { regex: /^h-(\d+)$/, extract: (v) => ({ height: `${parseInt(v) * 0.25}rem` }) },
    { regex: /^grid-cols-(\d+)$/, extract: (v) => ({ gridTemplateColumns: `repeat(${v}, minmax(0, 1fr))` }) },
    { regex: /^grid-rows-(\d+)$/, extract: (v) => ({ gridTemplateRows: `repeat(${v}, minmax(0, 1fr))` }) },
    { regex: /^col-span-(\d+)$/, extract: (v) => ({ gridColumn: `span ${v} / span ${v}` }) },
    { regex: /^row-span-(\d+)$/, extract: (v) => ({ gridRow: `span ${v} / span ${v}` }) },
    { regex: /^text-(\d+)xl$/, extract: (v) => ({ fontSize: `${1.5 + (parseInt(v) - 1) * 0.5}rem` }) },
    { regex: /^text-(xs|sm|base|lg|xl)$/, extract: (v) => {
      const sizes: Record<string, string> = { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' }
      return { fontSize: sizes[v] || '1rem' }
    }},
    { regex: /^rounded-(none|sm|md|lg|xl|full)$/, extract: (v) => {
      const radii: Record<string, string> = { none: '0', sm: '0.125rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' }
      return { borderRadius: radii[v] || '0.25rem' }
    }},
  ]

  for (const pattern of numericPatterns) {
    const match = baseClass.match(pattern.regex)
    if (match) {
      return { styles: pattern.extract(match[1]), pseudo }
    }
  }

  // Unknown class - log warning and skip
  console.warn(`[tailwind-to-css] Unknown class: ${className}`)
  return null
}

/**
 * Parse multiple Tailwind classes into grouped CSS
 */
export function parseTailwindClasses(classString: string): {
  base: Record<string, string>
  pseudos: Record<string, Record<string, string>>
} {
  const classes = classString.split(/\s+/).filter(Boolean)
  const base: Record<string, string> = {}
  const pseudos: Record<string, Record<string, string>> = {}

  for (const cls of classes) {
    const parsed = parseTailwindClass(cls)
    if (!parsed) continue

    if (parsed.pseudo) {
      if (!pseudos[parsed.pseudo]) {
        pseudos[parsed.pseudo] = {}
      }
      Object.assign(pseudos[parsed.pseudo], parsed.styles)
    } else {
      Object.assign(base, parsed.styles)
    }
  }

  return { base, pseudos }
}

/**
 * Parse inline style string to object
 */
export function parseInlineStyle(styleString: string): Record<string, string> {
  const styles: Record<string, string> = {}
  if (!styleString) return styles

  const pairs = styleString.split(';').filter(Boolean)
  for (const pair of pairs) {
    const [prop, ...valueParts] = pair.split(':')
    if (prop && valueParts.length) {
      const property = prop.trim()
      const value = valueParts.join(':').trim()
      // Convert to camelCase for consistency
      const camelProp = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
      styles[camelProp] = value
    }
  }

  return styles
}
