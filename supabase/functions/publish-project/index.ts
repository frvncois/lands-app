import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hydrateProject } from './hydrator.ts'
import { styleExtractor } from './lib/style-extractor.ts'

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

interface TranslationSettings {
  defaultLanguage: string
  languages: string[]
}

interface SectionInstance {
  id: string
  type: string
  variant: string
  data: Record<string, unknown>
  fieldStyles?: Record<string, Record<string, unknown>>
  styles?: Record<string, unknown>
  itemStyles?: Record<string, unknown>
}

interface PageContent {
  themeId: string
  sections: SectionInstance[]
  themeOverrides?: {
    colors?: Partial<ThemeTokens['colors']>
    fonts?: Partial<ThemeTokens['fonts']>
  }
  translation?: TranslationSettings
  translations?: Record<string, Record<string, Record<string, unknown>>>
}

interface ThemeTokens {
  colors: {
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
  fonts: {
    heading: string
    body: string
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================
// THEME DEFINITIONS
// ============================================

const THEMES: Record<string, ThemeTokens> = {
  minimal: {
    colors: {
      background: '#ffffff',
      foreground: '#09090b',
      primary: '#18181b',
      primaryForeground: '#fafafa',
      secondary: '#f4f4f5',
      secondaryForeground: '#18181b',
      muted: '#f4f4f5',
      mutedForeground: '#71717a',
      accent: '#f4f4f5',
      border: '#e4e4e7',
    },
    fonts: {
      heading: 'Satoshi, sans-serif',
      body: 'Satoshi, sans-serif',
    },
  },
  midnight: {
    colors: {
      background: '#09090b',
      foreground: '#fafafa',
      primary: '#fafafa',
      primaryForeground: '#18181b',
      secondary: '#27272a',
      secondaryForeground: '#fafafa',
      muted: '#27272a',
      mutedForeground: '#a1a1aa',
      accent: '#27272a',
      border: '#27272a',
    },
    fonts: {
      heading: 'Satoshi, sans-serif',
      body: 'Satoshi, sans-serif',
    },
  },
  forest: {
    colors: {
      background: '#fafaf9',
      foreground: '#1c1917',
      primary: '#166534',
      primaryForeground: '#f0fdf4',
      secondary: '#f5f5f4',
      secondaryForeground: '#1c1917',
      muted: '#f5f5f4',
      mutedForeground: '#78716c',
      accent: '#dcfce7',
      border: '#e7e5e4',
    },
    fonts: {
      heading: 'Instrument Serif, serif',
      body: 'Satoshi, sans-serif',
    },
  },
  ocean: {
    colors: {
      background: '#f8fafc',
      foreground: '#0f172a',
      primary: '#0369a1',
      primaryForeground: '#f0f9ff',
      secondary: '#f1f5f9',
      secondaryForeground: '#0f172a',
      muted: '#f1f5f9',
      mutedForeground: '#64748b',
      accent: '#e0f2fe',
      border: '#e2e8f0',
    },
    fonts: {
      heading: 'Clash Grotesk, sans-serif',
      body: 'Switzer, sans-serif',
    },
  },
  sunset: {
    colors: {
      background: '#fffbeb',
      foreground: '#1c1917',
      primary: '#ea580c',
      primaryForeground: '#fff7ed',
      secondary: '#fef3c7',
      secondaryForeground: '#1c1917',
      muted: '#fef3c7',
      mutedForeground: '#78716c',
      accent: '#ffedd5',
      border: '#fde68a',
    },
    fonts: {
      heading: 'Cabinet Grotesk, sans-serif',
      body: 'Ranade, sans-serif',
    },
  },
}

// Language labels for the switcher
const LANGUAGE_LABELS: Record<string, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇺🇸' },
  fr: { label: 'Français', flag: '🇫🇷' },
  es: { label: 'Español', flag: '🇪🇸' },
  de: { label: 'Deutsch', flag: '🇩🇪' },
  it: { label: 'Italiano', flag: '🇮🇹' },
  pt: { label: 'Português', flag: '🇵🇹' },
  nl: { label: 'Nederlands', flag: '🇳🇱' },
  pl: { label: 'Polski', flag: '🇵🇱' },
  ru: { label: 'Русский', flag: '🇷🇺' },
  ja: { label: '日本語', flag: '🇯🇵' },
  zh: { label: '中文', flag: '🇨🇳' },
  ko: { label: '한국어', flag: '🇰🇷' },
  ar: { label: 'العربية', flag: '🇸🇦' },
}

// ============================================
// UTILITIES
// ============================================

function escapeHtml(text: string): string {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getTheme(themeId: string): ThemeTokens {
  return THEMES[themeId] || THEMES.minimal
}

// ============================================
// SECTION HTML GENERATORS
// ============================================

function generateSectionHTML(section: SectionInstance, theme: ThemeTokens): string {
  const { type, variant, data, styles, fieldStyles, itemStyles } = section

  // Section-level styles
  const sectionStyle = buildSectionStyle(styles, theme)

  switch (type) {
    case 'hero':
      return generateHeroHTML(section, theme, sectionStyle)
    case 'cards':
      return generateCardsHTML(section, theme, sectionStyle)
    case 'cta':
      return generateCTAHTML(section, theme, sectionStyle)
    case 'links':
      return generateLinksHTML(section, theme, sectionStyle)
    case 'accordion':
    case 'faq':
    case 'menu':
    case 'services':
      return generateAccordionHTML(section, theme, sectionStyle)
    case 'gallery':
      return generateGalleryHTML(section, theme, sectionStyle)
    case 'products':
      return generateProductsHTML(section, theme, sectionStyle)
    case 'events':
      return generateEventsHTML(section, theme, sectionStyle)
    case 'contact':
      return generateContactHTML(section, theme, sectionStyle)
    case 'subscribe':
      return generateSubscribeHTML(section, theme, sectionStyle)
    case 'text':
    case 'media-text':
      return generateTextHTML(section, theme, sectionStyle)
    case 'header':
      return generateHeaderHTML(section, theme, sectionStyle)
    case 'footer':
      return generateFooterHTML(section, theme, sectionStyle)
    default:
      // STEP 5 — BAN SILENT SECTION DROPS
      throw new Error(
        `[publish] Unsupported section type "${type}". Registry & publish mismatch.`
      )
  }
}

function buildSectionStyle(styles: Record<string, unknown> | undefined, theme: ThemeTokens): string {
  if (!styles) return ''
  const parts: string[] = []
  if (styles.backgroundColor) parts.push(`background-color: ${styles.backgroundColor}`)
  if (styles.spacingY) parts.push(`padding-top: ${styles.spacingY}px; padding-bottom: ${styles.spacingY}px`)
  if (styles.spacingX) parts.push(`padding-left: ${styles.spacingX}px; padding-right: ${styles.spacingX}px`)
  return parts.join('; ')
}

function buildFieldStyle(fieldStyles: Record<string, Record<string, unknown>> | undefined, fieldKey: string): string {
  if (!fieldStyles || !fieldStyles[fieldKey]) return ''
  const styles = fieldStyles[fieldKey]
  const parts: string[] = []
  if (styles.fontSize) parts.push(`font-size: ${styles.fontSize}px`)
  if (styles.lineHeight) parts.push(`line-height: ${styles.lineHeight}`)
  if (styles.color) parts.push(`color: ${styles.color}`)
  if (styles.backgroundColor) parts.push(`background-color: ${styles.backgroundColor}`)
  if (styles.spacingY) parts.push(`margin-top: ${styles.spacingY}px; margin-bottom: ${styles.spacingY}px`)
  if (styles.spacingX) parts.push(`margin-left: ${styles.spacingX}px; margin-right: ${styles.spacingX}px`)
  if (styles.borderRadius) parts.push(`border-radius: ${styles.borderRadius}px`)
  return parts.join('; ')
}

/**
 * Extract section styles as CSS object for styleExtractor
 * This gets the user's custom values that should NOT use theme var() defaults
 */
function extractSectionStyles(styles: Record<string, unknown> | undefined): Record<string, string> {
  if (!styles) return {}
  const cssStyles: Record<string, string> = {}

  if (styles.backgroundColor) cssStyles.backgroundColor = `${styles.backgroundColor}`
  if (styles.spacingY !== undefined) {
    cssStyles.paddingTop = `${styles.spacingY}px`
    cssStyles.paddingBottom = `${styles.spacingY}px`
  }
  if (styles.spacingX !== undefined) {
    cssStyles.paddingLeft = `${styles.spacingX}px`
    cssStyles.paddingRight = `${styles.spacingX}px`
  }

  return cssStyles
}

/**
 * Extract field styles as CSS object for styleExtractor
 */
function extractFieldStyles(fieldStyles: Record<string, Record<string, unknown>> | undefined, fieldKey: string): Record<string, string> {
  if (!fieldStyles || !fieldStyles[fieldKey]) return {}
  const styles = fieldStyles[fieldKey]
  const cssStyles: Record<string, string> = {}

  if (styles.fontSize) cssStyles.fontSize = `${styles.fontSize}px`
  if (styles.lineHeight) cssStyles.lineHeight = `${styles.lineHeight}`
  if (styles.fontFamily) cssStyles.fontFamily = `${styles.fontFamily}`
  if (styles.fontWeight) cssStyles.fontWeight = `${styles.fontWeight}`
  if (styles.color) cssStyles.color = `${styles.color}`
  if (styles.backgroundColor) cssStyles.backgroundColor = `${styles.backgroundColor}`
  if (styles.spacingY) {
    cssStyles.marginTop = `${styles.spacingY}px`
    cssStyles.marginBottom = `${styles.spacingY}px`
  }
  if (styles.spacingX) {
    cssStyles.marginLeft = `${styles.spacingX}px`
    cssStyles.marginRight = `${styles.spacingX}px`
  }
  if (styles.borderRadius) cssStyles.borderRadius = `${styles.borderRadius}px`

  return cssStyles
}

// ============================================
// HERO SECTION
// ============================================

function generateHeroHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, variant, data, fieldStyles, styles } = section

  // Extract data fields
  const headline = data.headline as string || ''
  const subheadline = data.subheadline as string || ''
  const paragraph = data.paragraph as string || ''
  const media = data.media as { type?: string; src?: string; alt?: string } | undefined
  const primaryCTA = data.primaryCTA as { label?: string; url?: string } | undefined
  const secondaryCTA = data.secondaryCTA as { label?: string; url?: string } | undefined

  // Extract styles
  const spaceBetween = (styles as Record<string, unknown>)?.spaceBetween ?? 32
  const stackedLayout = (styles as Record<string, unknown>)?.heroStackedLayout ?? 'option1'
  const customStyles = extractSectionStyles(styles as Record<string, unknown>)

  // Create class names
  const heroClass = styleExtractor.createRootClass('hero')
  const containerClass = styleExtractor.createChildClass(heroClass, 'container')
  const headlineClass = styleExtractor.createChildClass(heroClass, 'headline')
  const subheadlineClass = styleExtractor.createChildClass(heroClass, 'subheadline')
  const paragraphClass = styleExtractor.createChildClass(heroClass, 'paragraph')
  const mediaContainerClass = styleExtractor.createChildClass(heroClass, 'media-container')
  const mediaClass = styleExtractor.createChildClass(heroClass, 'media')
  const primaryBtnClass = styleExtractor.createChildClass(heroClass, 'primary-btn')
  const secondaryBtnClass = styleExtractor.createChildClass(heroClass, 'secondary-btn')
  const buttonsClass = styleExtractor.createChildClass(heroClass, 'buttons')
  const headerClass = styleExtractor.createChildClass(heroClass, 'header')
  const contentClass = styleExtractor.createChildClass(heroClass, 'content')

  // Process section element
  styleExtractor.processElement({
    className: heroClass,
    tailwindClasses: 'text-[var(--color-fg)]',
    additionalStyles: customStyles,
  })

  // Process media
  if (media?.src) {
    styleExtractor.processElement({
      className: mediaContainerClass,
      tailwindClasses: 'w-full min-h-0 relative overflow-hidden',
      additionalStyles: { aspectRatio: '16 / 9' },
    })

    styleExtractor.processElement({
      className: mediaClass,
      tailwindClasses: 'w-full h-full object-cover',
    })
  }

  // Process headline
  styleExtractor.processElement({
    className: headlineClass,
    tailwindClasses: 'text-[var(--text-5xl)] font-bold m-0',
    additionalStyles: {
      lineHeight: '1.2',
      fontFamily: 'var(--font-heading)',
      ...extractFieldStyles(fieldStyles, 'headline'),
    },
  })

  // Process subheadline
  styleExtractor.processElement({
    className: subheadlineClass,
    tailwindClasses: 'text-[var(--text-xl)] m-0',
    additionalStyles: {
      color: theme.colors.mutedForeground,
      fontFamily: 'var(--font-body)',
      ...extractFieldStyles(fieldStyles, 'subheadline'),
    },
  })

  // Process paragraph
  styleExtractor.processElement({
    className: paragraphClass,
    tailwindClasses: 'text-[var(--text-base)] m-0',
    additionalStyles: {
      color: theme.colors.mutedForeground,
      fontFamily: 'var(--font-body)',
      ...extractFieldStyles(fieldStyles, 'paragraph'),
    },
  })

  // Process buttons
  if (primaryCTA?.label) {
    styleExtractor.processElement({
      className: primaryBtnClass,
      tailwindClasses: 'inline-flex items-center justify-center no-underline',
      additionalStyles: {
        padding: 'var(--btn-py) var(--btn-px)',
        backgroundColor: theme.colors.primary,
        color: theme.colors.primaryForeground,
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--btn-weight)',
        borderRadius: 'var(--btn-radius)',
        ...extractFieldStyles(fieldStyles, 'primaryCTA'),
      },
    })
  }

  if (secondaryCTA?.label) {
    styleExtractor.processElement({
      className: secondaryBtnClass,
      tailwindClasses: 'inline-flex items-center justify-center no-underline',
      additionalStyles: {
        padding: 'var(--btn-py) var(--btn-px)',
        backgroundColor: theme.colors.secondary,
        color: theme.colors.secondaryForeground,
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--btn-weight)',
        borderRadius: 'var(--btn-radius)',
        ...extractFieldStyles(fieldStyles, 'secondaryCTA'),
      },
    })
  }

  const mediaHTML = media?.src ? (media.type === 'video'
    ? `<video class="${mediaClass}" src="${escapeHtml(media.src)}" autoplay loop muted playsinline></video>`
    : `<img class="${mediaClass}" src="${escapeHtml(media.src)}" alt="${escapeHtml(media.alt || '')}" loading="lazy" />`)
    : ''

  const primaryButtonHTML = primaryCTA?.label ? `<a class="${primaryBtnClass}" href="${escapeHtml(primaryCTA.url || '#')}" data-field="primaryCTA">${escapeHtml(primaryCTA.label)}</a>` : ''
  const secondaryButtonHTML = secondaryCTA?.label ? `<a class="${secondaryBtnClass}" href="${escapeHtml(secondaryCTA.url || '#')}" data-field="secondaryCTA">${escapeHtml(secondaryCTA.label)}</a>` : ''

  if (variant === 'stacked') {
    if (stackedLayout === 'option1') {
      // Option 1: A (headline+subheadline) → B (media) → C (paragraph+buttons right 50%)
      styleExtractor.processElement({
        className: containerClass,
        tailwindClasses: 'max-w-[1200px] mx-auto w-full flex flex-col',
        additionalStyles: { gap: `${spaceBetween}px` },
      })

      styleExtractor.processElement({
        className: headerClass,
        tailwindClasses: 'flex flex-col',
      })

      styleExtractor.processElement({
        className: contentClass,
        tailwindClasses: 'flex flex-col gap-[var(--spacing-lg)] ml-auto w-full max-w-[50%]',
      })

      styleExtractor.processElement({
        className: buttonsClass,
        tailwindClasses: 'flex gap-[var(--spacing-md)]',
      })

      styleExtractor.processElement({
        className: subheadlineClass,
        tailwindClasses: 'text-[var(--text-xl)] m-0 max-w-[600px]',
        additionalStyles: {
          color: theme.colors.mutedForeground,
          fontFamily: 'var(--font-body)',
          ...extractFieldStyles(fieldStyles, 'subheadline'),
        },
      })

      return `
      <section class="${heroClass}" data-section-id="${id}">
        <div class="${containerClass}">
          <div class="${headerClass}">
            ${headline ? `<h1 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h1>` : ''}
            ${subheadline ? `<p class="${subheadlineClass}" data-field="subheadline">${escapeHtml(subheadline)}</p>` : ''}
          </div>
          ${media?.src ? `<div class="${mediaContainerClass}">${mediaHTML}</div>` : ''}
          <div class="${contentClass}">
            ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
            <div class="${buttonsClass}">
              ${primaryButtonHTML}
              ${secondaryButtonHTML}
            </div>
          </div>
        </div>
      </section>`
    } else if (stackedLayout === 'option2') {
      // Option 2: A (headline+subheadline center) → C (paragraph+buttons center) → B (media)
      styleExtractor.processElement({
        className: containerClass,
        tailwindClasses: 'max-w-[1200px] mx-auto w-full flex flex-col items-center text-center',
        additionalStyles: { gap: `${spaceBetween}px` },
      })

      styleExtractor.processElement({
        className: headerClass,
        tailwindClasses: 'flex flex-col gap-[var(--spacing-md)] items-center',
      })

      styleExtractor.processElement({
        className: contentClass,
        tailwindClasses: 'flex flex-col gap-[var(--spacing-lg)] items-center',
      })

      styleExtractor.processElement({
        className: buttonsClass,
        tailwindClasses: 'flex gap-[var(--spacing-md)] justify-center',
      })

      styleExtractor.processElement({
        className: subheadlineClass,
        tailwindClasses: 'text-[var(--text-xl)] m-0 max-w-[600px]',
        additionalStyles: {
          color: theme.colors.mutedForeground,
          fontFamily: 'var(--font-body)',
          ...extractFieldStyles(fieldStyles, 'subheadline'),
        },
      })

      styleExtractor.processElement({
        className: paragraphClass,
        tailwindClasses: 'text-[var(--text-base)] m-0 max-w-[600px]',
        additionalStyles: {
          color: theme.colors.mutedForeground,
          fontFamily: 'var(--font-body)',
          ...extractFieldStyles(fieldStyles, 'paragraph'),
        },
      })

      return `
      <section class="${heroClass}" data-section-id="${id}">
        <div class="${containerClass}">
          <div class="${headerClass}">
            ${headline ? `<h1 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h1>` : ''}
            ${subheadline ? `<p class="${subheadlineClass}" data-field="subheadline">${escapeHtml(subheadline)}</p>` : ''}
          </div>
          <div class="${contentClass}">
            ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
            <div class="${buttonsClass}">
              ${primaryButtonHTML}
              ${secondaryButtonHTML}
            </div>
          </div>
          ${media?.src ? `<div class="${mediaContainerClass}">${mediaHTML}</div>` : ''}
        </div>
      </section>`
    } else {
      // Option 3: B (media) → A (headline+subheadline center) → C (paragraph+buttons center)
      styleExtractor.processElement({
        className: containerClass,
        tailwindClasses: 'max-w-[1200px] mx-auto w-full flex flex-col items-center text-center',
        additionalStyles: { gap: `${spaceBetween}px` },
      })

      styleExtractor.processElement({
        className: headerClass,
        tailwindClasses: 'flex flex-col gap-[var(--spacing-md)] items-center',
      })

      styleExtractor.processElement({
        className: contentClass,
        tailwindClasses: 'flex flex-col gap-[var(--spacing-lg)] items-center',
      })

      styleExtractor.processElement({
        className: buttonsClass,
        tailwindClasses: 'flex gap-[var(--spacing-md)] justify-center',
      })

      styleExtractor.processElement({
        className: subheadlineClass,
        tailwindClasses: 'text-[var(--text-xl)] m-0 max-w-[600px]',
        additionalStyles: {
          color: theme.colors.mutedForeground,
          fontFamily: 'var(--font-body)',
          ...extractFieldStyles(fieldStyles, 'subheadline'),
        },
      })

      styleExtractor.processElement({
        className: paragraphClass,
        tailwindClasses: 'text-[var(--text-base)] m-0 max-w-[600px]',
        additionalStyles: {
          color: theme.colors.mutedForeground,
          fontFamily: 'var(--font-body)',
          ...extractFieldStyles(fieldStyles, 'paragraph'),
        },
      })

      return `
      <section class="${heroClass}" data-section-id="${id}">
        <div class="${containerClass}">
          ${media?.src ? `<div class="${mediaContainerClass}">${mediaHTML}</div>` : ''}
          <div class="${headerClass}">
            ${headline ? `<h1 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h1>` : ''}
            ${subheadline ? `<p class="${subheadlineClass}" data-field="subheadline">${escapeHtml(subheadline)}</p>` : ''}
          </div>
          <div class="${contentClass}">
            ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
            <div class="${buttonsClass}">
              ${primaryButtonHTML}
              ${secondaryButtonHTML}
            </div>
          </div>
        </div>
      </section>`
    }
  }

  if (variant === 'split') {
    const height = (styles as Record<string, unknown>)?.heroSplitHeight ?? 'full'
    const contentPosition = (styles as Record<string, unknown>)?.heroSplitContentPosition ?? 'right'
    const minHeight = height === 'full' ? '100vh' : '50vh'
    const isContentRight = contentPosition === 'right'
    const mediaOrder = isContentRight ? 1 : 2
    const contentOrder = isContentRight ? 2 : 1

    const splitContainerClass = styleExtractor.createChildClass(heroClass, 'split-container')
    const mediaColumnClass = styleExtractor.createChildClass(heroClass, 'media-column')
    const contentColumnClass = styleExtractor.createChildClass(heroClass, 'content-column')
    const mediaInnerClass = styleExtractor.createChildClass(heroClass, 'media-inner')
    const placeholderClass = styleExtractor.createChildClass(heroClass, 'placeholder')

    // Extract spacingX and spacingY from section styles
    const spacingY = (styles as Record<string, unknown>)?.spacingY
    const spacingX = (styles as Record<string, unknown>)?.spacingX
    const bgColor = (styles as Record<string, unknown>)?.backgroundColor

    // Build section style with only backgroundColor and spacingY
    const sectionAdditionalStyles: Record<string, string> = {
      minHeight: minHeight,
      backgroundColor: bgColor ? `${bgColor}` : theme.colors.background,
      color: theme.colors.foreground,
    }
    if (spacingY !== undefined) {
      sectionAdditionalStyles.paddingTop = `${spacingY}px`
      sectionAdditionalStyles.paddingBottom = `${spacingY}px`
    }

    // Process split variant styling
    styleExtractor.processElement({
      className: heroClass,
      tailwindClasses: 'flex',
      additionalStyles: sectionAdditionalStyles,
    })

    styleExtractor.processElement({
      className: splitContainerClass,
      tailwindClasses: 'max-w-[1200px] mx-auto w-full grid grid-cols-2 items-center',
    })

    styleExtractor.processElement({
      className: mediaColumnClass,
      tailwindClasses: 'h-full',
      additionalStyles: { order: mediaOrder.toString() },
    })

    styleExtractor.processElement({
      className: mediaInnerClass,
      tailwindClasses: 'h-full',
    })

    if (media?.src) {
      styleExtractor.processElement({
        className: mediaClass,
        tailwindClasses: 'w-full h-full object-cover rounded-[var(--radius-lg)]',
      })
    } else {
      styleExtractor.processElement({
        className: placeholderClass,
        tailwindClasses: 'h-full bg-[var(--color-secondary)] rounded-[var(--radius-lg)]',
      })
    }

    // Apply spacingX to content column if set, otherwise use default
    const contentColumnAdditionalStyles: Record<string, string> = {
      gap: `${spaceBetween}px`,
      order: contentOrder.toString(),
    }
    if (spacingX !== undefined) {
      contentColumnAdditionalStyles.paddingLeft = `${spacingX}px`
      contentColumnAdditionalStyles.paddingRight = `${spacingX}px`
    }

    styleExtractor.processElement({
      className: contentColumnClass,
      tailwindClasses: spacingX !== undefined ? 'flex flex-col' : 'flex flex-col px-[var(--spacing-container)]',
      additionalStyles: contentColumnAdditionalStyles,
    })

    styleExtractor.processElement({
      className: headerClass,
      tailwindClasses: 'flex flex-col gap-[var(--spacing-md)]',
    })

    styleExtractor.processElement({
      className: contentClass,
      tailwindClasses: 'flex flex-col gap-[var(--spacing-md)]',
    })

    styleExtractor.processElement({
      className: buttonsClass,
      tailwindClasses: 'flex gap-[var(--spacing-md)]',
    })

    styleExtractor.processElement({
      className: subheadlineClass,
      tailwindClasses: 'text-[var(--text-xl)] m-0',
      additionalStyles: {
        color: 'var(--color-muted)',
        fontFamily: 'var(--font-body)',
        ...extractFieldStyles(fieldStyles, 'subheadline'),
      },
    })

    styleExtractor.processElement({
      className: paragraphClass,
      tailwindClasses: 'text-[var(--text-base)] m-0',
      additionalStyles: {
        color: 'var(--color-muted)',
        fontFamily: 'var(--font-body)',
        ...extractFieldStyles(fieldStyles, 'paragraph'),
      },
    })

    return `
    <section class="${heroClass}" data-section-id="${id}">
      <div class="${splitContainerClass}">
        <div class="${mediaColumnClass}">
          ${media?.src ? `<div class="${mediaInnerClass}">${mediaHTML}</div>` : `<div class="${placeholderClass}"></div>`}
        </div>
        <div class="${contentColumnClass}">
          <div class="${headerClass}">
            ${headline ? `<h1 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h1>` : ''}
            ${subheadline ? `<p class="${subheadlineClass}" data-field="subheadline">${escapeHtml(subheadline)}</p>` : ''}
          </div>
          <div class="${contentClass}">
            ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
            <div class="${buttonsClass}">
              ${primaryButtonHTML}
              ${secondaryButtonHTML}
            </div>
          </div>
        </div>
      </div>
    </section>`
  }

  if (variant === 'overlay') {
    const overlayHeight = (styles as Record<string, unknown>)?.overlayHeight ?? 'full'
    const positionX = (styles as Record<string, unknown>)?.overlayPositionX ?? 'center'
    const positionY = (styles as Record<string, unknown>)?.overlayPositionY ?? 'middle'
    const overlayColor = (styles as Record<string, unknown>)?.overlayColor ?? '#000000'
    const overlayOpacity = (styles as Record<string, unknown>)?.overlayOpacity ?? 50
    const overlayBlur = (styles as Record<string, unknown>)?.overlayBlur ?? 0

    const minHeight = overlayHeight === 'full' ? '100vh' : '50vh'

    // Convert hex to RGB
    const hex = (overlayColor as string).replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const rgba = `rgba(${r}, ${g}, ${b}, ${overlayOpacity / 100})`

    const textAlign = positionX === 'left' ? 'left' : positionX === 'right' ? 'right' : 'center'
    const itemsAlign = positionX === 'left' ? 'flex-start' : positionX === 'right' ? 'flex-end' : 'center'

    const mediaBgClass = styleExtractor.createChildClass(heroClass, 'media-bg')
    const overlayLayerClass = styleExtractor.createChildClass(heroClass, 'overlay-layer')
    const overlayContainerClass = styleExtractor.createChildClass(heroClass, 'overlay-container')
    const overlayWrapperClass = styleExtractor.createChildClass(heroClass, 'overlay-wrapper')

    // Process overlay variant styling
    styleExtractor.processElement({
      className: heroClass,
      tailwindClasses: 'relative overflow-hidden flex',
      additionalStyles: { minHeight: minHeight },
    })

    styleExtractor.processElement({
      className: mediaBgClass,
      tailwindClasses: 'absolute inset-0',
      additionalStyles: {
        backgroundColor: 'var(--color-secondary)',
      },
    })

    if (media?.src) {
      styleExtractor.processElement({
        className: mediaClass,
        tailwindClasses: 'w-full h-full object-cover',
      })
    }

    styleExtractor.processElement({
      className: overlayLayerClass,
      tailwindClasses: 'absolute inset-0',
      additionalStyles: {
        backgroundColor: rgba,
        ...(overlayBlur > 0 && { backdropFilter: `blur(${overlayBlur}px)` }),
      },
    })

    // Position style calculation
    const positionStyles: Record<string, string> = { position: 'absolute', zIndex: '10' }
    if (positionY === 'top') {
      positionStyles.top = '0'
    } else if (positionY === 'bottom') {
      positionStyles.bottom = '0'
    } else {
      positionStyles.top = '50%'
      positionStyles.transform = 'translateY(-50%)'
    }

    if (positionX === 'left') {
      positionStyles.left = '0'
    } else if (positionX === 'right') {
      positionStyles.right = '0'
    } else {
      positionStyles.left = '50%'
      if (positionY === 'middle') {
        positionStyles.transform = 'translate(-50%, -50%)'
      } else {
        positionStyles.transform = 'translateX(-50%)'
      }
    }

    styleExtractor.processElement({
      className: overlayContainerClass,
      tailwindClasses: 'p-[var(--spacing-container)] py-[var(--spacing-section)] w-full max-w-[1200px] mx-auto',
      additionalStyles: positionStyles,
    })

    styleExtractor.processElement({
      className: overlayWrapperClass,
      tailwindClasses: 'flex flex-col',
      additionalStyles: {
        gap: `${spaceBetween}px`,
        textAlign: textAlign,
        alignItems: itemsAlign,
      },
    })

    styleExtractor.processElement({
      className: headerClass,
      tailwindClasses: 'flex flex-col gap-[var(--spacing-sm)]',
      additionalStyles: {
        textAlign: textAlign,
        alignItems: itemsAlign,
      },
    })

    styleExtractor.processElement({
      className: contentClass,
      tailwindClasses: 'flex flex-col gap-[var(--spacing-md)]',
      additionalStyles: {
        textAlign: textAlign,
        alignItems: itemsAlign,
      },
    })

    styleExtractor.processElement({
      className: buttonsClass,
      tailwindClasses: 'flex gap-[var(--spacing-md)]',
    })

    styleExtractor.processElement({
      className: headlineClass,
      tailwindClasses: 'text-[var(--text-5xl)] font-bold m-0',
      additionalStyles: {
        lineHeight: '1.2',
        color: 'white',
        fontFamily: 'var(--font-heading)',
        ...extractFieldStyles(fieldStyles, 'headline'),
      },
    })

    styleExtractor.processElement({
      className: subheadlineClass,
      tailwindClasses: 'text-[var(--text-xl)] m-0',
      additionalStyles: {
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'var(--font-body)',
        ...extractFieldStyles(fieldStyles, 'subheadline'),
      },
    })

    styleExtractor.processElement({
      className: paragraphClass,
      tailwindClasses: 'text-[var(--text-base)] m-0 max-w-[600px]',
      additionalStyles: {
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'var(--font-body)',
        ...extractFieldStyles(fieldStyles, 'paragraph'),
      },
    })

    return `
    <section class="${heroClass}" data-section-id="${id}">
      <div class="${mediaBgClass}">${media?.src ? mediaHTML : ''}</div>
      <div class="${overlayLayerClass}"></div>
      <div class="${overlayContainerClass}">
        <div class="${overlayWrapperClass}">
          <div class="${headerClass}">
            ${headline ? `<h1 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h1>` : ''}
            ${subheadline ? `<p class="${subheadlineClass}" data-field="subheadline">${escapeHtml(subheadline)}</p>` : ''}
          </div>
          <div class="${contentClass}">
            ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
            <div class="${buttonsClass}">
              ${primaryButtonHTML}
              ${secondaryButtonHTML}
            </div>
          </div>
        </div>
      </div>
    </section>`
  }

  if (variant === 'presentation') {
    const layout = (styles as Record<string, unknown>)?.heroPresentationLayout ?? 'inline'

    const presContainerClass = styleExtractor.createChildClass(heroClass, 'pres-container')
    const profileClass = styleExtractor.createChildClass(heroClass, 'profile')
    const profileImgClass = styleExtractor.createChildClass(heroClass, 'profile-img')
    const profilePlaceholderClass = styleExtractor.createChildClass(heroClass, 'profile-placeholder')
    const profilePlaceholderTextClass = styleExtractor.createChildClass(heroClass, 'profile-placeholder-text')
    const presContentClass = styleExtractor.createChildClass(heroClass, 'pres-content')
    const presHeaderRowClass = styleExtractor.createChildClass(heroClass, 'pres-header-row')
    const presButtonsClass = styleExtractor.createChildClass(heroClass, 'pres-buttons')

    if (layout === 'inline') {
      // Process inline presentation variant
      styleExtractor.processElement({
        className: presContainerClass,
        tailwindClasses: 'max-w-[1200px] mx-auto w-full flex flex-row items-start',
        additionalStyles: { gap: `${spaceBetween}px` },
      })

      styleExtractor.processElement({
        className: profileClass,
        tailwindClasses: 'flex-shrink-0',
      })

      if (media?.src && media.type === 'image') {
        styleExtractor.processElement({
          className: profileImgClass,
          tailwindClasses: 'w-[128px] h-[128px] rounded-full object-cover',
        })
      } else {
        styleExtractor.processElement({
          className: profilePlaceholderClass,
          tailwindClasses: 'w-[128px] h-[128px] rounded-full bg-[var(--color-secondary)] flex items-center justify-center',
        })
        styleExtractor.processElement({
          className: profilePlaceholderTextClass,
          tailwindClasses: 'text-[12px]',
          additionalStyles: {
            color: 'var(--color-muted)',
          },
        })
      }

      styleExtractor.processElement({
        className: presContentClass,
        tailwindClasses: 'flex flex-col gap-[var(--spacing-md)] flex-1',
      })

      styleExtractor.processElement({
        className: presHeaderRowClass,
        tailwindClasses: 'flex flex-wrap items-center gap-[var(--spacing-md)]',
      })

      styleExtractor.processElement({
        className: presButtonsClass,
        tailwindClasses: 'flex gap-[var(--spacing-sm)]',
      })

      styleExtractor.processElement({
        className: headlineClass,
        tailwindClasses: 'text-[var(--text-4xl)] font-bold m-0',
        additionalStyles: {
          lineHeight: '1.2',
          fontFamily: 'var(--font-heading)',
          ...extractFieldStyles(fieldStyles, 'headline'),
        },
      })

      styleExtractor.processElement({
        className: subheadlineClass,
        tailwindClasses: 'text-[var(--text-lg)] m-0',
        additionalStyles: {
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-body)',
          ...extractFieldStyles(fieldStyles, 'subheadline'),
        },
      })

      styleExtractor.processElement({
        className: paragraphClass,
        tailwindClasses: 'text-[var(--text-base)] m-0',
        additionalStyles: {
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-body)',
          ...extractFieldStyles(fieldStyles, 'paragraph'),
        },
      })

      if (primaryCTA?.label) {
        styleExtractor.processElement({
          className: primaryBtnClass,
          tailwindClasses: 'inline-flex items-center justify-center no-underline',
          additionalStyles: {
            padding: 'var(--btn-py) var(--btn-px)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-primary-fg)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--btn-weight)',
            borderRadius: 'var(--btn-radius)',
            ...extractFieldStyles(fieldStyles, 'primaryCTA'),
          },
        })
      }

      if (secondaryCTA?.label) {
        styleExtractor.processElement({
          className: secondaryBtnClass,
          tailwindClasses: 'inline-flex items-center justify-center no-underline',
          additionalStyles: {
            padding: 'var(--btn-py) var(--btn-px)',
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-secondary-fg)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--btn-weight)',
            borderRadius: 'var(--btn-radius)',
            ...extractFieldStyles(fieldStyles, 'secondaryCTA'),
          },
        })
      }

      const primaryButtonHTMLSmall = primaryCTA?.label ? `<a class="${primaryBtnClass}" href="${escapeHtml(primaryCTA.url || '#')}" data-field="primaryCTA">${escapeHtml(primaryCTA.label)}</a>` : ''
      const secondaryButtonHTMLSmall = secondaryCTA?.label ? `<a class="${secondaryBtnClass}" href="${escapeHtml(secondaryCTA.url || '#')}" data-field="secondaryCTA">${escapeHtml(secondaryCTA.label)}</a>` : ''

      return `
      <section class="${heroClass}" data-section-id="${id}">
        <div class="${presContainerClass}">
          <div class="${profileClass}">
            ${media?.src && media.type === 'image' ? `<img class="${profileImgClass}" src="${escapeHtml(media.src)}" alt="${escapeHtml(media.alt || '')}" />` : `<div class="${profilePlaceholderClass}"><span class="${profilePlaceholderTextClass}">Photo</span></div>`}
          </div>
          <div class="${presContentClass}">
            <div class="${presHeaderRowClass}">
              ${headline ? `<h1 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h1>` : ''}
              <div class="${presButtonsClass}">
                ${primaryButtonHTMLSmall}
                ${secondaryButtonHTMLSmall}
              </div>
            </div>
            ${subheadline ? `<p class="${subheadlineClass}" data-field="subheadline">${escapeHtml(subheadline)}</p>` : ''}
            ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
          </div>
        </div>
      </section>`
    } else {
      // Stacked layout
      styleExtractor.processElement({
        className: presContainerClass,
        tailwindClasses: 'max-w-[800px] mx-auto w-full flex flex-col items-center text-center',
        additionalStyles: { gap: `${spaceBetween}px` },
      })

      if (media?.src && media.type === 'image') {
        styleExtractor.processElement({
          className: profileImgClass,
          tailwindClasses: 'w-[128px] h-[128px] rounded-full object-cover',
        })
      } else {
        styleExtractor.processElement({
          className: profilePlaceholderClass,
          tailwindClasses: 'w-[128px] h-[128px] rounded-full bg-[var(--color-secondary)] flex items-center justify-center',
        })
        styleExtractor.processElement({
          className: profilePlaceholderTextClass,
          tailwindClasses: 'text-[12px]',
          additionalStyles: {
            color: 'var(--color-muted)',
          },
        })
      }

      styleExtractor.processElement({
        className: headerClass,
        tailwindClasses: 'flex flex-col gap-[var(--spacing-md)] items-center',
      })

      styleExtractor.processElement({
        className: contentClass,
        tailwindClasses: 'flex flex-col gap-[var(--spacing-md)] items-center',
      })

      styleExtractor.processElement({
        className: presButtonsClass,
        tailwindClasses: 'flex gap-[var(--spacing-sm)]',
      })

      styleExtractor.processElement({
        className: headlineClass,
        tailwindClasses: 'text-[var(--text-4xl)] font-bold m-0',
        additionalStyles: {
          lineHeight: '1.2',
          fontFamily: 'var(--font-heading)',
          ...extractFieldStyles(fieldStyles, 'headline'),
        },
      })

      styleExtractor.processElement({
        className: subheadlineClass,
        tailwindClasses: 'text-[var(--text-lg)] m-0',
        additionalStyles: {
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-body)',
          ...extractFieldStyles(fieldStyles, 'subheadline'),
        },
      })

      styleExtractor.processElement({
        className: paragraphClass,
        tailwindClasses: 'text-[var(--text-base)] m-0',
        additionalStyles: {
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-body)',
          ...extractFieldStyles(fieldStyles, 'paragraph'),
        },
      })

      return `
      <section class="${heroClass}" data-section-id="${id}">
        <div class="${presContainerClass}">
          ${media?.src && media.type === 'image' ? `<img class="${profileImgClass}" src="${escapeHtml(media.src)}" alt="${escapeHtml(media.alt || '')}" />` : `<div class="${profilePlaceholderClass}"><span class="${profilePlaceholderTextClass}">Photo</span></div>`}
          <div class="${headerClass}">
            ${headline ? `<h1 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h1>` : ''}
            ${subheadline ? `<p class="${subheadlineClass}" data-field="subheadline">${escapeHtml(subheadline)}</p>` : ''}
          </div>
          <div class="${contentClass}">
            ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
            <div class="${presButtonsClass}">
              ${primaryButtonHTML}
              ${secondaryButtonHTML}
            </div>
          </div>
        </div>
      </section>`
    }
  }

  // Default fallback (stacked option1)
  return generateHeroHTML({ ...section, variant: 'stacked' }, theme, sectionStyle)
}

// ============================================
// STYLE RESOLVER HELPERS (matching section-styles.ts)
// ============================================

function resolveSharedFormInputStyles(sectionStyles: Record<string, unknown> | undefined): string {
  if (!sectionStyles) return ''
  const styles: string[] = []

  if (sectionStyles.formInputPaddingX !== undefined) {
    styles.push(`padding-left: ${sectionStyles.formInputPaddingX}px`)
    styles.push(`padding-right: ${sectionStyles.formInputPaddingX}px`)
  }
  if (sectionStyles.formInputPaddingY !== undefined) {
    styles.push(`padding-top: ${sectionStyles.formInputPaddingY}px`)
    styles.push(`padding-bottom: ${sectionStyles.formInputPaddingY}px`)
  }
  if (sectionStyles.formInputBackgroundColor) {
    styles.push(`background-color: ${sectionStyles.formInputBackgroundColor}`)
  }
  if (sectionStyles.formInputBorderWidth !== undefined && sectionStyles.formInputBorderWidth > 0) {
    styles.push(`border-width: ${sectionStyles.formInputBorderWidth}px`)
    styles.push(`border-style: solid`)
    if (sectionStyles.formInputBorderColor) {
      styles.push(`border-color: ${sectionStyles.formInputBorderColor}`)
    }
  }
  if (sectionStyles.formInputRadius !== undefined) {
    styles.push(`border-radius: ${sectionStyles.formInputRadius}px`)
  }
  if (sectionStyles.formInputFontSize !== undefined) {
    styles.push(`font-size: ${sectionStyles.formInputFontSize}px`)
  }
  if (sectionStyles.formInputTextColor) {
    styles.push(`color: ${sectionStyles.formInputTextColor}`)
  }

  return styles.join('; ')
}

function resolveSharedLinkContainerStyles(sectionStyles: Record<string, unknown> | undefined): string {
  if (!sectionStyles) return ''
  const styles: string[] = []

  if (sectionStyles.linkPaddingX !== undefined) {
    styles.push(`padding-left: ${sectionStyles.linkPaddingX}px`)
    styles.push(`padding-right: ${sectionStyles.linkPaddingX}px`)
  }
  if (sectionStyles.linkPaddingY !== undefined) {
    styles.push(`padding-top: ${sectionStyles.linkPaddingY}px`)
    styles.push(`padding-bottom: ${sectionStyles.linkPaddingY}px`)
  }
  if (sectionStyles.linkBackgroundColor) {
    styles.push(`background-color: ${sectionStyles.linkBackgroundColor}`)
  }
  if (sectionStyles.linkBorderWidth !== undefined && sectionStyles.linkBorderWidth > 0) {
    styles.push(`border-width: ${sectionStyles.linkBorderWidth}px`)
    styles.push(`border-style: solid`)
    if (sectionStyles.linkBorderColor) {
      styles.push(`border-color: ${sectionStyles.linkBorderColor}`)
    }
  }
  if (sectionStyles.linkRadius !== undefined) {
    styles.push(`border-radius: ${sectionStyles.linkRadius}px`)
  }

  return styles.join('; ')
}

function resolveSharedLinkTextStyles(
  sectionStyles: Record<string, unknown> | undefined,
  fieldType: 'Label' | 'Description'
): string {
  if (!sectionStyles) return ''
  const styles: string[] = []

  const fontSizeKey = `link${fieldType}FontSize`
  const colorKey = `link${fieldType}TextColor`

  if (sectionStyles[fontSizeKey] !== undefined) {
    styles.push(`font-size: ${sectionStyles[fontSizeKey]}px`)
  }
  if (sectionStyles[colorKey]) {
    styles.push(`color: ${sectionStyles[colorKey]}`)
  }

  return styles.join('; ')
}

function resolveSharedCardContainerStyles(sectionStyles: Record<string, unknown> | undefined): string {
  if (!sectionStyles) return ''
  const styles: string[] = []

  if (sectionStyles.cardPaddingX !== undefined) {
    styles.push(`padding-left: ${sectionStyles.cardPaddingX}px`)
    styles.push(`padding-right: ${sectionStyles.cardPaddingX}px`)
  }
  if (sectionStyles.cardPaddingY !== undefined) {
    styles.push(`padding-top: ${sectionStyles.cardPaddingY}px`)
    styles.push(`padding-bottom: ${sectionStyles.cardPaddingY}px`)
  }
  if (sectionStyles.cardBackgroundColor) {
    styles.push(`background-color: ${sectionStyles.cardBackgroundColor}`)
  }
  if (sectionStyles.cardBorderWidth !== undefined && sectionStyles.cardBorderWidth > 0) {
    styles.push(`border-width: ${sectionStyles.cardBorderWidth}px`)
    styles.push(`border-style: solid`)
    if (sectionStyles.cardBorderColor) {
      styles.push(`border-color: ${sectionStyles.cardBorderColor}`)
    }
  }
  if (sectionStyles.cardRadius !== undefined) {
    styles.push(`border-radius: ${sectionStyles.cardRadius}px`)
  }

  return styles.join('; ')
}

function resolveSharedCardInnerGap(sectionStyles: Record<string, unknown> | undefined): string {
  const gap = sectionStyles?.cardInnerSpaceBetween
  return gap !== undefined ? `${gap}px` : 'var(--spacing-xs)'
}

function getCardMediaAspectRatio(aspect: string | undefined): string {
  switch (aspect) {
    case 'square': return '1 / 1'
    case 'portrait': return '3 / 4'
    case 'paysage': return '4 / 3'
    default: return '16 / 9'
  }
}

function resolveSharedCardMediaStyles(sectionStyles: Record<string, unknown> | undefined): string {
  if (!sectionStyles) return ''
  const styles: string[] = []

  if (sectionStyles.cardMediaRadius !== undefined) {
    styles.push(`border-radius: ${sectionStyles.cardMediaRadius}px`)
  }
  if (sectionStyles.cardMediaAspect) {
    styles.push(`aspect-ratio: ${getCardMediaAspectRatio(sectionStyles.cardMediaAspect as string)}`)
  }

  return styles.join('; ')
}

function resolveSharedCardTextStyles(
  sectionStyles: Record<string, unknown> | undefined,
  fieldType: 'Headline' | 'Subheadline' | 'Paragraph'
): string {
  if (!sectionStyles) return ''
  const styles: string[] = []

  const fontSizeKey = `card${fieldType}FontSize`
  const paddingXKey = `card${fieldType}PaddingX`
  const paddingYKey = `card${fieldType}PaddingY`
  const colorKey = `card${fieldType}TextColor`

  if (sectionStyles[fontSizeKey] !== undefined) {
    styles.push(`font-size: ${sectionStyles[fontSizeKey]}px`)
  }
  if (sectionStyles[paddingXKey] !== undefined) {
    styles.push(`margin-left: ${sectionStyles[paddingXKey]}px`)
    styles.push(`margin-right: ${sectionStyles[paddingXKey]}px`)
  }
  if (sectionStyles[paddingYKey] !== undefined) {
    styles.push(`margin-top: ${sectionStyles[paddingYKey]}px`)
    styles.push(`margin-bottom: ${sectionStyles[paddingYKey]}px`)
  }
  if (sectionStyles[colorKey]) {
    styles.push(`color: ${sectionStyles[colorKey]}`)
  }

  return styles.join('; ')
}

function resolveSharedCardButtonStyles(sectionStyles: Record<string, unknown> | undefined): string {
  if (!sectionStyles) return ''
  const styles: string[] = []

  if (sectionStyles.cardButtonFontSize !== undefined) {
    styles.push(`font-size: ${sectionStyles.cardButtonFontSize}px`)
  }
  if (sectionStyles.cardButtonPaddingX !== undefined) {
    styles.push(`padding-left: ${sectionStyles.cardButtonPaddingX}px`)
    styles.push(`padding-right: ${sectionStyles.cardButtonPaddingX}px`)
  }
  if (sectionStyles.cardButtonPaddingY !== undefined) {
    styles.push(`padding-top: ${sectionStyles.cardButtonPaddingY}px`)
    styles.push(`padding-bottom: ${sectionStyles.cardButtonPaddingY}px`)
  }
  if (sectionStyles.cardButtonRadius !== undefined) {
    styles.push(`border-radius: ${sectionStyles.cardButtonRadius}px`)
  }
  if (sectionStyles.cardButtonBorderWidth !== undefined && sectionStyles.cardButtonBorderWidth > 0) {
    styles.push(`border-width: ${sectionStyles.cardButtonBorderWidth}px`)
    styles.push(`border-style: solid`)
    if (sectionStyles.cardButtonBorderColor) {
      styles.push(`border-color: ${sectionStyles.cardButtonBorderColor}`)
    }
  }
  if (sectionStyles.cardButtonTextColor) {
    styles.push(`color: ${sectionStyles.cardButtonTextColor}`)
  }
  if (sectionStyles.cardButtonBackgroundColor) {
    styles.push(`background-color: ${sectionStyles.cardButtonBackgroundColor}`)
  }

  return styles.join('; ')
}

// Product style resolvers (same as card but with product prefix)
function resolveSharedProductContainerStyles(sectionStyles: Record<string, unknown> | undefined): string {
  if (!sectionStyles) return ''
  const styles: string[] = []

  if (sectionStyles.productPaddingX !== undefined) {
    styles.push(`padding-left: ${sectionStyles.productPaddingX}px`)
    styles.push(`padding-right: ${sectionStyles.productPaddingX}px`)
  }
  if (sectionStyles.productPaddingY !== undefined) {
    styles.push(`padding-top: ${sectionStyles.productPaddingY}px`)
    styles.push(`padding-bottom: ${sectionStyles.productPaddingY}px`)
  }
  if (sectionStyles.productBackgroundColor) {
    styles.push(`background-color: ${sectionStyles.productBackgroundColor}`)
  }
  if (sectionStyles.productBorderWidth !== undefined && sectionStyles.productBorderWidth > 0) {
    styles.push(`border-width: ${sectionStyles.productBorderWidth}px`)
    styles.push(`border-style: solid`)
    if (sectionStyles.productBorderColor) {
      styles.push(`border-color: ${sectionStyles.productBorderColor}`)
    }
  }
  if (sectionStyles.productRadius !== undefined) {
    styles.push(`border-radius: ${sectionStyles.productRadius}px`)
  }

  return styles.join('; ')
}

function resolveSharedProductInnerGap(sectionStyles: Record<string, unknown> | undefined): string {
  const gap = sectionStyles?.productInnerSpaceBetween
  return gap !== undefined ? `${gap}px` : 'var(--spacing-xs)'
}

function resolveSharedProductMediaStyles(sectionStyles: Record<string, unknown> | undefined): string {
  if (!sectionStyles) return ''
  const styles: string[] = []

  if (sectionStyles.productMediaRadius !== undefined) {
    styles.push(`border-radius: ${sectionStyles.productMediaRadius}px`)
  }
  if (sectionStyles.productMediaAspect) {
    styles.push(`aspect-ratio: ${getCardMediaAspectRatio(sectionStyles.productMediaAspect as string)}`)
  }

  return styles.join('; ')
}

function resolveSharedProductTextStyles(
  sectionStyles: Record<string, unknown> | undefined,
  fieldType: 'Name' | 'Description' | 'Price'
): string {
  if (!sectionStyles) return ''
  const styles: string[] = []

  const fontSizeKey = `product${fieldType}FontSize`
  const colorKey = `product${fieldType}TextColor`

  if (sectionStyles[fontSizeKey] !== undefined) {
    styles.push(`font-size: ${sectionStyles[fontSizeKey]}px`)
  }
  if (sectionStyles[colorKey]) {
    styles.push(`color: ${sectionStyles[colorKey]}`)
  }

  return styles.join('; ')
}

function resolveSharedProductButtonStyles(sectionStyles: Record<string, unknown> | undefined): string {
  if (!sectionStyles) return ''
  const styles: string[] = []

  if (sectionStyles.productButtonFontSize !== undefined) {
    styles.push(`font-size: ${sectionStyles.productButtonFontSize}px`)
  }
  if (sectionStyles.productButtonPaddingX !== undefined) {
    styles.push(`padding-left: ${sectionStyles.productButtonPaddingX}px`)
    styles.push(`padding-right: ${sectionStyles.productButtonPaddingX}px`)
  }
  if (sectionStyles.productButtonPaddingY !== undefined) {
    styles.push(`padding-top: ${sectionStyles.productButtonPaddingY}px`)
    styles.push(`padding-bottom: ${sectionStyles.productButtonPaddingY}px`)
  }
  if (sectionStyles.productButtonRadius !== undefined) {
    styles.push(`border-radius: ${sectionStyles.productButtonRadius}px`)
  }
  if (sectionStyles.productButtonBorderWidth !== undefined && sectionStyles.productButtonBorderWidth > 0) {
    styles.push(`border-width: ${sectionStyles.productButtonBorderWidth}px`)
    styles.push(`border-style: solid`)
    if (sectionStyles.productButtonBorderColor) {
      styles.push(`border-color: ${sectionStyles.productButtonBorderColor}`)
    }
  }
  if (sectionStyles.productButtonTextColor) {
    styles.push(`color: ${sectionStyles.productButtonTextColor}`)
  }
  if (sectionStyles.productButtonBackgroundColor) {
    styles.push(`background-color: ${sectionStyles.productButtonBackgroundColor}`)
  }

  return styles.join('; ')
}

// ============================================
// CARDS SECTION
// ============================================

function generateCardsHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, variant, data, fieldStyles, styles } = section

  // Extract data fields
  const headline = data.headline as string || ''
  const subheadline = data.subheadline as string || ''
  const paragraph = data.paragraph as string || ''
  const items = data.items as Array<{
    id?: string
    media?: { type?: string; src?: string; alt?: string }
    headline?: string
    subheadline?: string
    paragraph?: string
    buttonLabel?: string
    buttonUrl?: string
  }> || []

  // Extract spacing
  const sectionSpaceBetween = (styles as Record<string, unknown>)?.spaceBetween ?? 32
  const itemsSpaceBetween = (styles as Record<string, unknown>)?.itemsSpaceBetween ?? 16

  // Shared card styles (these are resolved but not directly used - passed to styleExtractor)
  const sharedContainerStyle = resolveSharedCardContainerStyles(styles as Record<string, unknown>)
  const sharedInnerGap = resolveSharedCardInnerGap(styles as Record<string, unknown>)
  const sharedMediaStyle = resolveSharedCardMediaStyles(styles as Record<string, unknown>)
  const sharedHeadlineStyle = resolveSharedCardTextStyles(styles as Record<string, unknown>, 'Headline')
  const sharedSubheadlineStyle = resolveSharedCardTextStyles(styles as Record<string, unknown>, 'Subheadline')
  const sharedParagraphStyle = resolveSharedCardTextStyles(styles as Record<string, unknown>, 'Paragraph')
  const sharedButtonStyle = resolveSharedCardButtonStyles(styles as Record<string, unknown>)

  // Create class names
  const cardsClass = styleExtractor.createRootClass('cards')
  const containerClass = styleExtractor.createChildClass(cardsClass, 'container')
  const headerBlockClass = styleExtractor.createChildClass(cardsClass, 'header-block')
  const headlineClass = styleExtractor.createChildClass(cardsClass, 'headline')
  const subheadlineClass = styleExtractor.createChildClass(cardsClass, 'subheadline')
  const paragraphClass = styleExtractor.createChildClass(cardsClass, 'paragraph')
  const gridClass = styleExtractor.createChildClass(cardsClass, 'grid')
  const rowContainerClass = styleExtractor.createChildClass(cardsClass, 'row-container')

  // Process section element
  styleExtractor.processElement({
    className: cardsClass,
    tailwindClasses: 'px-[var(--spacing-container)] py-[var(--spacing-section)]',
    inlineStyle: sectionStyle,
    additionalStyles: {
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-fg)',
    },
  })

  // Process container
  styleExtractor.processElement({
    className: containerClass,
    tailwindClasses: 'flex flex-col w-full max-w-[1200px] mx-auto',
    additionalStyles: { gap: `${sectionSpaceBetween}px` },
  })

  // Process header block
  const hasHeaderContent = headline || subheadline || paragraph
  if (hasHeaderContent) {
    styleExtractor.processElement({
      className: headerBlockClass,
      tailwindClasses: 'flex flex-col gap-[var(--spacing-sm)]',
    })

    if (headline) {
      styleExtractor.processElement({
        className: headlineClass,
        tailwindClasses: 'text-[var(--text-3xl)] font-bold m-0',
        additionalStyles: {
          lineHeight: '1.2',
          fontFamily: 'var(--font-heading)',
          ...extractFieldStyles(fieldStyles, 'headline'),
        },
      })
    }

    if (subheadline) {
      styleExtractor.processElement({
        className: subheadlineClass,
        tailwindClasses: 'text-[var(--text-lg)] m-0',
        additionalStyles: {
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-heading)',
          ...extractFieldStyles(fieldStyles, 'subheadline'),
        },
      })
    }

    if (paragraph) {
      styleExtractor.processElement({
        className: paragraphClass,
        tailwindClasses: 'text-[var(--text-base)] m-0',
        additionalStyles: {
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-body)',
          ...extractFieldStyles(fieldStyles, 'paragraph'),
        },
      })
    }
  }

  const sectionHeaderHTML = hasHeaderContent ? `
    <div class="${headerBlockClass}">
      ${headline ? `<h2 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h2>` : ''}
      ${subheadline ? `<h3 class="${subheadlineClass}" data-field="subheadline">${escapeHtml(subheadline)}</h3>` : ''}
      ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
    </div>
  ` : ''

  // Generate card HTML with styleExtractor (used by all variants)
  function generateCardHTML(item: typeof items[0], index: number, variantType: string): string {
    const mediaAspectRatio = getCardMediaAspectRatio((styles as Record<string, unknown>)?.cardMediaAspect as string)
    const cardItemClass = styleExtractor.createChildClass(cardsClass, `item_${index}`)
    const mediaContainerClass = styleExtractor.createChildClass(cardsClass, `item_${index}_media-container`)
    const mediaClass = styleExtractor.createChildClass(cardsClass, `item_${index}_media`)
    const contentClass = styleExtractor.createChildClass(cardsClass, `item_${index}_content`)
    const itemHeadlineClass = styleExtractor.createChildClass(cardsClass, `item_${index}_headline`)
    const itemSubheadlineClass = styleExtractor.createChildClass(cardsClass, `item_${index}_subheadline`)
    const itemParagraphClass = styleExtractor.createChildClass(cardsClass, `item_${index}_paragraph`)
    const buttonClass = styleExtractor.createChildClass(cardsClass, `item_${index}_button`)

    // Process media container
    if (item.media?.src) {
      styleExtractor.processElement({
        className: mediaContainerClass,
        tailwindClasses: 'w-full overflow-hidden',
        additionalStyles: {
          ...(sharedMediaStyle && Object.fromEntries(
            sharedMediaStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })

      styleExtractor.processElement({
        className: mediaClass,
        tailwindClasses: 'w-full h-full object-cover',
        additionalStyles: {
          aspectRatio: mediaAspectRatio,
        },
      })
    }

    // Process content container
    styleExtractor.processElement({
      className: contentClass,
      tailwindClasses: 'p-[var(--spacing-md)] flex flex-col',
      additionalStyles: { gap: sharedInnerGap },
    })

    // Process item headline
    if (item.headline) {
      const textSize = variantType === 'row' ? 'var(--text-3xl)' : 'var(--text-xl)'
      styleExtractor.processElement({
        className: itemHeadlineClass,
        tailwindClasses: `text-[${textSize}] ${variantType === 'row' ? 'font-bold' : 'font-semibold'} m-0`,
        additionalStyles: {
          lineHeight: variantType === 'row' ? '1.2' : '1.5',
          fontFamily: 'var(--font-heading)',
          ...(sharedHeadlineStyle && Object.fromEntries(
            sharedHeadlineStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })
    }

    // Process item subheadline
    if (item.subheadline) {
      const textSize = variantType === 'row' ? 'var(--text-lg)' : 'var(--text-sm)'
      styleExtractor.processElement({
        className: itemSubheadlineClass,
        tailwindClasses: `text-[${textSize}] m-0`,
        additionalStyles: {
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-body)',
          ...(sharedSubheadlineStyle && Object.fromEntries(
            sharedSubheadlineStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })
    }

    // Process item paragraph
    if (item.paragraph) {
      styleExtractor.processElement({
        className: itemParagraphClass,
        tailwindClasses: 'text-[var(--text-base)] m-0',
        additionalStyles: {
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-body)',
          ...(sharedParagraphStyle && Object.fromEntries(
            sharedParagraphStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })
    }

    // Process button
    if (item.buttonLabel && item.buttonUrl) {
      styleExtractor.processElement({
        className: buttonClass,
        tailwindClasses: 'mt-[var(--spacing-sm)] inline-flex items-center justify-center font-medium no-underline',
        additionalStyles: {
          ...(sharedButtonStyle && Object.fromEntries(
            sharedButtonStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })
    }

    const mediaHTML = item.media?.src ? `
      <div class="${mediaContainerClass}">
        ${item.media.type === 'video'
          ? `<video class="${mediaClass}" src="${escapeHtml(item.media.src)}" autoplay muted loop playsinline></video>`
          : `<img class="${mediaClass}" src="${escapeHtml(item.media.src)}" alt="${escapeHtml(item.media.alt || '')}" loading="lazy" />`
        }
      </div>
    ` : ''

    const contentHTML = `
      <div class="${contentClass}">
        ${item.headline ? `<h3 class="${itemHeadlineClass}">${escapeHtml(item.headline)}</h3>` : ''}
        ${item.subheadline ? `<p class="${itemSubheadlineClass}">${escapeHtml(item.subheadline)}</p>` : ''}
        ${item.paragraph ? `<div class="${itemParagraphClass}">${item.paragraph}</div>` : ''}
        ${item.buttonLabel && item.buttonUrl ? `<a class="${buttonClass}" href="${escapeHtml(item.buttonUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.buttonLabel)}</a>` : ''}
      </div>
    `

    return { cardItemClass, mediaHTML, contentHTML }
  }

  // Variant-specific layouts
  if (variant === 'grid') {
    styleExtractor.processElement({
      className: gridClass,
      tailwindClasses: 'grid grid-cols-1',
      additionalStyles: { gap: `${itemsSpaceBetween}px` },
    })

    const cardsHTML = items.map((item, index) => {
      const { cardItemClass, mediaHTML, contentHTML } = generateCardHTML(item, index, 'grid')

      styleExtractor.processElement({
        className: cardItemClass,
        tailwindClasses: 'flex flex-col bg-[var(--color-surface)] rounded-[var(--radius-lg)] overflow-hidden',
        additionalStyles: {
          ...(sharedContainerStyle && Object.fromEntries(
            sharedContainerStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })

      return `
      <div class="${cardItemClass}" data-field="items" data-index="${index}">
        ${mediaHTML}${contentHTML}
      </div>
    `
    }).join('')

    return `
    <section class="${cardsClass}" data-section-id="${id}">
      <div class="${containerClass}">
        ${sectionHeaderHTML}
        <div class="${gridClass}">
          ${cardsHTML}
        </div>
      </div>
    </section>`
  }

  if (variant === 'row') {
    styleExtractor.processElement({
      className: rowContainerClass,
      tailwindClasses: 'flex flex-col w-full',
      additionalStyles: { gap: `${itemsSpaceBetween}px` },
    })

    const cardsHTML = items.map((item, index) => {
      const isMediaLeft = index % 2 === 0
      const { cardItemClass, mediaHTML, contentHTML } = generateCardHTML(item, index, 'row')
      const mediaWrapperClass = styleExtractor.createChildClass(cardsClass, `item_${index}_media-wrapper`)
      const contentWrapperClass = styleExtractor.createChildClass(cardsClass, `item_${index}_content-wrapper`)

      styleExtractor.processElement({
        className: cardItemClass,
        tailwindClasses: 'grid grid-cols-2 items-center gap-[var(--spacing-xl)]',
        additionalStyles: {
          ...(sharedContainerStyle && Object.fromEntries(
            sharedContainerStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })

      styleExtractor.processElement({
        className: mediaWrapperClass,
        tailwindClasses: '',
        additionalStyles: { order: isMediaLeft ? '1' : '2' },
      })

      styleExtractor.processElement({
        className: contentWrapperClass,
        tailwindClasses: 'flex flex-col',
        additionalStyles: { order: isMediaLeft ? '2' : '1', gap: sharedInnerGap },
      })

      return `
        <div class="${cardItemClass}" data-field="items" data-index="${index}">
          <div class="${mediaWrapperClass}">
            ${mediaHTML || `<div class="w-full aspect-[4/3] rounded-[var(--radius-lg)] bg-[var(--color-surface)] flex items-center justify-center"><span class="text-[var(--color-muted)]">Add media</span></div>`}
          </div>
          <div class="${contentWrapperClass}">
            ${contentHTML}
          </div>
        </div>
      `
    }).join('')

    return `
    <section class="${cardsClass}" data-section-id="${id}">
      <div class="${containerClass}">
        ${sectionHeaderHTML}
        <div class="${rowContainerClass}">
          ${cardsHTML}
        </div>
      </div>
    </section>`
  }

  if (variant === 'carousel') {
    const slidesPerView = (styles as Record<string, unknown>)?.slidesPerView ?? 3
    const gap = itemsSpaceBetween
    const gapOffset = ((slidesPerView - 1) * gap) / slidesPerView
    const cardWidth = `calc(${100 / slidesPerView}% - ${gapOffset}px)`

    const carouselWrapperClass = styleExtractor.createChildClass(cardsClass, 'carousel-wrapper')
    const carouselClass = styleExtractor.createChildClass(cardsClass, 'carousel')

    styleExtractor.processElement({
      className: carouselWrapperClass,
      tailwindClasses: 'relative w-full',
    })

    styleExtractor.processElement({
      className: carouselClass,
      tailwindClasses: 'flex overflow-x-auto pb-[var(--spacing-md)]',
      additionalStyles: { gap: `${itemsSpaceBetween}px` },
    })

    const cardsHTML = items.map((item, index) => {
      const { cardItemClass, mediaHTML, contentHTML } = generateCardHTML(item, index, 'carousel')

      styleExtractor.processElement({
        className: cardItemClass,
        tailwindClasses: 'flex-shrink-0 flex flex-col bg-[var(--color-surface)] rounded-[var(--radius-lg)] overflow-hidden',
        additionalStyles: {
          width: cardWidth,
          ...(sharedContainerStyle && Object.fromEntries(
            sharedContainerStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })

      return `
      <div class="${cardItemClass}" data-field="items" data-index="${index}">
        ${mediaHTML}${contentHTML}
      </div>
    `
    }).join('')

    return `
    <section class="${cardsClass}" data-section-id="${id}">
      <div class="${containerClass}">
        ${sectionHeaderHTML}
        <div class="${carouselWrapperClass}">
          <div class="${carouselClass}">
            ${cardsHTML}
          </div>
        </div>
      </div>
    </section>`
  }

  if (variant === 'split') {
    const splitContainerClass = styleExtractor.createChildClass(cardsClass, 'split-container')
    const splitHeaderClass = styleExtractor.createChildClass(cardsClass, 'split-header')
    const splitContentClass = styleExtractor.createChildClass(cardsClass, 'split-content')

    styleExtractor.processElement({
      className: splitContainerClass,
      tailwindClasses: 'max-w-[1200px] mx-auto w-full flex flex-row items-start',
      additionalStyles: { gap: `${sectionSpaceBetween}px` },
    })

    if (hasHeaderContent) {
      styleExtractor.processElement({
        className: splitHeaderClass,
        tailwindClasses: 'w-[33.333%] flex-shrink-0',
      })
    }

    styleExtractor.processElement({
      className: splitContentClass,
      tailwindClasses: `flex flex-col flex-1 ${hasHeaderContent ? 'w-[66.667%]' : 'w-full'}`,
      additionalStyles: { gap: `${itemsSpaceBetween}px` },
    })

    const cardsHTML = items.map((item, index) => {
      const { cardItemClass, mediaHTML, contentHTML } = generateCardHTML(item, index, 'split')

      styleExtractor.processElement({
        className: cardItemClass,
        tailwindClasses: 'flex-1 flex flex-col bg-[var(--color-surface)] rounded-[var(--radius-lg)] overflow-hidden',
        additionalStyles: {
          ...(sharedContainerStyle && Object.fromEntries(
            sharedContainerStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })

      return `
      <div class="${cardItemClass}" data-field="items" data-index="${index}">
        ${mediaHTML}${contentHTML}
      </div>
    `
    }).join('')

    return `
    <section class="${cardsClass}" data-section-id="${id}">
      <div class="${splitContainerClass}">
        ${hasHeaderContent ? `<div class="${splitHeaderClass}">${sectionHeaderHTML}</div>` : ''}
        <div class="${splitContentClass}">
          ${cardsHTML}
        </div>
      </div>
    </section>`
  }

  // Default fallback (grid)
  return generateCardsHTML({ ...section, variant: 'grid' }, theme, sectionStyle)
}

// ============================================
// CTA SECTION
// ============================================

function generateCTAHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, variant, data, fieldStyles, styles } = section

  // Extract data fields
  const headline = data.headline as string || ''
  const paragraph = data.paragraph as string || ''
  const primaryCTA = data.primaryCTA as { label?: string; url?: string } | undefined
  const secondaryCTA = data.secondaryCTA as { label?: string; url?: string } | undefined

  // Extract style options
  const ctaHeight = (styles as Record<string, unknown>)?.ctaHeight ?? 1
  const ctaLayout = (styles as Record<string, unknown>)?.ctaLayout ?? 'option1'
  const ctaWrapGap = (styles as Record<string, unknown>)?.ctaWrapGap ?? 32
  const splitLayout = (styles as Record<string, unknown>)?.splitLayout ?? 'content-buttons'

  // Create class names
  const ctaClass = styleExtractor.createRootClass('cta')
  const containerClass = styleExtractor.createChildClass(ctaClass, 'container')
  const headlineClass = styleExtractor.createChildClass(ctaClass, 'headline')
  const paragraphClass = styleExtractor.createChildClass(ctaClass, 'paragraph')
  const buttonsClass = styleExtractor.createChildClass(ctaClass, 'buttons')
  const primaryBtnClass = styleExtractor.createChildClass(ctaClass, 'primary-btn')
  const secondaryBtnClass = styleExtractor.createChildClass(ctaClass, 'secondary-btn')
  const wrapperClass = styleExtractor.createChildClass(ctaClass, 'wrapper')
  const contentClass = styleExtractor.createChildClass(ctaClass, 'content')

  // Height class (1=auto, 2=50vh, 3=100vh)
  const minHeight = ctaHeight === 3 ? '100vh' : ctaHeight === 2 ? '50vh' : 'auto'

  // Process section element
  styleExtractor.processElement({
    className: ctaClass,
    tailwindClasses: 'px-[var(--spacing-container)] py-[var(--spacing-section)]',
    inlineStyle: sectionStyle,
    additionalStyles: {
      minHeight: minHeight,
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-fg)',
    },
  })

  // Process headline
  styleExtractor.processElement({
    className: headlineClass,
    tailwindClasses: 'text-[var(--text-3xl)] font-bold m-0',
    additionalStyles: {
      lineHeight: '1.2',
      fontFamily: 'var(--font-heading)',
      ...extractFieldStyles(fieldStyles, 'headline'),
    },
  })

  // Process paragraph
  if (paragraph) {
    styleExtractor.processElement({
      className: paragraphClass,
      tailwindClasses: 'text-[var(--text-base)] m-0',
      additionalStyles: {
        color: 'var(--color-muted)',
        fontFamily: 'var(--font-body)',
        ...extractFieldStyles(fieldStyles, 'paragraph'),
      },
    })
  }

  // Process primary button
  if (primaryCTA?.label) {
    styleExtractor.processElement({
      className: primaryBtnClass,
      tailwindClasses: 'inline-flex items-center justify-center no-underline',
      additionalStyles: {
        padding: 'var(--btn-py) var(--btn-px)',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-primary-fg)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--btn-weight)',
        borderRadius: 'var(--btn-radius)',
        ...extractFieldStyles(fieldStyles, 'primaryCTA'),
      },
    })
  }

  // Process secondary button
  if (secondaryCTA?.label) {
    styleExtractor.processElement({
      className: secondaryBtnClass,
      tailwindClasses: 'inline-flex items-center justify-center no-underline',
      additionalStyles: {
        padding: 'var(--btn-py) var(--btn-px)',
        backgroundColor: 'var(--color-secondary)',
        color: 'var(--color-secondary-fg)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--btn-weight)',
        borderRadius: 'var(--btn-radius)',
        ...extractFieldStyles(fieldStyles, 'secondaryCTA'),
      },
    })
  }

  // Buttons HTML
  const primaryButtonHTML = primaryCTA?.label ? `
    <a href="${escapeHtml(primaryCTA.url || '#')}" class="${primaryBtnClass}" data-field="primaryCTA">${escapeHtml(primaryCTA.label)}</a>
  ` : ''

  const secondaryButtonHTML = secondaryCTA?.label ? `
    <a href="${escapeHtml(secondaryCTA.url || '#')}" class="${secondaryBtnClass}" data-field="secondaryCTA">${escapeHtml(secondaryCTA.label)}</a>
  ` : ''

  if (variant === 'stacked') {
    if (ctaLayout === 'option1') {
      // Option 1: Centered
      styleExtractor.processElement({
        className: containerClass,
        tailwindClasses: 'max-w-[800px] mx-auto w-full text-center flex flex-col items-center gap-[var(--spacing-md)]',
        additionalStyles: ctaHeight !== 1 ? { justifyContent: 'center', height: '100%' } : {},
      })

      styleExtractor.processElement({
        className: buttonsClass,
        tailwindClasses: 'flex flex-wrap items-center justify-center mt-[var(--spacing-sm)]',
        additionalStyles: { gap: `${ctaWrapGap}px` },
      })

      if (paragraph) {
        styleExtractor.processElement({
          className: paragraphClass,
          tailwindClasses: 'text-[var(--text-base)] m-0 max-w-[600px]',
          additionalStyles: {
            color: 'var(--color-muted)',
            fontFamily: 'var(--font-body)',
            ...extractFieldStyles(fieldStyles, 'paragraph'),
          },
        })
      }

      return `
      <section class="${ctaClass}" data-section-id="${id}">
        <div class="${containerClass}">
          <h2 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h2>
          ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
          <div class="${buttonsClass}">
            ${primaryButtonHTML}
            ${secondaryButtonHTML}
          </div>
        </div>
      </section>`
    }

    if (ctaLayout === 'option2') {
      // Option 2: Left-aligned
      styleExtractor.processElement({
        className: containerClass,
        tailwindClasses: 'max-w-[800px] mx-auto w-full flex flex-col gap-[var(--spacing-md)]',
        additionalStyles: ctaHeight !== 1 ? { justifyContent: 'center', height: '100%' } : {},
      })

      styleExtractor.processElement({
        className: buttonsClass,
        tailwindClasses: 'flex flex-wrap items-center mt-[var(--spacing-sm)]',
        additionalStyles: { gap: `${ctaWrapGap}px` },
      })

      if (paragraph) {
        styleExtractor.processElement({
          className: paragraphClass,
          tailwindClasses: 'text-[var(--text-base)] m-0 max-w-[600px]',
          additionalStyles: {
            color: 'var(--color-muted)',
            fontFamily: 'var(--font-body)',
            ...extractFieldStyles(fieldStyles, 'paragraph'),
          },
        })
      }

      return `
      <section class="${ctaClass}" data-section-id="${id}">
        <div class="${containerClass}">
          <h2 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h2>
          ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
          <div class="${buttonsClass}">
            ${primaryButtonHTML}
            ${secondaryButtonHTML}
          </div>
        </div>
      </section>`
    }

    // Option 3: Headline with inline buttons
    styleExtractor.processElement({
      className: containerClass,
      tailwindClasses: 'max-w-[1200px] mx-auto w-full flex flex-col gap-[var(--spacing-md)]',
      additionalStyles: ctaHeight !== 1 ? { justifyContent: 'center', height: '100%' } : {},
    })

    styleExtractor.processElement({
      className: wrapperClass,
      tailwindClasses: 'flex flex-wrap items-center',
      additionalStyles: { gap: `${ctaWrapGap}px` },
    })

    styleExtractor.processElement({
      className: buttonsClass,
      tailwindClasses: 'flex flex-wrap items-center',
      additionalStyles: { gap: `${ctaWrapGap}px` },
    })

    if (paragraph) {
      styleExtractor.processElement({
        className: paragraphClass,
        tailwindClasses: 'text-[var(--text-base)] m-0 max-w-[600px]',
        additionalStyles: {
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-body)',
          ...extractFieldStyles(fieldStyles, 'paragraph'),
        },
      })
    }

    return `
    <section class="${ctaClass}" data-section-id="${id}">
      <div class="${containerClass}">
        <div class="${wrapperClass}">
          <h2 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h2>
          <div class="${buttonsClass}">
            ${primaryButtonHTML}
            ${secondaryButtonHTML}
          </div>
        </div>
        ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
      </div>
    </section>`
  }

  if (variant === 'split') {
    const isButtonsFirst = splitLayout === 'buttons-content'
    const contentOrder = isButtonsFirst ? 2 : 1
    const buttonsOrder = isButtonsFirst ? 1 : 2
    const buttonsJustify = isButtonsFirst ? 'flex-start' : 'flex-end'

    styleExtractor.processElement({
      className: containerClass,
      tailwindClasses: 'max-w-[1200px] mx-auto w-full grid grid-cols-2 gap-[var(--spacing-xl)] items-center',
      additionalStyles: ctaHeight !== 1 ? { height: '100%' } : {},
    })

    styleExtractor.processElement({
      className: contentClass,
      tailwindClasses: 'flex flex-col gap-[var(--spacing-md)]',
      additionalStyles: { order: contentOrder.toString() },
    })

    styleExtractor.processElement({
      className: buttonsClass,
      tailwindClasses: 'flex flex-wrap items-center',
      additionalStyles: {
        justifyContent: buttonsJustify,
        order: buttonsOrder.toString(),
        gap: `${ctaWrapGap}px`,
      },
    })

    if (paragraph) {
      styleExtractor.processElement({
        className: paragraphClass,
        tailwindClasses: 'text-[var(--text-base)] m-0',
        additionalStyles: {
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-body)',
          ...extractFieldStyles(fieldStyles, 'paragraph'),
        },
      })
    }

    return `
    <section class="${ctaClass}" data-section-id="${id}">
      <div class="${containerClass}">
        <div class="${contentClass}">
          <h2 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h2>
          ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
        </div>
        <div class="${buttonsClass}">
          ${primaryButtonHTML}
          ${secondaryButtonHTML}
        </div>
      </div>
    </section>`
  }

  // Default fallback (stacked option1)
  return generateCTAHTML({ ...section, variant: 'stacked' }, theme, sectionStyle)
}

// ============================================
// LINKS SECTION
// ============================================

function generateLinksHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, variant, data, fieldStyles, itemStyles, styles } = section

  // Match exact schema field names
  const headline = data.headline as string || ''
  const paragraph = data.paragraph as string || ''
  const items = data.items as Array<{
    image?: { src?: string; alt?: string }
    label?: string
    url?: string
    description?: string
  }> || []

  const customStyles = extractSectionStyles(styles as Record<string, unknown>)

  // Create class names
  const linksClass = styleExtractor.createRootClass('links')
  const containerClass = styleExtractor.createChildClass(linksClass, 'container')
  const headerClass = styleExtractor.createChildClass(linksClass, 'header')
  const headlineClass = styleExtractor.createChildClass(linksClass, 'headline')
  const paragraphClass = styleExtractor.createChildClass(linksClass, 'paragraph')
  const listClass = styleExtractor.createChildClass(linksClass, 'list')

  // Process section element
  styleExtractor.processElement({
    className: linksClass,
    tailwindClasses: 'text-[var(--color-fg)]',
    additionalStyles: customStyles,
  })

  // Process container - variant-specific layout
  const maxWidth = variant === 'grid' ? '1200px' : variant === 'split' ? '1200px' : '600px'
  styleExtractor.processElement({
    className: containerClass,
    tailwindClasses: `max-w-[${maxWidth}] mx-auto w-full`,
  })

  // Process header
  if (headline || paragraph) {
    styleExtractor.processElement({
      className: headerClass,
      tailwindClasses: 'text-center mb-[var(--spacing-xl)]',
    })
  }

  // Process headline with field styles
  if (headline) {
    styleExtractor.processElement({
      className: headlineClass,
      tailwindClasses: 'text-[length:var(--text-3xl)] font-bold leading-tight m-0 mb-[var(--spacing-md)]',
      additionalStyles: extractFieldStyles(fieldStyles, 'headline'),
    })
  }

  // Process paragraph with field styles
  if (paragraph) {
    styleExtractor.processElement({
      className: paragraphClass,
      tailwindClasses: 'text-[length:var(--text-base)] text-[var(--color-muted)] m-0',
      additionalStyles: extractFieldStyles(fieldStyles, 'paragraph'),
    })
  }

  // Process list
  styleExtractor.processElement({
    className: listClass,
    tailwindClasses: 'flex flex-col gap-[var(--spacing-sm)]',
  })

  // Generate links HTML with indexed classes
  const linksHTML = items.map((link, index) => {
    const itemClass = styleExtractor.createChildClass(linksClass, `item_${index}`)
    const imageClass = styleExtractor.createChildClass(linksClass, `item_${index}_image`)
    const contentClass = styleExtractor.createChildClass(linksClass, `item_${index}_content`)
    const labelClass = styleExtractor.createChildClass(linksClass, `item_${index}_label`)
    const descClass = styleExtractor.createChildClass(linksClass, `item_${index}_desc`)

    // Process link item container
    styleExtractor.processElement({
      className: itemClass,
      tailwindClasses: 'flex items-center gap-[var(--spacing-md)] p-[var(--spacing-md)] bg-[var(--color-surface)] rounded-[var(--radius-md)] hover:bg-[var(--color-secondary)] transition-colors group',
    })

    // Process image if present
    if (link.image?.src) {
      styleExtractor.processElement({
        className: imageClass,
        tailwindClasses: 'w-10 h-10 rounded-[var(--radius-sm)] object-cover flex-shrink-0',
      })
    }

    // Process content wrapper
    styleExtractor.processElement({
      className: contentClass,
      tailwindClasses: 'flex flex-col gap-[var(--spacing-xs)] min-w-0 flex-1',
    })

    // Process label
    styleExtractor.processElement({
      className: labelClass,
      tailwindClasses: 'text-[length:var(--text-base)] font-medium',
    })

    // Process description if present
    if (link.description) {
      styleExtractor.processElement({
        className: descClass,
        tailwindClasses: 'text-[length:var(--text-sm)] text-[var(--color-muted)]',
      })
    }

    const arrowClass = styleExtractor.createChildClass(linksClass, `item_${index}_arrow`)
    styleExtractor.processElement({
      className: arrowClass,
      tailwindClasses: 'text-[var(--color-muted)] flex-shrink-0',
    })

    return `
    <a class="${itemClass}" href="${escapeHtml(link.url || '#')}" data-field="items" data-index="${index}">
      ${link.image?.src ? `<img class="${imageClass}" src="${escapeHtml(link.image.src)}" alt="${escapeHtml(link.image.alt || '')}" loading="lazy" />` : ''}
      <div class="${contentClass}">
        <span class="${labelClass}" data-item-field="label">${escapeHtml(link.label || '')}</span>
        ${link.description ? `<span class="${descClass}" data-item-field="description">${escapeHtml(link.description)}</span>` : ''}
      </div>
      <span class="${arrowClass}">→</span>
    </a>
  `
  }).join('')

  return `
  <section class="${linksClass}" data-section-id="${id}">
    <div class="${containerClass}">
      ${headline || paragraph ? `
      <div class="${headerClass}">
        ${headline ? `<h2 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h2>` : ''}
        ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
      </div>
      ` : ''}
      <div class="${listClass}">
        ${linksHTML}
      </div>
    </div>
  </section>`
}

// ============================================
// ACCORDION SECTION
// ============================================

function generateAccordionHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, variant, data, fieldStyles, itemStyles, styles } = section

  // Match exact schema field names
  const headline = data.headline as string || ''
  const paragraph = data.paragraph as string || ''
  const items = data.items as Array<{ headline?: string; content?: string }> || []

  // Get custom section styles
  const customStyles = extractSectionStyles(styles as Record<string, unknown>)

  // Create class names
  const accordionClass = styleExtractor.createRootClass('accordion')
  const containerClass = styleExtractor.createChildClass(accordionClass, 'container')
  const headerClass = styleExtractor.createChildClass(accordionClass, 'header')
  const headlineClass = styleExtractor.createChildClass(accordionClass, 'headline')
  const paragraphClass = styleExtractor.createChildClass(accordionClass, 'paragraph')
  const listClass = styleExtractor.createChildClass(accordionClass, 'list')

  // Process section element - NO var() for user-customizable properties
  styleExtractor.processElement({
    className: accordionClass,
    tailwindClasses: 'text-[var(--color-fg)]', // Only use var() for theme colors
    additionalStyles: customStyles, // User's custom bg color and spacing
  })

  // Process container - variant-specific max-width
  const maxWidth = variant === 'split' ? '1200px' : '800px'
  styleExtractor.processElement({
    className: containerClass,
    tailwindClasses: `max-w-[${maxWidth}] mx-auto w-full`,
  })

  // Process header
  styleExtractor.processElement({
    className: headerClass,
    tailwindClasses: 'text-center mb-[2rem]',
  })

  // Process headline with field styles
  if (headline) {
    styleExtractor.processElement({
      className: headlineClass,
      tailwindClasses: 'text-[3rem] font-bold leading-tight m-0 mb-[1rem]',
      additionalStyles: extractFieldStyles(fieldStyles, 'headline'),
    })
  }

  // Process paragraph with field styles
  if (paragraph) {
    styleExtractor.processElement({
      className: paragraphClass,
      tailwindClasses: 'text-[1rem] text-[var(--color-muted)] m-0',
      additionalStyles: extractFieldStyles(fieldStyles, 'paragraph'),
    })
  }

  // Process list
  styleExtractor.processElement({
    className: listClass,
    tailwindClasses: 'flex flex-col gap-[0.5rem]',
  })

  // Generate accordion items with indexed classes
  const itemsHTML = items.map((item, index) => {
    const itemClass = styleExtractor.createChildClass(accordionClass, `item_${index}`)
    const itemButtonClass = styleExtractor.createChildClass(accordionClass, `item_${index}_button`)
    const itemHeadlineClass = styleExtractor.createChildClass(accordionClass, `item_${index}_headline`)
    const itemContentClass = styleExtractor.createChildClass(accordionClass, `item_${index}_content`)

    // Process accordion item
    styleExtractor.processElement({
      className: itemClass,
      tailwindClasses: 'bg-[var(--color-surface)] rounded-[0.5rem] overflow-hidden',
    })

    // Process item button (summary element)
    styleExtractor.processElement({
      className: itemButtonClass,
      tailwindClasses: 'w-full flex items-center justify-between gap-[1rem] text-left p-[1rem] cursor-pointer',
    })

    // Process item headline
    styleExtractor.processElement({
      className: itemHeadlineClass,
      tailwindClasses: 'text-[1rem] font-medium block',
    })

    // Process item content
    styleExtractor.processElement({
      className: itemContentClass,
      tailwindClasses: 'px-[1rem] pb-[1rem] text-[1rem] text-[var(--color-muted)]',
    })

    return `
    <details class="${itemClass}" data-field="items" data-index="${index}">
      <summary class="${itemButtonClass}" data-item-field="headline">
        <span class="${itemHeadlineClass}">${escapeHtml(item.headline || '')}</span>
        <span class="${styleExtractor.createChildClass(accordionClass, `item_${index}_icon`)}" style="color: var(--color-muted); flex-shrink: 0;">▼</span>
      </summary>
      <div class="${itemContentClass}" data-item-field="content">${item.content || ''}</div>
    </details>
  `
  }).join('')

  return `
  <section class="${accordionClass}" data-section-id="${id}">
    <div class="${containerClass}">
      <div class="${headerClass}">
        ${headline ? `<h2 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h2>` : ''}
        ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
      </div>
      <div class="${listClass}">
        ${itemsHTML}
      </div>
    </div>
  </section>`
}

// ============================================
// HEADER SECTION
// ============================================

function generateHeaderHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, data, fieldStyles, variant, styles } = section

  // Match exact schema field names
  const logo = data.logo as { src?: string; alt?: string } | undefined
  const title = data.title as string || ''
  const link = data.link as { label?: string; url?: string } | undefined

  const customStyles = extractSectionStyles(styles as Record<string, unknown>)

  // Create class names
  const headerClass = styleExtractor.createRootClass('header')
  const containerClass = styleExtractor.createChildClass(headerClass, 'container')
  const brandClass = styleExtractor.createChildClass(headerClass, 'brand')
  const logoClass = styleExtractor.createChildClass(headerClass, 'logo')
  const titleClass = styleExtractor.createChildClass(headerClass, 'title')
  const linkClass = styleExtractor.createChildClass(headerClass, 'link')

  // Process header element
  styleExtractor.processElement({
    className: headerClass,
    tailwindClasses: 'text-[var(--color-fg)]',
    additionalStyles: customStyles,
  })

  // Process container with variant-specific classes
  const containerVariantClasses = variant === 'centered'
    ? 'max-w-[1200px] mx-auto w-full flex flex-col items-center gap-[var(--spacing-sm)]'
    : 'max-w-[1200px] mx-auto w-full flex items-center justify-between gap-[var(--spacing-md)]'

  styleExtractor.processElement({
    className: containerClass,
    tailwindClasses: containerVariantClasses,
  })

  // Process brand container (logo + title wrapper)
  const brandVariantClasses = variant === 'centered' ? 'flex-row' : ''
  styleExtractor.processElement({
    className: brandClass,
    tailwindClasses: `flex items-center gap-[var(--header-gap)] ${brandVariantClasses}`,
  })

  // Process logo
  if (logo?.src) {
    styleExtractor.processElement({
      className: logoClass,
      tailwindClasses: 'max-h-10 w-auto object-contain',
      additionalStyles: extractFieldStyles(fieldStyles, 'logo.src'),
    })
  }

  // Process title
  if (title) {
    const titleVariantClasses = variant === 'centered' ? 'text-center' : ''
    styleExtractor.processElement({
      className: titleClass,
      tailwindClasses: `font-semibold text-[length:var(--text-lg)] ${titleVariantClasses}`,
      additionalStyles: extractFieldStyles(fieldStyles, 'title'),
    })
  }

  // Process link (button-styled)
  if (link?.label) {
    styleExtractor.processElement({
      className: linkClass,
      tailwindClasses: 'inline-flex items-center justify-center py-[var(--btn-py)] px-[var(--btn-px)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[length:var(--text-sm)] font-[var(--btn-weight)] rounded-[var(--btn-radius)] hover:opacity-90 transition-opacity',
      additionalStyles: extractFieldStyles(fieldStyles, 'link'),
    })
  }

  return `
  <header class="${headerClass}" data-section-id="${id}">
    <div class="${containerClass}">
      <div class="${brandClass}">
        ${logo?.src ? `<img class="${logoClass}" src="${escapeHtml(logo.src)}" alt="${escapeHtml(logo.alt || '')}" data-field="logo" />` : ''}
        ${title ? `<span class="${titleClass}" data-field="title">${escapeHtml(title)}</span>` : ''}
      </div>
      ${link?.label ? `<a class="${linkClass}" href="${escapeHtml(link.url || '#')}" data-field="link">${escapeHtml(link.label)}</a>` : ''}
    </div>
  </header>`
}

// ============================================
// FOOTER SECTION
// ============================================

function generateFooterHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, data, fieldStyles, variant, styles } = section

  // Match exact schema field names
  const logo = data.logo as string || ''
  const title = data.title as string || ''
  const paragraph = data.paragraph as string || ''
  const secondaryText = data.secondaryText as string || ''

  const customStyles = extractSectionStyles(styles as Record<string, unknown>)

  // Create class names
  const footerClass = styleExtractor.createRootClass('footer')
  const containerClass = styleExtractor.createChildClass(footerClass, 'container')
  const logoInfoClass = styleExtractor.createChildClass(footerClass, 'logo_info')
  const logoTitleWrapperClass = styleExtractor.createChildClass(footerClass, 'logo_title_wrapper')
  const logoClass = styleExtractor.createChildClass(footerClass, 'logo')
  const titleClass = styleExtractor.createChildClass(footerClass, 'title')
  const paragraphClass = styleExtractor.createChildClass(footerClass, 'paragraph')
  const secondaryClass = styleExtractor.createChildClass(footerClass, 'secondary')

  // Process footer element
  styleExtractor.processElement({
    className: footerClass,
    tailwindClasses: 'text-[var(--color-fg)]',
    additionalStyles: customStyles,
  })

  // Process container with variant-specific classes
  const containerVariantClasses = variant === 'centered'
    ? 'flex flex-col items-center text-center gap-[var(--spacing-md)]'
    : variant === 'minimal'
    ? 'flex items-center justify-center'
    : 'flex flex-col md:flex-row items-start md:items-center justify-between gap-[var(--spacing-lg)]'

  styleExtractor.processElement({
    className: containerClass,
    tailwindClasses: `max-w-[1200px] mx-auto w-full ${containerVariantClasses}`,
  })

  // Process logo + info wrapper (not shown in minimal variant)
  if (variant !== 'minimal') {
    const logoInfoVariantClasses = variant === 'centered' ? 'items-center' : ''
    styleExtractor.processElement({
      className: logoInfoClass,
      tailwindClasses: `flex flex-col gap-[var(--spacing-sm)] ${logoInfoVariantClasses}`,
    })
  }

  // Process logo + title wrapper
  styleExtractor.processElement({
    className: logoTitleWrapperClass,
    tailwindClasses: 'flex items-center gap-[var(--spacing-sm)]',
  })

  // Process logo
  if (logo) {
    styleExtractor.processElement({
      className: logoClass,
      tailwindClasses: 'h-8 w-auto',
    })
  }

  // Process title with field styles
  if (title) {
    styleExtractor.processElement({
      className: titleClass,
      tailwindClasses: 'font-semibold text-[length:var(--text-lg)]',
      additionalStyles: extractFieldStyles(fieldStyles, 'title'),
    })
  }

  // Process paragraph with field styles
  if (paragraph) {
    styleExtractor.processElement({
      className: paragraphClass,
      tailwindClasses: 'text-[length:var(--text-sm)] text-[var(--color-muted)] max-w-[300px]',
      additionalStyles: extractFieldStyles(fieldStyles, 'paragraph'),
    })
  }

  // Process secondary text with field styles
  if (secondaryText) {
    const secondaryVariantClasses = variant === 'centered' ? 'mt-[var(--spacing-md)]' : ''
    styleExtractor.processElement({
      className: secondaryClass,
      tailwindClasses: `text-[length:var(--text-sm)] text-[var(--color-muted)] m-0 ${secondaryVariantClasses}`,
      additionalStyles: extractFieldStyles(fieldStyles, 'secondaryText'),
    })
  }

  return `
  <footer class="${footerClass}" data-section-id="${id}">
    <div class="${containerClass}">
      ${variant !== 'minimal' ? `
      <div class="${logoInfoClass}">
        <div class="${logoTitleWrapperClass}">
          ${logo ? `<img class="${logoClass}" src="${escapeHtml(logo)}" alt="" data-field="logo" />` : ''}
          ${title ? `<span class="${titleClass}" data-field="title">${escapeHtml(title)}</span>` : ''}
        </div>
        ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${escapeHtml(paragraph)}</div>` : ''}
      </div>
      ` : ''}
      ${secondaryText ? `<p class="${secondaryClass}" data-field="secondaryText">${escapeHtml(secondaryText)}</p>` : ''}
    </div>
  </footer>`
}

// ============================================
// GALLERY SECTION
// ============================================

function generateGalleryHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, data, fieldStyles, itemStyles, styles } = section
  const headline = data.headline as string || ''
  const subheadline = data.subheadline as string || ''
  const paragraph = data.paragraph as string || ''
  const items = data.items as Array<{
    media?: { type?: 'image' | 'video'; src?: string; alt?: string }
    link?: { url?: string }
  }> || []

  const contentSpacing = (styles as Record<string, unknown>)?.spaceBetween ?? 32
  const customStyles = extractSectionStyles(styles as Record<string, unknown>)

  // Create class names
  const galleryClass = styleExtractor.createRootClass('gallery')
  const containerClass = styleExtractor.createChildClass(galleryClass, 'container')
  const headerClass = styleExtractor.createChildClass(galleryClass, 'header')
  const headlineClass = styleExtractor.createChildClass(galleryClass, 'headline')
  const subheadlineClass = styleExtractor.createChildClass(galleryClass, 'subheadline')
  const paragraphClass = styleExtractor.createChildClass(galleryClass, 'paragraph')
  const gridClass = styleExtractor.createChildClass(galleryClass, 'grid')

  // Process section element
  styleExtractor.processElement({
    className: galleryClass,
    tailwindClasses: 'text-[var(--color-fg)]',
    additionalStyles: customStyles,
  })

  // Process container
  styleExtractor.processElement({
    className: containerClass,
    tailwindClasses: 'max-w-[1200px] mx-auto w-full flex flex-col',
    additionalStyles: { gap: `${contentSpacing}px` },
  })

  // Process header
  if (headline || subheadline || paragraph) {
    styleExtractor.processElement({
      className: headerClass,
      tailwindClasses: 'text-center flex flex-col gap-[var(--spacing-sm)]',
    })
  }

  // Process headline with field styles
  if (headline) {
    styleExtractor.processElement({
      className: headlineClass,
      tailwindClasses: 'text-[length:var(--text-3xl)] font-bold leading-tight m-0',
      additionalStyles: extractFieldStyles(fieldStyles, 'headline'),
    })
  }

  // Process subheadline with field styles
  if (subheadline) {
    styleExtractor.processElement({
      className: subheadlineClass,
      tailwindClasses: 'text-[length:var(--text-lg)] text-[var(--color-muted)] m-0',
      additionalStyles: extractFieldStyles(fieldStyles, 'subheadline'),
    })
  }

  // Process paragraph with field styles
  if (paragraph) {
    styleExtractor.processElement({
      className: paragraphClass,
      tailwindClasses: 'text-[length:var(--text-base)] text-[var(--color-muted)] m-0',
      additionalStyles: extractFieldStyles(fieldStyles, 'paragraph'),
    })
  }

  // Process grid
  styleExtractor.processElement({
    className: gridClass,
    tailwindClasses: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]',
  })

  // Generate gallery items with indexed classes
  const itemsHTML = items.map((item, index) => {
    const mediaSrc = item.media?.src || ''
    const mediaAlt = item.media?.alt || ''
    const mediaType = item.media?.type || 'image'

    const itemClass = styleExtractor.createChildClass(galleryClass, `item_${index}`)
    const imageClass = styleExtractor.createChildClass(galleryClass, `item_${index}_image`)
    const videoClass = styleExtractor.createChildClass(galleryClass, `item_${index}_video`)

    // Process gallery item
    styleExtractor.processElement({
      className: itemClass,
      tailwindClasses: 'block aspect-square rounded-[var(--radius-md)] overflow-hidden',
    })

    // Process image or video
    if (mediaType === 'image') {
      styleExtractor.processElement({
        className: imageClass,
        tailwindClasses: 'w-full h-full object-cover',
      })
    } else {
      styleExtractor.processElement({
        className: videoClass,
        tailwindClasses: 'w-full h-full object-cover',
      })
    }

    const content = `
      <div class="${itemClass}" data-field="items" data-index="${index}">
        ${mediaType === 'image'
          ? `<img class="${imageClass}" src="${escapeHtml(mediaSrc)}" alt="${escapeHtml(mediaAlt)}" loading="lazy" />`
          : `<video class="${videoClass}" src="${escapeHtml(mediaSrc)}" controls></video>`
        }
      </div>
    `
    return item.link?.url
      ? `<a href="${escapeHtml(item.link.url)}" target="_blank" rel="noopener">${content}</a>`
      : content
  }).join('')

  return `
  <section class="${galleryClass}" data-section-id="${id}">
    <div class="${containerClass}">
      ${headline || subheadline || paragraph ? `
      <div class="${headerClass}">
        ${headline ? `<h2 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h2>` : ''}
        ${subheadline ? `<p class="${subheadlineClass}" data-field="subheadline">${escapeHtml(subheadline)}</p>` : ''}
        ${paragraph ? `<p class="${paragraphClass}" data-field="paragraph">${escapeHtml(paragraph)}</p>` : ''}
      </div>
      ` : ''}
      <div class="${gridClass}">
        ${itemsHTML}
      </div>
    </div>
  </section>`
}

// ============================================
// PRODUCTS SECTION
// ============================================

function generateProductsHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, variant, data, fieldStyles, styles } = section

  const headline = data.headline as string || ''
  const subheadline = data.subheadline as string || ''
  const paragraph = data.paragraph as string || ''
  const items = data.items as Array<{
    id?: string
    image?: { src?: string; alt?: string }
    name?: string
    description?: string
    price?: string
    ctaLabel?: string
    ctaUrl?: string
  }> || []

  const sectionSpaceBetween = (styles as Record<string, unknown>)?.spaceBetween ?? 32
  const itemsSpaceBetween = (styles as Record<string, unknown>)?.itemsSpaceBetween ?? 16

  // Shared product styles (resolved but passed to styleExtractor)
  const sharedContainerStyle = resolveSharedProductContainerStyles(styles as Record<string, unknown>)
  const sharedInnerGap = resolveSharedProductInnerGap(styles as Record<string, unknown>)
  const sharedMediaStyle = resolveSharedProductMediaStyles(styles as Record<string, unknown>)
  const sharedNameStyle = resolveSharedProductTextStyles(styles as Record<string, unknown>, 'Name')
  const sharedDescriptionStyle = resolveSharedProductTextStyles(styles as Record<string, unknown>, 'Description')
  const sharedPriceStyle = resolveSharedProductTextStyles(styles as Record<string, unknown>, 'Price')
  const sharedButtonStyle = resolveSharedProductButtonStyles(styles as Record<string, unknown>)

  // Create class names
  const productsClass = styleExtractor.createRootClass('products')
  const containerClass = styleExtractor.createChildClass(productsClass, 'container')
  const headerBlockClass = styleExtractor.createChildClass(productsClass, 'header-block')
  const headlineClass = styleExtractor.createChildClass(productsClass, 'headline')
  const subheadlineClass = styleExtractor.createChildClass(productsClass, 'subheadline')
  const paragraphClass = styleExtractor.createChildClass(productsClass, 'paragraph')
  const gridClass = styleExtractor.createChildClass(productsClass, 'grid')
  const rowContainerClass = styleExtractor.createChildClass(productsClass, 'row-container')

  // Process section element
  styleExtractor.processElement({
    className: productsClass,
    tailwindClasses: 'px-[var(--spacing-container)] py-[var(--spacing-section)]',
    inlineStyle: sectionStyle,
    additionalStyles: {
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-fg)',
    },
  })

  // Process container
  styleExtractor.processElement({
    className: containerClass,
    tailwindClasses: 'flex flex-col w-full max-w-[1200px] mx-auto',
    additionalStyles: { gap: `${sectionSpaceBetween}px` },
  })

  // Process header block
  const hasHeaderContent = headline || subheadline || paragraph
  if (hasHeaderContent) {
    styleExtractor.processElement({
      className: headerBlockClass,
      tailwindClasses: 'flex flex-col gap-[var(--spacing-sm)]',
    })

    if (headline) {
      styleExtractor.processElement({
        className: headlineClass,
        tailwindClasses: 'text-[var(--text-3xl)] font-bold m-0',
        additionalStyles: {
          lineHeight: '1.2',
          fontFamily: 'var(--font-heading)',
          ...extractFieldStyles(fieldStyles, 'headline'),
        },
      })
    }

    if (subheadline) {
      styleExtractor.processElement({
        className: subheadlineClass,
        tailwindClasses: 'text-[var(--text-lg)] m-0',
        additionalStyles: {
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-heading)',
          ...extractFieldStyles(fieldStyles, 'subheadline'),
        },
      })
    }

    if (paragraph) {
      styleExtractor.processElement({
        className: paragraphClass,
        tailwindClasses: 'text-[var(--text-base)] m-0',
        additionalStyles: {
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-body)',
          ...extractFieldStyles(fieldStyles, 'paragraph'),
        },
      })
    }
  }

  const sectionHeaderHTML = hasHeaderContent ? `
    <div class="${headerBlockClass}">
      ${headline ? `<h2 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h2>` : ''}
      ${subheadline ? `<h3 class="${subheadlineClass}" data-field="subheadline">${escapeHtml(subheadline)}</h3>` : ''}
      ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
    </div>
  ` : ''

  // Generate product HTML with styleExtractor
  function generateProductHTML(item: typeof items[0], index: number, variantType: string): { productItemClass: string; mediaHTML: string; contentHTML: string } {
    const mediaAspectRatio = getCardMediaAspectRatio((styles as Record<string, unknown>)?.productMediaAspect as string)
    const productItemClass = styleExtractor.createChildClass(productsClass, `item_${index}`)
    const mediaContainerClass = styleExtractor.createChildClass(productsClass, `item_${index}_media-container`)
    const mediaClass = styleExtractor.createChildClass(productsClass, `item_${index}_media`)
    const contentClass = styleExtractor.createChildClass(productsClass, `item_${index}_content`)
    const nameClass = styleExtractor.createChildClass(productsClass, `item_${index}_name`)
    const descriptionClass = styleExtractor.createChildClass(productsClass, `item_${index}_description`)
    const priceClass = styleExtractor.createChildClass(productsClass, `item_${index}_price`)
    const buttonClass = styleExtractor.createChildClass(productsClass, `item_${index}_button`)

    // Process media container
    if (item.image?.src) {
      styleExtractor.processElement({
        className: mediaContainerClass,
        tailwindClasses: 'w-full overflow-hidden',
        additionalStyles: {
          ...(sharedMediaStyle && Object.fromEntries(
            sharedMediaStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })

      styleExtractor.processElement({
        className: mediaClass,
        tailwindClasses: 'w-full h-full object-cover',
        additionalStyles: {
          aspectRatio: mediaAspectRatio,
        },
      })
    }

    // Process content container
    styleExtractor.processElement({
      className: contentClass,
      tailwindClasses: 'p-[var(--spacing-md)] flex flex-col',
      additionalStyles: { gap: sharedInnerGap },
    })

    // Process name
    if (item.name) {
      const textSize = variantType === 'row' ? 'var(--text-3xl)' : 'var(--text-xl)'
      styleExtractor.processElement({
        className: nameClass,
        tailwindClasses: `text-[${textSize}] ${variantType === 'row' ? 'font-bold' : 'font-semibold'} m-0`,
        additionalStyles: {
          lineHeight: variantType === 'row' ? '1.2' : '1.5',
          fontFamily: 'var(--font-heading)',
          ...(sharedNameStyle && Object.fromEntries(
            sharedNameStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })
    }

    // Process description
    if (item.description) {
      styleExtractor.processElement({
        className: descriptionClass,
        tailwindClasses: 'text-[var(--text-base)] m-0',
        additionalStyles: {
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-body)',
          ...(sharedDescriptionStyle && Object.fromEntries(
            sharedDescriptionStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })
    }

    // Process price
    if (item.price) {
      const textSize = variantType === 'row' ? 'var(--text-xl)' : 'var(--text-lg)'
      styleExtractor.processElement({
        className: priceClass,
        tailwindClasses: `text-[${textSize}] font-semibold m-0`,
        additionalStyles: {
          fontFamily: 'var(--font-body)',
          ...(sharedPriceStyle && Object.fromEntries(
            sharedPriceStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })
    }

    // Process button
    if (item.ctaLabel && item.ctaUrl) {
      styleExtractor.processElement({
        className: buttonClass,
        tailwindClasses: 'mt-[var(--spacing-sm)] inline-flex items-center justify-center font-medium no-underline',
        additionalStyles: {
          ...(sharedButtonStyle && Object.fromEntries(
            sharedButtonStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })
    }

    const mediaHTML = item.image?.src ? `
      <div class="${mediaContainerClass}">
        <img class="${mediaClass}" src="${escapeHtml(item.image.src)}" alt="${escapeHtml(item.image.alt || '')}" loading="lazy" />
      </div>
    ` : ''

    const contentHTML = `
      <div class="${contentClass}">
        ${item.name ? `<h3 class="${nameClass}">${escapeHtml(item.name)}</h3>` : ''}
        ${item.description ? `<div class="${descriptionClass}">${item.description}</div>` : ''}
        ${item.price ? `<p class="${priceClass}">${escapeHtml(item.price)}</p>` : ''}
        ${item.ctaLabel && item.ctaUrl ? `<a class="${buttonClass}" href="${escapeHtml(item.ctaUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.ctaLabel)}</a>` : ''}
      </div>
    `

    return { productItemClass, mediaHTML, contentHTML }
  }

  // Variant-specific layouts
  if (variant === 'grid') {
    styleExtractor.processElement({
      className: gridClass,
      tailwindClasses: 'grid grid-cols-1',
      additionalStyles: { gap: `${itemsSpaceBetween}px` },
    })

    const productsHTML = items.map((item, index) => {
      const { productItemClass, mediaHTML, contentHTML } = generateProductHTML(item, index, 'grid')

      styleExtractor.processElement({
        className: productItemClass,
        tailwindClasses: 'flex flex-col bg-[var(--color-surface)] rounded-[var(--radius-lg)] overflow-hidden',
        additionalStyles: {
          ...(sharedContainerStyle && Object.fromEntries(
            sharedContainerStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })

      return `
      <div class="${productItemClass}" data-field="items" data-index="${index}">
        ${mediaHTML}${contentHTML}
      </div>
    `
    }).join('')

    return `
    <section class="${productsClass}" data-section-id="${id}">
      <div class="${containerClass}">
        ${sectionHeaderHTML}
        <div class="${gridClass}">
          ${productsHTML}
        </div>
      </div>
    </section>`
  }

  if (variant === 'row') {
    styleExtractor.processElement({
      className: rowContainerClass,
      tailwindClasses: 'flex flex-col w-full',
      additionalStyles: { gap: `${itemsSpaceBetween}px` },
    })

    const productsHTML = items.map((item, index) => {
      const isMediaLeft = index % 2 === 0
      const { productItemClass, mediaHTML, contentHTML } = generateProductHTML(item, index, 'row')
      const mediaWrapperClass = styleExtractor.createChildClass(productsClass, `item_${index}_media-wrapper`)
      const contentWrapperClass = styleExtractor.createChildClass(productsClass, `item_${index}_content-wrapper`)

      styleExtractor.processElement({
        className: productItemClass,
        tailwindClasses: 'grid grid-cols-2 items-center gap-[var(--spacing-xl)]',
        additionalStyles: {
          ...(sharedContainerStyle && Object.fromEntries(
            sharedContainerStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })

      styleExtractor.processElement({
        className: mediaWrapperClass,
        tailwindClasses: '',
        additionalStyles: { order: isMediaLeft ? '1' : '2' },
      })

      styleExtractor.processElement({
        className: contentWrapperClass,
        tailwindClasses: 'flex flex-col',
        additionalStyles: { order: isMediaLeft ? '2' : '1', gap: sharedInnerGap },
      })

      return `
        <div class="${productItemClass}" data-field="items" data-index="${index}">
          <div class="${mediaWrapperClass}">
            ${mediaHTML || `<div class="w-full aspect-[4/3] rounded-[var(--radius-lg)] bg-[var(--color-surface)] flex items-center justify-center"><span class="text-[var(--color-muted)]">Add image</span></div>`}
          </div>
          <div class="${contentWrapperClass}">
            ${contentHTML}
          </div>
        </div>
      `
    }).join('')

    return `
    <section class="${productsClass}" data-section-id="${id}">
      <div class="${containerClass}">
        ${sectionHeaderHTML}
        <div class="${rowContainerClass}">
          ${productsHTML}
        </div>
      </div>
    </section>`
  }

  if (variant === 'carousel') {
    const slidesPerView = (styles as Record<string, unknown>)?.slidesPerView ?? 3
    const gap = itemsSpaceBetween
    const gapOffset = ((slidesPerView - 1) * gap) / slidesPerView
    const productWidth = `calc(${100 / slidesPerView}% - ${gapOffset}px)`

    const carouselWrapperClass = styleExtractor.createChildClass(productsClass, 'carousel-wrapper')
    const carouselClass = styleExtractor.createChildClass(productsClass, 'carousel')

    styleExtractor.processElement({
      className: carouselWrapperClass,
      tailwindClasses: 'relative w-full',
    })

    styleExtractor.processElement({
      className: carouselClass,
      tailwindClasses: 'flex overflow-x-auto pb-[var(--spacing-md)]',
      additionalStyles: { gap: `${itemsSpaceBetween}px` },
    })

    const productsHTML = items.map((item, index) => {
      const { productItemClass, mediaHTML, contentHTML } = generateProductHTML(item, index, 'carousel')

      styleExtractor.processElement({
        className: productItemClass,
        tailwindClasses: 'flex-shrink-0 flex flex-col bg-[var(--color-surface)] rounded-[var(--radius-lg)] overflow-hidden',
        additionalStyles: {
          width: productWidth,
          ...(sharedContainerStyle && Object.fromEntries(
            sharedContainerStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })

      return `
      <div class="${productItemClass}" data-field="items" data-index="${index}">
        ${mediaHTML}${contentHTML}
      </div>
    `
    }).join('')

    return `
    <section class="${productsClass}" data-section-id="${id}">
      <div class="${containerClass}">
        ${sectionHeaderHTML}
        <div class="${carouselWrapperClass}">
          <div class="${carouselClass}">
            ${productsHTML}
          </div>
        </div>
      </div>
    </section>`
  }

  if (variant === 'split') {
    const splitContainerClass = styleExtractor.createChildClass(productsClass, 'split-container')
    const splitHeaderClass = styleExtractor.createChildClass(productsClass, 'split-header')
    const splitContentClass = styleExtractor.createChildClass(productsClass, 'split-content')

    styleExtractor.processElement({
      className: splitContainerClass,
      tailwindClasses: 'max-w-[1200px] mx-auto w-full flex flex-row items-start',
      additionalStyles: { gap: `${sectionSpaceBetween}px` },
    })

    if (hasHeaderContent) {
      styleExtractor.processElement({
        className: splitHeaderClass,
        tailwindClasses: 'w-[33.333%] flex-shrink-0',
      })
    }

    styleExtractor.processElement({
      className: splitContentClass,
      tailwindClasses: `flex flex-col flex-1 ${hasHeaderContent ? 'w-[66.667%]' : 'w-full'}`,
      additionalStyles: { gap: `${itemsSpaceBetween}px` },
    })

    const productsHTML = items.map((item, index) => {
      const { productItemClass, mediaHTML, contentHTML } = generateProductHTML(item, index, 'split')

      styleExtractor.processElement({
        className: productItemClass,
        tailwindClasses: 'flex-1 flex flex-col bg-[var(--color-surface)] rounded-[var(--radius-lg)] overflow-hidden',
        additionalStyles: {
          ...(sharedContainerStyle && Object.fromEntries(
            sharedContainerStyle.split('; ').filter(s => s).map(s => {
              const [k, v] = s.split(': ')
              return [k.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), v]
            })
          )),
        },
      })

      return `
      <div class="${productItemClass}" data-field="items" data-index="${index}">
        ${mediaHTML}${contentHTML}
      </div>
    `
    }).join('')

    return `
    <section class="${productsClass}" data-section-id="${id}">
      <div class="${splitContainerClass}">
        ${hasHeaderContent ? `<div class="${splitHeaderClass}">${sectionHeaderHTML}</div>` : ''}
        <div class="${splitContentClass}">
          ${productsHTML}
        </div>
      </div>
    </section>`
  }

  return generateProductsHTML({ ...section, variant: 'grid' }, theme, sectionStyle)
}

// ============================================
// EVENTS SECTION
// ============================================

function generateEventsHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, variant, data, fieldStyles, itemStyles, styles } = section

  const headline = data.headline as string || ''
  const paragraph = data.paragraph as string || ''
  const items = data.items as Array<{
    headline?: string
    datetime?: string
    location?: string
    details?: string
    price?: string
    image?: { src?: string; alt?: string }
    button?: { label?: string; url?: string }
  }> || []

  // Get custom section styles
  const customStyles = extractSectionStyles(styles as Record<string, unknown>)

  // Create class names
  const eventsClass = styleExtractor.createRootClass('events')
  const containerClass = styleExtractor.createChildClass(eventsClass, 'container')
  const headerClass = styleExtractor.createChildClass(eventsClass, 'header')
  const headlineClass = styleExtractor.createChildClass(eventsClass, 'headline')
  const paragraphClass = styleExtractor.createChildClass(eventsClass, 'paragraph')
  const listClass = styleExtractor.createChildClass(eventsClass, 'list')

  // Process section element - NO var() for user-customizable properties
  styleExtractor.processElement({
    className: eventsClass,
    tailwindClasses: 'text-[var(--color-fg)]',
    additionalStyles: customStyles,
  })

  // Process container - variant-specific max-width
  const maxWidth = variant === 'split' ? '1200px' : '800px'
  styleExtractor.processElement({
    className: containerClass,
    tailwindClasses: `max-w-[${maxWidth}] mx-auto w-full`,
  })

  // Process header
  styleExtractor.processElement({
    className: headerClass,
    tailwindClasses: 'text-center mb-[2rem]',
  })

  // Process headline with field styles
  if (headline) {
    styleExtractor.processElement({
      className: headlineClass,
      tailwindClasses: 'text-[3rem] font-bold leading-tight m-0 mb-[1rem]',
      additionalStyles: extractFieldStyles(fieldStyles, 'headline'),
    })
  }

  // Process paragraph with field styles
  if (paragraph) {
    styleExtractor.processElement({
      className: paragraphClass,
      tailwindClasses: 'text-[1rem] text-[var(--color-muted)] m-0',
      additionalStyles: extractFieldStyles(fieldStyles, 'paragraph'),
    })
  }

  // Process list
  styleExtractor.processElement({
    className: listClass,
    tailwindClasses: 'flex flex-col gap-[0.5rem]',
  })

  // Generate event items with indexed classes
  const eventsHTML = items.map((item, index) => {
    const itemClass = styleExtractor.createChildClass(eventsClass, `item_${index}`)
    const summaryClass = styleExtractor.createChildClass(eventsClass, `item_${index}_summary`)
    const titleWrapperClass = styleExtractor.createChildClass(eventsClass, `item_${index}_title_wrapper`)
    const titleClass = styleExtractor.createChildClass(eventsClass, `item_${index}_title`)
    const metaClass = styleExtractor.createChildClass(eventsClass, `item_${index}_meta`)
    const iconClass = styleExtractor.createChildClass(eventsClass, `item_${index}_icon`)
    const detailsContainerClass = styleExtractor.createChildClass(eventsClass, `item_${index}_details_container`)
    const contentWrapperClass = styleExtractor.createChildClass(eventsClass, `item_${index}_content_wrapper`)
    const imageClass = styleExtractor.createChildClass(eventsClass, `item_${index}_image`)
    const descClass = styleExtractor.createChildClass(eventsClass, `item_${index}_desc`)
    const priceClass = styleExtractor.createChildClass(eventsClass, `item_${index}_price`)
    const btnClass = styleExtractor.createChildClass(eventsClass, `item_${index}_btn`)

    // Process event item container
    styleExtractor.processElement({
      className: itemClass,
      tailwindClasses: 'bg-[var(--color-surface)] rounded-[0.5rem] overflow-hidden',
    })

    // Process summary (button element)
    styleExtractor.processElement({
      className: summaryClass,
      tailwindClasses: 'w-full flex items-center justify-between gap-[1rem] text-left p-[1rem] cursor-pointer',
    })

    // Process title wrapper
    styleExtractor.processElement({
      className: titleWrapperClass,
      tailwindClasses: 'flex-1 min-w-0',
    })

    // Process title
    if (item.headline) {
      styleExtractor.processElement({
        className: titleClass,
        tailwindClasses: 'text-[1rem] font-medium block',
      })
    }

    // Process meta (datetime + location)
    const metaParts = []
    if (item.datetime) metaParts.push(item.datetime)
    if (item.location) metaParts.push(item.location)
    const metaText = metaParts.join(' • ')

    if (metaText) {
      styleExtractor.processElement({
        className: metaClass,
        tailwindClasses: 'text-[0.875rem] text-[var(--color-muted)] mt-1 block',
      })
    }

    // Process chevron icon
    styleExtractor.processElement({
      className: iconClass,
      tailwindClasses: 'text-[var(--color-muted)] flex-shrink-0',
    })

    // Process details container (expandable content)
    styleExtractor.processElement({
      className: detailsContainerClass,
      tailwindClasses: 'px-[1rem] pb-[1rem]',
    })

    // Process content wrapper
    styleExtractor.processElement({
      className: contentWrapperClass,
      tailwindClasses: 'flex flex-col gap-[1rem]',
    })

    // Process image
    if (item.image?.src) {
      styleExtractor.processElement({
        className: imageClass,
        tailwindClasses: 'w-full aspect-video object-cover rounded-[0.5rem]',
      })
    }

    // Process description
    if (item.details) {
      styleExtractor.processElement({
        className: descClass,
        tailwindClasses: 'text-[1rem] text-[var(--color-muted)]',
      })
    }

    // Process price
    if (item.price) {
      styleExtractor.processElement({
        className: priceClass,
        tailwindClasses: 'text-[1.125rem] font-medium',
      })
    }

    // Process button
    if (item.button?.label) {
      styleExtractor.processElement({
        className: btnClass,
        tailwindClasses: 'inline-flex items-center justify-center py-[0.875rem] px-[2rem] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[0.875rem] font-medium rounded-[0.5rem] hover:opacity-90 transition-opacity self-start',
      })
    }

    return `
      <details class="${itemClass}" data-field="items" data-index="${index}">
        <summary class="${summaryClass}">
          <div class="${titleWrapperClass}">
            ${item.headline ? `<span class="${titleClass}" data-item-field="headline">${escapeHtml(item.headline)}</span>` : ''}
            ${metaText ? `<span class="${metaClass}">${escapeHtml(metaText)}</span>` : ''}
          </div>
          <span class="${iconClass}">▼</span>
        </summary>
        <div class="${detailsContainerClass}">
          <div class="${contentWrapperClass}">
            ${item.image?.src ? `<img class="${imageClass}" src="${escapeHtml(item.image.src)}" alt="${escapeHtml(item.image.alt || '')}" loading="lazy" />` : ''}
            ${item.details ? `<div class="${descClass}" data-item-field="details">${item.details}</div>` : ''}
            ${item.price ? `<div class="${priceClass}">${escapeHtml(item.price)}</div>` : ''}
            ${item.button?.label ? `<a class="${btnClass}" href="${escapeHtml(item.button.url || '#')}" data-item-field="button">${escapeHtml(item.button.label)}</a>` : ''}
          </div>
        </div>
      </details>
    `
  }).join('')

  return `
  <section class="${eventsClass}" data-section-id="${id}">
    <div class="${containerClass}">
      ${headline || paragraph ? `<div class="${headerClass}">
        ${headline ? `<h2 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h2>` : ''}
        ${paragraph ? `<div class="${paragraphClass}" data-field="paragraph">${paragraph}</div>` : ''}
      </div>` : ''}
      <div class="${listClass}">
        ${eventsHTML}
      </div>
    </div>
  </section>`
}

// ============================================
// CONTACT SECTION
// ============================================

function generateContactHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, variant, data, fieldStyles, styles } = section

  // Extract data fields
  const headline = data.headline as string || ''
  const subheadline = data.subheadline as string || ''
  const paragraphs = data.paragraphs as string[] || []
  const formFields = data.formFields as Array<{
    id?: string
    type?: string
    label?: string
    required?: boolean
    options?: string[]
  }> || []
  const submitButton = data.submitButton as { label?: string; url?: string } | undefined
  const socialLinks = data.socialLinks as Array<{
    id?: string
    image?: { src?: string; alt?: string }
    label?: string
    url?: string
    description?: string
  }> || []

  // Extract style options
  const splitLayout = (styles as Record<string, unknown>)?.splitLayout ?? 'title-content'
  const formFieldsSpaceBetween = (styles as Record<string, unknown>)?.formFieldsSpaceBetween
  const socialLinksSpaceBetween = (styles as Record<string, unknown>)?.socialLinksSpaceBetween

  // Shared styles (convert to style objects)
  const sharedFormInputStyleStr = resolveSharedFormInputStyles(styles as Record<string, unknown>)
  const sharedFormInputStyle = Object.fromEntries(
    sharedFormInputStyleStr.split(';').filter(Boolean).map((s) => {
      const [key, value] = s.split(':').map((x) => x.trim())
      const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      return [camelKey, value]
    })
  )

  const sharedLinkContainerStyleStr = resolveSharedLinkContainerStyles(styles as Record<string, unknown>)
  const sharedLinkContainerStyle = Object.fromEntries(
    sharedLinkContainerStyleStr.split(';').filter(Boolean).map((s) => {
      const [key, value] = s.split(':').map((x) => x.trim())
      const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      return [camelKey, value]
    })
  )

  const sharedLinkLabelStyleStr = resolveSharedLinkTextStyles(styles as Record<string, unknown>, 'Label')
  const sharedLinkLabelStyle = Object.fromEntries(
    sharedLinkLabelStyleStr.split(';').filter(Boolean).map((s) => {
      const [key, value] = s.split(':').map((x) => x.trim())
      const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      return [camelKey, value]
    })
  )

  const sharedLinkDescriptionStyleStr = resolveSharedLinkTextStyles(styles as Record<string, unknown>, 'Description')
  const sharedLinkDescriptionStyle = Object.fromEntries(
    sharedLinkDescriptionStyleStr.split(';').filter(Boolean).map((s) => {
      const [key, value] = s.split(':').map((x) => x.trim())
      const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      return [camelKey, value]
    })
  )

  // Create class names
  const contactClass = styleExtractor.createRootClass('contact')
  const containerClass = styleExtractor.createChildClass(contactClass, 'container')
  const headerClass = styleExtractor.createChildClass(contactClass, 'header')
  const headlineClass = styleExtractor.createChildClass(contactClass, 'headline')
  const subheadlineClass = styleExtractor.createChildClass(contactClass, 'subheadline')
  const paragraphsContainerClass = styleExtractor.createChildClass(contactClass, 'paragraphs-container')
  const formClass = styleExtractor.createChildClass(contactClass, 'form')
  const submitButtonClass = styleExtractor.createChildClass(contactClass, 'submit-button')
  const socialLinksContainerClass = styleExtractor.createChildClass(contactClass, 'social-links-container')

  // Process section-level styles
  styleExtractor.processElement({
    className: contactClass,
    tailwindClasses: 'py-[var(--spacing-section)] px-[var(--spacing-container)]',
    inlineStyle: sectionStyle,
    additionalStyles: {
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-fg)',
    },
  })

  // Field styles
  styleExtractor.processElement({
    className: headlineClass,
    tailwindClasses: 'text-3xl font-bold mb-2',
    additionalStyles: {
      fontFamily: 'var(--font-heading)',
      lineHeight: '1.2',
      margin: '0',
      marginBottom: 'var(--spacing-sm)',
      ...extractFieldStyles(fieldStyles, 'headline'),
    },
  })

  styleExtractor.processElement({
    className: subheadlineClass,
    tailwindClasses: 'text-lg',
    additionalStyles: {
      fontFamily: 'var(--font-body)',
      color: 'var(--color-muted)',
      margin: '0',
      ...extractFieldStyles(fieldStyles, 'subheadline'),
    },
  })

  styleExtractor.processElement({
    className: submitButtonClass,
    tailwindClasses: 'inline-flex items-center justify-center',
    additionalStyles: {
      padding: 'var(--btn-py) var(--btn-px)',
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-primary-fg)',
      fontSize: 'var(--text-base)',
      fontWeight: 'var(--btn-weight)',
      borderRadius: 'var(--btn-radius)',
      textDecoration: 'none',
      ...extractFieldStyles(fieldStyles, 'submitButton'),
    },
  })

  // Generate form fields HTML (all types) with indexed classes
  const formFieldsHTML = formFields.map((field, index) => {
    const fieldType = field.type || 'text'
    const inputClass = styleExtractor.createChildClass(formClass, `input_${index}`)

    // Process input field styles
    styleExtractor.processElement({
      className: inputClass,
      tailwindClasses: '',
      additionalStyles: {
        width: '100%',
        ...sharedFormInputStyle,
      },
    })

    switch (fieldType) {
      case 'text':
      case 'email':
      case 'phone':
        return `<input type="${fieldType === 'phone' ? 'tel' : fieldType}" placeholder="${escapeHtml(field.label || '')}" class="${inputClass}" />`

      case 'datetime':
        return `<input type="datetime-local" placeholder="${escapeHtml(field.label || '')}" class="${inputClass}" />`

      case 'select':
        return `
          <select class="${inputClass}">
            <option value="" disabled selected>${escapeHtml(field.label || '')}</option>
            ${(field.options || []).map(opt => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('')}
          </select>`

      case 'checkbox': {
        const checkboxContainerClass = styleExtractor.createChildClass(formClass, `checkbox-container_${index}`)
        styleExtractor.processElement({
          className: checkboxContainerClass,
          tailwindClasses: 'flex flex-col gap-[var(--spacing-xs)]',
        })

        return `
          <div class="${checkboxContainerClass}">
            ${(field.options || []).map((opt, optIndex) => {
              const checkboxLabelClass = styleExtractor.createChildClass(checkboxContainerClass, `label_${optIndex}`)
              const checkboxInputClass = styleExtractor.createChildClass(checkboxContainerClass, `input_${optIndex}`)

              styleExtractor.processElement({
                className: checkboxLabelClass,
                tailwindClasses: 'flex items-center gap-[var(--spacing-sm)]',
                additionalStyles: { fontSize: 'var(--text-base)' },
              })

              styleExtractor.processElement({
                className: checkboxInputClass,
                additionalStyles: { width: '16px', height: '16px' },
              })

              return `
              <label class="${checkboxLabelClass}">
                <input type="checkbox" value="${escapeHtml(opt)}" class="${checkboxInputClass}" />
                <span>${escapeHtml(opt)}</span>
              </label>`
            }).join('')}
          </div>`
      }

      case 'radio': {
        const radioContainerClass = styleExtractor.createChildClass(formClass, `radio-container_${index}`)
        styleExtractor.processElement({
          className: radioContainerClass,
          tailwindClasses: 'flex flex-col gap-[var(--spacing-xs)]',
        })

        return `
          <div class="${radioContainerClass}">
            ${(field.options || []).map((opt, optIndex) => {
              const radioLabelClass = styleExtractor.createChildClass(radioContainerClass, `label_${optIndex}`)
              const radioInputClass = styleExtractor.createChildClass(radioContainerClass, `input_${optIndex}`)

              styleExtractor.processElement({
                className: radioLabelClass,
                tailwindClasses: 'flex items-center gap-[var(--spacing-sm)]',
                additionalStyles: { fontSize: 'var(--text-base)' },
              })

              styleExtractor.processElement({
                className: radioInputClass,
                additionalStyles: { width: '16px', height: '16px' },
              })

              return `
              <label class="${radioLabelClass}">
                <input type="radio" name="radio-${index}" value="${escapeHtml(opt)}" class="${radioInputClass}" />
                <span>${escapeHtml(opt)}</span>
              </label>`
            }).join('')}
          </div>`
      }

      case 'textarea':
        styleExtractor.processElement({
          className: inputClass,
          additionalStyles: {
            width: '100%',
            resize: 'vertical',
            ...sharedFormInputStyle,
          },
        })
        return `<textarea placeholder="${escapeHtml(field.label || '')}" rows="4" class="${inputClass}"></textarea>`

      default:
        return `<input type="text" placeholder="${escapeHtml(field.label || '')}" class="${inputClass}" />`
    }
  }).join('')

  // Generate social links HTML with indexed classes
  const socialLinksHTML = socialLinks.map((link, index) => {
    const linkClass = styleExtractor.createChildClass(socialLinksContainerClass, `item_${index}`)
    const linkImageClass = styleExtractor.createChildClass(linkClass, 'image')
    const linkContentClass = styleExtractor.createChildClass(linkClass, 'content')
    const linkLabelClass = styleExtractor.createChildClass(linkClass, 'label')
    const linkDescriptionClass = styleExtractor.createChildClass(linkClass, 'description')
    const linkIconClass = styleExtractor.createChildClass(linkClass, 'icon')

    styleExtractor.processElement({
      className: linkClass,
      tailwindClasses: 'flex items-center gap-[var(--spacing-md)]',
      additionalStyles: {
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        ...sharedLinkContainerStyle,
      },
    })

    styleExtractor.processElement({
      className: linkImageClass,
      additionalStyles: {
        width: '40px',
        height: '40px',
        borderRadius: 'var(--radius-sm)',
        objectFit: 'cover',
        flexShrink: '0',
      },
    })

    styleExtractor.processElement({
      className: linkContentClass,
      tailwindClasses: 'flex flex-col gap-[var(--spacing-xs)]',
      additionalStyles: {
        minWidth: '0',
        flex: '1',
      },
    })

    styleExtractor.processElement({
      className: linkLabelClass,
      additionalStyles: {
        fontSize: 'var(--text-base)',
        fontWeight: '500',
        ...sharedLinkLabelStyle,
      },
    })

    styleExtractor.processElement({
      className: linkDescriptionClass,
      additionalStyles: {
        fontSize: 'var(--text-sm)',
        color: 'var(--color-muted)',
        ...sharedLinkDescriptionStyle,
      },
    })

    styleExtractor.processElement({
      className: linkIconClass,
      additionalStyles: {
        color: 'var(--color-muted)',
        flexShrink: '0',
        marginLeft: 'var(--spacing-md)',
      },
    })

    return `
    <a href="${escapeHtml(link.url || '#')}" data-field="socialLinks" data-index="${index}" class="${linkClass}">
      ${link.image?.src ? `<img src="${escapeHtml(link.image.src)}" alt="${escapeHtml(link.image.alt || '')}" class="${linkImageClass}" />` : ''}
      <div class="${linkContentClass}">
        <span class="${linkLabelClass}">${escapeHtml(link.label || '')}</span>
        ${link.description ? `<span class="${linkDescriptionClass}">${escapeHtml(link.description)}</span>` : ''}
      </div>
      <i class="lni lni-arrow-right ${linkIconClass}"></i>
    </a>`
  }).join('')

  if (variant === 'stacked') {
    // Stacked-specific classes
    const stackedContainerClass = styleExtractor.createChildClass(contactClass, 'stacked-container')
    const stackedHeaderClass = styleExtractor.createChildClass(contactClass, 'stacked-header')
    const stackedParagraphsClass = styleExtractor.createChildClass(contactClass, 'stacked-paragraphs')
    const stackedFormClass = styleExtractor.createChildClass(contactClass, 'stacked-form')
    const stackedSocialLinksClass = styleExtractor.createChildClass(contactClass, 'stacked-social-links')

    styleExtractor.processElement({
      className: stackedContainerClass,
      additionalStyles: {
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
      },
    })

    styleExtractor.processElement({
      className: stackedHeaderClass,
      additionalStyles: {
        textAlign: 'center',
        marginBottom: 'var(--spacing-xl)',
      },
    })

    styleExtractor.processElement({
      className: stackedParagraphsClass,
      tailwindClasses: 'flex flex-col gap-[var(--spacing-sm)]',
      additionalStyles: {
        marginBottom: 'var(--spacing-xl)',
        textAlign: 'center',
      },
    })

    const formGapStyles: Record<string, string> = {}
    if (formFieldsSpaceBetween !== undefined) {
      formGapStyles.gap = `${formFieldsSpaceBetween}px`
    }

    styleExtractor.processElement({
      className: stackedFormClass,
      tailwindClasses: 'flex flex-col',
      additionalStyles: {
        marginBottom: 'var(--spacing-xl)',
        ...formGapStyles,
      },
    })

    const socialLinksGapStyles: Record<string, string> = {}
    if (socialLinksSpaceBetween !== undefined) {
      socialLinksGapStyles.gap = `${socialLinksSpaceBetween}px`
    }

    styleExtractor.processElement({
      className: stackedSocialLinksClass,
      tailwindClasses: 'flex flex-col gap-[var(--spacing-sm)]',
      additionalStyles: socialLinksGapStyles,
    })

    // Process paragraph classes
    paragraphs.forEach((_, i) => {
      const paragraphClass = styleExtractor.createChildClass(stackedParagraphsClass, `p_${i}`)
      styleExtractor.processElement({
        className: paragraphClass,
        additionalStyles: {
          fontSize: 'var(--text-base)',
          margin: '0',
          fontFamily: 'var(--font-body)',
        },
      })
    })

    return `
    <section data-section-id="${id}" class="${contactClass}">
      <div class="${stackedContainerClass}">
        <!-- Section Header -->
        ${(headline || subheadline) ? `
          <div class="${stackedHeaderClass}">
            ${headline ? `<h2 data-field="headline" class="${headlineClass}">${escapeHtml(headline)}</h2>` : ''}
            ${subheadline ? `<p data-field="subheadline" class="${subheadlineClass}">${escapeHtml(subheadline)}</p>` : ''}
          </div>
        ` : ''}

        <!-- Paragraphs (Email, Phone, Address) -->
        ${paragraphs.length === 3 ? `
          <div class="${stackedParagraphsClass}">
            ${paragraphs.map((p, i) => {
              const pClass = styleExtractor.createChildClass(stackedParagraphsClass, `p_${i}`)
              return `<p data-field="paragraphs.${i}" class="${pClass}">${escapeHtml(p)}</p>`
            }).join('')}
          </div>
        ` : ''}

        <!-- Form -->
        <form class="${stackedFormClass}" onsubmit="event.preventDefault();">
          ${formFieldsHTML}
          ${submitButton?.label ? `<a href="${escapeHtml(submitButton.url || '#')}" data-field="submitButton" class="${submitButtonClass}">${escapeHtml(submitButton.label)}</a>` : ''}
        </form>

        <!-- Social Links -->
        ${socialLinks.length > 0 ? `
          <div class="${stackedSocialLinksClass}">
            ${socialLinksHTML}
          </div>
        ` : ''}
      </div>
    </section>`
  }

  if (variant === 'split') {
    const isTitleFirst = splitLayout === 'title-content'
    const titleOrder = isTitleFirst ? '1' : '2'
    const contentOrder = isTitleFirst ? '2' : '1'

    // Split-specific classes
    const splitContainerClass = styleExtractor.createChildClass(contactClass, 'split-container')
    const splitContentColumnClass = styleExtractor.createChildClass(contactClass, 'split-content-column')
    const splitFormClass = styleExtractor.createChildClass(contactClass, 'split-form')
    const splitSocialLinksClass = styleExtractor.createChildClass(contactClass, 'split-social-links')
    const splitTitleColumnClass = styleExtractor.createChildClass(contactClass, 'split-title-column')
    const splitParagraphsClass = styleExtractor.createChildClass(contactClass, 'split-paragraphs')

    styleExtractor.processElement({
      className: splitContainerClass,
      tailwindClasses: 'grid grid-cols-2 gap-[var(--spacing-2xl)]',
      additionalStyles: {
        maxWidth: '1200px',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
        alignItems: 'flex-start',
      },
    })

    styleExtractor.processElement({
      className: splitContentColumnClass,
      tailwindClasses: 'flex flex-col gap-[var(--spacing-xl)]',
      additionalStyles: {
        order: contentOrder,
      },
    })

    const formGapStyles: Record<string, string> = {}
    if (formFieldsSpaceBetween !== undefined) {
      formGapStyles.gap = `${formFieldsSpaceBetween}px`
    }

    styleExtractor.processElement({
      className: splitFormClass,
      tailwindClasses: 'flex flex-col',
      additionalStyles: formGapStyles,
    })

    const socialLinksGapStyles: Record<string, string> = {}
    if (socialLinksSpaceBetween !== undefined) {
      socialLinksGapStyles.gap = `${socialLinksSpaceBetween}px`
    }

    styleExtractor.processElement({
      className: splitSocialLinksClass,
      tailwindClasses: 'flex flex-col gap-[var(--spacing-sm)]',
      additionalStyles: socialLinksGapStyles,
    })

    styleExtractor.processElement({
      className: splitTitleColumnClass,
      tailwindClasses: 'flex flex-col gap-[var(--spacing-lg)]',
      additionalStyles: {
        order: titleOrder,
      },
    })

    styleExtractor.processElement({
      className: splitParagraphsClass,
      tailwindClasses: 'flex flex-col gap-[var(--spacing-sm)]',
    })

    // Process paragraph classes
    paragraphs.forEach((_, i) => {
      const paragraphClass = styleExtractor.createChildClass(splitParagraphsClass, `p_${i}`)
      styleExtractor.processElement({
        className: paragraphClass,
        additionalStyles: {
          fontSize: 'var(--text-base)',
          margin: '0',
          fontFamily: 'var(--font-body)',
        },
      })
    })

    return `
    <section data-section-id="${id}" class="${contactClass}">
      <div class="${splitContainerClass}">
        <!-- Form + Social Links Column -->
        <div class="${splitContentColumnClass}">
          <!-- Form -->
          <form class="${splitFormClass}" onsubmit="event.preventDefault();">
            ${formFieldsHTML}
            ${submitButton?.label ? `<a href="${escapeHtml(submitButton.url || '#')}" data-field="submitButton" class="${submitButtonClass}">${escapeHtml(submitButton.label)}</a>` : ''}
          </form>

          <!-- Social Links -->
          ${socialLinks.length > 0 ? `
            <div class="${splitSocialLinksClass}">
              ${socialLinksHTML}
            </div>
          ` : ''}
        </div>

        <!-- Title Column -->
        <div class="${splitTitleColumnClass}">
          ${headline ? `<h2 data-field="headline" class="${headlineClass}">${escapeHtml(headline)}</h2>` : ''}
          ${subheadline ? `<p data-field="subheadline" class="${subheadlineClass}">${escapeHtml(subheadline)}</p>` : ''}

          <!-- Paragraphs (Email, Phone, Address) -->
          ${paragraphs.length === 3 ? `
            <div class="${splitParagraphsClass}">
              ${paragraphs.map((p, i) => {
                const pClass = styleExtractor.createChildClass(splitParagraphsClass, `p_${i}`)
                return `<p data-field="paragraphs.${i}" class="${pClass}">${escapeHtml(p)}</p>`
              }).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </section>`
  }

  // Default fallback (stacked)
  return generateContactHTML({ ...section, variant: 'stacked' }, theme, sectionStyle)
}

// ============================================
// SUBSCRIBE SECTION
// ============================================

function generateSubscribeHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, data, fieldStyles, styles } = section
  const headline = data.headline as string || ''
  const subheadline = data.subheadline as string || ''
  const paragraph = data.paragraph as string || ''
  const emailPlaceholder = data.emailPlaceholder as string || 'Enter your email'
  const submitButton = data.submitButton as { label?: string } | undefined

  const customStyles = extractSectionStyles(styles as Record<string, unknown>)

  // Create class names
  const subscribeClass = styleExtractor.createRootClass('subscribe')
  const containerClass = styleExtractor.createChildClass(subscribeClass, 'container')
  const headerClass = styleExtractor.createChildClass(subscribeClass, 'header')
  const headlineClass = styleExtractor.createChildClass(subscribeClass, 'headline')
  const subheadlineClass = styleExtractor.createChildClass(subscribeClass, 'subheadline')
  const paragraphWrapperClass = styleExtractor.createChildClass(subscribeClass, 'paragraph_wrapper')
  const paragraphClass = styleExtractor.createChildClass(subscribeClass, 'paragraph')
  const formClass = styleExtractor.createChildClass(subscribeClass, 'form')
  const inputClass = styleExtractor.createChildClass(subscribeClass, 'input')
  const buttonClass = styleExtractor.createChildClass(subscribeClass, 'button')

  // Process subscribe section
  styleExtractor.processElement({
    className: subscribeClass,
    tailwindClasses: 'text-[var(--color-fg)]',
    additionalStyles: customStyles,
  })

  // Process container
  styleExtractor.processElement({
    className: containerClass,
    tailwindClasses: 'max-w-[600px] mx-auto w-full',
  })

  // Process header (headline + subheadline wrapper)
  if (headline || subheadline) {
    styleExtractor.processElement({
      className: headerClass,
      tailwindClasses: 'text-center mb-[var(--spacing-xl)]',
    })
  }

  // Process headline
  if (headline) {
    styleExtractor.processElement({
      className: headlineClass,
      tailwindClasses: 'text-[length:var(--text-3xl)] font-bold leading-tight m-0 mb-[var(--spacing-sm)]',
      additionalStyles: extractFieldStyles(fieldStyles, 'headline'),
    })
  }

  // Process subheadline
  if (subheadline) {
    styleExtractor.processElement({
      className: subheadlineClass,
      tailwindClasses: 'text-[length:var(--text-lg)] text-[var(--color-muted)] m-0',
      additionalStyles: extractFieldStyles(fieldStyles, 'subheadline'),
    })
  }

  // Process paragraph wrapper
  if (paragraph) {
    styleExtractor.processElement({
      className: paragraphWrapperClass,
      tailwindClasses: 'text-center mb-[var(--spacing-lg)]',
    })
  }

  // Process paragraph
  if (paragraph) {
    styleExtractor.processElement({
      className: paragraphClass,
      tailwindClasses: 'text-[length:var(--text-base)] text-[var(--color-muted)] m-0',
      additionalStyles: extractFieldStyles(fieldStyles, 'paragraph'),
    })
  }

  // Process form
  styleExtractor.processElement({
    className: formClass,
    tailwindClasses: 'flex flex-col sm:flex-row gap-[var(--spacing-sm)] items-stretch',
  })

  // Process input
  styleExtractor.processElement({
    className: inputClass,
    tailwindClasses: 'flex-1 px-[var(--spacing-md)] py-[var(--spacing-sm)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-fg)] text-[length:var(--text-base)] font-[var(--font-body)] outline-none focus:border-[var(--color-primary)] transition-colors',
  })

  // Process button
  if (submitButton?.label) {
    styleExtractor.processElement({
      className: buttonClass,
      tailwindClasses: 'inline-flex items-center justify-center px-[var(--spacing-lg)] py-[var(--spacing-sm)] rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[length:var(--text-base)] font-medium font-[var(--font-body)] no-underline whitespace-nowrap transition-colors hover:opacity-90 cursor-pointer',
    })
  }

  return `
  <section class="${subscribeClass}" data-section-id="${id}">
    <div class="${containerClass}">
      ${headline || subheadline ? `
      <div class="${headerClass}">
        ${headline ? `<h2 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h2>` : ''}
        ${subheadline ? `<p class="${subheadlineClass}" data-field="subheadline">${escapeHtml(subheadline)}</p>` : ''}
      </div>
      ` : ''}
      ${paragraph ? `
      <div class="${paragraphWrapperClass}">
        <p class="${paragraphClass}" data-field="paragraph">${escapeHtml(paragraph)}</p>
      </div>
      ` : ''}
      <form class="${formClass}">
        <input type="email" class="${inputClass}" placeholder="${escapeHtml(emailPlaceholder)}" required data-field="emailPlaceholder" />
        ${submitButton?.label ? `<button type="submit" class="${buttonClass}" data-field="submitButton">${escapeHtml(submitButton.label)}</button>` : ''}
      </form>
    </div>
  </section>`
}

// ============================================
// TEXT SECTION
// ============================================

function generateTextHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, data, fieldStyles } = section
  const headline = data.headline as string || ''
  const paragraph = data.paragraph as string || ''

  // Create class names
  const textClass = styleExtractor.createRootClass('text')
  const contentClass = styleExtractor.createChildClass(textClass, 'content')
  const headlineClass = styleExtractor.createChildClass(textClass, 'headline')
  const paragraphClass = styleExtractor.createChildClass(textClass, 'paragraph')

  // Process text section
  styleExtractor.processElement({
    className: textClass,
    tailwindClasses: 'py-[4rem] px-[1.5rem] max-w-[800px] mx-auto',
    inlineStyle: sectionStyle,
  })

  // Process content container
  styleExtractor.processElement({
    className: contentClass,
    tailwindClasses: 'flex flex-col gap-[1.5rem]',
  })

  // Process headline with field styles
  if (headline) {
    styleExtractor.processElement({
      className: headlineClass,
      tailwindClasses: '',
      additionalStyles: extractFieldStyles(fieldStyles, 'headline'),
    })
  }

  // Process paragraph with field styles
  if (paragraph) {
    styleExtractor.processElement({
      className: paragraphClass,
      tailwindClasses: '',
      additionalStyles: {
        lineHeight: '1.8',
        ...extractFieldStyles(fieldStyles, 'paragraph'),
      },
    })
  }

  return `
  <section class="${textClass}" data-section-id="${id}">
    <div class="${contentClass}">
      ${headline ? `<h2 class="${headlineClass}" data-field="headline">${escapeHtml(headline)}</h2>` : ''}
      ${paragraph ? `<p class="${paragraphClass}" data-field="paragraph">${escapeHtml(paragraph)}</p>` : ''}
    </div>
  </section>`
}

// ============================================
// LANGUAGE SWITCHER
// ============================================

function generateLanguageSwitcher(translation: TranslationSettings): string {
  const allLangs = [translation.defaultLanguage, ...translation.languages]

  const options = allLangs.map(code => {
    const lang = LANGUAGE_LABELS[code] || { label: code, flag: '' }
    return `<option value="${code}">${lang.flag} ${lang.label}</option>`
  }).join('')

  return `
  <div class="ld-lang-switcher">
    <select id="ld-lang-select" aria-label="Select language">
      ${options}
    </select>
  </div>`
}

// ============================================
// CSS GENERATION
// ============================================

function generateCSS(theme: ThemeTokens): string {
  return `
/* CSS Reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; line-height: 1.6; }
body {
  font-family: ${theme.fonts.body};
  background-color: ${theme.colors.background};
  color: ${theme.colors.foreground};
  min-height: 100vh;
}
img, video { max-width: 100%; height: auto; display: block; }
a { color: inherit; text-decoration: none; }
button, input, textarea, select { font: inherit; }

/* Typography */
h1, h2, h3, h4, h5, h6 { font-family: ${theme.fonts.heading}; font-weight: 600; line-height: 1.2; }
h1 { font-size: clamp(2.5rem, 5vw, 4rem); }
h2 { font-size: clamp(2rem, 4vw, 3rem); }
h3 { font-size: clamp(1.25rem, 2vw, 1.5rem); }

/* Button */
.ld-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 2rem;
  font-weight: 500;
  border-radius: 0.5rem;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.primaryForeground};
  transition: opacity 0.2s;
  cursor: pointer;
  border: none;
}
.ld-btn:hover { opacity: 0.9; }

/* Language Switcher */
.ld-lang-switcher {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1000;
}
.ld-lang-switcher select {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.background};
  color: ${theme.colors.foreground};
  cursor: pointer;
  font-size: 0.875rem;
}

/* Hero Section */
.ld-hero {
  padding: 4rem 1.5rem;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ld-hero--full {
  position: relative;
  min-height: 100vh;
  text-align: center;
}
.ld-hero--full .ld-hero__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
}
.ld-hero--full .ld-hero__bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ld-hero--centered {
  text-align: center;
}
.ld-hero--split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
}
@media (max-width: 768px) {
  .ld-hero--split { grid-template-columns: 1fr; }
}
.ld-hero__content {
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.ld-hero--centered .ld-hero__content { align-items: center; }
.ld-hero__headline { margin-bottom: 0; }
.ld-hero__subheadline { color: ${theme.colors.mutedForeground}; font-size: 1.25rem; }
.ld-hero__media img { border-radius: 0.75rem; }

/* Cards Section */
.ld-cards {
  padding: 4rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
.ld-cards__header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 3rem;
}
.ld-cards__paragraph {
  color: ${theme.colors.mutedForeground};
  margin-top: 1rem;
}
.ld-cards__grid {
  display: grid;
  gap: 1.5rem;
}
.ld-cards__grid--2 { grid-template-columns: repeat(2, 1fr); }
.ld-cards__grid--3 { grid-template-columns: repeat(3, 1fr); }
.ld-cards__grid--4 { grid-template-columns: repeat(4, 1fr); }
@media (max-width: 768px) {
  .ld-cards__grid--2,
  .ld-cards__grid--3,
  .ld-cards__grid--4 { grid-template-columns: 1fr; }
}
.ld-card {
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: ${theme.colors.secondary};
}
.ld-card__image {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}
.ld-card__title { margin-bottom: 0.5rem; }
.ld-card__desc { color: ${theme.colors.mutedForeground}; font-size: 0.875rem; }

/* CTA Section */
.ld-cta {
  padding: 4rem 1.5rem;
  text-align: center;
}
.ld-cta__content {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}
.ld-cta__paragraph { color: ${theme.colors.mutedForeground}; }

/* Links Section */
.ld-links {
  padding: 4rem 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}
.ld-links__header {
  text-align: center;
  margin-bottom: 2rem;
}
.ld-links__paragraph {
  color: ${theme.colors.mutedForeground};
  margin-top: 0.5rem;
}
.ld-links__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.ld-link-item {
  display: flex;
  flex-direction: column;
  padding: 1rem 1.5rem;
  background: ${theme.colors.secondary};
  border-radius: 0.5rem;
  transition: background 0.2s;
}
.ld-link-item:hover { background: ${theme.colors.muted}; }
.ld-link-item__label { font-weight: 500; }
.ld-link-item__desc { font-size: 0.875rem; color: ${theme.colors.mutedForeground}; }

/* Accordion Section */
.ld-accordion {
  padding: 4rem 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}
.ld-accordion__header {
  text-align: center;
  margin-bottom: 2rem;
}
.ld-accordion__paragraph {
  color: ${theme.colors.mutedForeground};
  margin-top: 0.5rem;
}
.ld-accordion__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ld-accordion-item {
  border: 1px solid ${theme.colors.border};
  border-radius: 0.5rem;
  overflow: hidden;
}
.ld-accordion-item__question {
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  list-style: none;
}
.ld-accordion-item__question::-webkit-details-marker { display: none; }
.ld-accordion-item__answer {
  padding: 0 1.5rem 1rem;
  color: ${theme.colors.mutedForeground};
}

/* Header Section */
.ld-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
.ld-header__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.ld-header__logo { height: 2rem; width: auto; }
.ld-header__title { font-weight: 600; }
.ld-header__nav {
  display: flex;
  gap: 1.5rem;
}
.ld-header__link { font-size: 0.875rem; transition: opacity 0.2s; }
.ld-header__link:hover { opacity: 0.7; }

/* Footer Section */
.ld-footer {
  padding: 2rem 1.5rem;
  text-align: center;
}
.ld-footer__nav {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}
.ld-footer__link { font-size: 0.875rem; transition: opacity 0.2s; }
.ld-footer__link:hover { opacity: 0.7; }
.ld-footer__copyright { font-size: 0.75rem; color: ${theme.colors.mutedForeground}; }

/* Gallery Section */
.ld-gallery {
  padding: 4rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
.ld-gallery__header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 3rem;
}
.ld-gallery__subheadline {
  color: ${theme.colors.mutedForeground};
  margin-top: 0.5rem;
}
.ld-gallery__paragraph {
  color: ${theme.colors.mutedForeground};
  margin-top: 1rem;
}
.ld-gallery__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
@media (max-width: 768px) {
  .ld-gallery__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .ld-gallery__grid {
    grid-template-columns: 1fr;
  }
}
.ld-gallery__item {
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
}
.ld-gallery__image,
.ld-gallery__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 1;
  display: block;
}

/* Products Section */
.ld-products {
  padding: 4rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
.ld-products__header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 3rem;
}
.ld-products__subheadline {
  color: ${theme.colors.mutedForeground};
  margin-top: 0.5rem;
}
.ld-products__paragraph {
  color: ${theme.colors.mutedForeground};
  margin-top: 1rem;
}
.ld-products__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
@media (max-width: 768px) {
  .ld-products__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .ld-products__grid {
    grid-template-columns: 1fr;
  }
}
.ld-product-card {
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: ${theme.colors.secondary};
  display: flex;
  flex-direction: column;
}
.ld-product-card__image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}
.ld-product-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}
.ld-product-card__heading {
  font-size: 1.25rem;
  font-weight: 600;
}
.ld-product-card__subheading {
  color: ${theme.colors.mutedForeground};
  font-size: 0.875rem;
}
.ld-product-card__desc {
  color: ${theme.colors.mutedForeground};
  font-size: 0.875rem;
  flex: 1;
}
.ld-product-card__price {
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  margin-top: 0.5rem;
}
.ld-product-card__btn {
  margin-top: 1rem;
}

/* Events Section */
.ld-events {
  padding: 4rem 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}
.ld-events__header {
  text-align: center;
  margin-bottom: 2rem;
}
.ld-events__paragraph {
  color: ${theme.colors.mutedForeground};
  margin-top: 0.5rem;
}
.ld-events__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.ld-event-item {
  border: 1px solid ${theme.colors.border};
  border-radius: 0.75rem;
  overflow: hidden;
}
.ld-event-item__summary {
  padding: 1.5rem;
  cursor: pointer;
  list-style: none;
  background: ${theme.colors.secondary};
  transition: background 0.2s;
}
.ld-event-item__summary:hover {
  background: ${theme.colors.muted};
}
.ld-event-item__summary::-webkit-details-marker {
  display: none;
}
.ld-event-item__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ld-event-item__title {
  font-size: 1.25rem;
  font-weight: 600;
}
.ld-event-item__datetime,
.ld-event-item__location {
  font-size: 0.875rem;
  color: ${theme.colors.mutedForeground};
}
.ld-event-item__details {
  padding: 1.5rem;
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.ld-event-item__image {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: 0.5rem;
}
.ld-event-item__desc {
  color: ${theme.colors.foreground};
  line-height: 1.6;
}
.ld-event-item__price {
  font-weight: 600;
  color: ${theme.colors.primary};
}

/* Contact Section */
.ld-contact {
  padding: 4rem 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  gap: 3rem;
}
@media (min-width: 768px) {
  .ld-contact {
    grid-template-columns: 1fr 1fr;
  }
}
.ld-contact__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.ld-contact__subheadline {
  color: ${theme.colors.mutedForeground};
  font-size: 1.125rem;
}
.ld-contact__paragraph {
  color: ${theme.colors.mutedForeground};
  font-size: 0.875rem;
}
.ld-contact__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.ld-contact__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ld-contact__field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.colors.foreground};
}
.ld-contact__field input,
.ld-contact__field textarea {
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 0.5rem;
  background: ${theme.colors.background};
  color: ${theme.colors.foreground};
  font-size: 0.875rem;
}
.ld-contact__field textarea {
  min-height: 120px;
  resize: vertical;
}
.ld-contact__field input:focus,
.ld-contact__field textarea:focus {
  outline: none;
  border-color: ${theme.colors.primary};
}

/* Text Section */
.ld-text {
  padding: 4rem 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}
.ld-text__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.ld-text__paragraph {
  color: ${theme.colors.foreground};
  line-height: 1.8;
}

/* Watermark */
.ld-watermark {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  font-size: 0.75rem;
  color: ${theme.colors.mutedForeground};
  z-index: 1000;
}
.ld-watermark a { opacity: 0.7; transition: opacity 0.2s; }
.ld-watermark a:hover { opacity: 1; }
`
}

// ============================================
// TRANSLATION JS
// ============================================

function generateTranslationJS(content: PageContent): string {
  if (!content.translation || content.translation.languages.length === 0) {
    return ''
  }

  const translations = JSON.stringify(content.translations || {})
  const defaultSections = JSON.stringify(
    content.sections.reduce((acc, section) => {
      acc[section.id] = section.data
      return acc
    }, {} as Record<string, unknown>)
  )

  return `
<script>
(function() {
  const translations = ${translations};
  const defaultData = ${defaultSections};
  const defaultLang = "${content.translation.defaultLanguage}";

  function applyTranslation(lang) {
    const langData = lang === defaultLang ? {} : (translations[lang] || {});

    document.querySelectorAll('[data-section-id]').forEach(section => {
      const sectionId = section.dataset.sectionId;
      const sectionDefaults = defaultData[sectionId] || {};
      const sectionTranslation = langData[sectionId] || {};

      // Simple fields
      section.querySelectorAll('[data-field]').forEach(el => {
        const field = el.dataset.field;
        const index = el.dataset.index;

        if (index !== undefined) {
          // Array item field
          const itemField = el.querySelector('[data-item-field]');
          if (itemField) {
            const itemKey = itemField.dataset.itemField;
            const defaultArr = sectionDefaults[field] || [];
            const transArr = sectionTranslation[field] || [];
            const value = transArr[index]?.[itemKey] ?? defaultArr[index]?.[itemKey] ?? '';
            itemField.textContent = value;
          }
        } else {
          // Simple field
          let value = sectionTranslation[field] ?? sectionDefaults[field] ?? '';

          // Handle link objects
          if (typeof value === 'object' && value !== null) {
            if (value.label !== undefined) {
              el.textContent = value.label;
              if (value.url && el.tagName === 'A') {
                el.href = value.url;
              }
            }
          } else {
            el.textContent = value;
          }
        }
      });
    });
  }

  // Language selector
  const select = document.getElementById('ld-lang-select');
  if (select) {
    select.addEventListener('change', (e) => {
      applyTranslation(e.target.value);
      localStorage.setItem('ld-lang', e.target.value);
    });

    // Restore saved language
    const saved = localStorage.getItem('ld-lang');
    if (saved && select.querySelector('option[value="' + saved + '"]')) {
      select.value = saved;
      applyTranslation(saved);
    }
  }
})();
</script>`
}

// ============================================
// HTML GENERATION
// ============================================

function generateHTML(project: any, content: PageContent, settings: any, umamiSiteId?: string): { html: string; css: string } {
  // Get base theme and merge with overrides
  const baseTheme = getTheme(content.themeId)
  const theme: ThemeTokens = {
    colors: {
      ...baseTheme.colors,
      ...(content.themeOverrides?.colors || {}),
    },
    fonts: {
      ...baseTheme.fonts,
      ...(content.themeOverrides?.fonts || {}),
    },
  }

  const title = settings?.meta_title || project.title || 'Untitled'
  const description = settings?.meta_description || project.description || ''
  const ogImage = settings?.og_image || ''
  const favicon = settings?.favicon || ''
  const keywords = settings?.keywords || ''

  // Reset style extractor for new page generation
  styleExtractor.reset()

  // Set theme for CSS variable resolution
  styleExtractor.setTheme(theme)

  // Generate sections HTML (this populates the styleExtractor)
  console.log('[PUBLISH_HTML_GEN_START] Starting HTML generation')
  const sectionsHTML = content.sections
    .map(section => generateSectionHTML(section, theme))
    .join('\n')
  console.log('[PUBLISH_HTML_GEN_END] HTML generation complete')

  // Get generated CSS from styleExtractor
  const generatedCSS = styleExtractor.getCSS()
  console.log('[PUBLISH_CSS_EXTRACT] CSS extracted, length:', generatedCSS.length)

  // Generate base CSS (theme variables, resets, etc.)
  const baseCSS = generateCSS(theme)

  // Generate font imports for CSS file
  const fontImports = Array.from(fonts)
    .filter(f => f && !f.includes('system'))
    .map(f => {
      const fontName = f.split(',')[0].replace(/'/g, '').trim()
      return `@import url('https://api.fontshare.com/v2/css?f[]=${encodeURIComponent(fontName.toLowerCase().replace(/\s+/g, '-'))}@400,500,600,700&display=swap');`
    })
    .join('\n')

  // Combine font imports, base CSS, and generated component CSS
  const css = `/* Font Imports */
${fontImports}

${baseCSS}

/* Generated Component Styles */
${generatedCSS}`

  // Generate language switcher if translations exist
  const langSwitcher = content.translation && content.translation.languages.length > 0
    ? generateLanguageSwitcher(content.translation)
    : ''

  // Generate translation JS
  const translationJS = generateTranslationJS(content)

  // Umami analytics
  const umamiScript = umamiSiteId
    ? `<script defer src="${UMAMI_API_URL}/script.js" data-website-id="${umamiSiteId}"></script>`
    : ''

  // Font preload - collect ALL fonts used (theme + fieldStyles)
  const fonts = new Set([theme.fonts.heading, theme.fonts.body])

  // Scan all sections for custom fonts in fieldStyles
  content.sections.forEach(section => {
    if (section.fieldStyles) {
      Object.values(section.fieldStyles).forEach(fieldStyle => {
        if (fieldStyle.fontFamily && typeof fieldStyle.fontFamily === 'string') {
          fonts.add(fieldStyle.fontFamily)
        }
      })
    }
  })

  // DEBUG: Log all fonts being loaded
  console.log('[PUBLISH_FONTS_TO_LOAD]', Array.from(fonts))

  const fontLinks = Array.from(fonts)
    .filter(f => f && !f.includes('system'))
    .map(f => {
      const fontName = f.split(',')[0].replace(/'/g, '').trim()
      return `<link href="https://api.fontshare.com/v2/css?f[]=${encodeURIComponent(fontName.toLowerCase().replace(/\s+/g, '-'))}@400,500,600,700&display=swap" rel="stylesheet">`
    })
    .join('\n  ')

  const html = `<!DOCTYPE html>
<html lang="${content.translation?.defaultLanguage || 'en'}">
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
  <link rel="preconnect" href="https://api.fontshare.com">
  ${fontLinks}

  <!-- Stylesheet -->
  <link rel="stylesheet" href="/style.css">
</head>
<body>
${sectionsHTML}

${langSwitcher}

<!-- Powered by Lands -->
<div class="ld-watermark">
  <a href="https://lands.app" target="_blank" rel="noopener">Built with Lands</a>
</div>

${translationJS}
</body>
</html>`

  return { html, css }
}

// ============================================
// CLOUDFLARE KV STORAGE
// ============================================

interface SiteData {
  html: string
  css: string
  visibility: 'public' | 'private' | 'password'
  passwordHash?: string
  updatedAt: string
}

async function storeInKV(key: string, data: SiteData): Promise<void> {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_KV_NAMESPACE_ID) {
    console.log('Cloudflare credentials not configured, skipping KV storage')
    return
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
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

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to delete from KV: ${error}`)
  }
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
      const { data: contentRow, error: contentError } = await supabase
        .from('project_content')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (contentError || !contentRow) {
        return new Response(JSON.stringify({ error: 'Project content not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      // Parse content from blocks column (new section-based format)
      const blocksData = contentRow.blocks as Record<string, unknown> || {}
      const content: PageContent = {
        themeId: (blocksData.themeId as string) || 'minimal',
        sections: (blocksData.sections as SectionInstance[]) || [],
        themeOverrides: blocksData.themeOverrides as PageContent['themeOverrides'] | undefined,
        translation: blocksData.translation as TranslationSettings | undefined,
        translations: blocksData.translations as Record<string, Record<string, Record<string, unknown>>> | undefined,
      }

      // DEBUG: Log theme overrides
      console.log('[PUBLISH_THEME_OVERRIDES]', JSON.stringify(content.themeOverrides, null, 2))

      // STEP 1 — RAW PROJECT DUMP (PUBLISH)
      console.log(
        '[PUBLISH_RAW_PROJECT]',
        JSON.stringify(content.sections, null, 2)
      )

      // STEP 4 — USE HYDRATOR IN PUBLISH FUNCTION
      const hydratedContent = hydrateProject(content)

      // STEP 10 — FINAL ASSERTION
      if (!hydratedContent.sections.length) {
        throw new Error('[publish] Project has zero sections after hydration')
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

      // Generate static HTML and CSS
      const { html, css } = generateHTML(project, hydratedContent, settings, umamiSiteId)

      // Store in Cloudflare KV using slug as key
      const visibility = (settings?.visibility as 'public' | 'private' | 'password') || 'public'
      let passwordHash: string | undefined

      if (visibility === 'password' && settings?.password) {
        const encoder = new TextEncoder()
        const data = encoder.encode(settings.password)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      }

      await storeInKV(project.slug, {
        html,
        css,
        visibility,
        passwordHash,
        updatedAt: new Date().toISOString(),
      })

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
