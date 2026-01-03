import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hydrateProject } from './hydrator.ts'

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

  // Field styles
  const headlineStyle = buildFieldStyle(fieldStyles, 'headline')
  const subheadlineStyle = buildFieldStyle(fieldStyles, 'subheadline')
  const paragraphStyle = buildFieldStyle(fieldStyles, 'paragraph')
  const primaryCTAStyle = buildFieldStyle(fieldStyles, 'primaryCTA')
  const secondaryCTAStyle = buildFieldStyle(fieldStyles, 'secondaryCTA')

  // Media HTML
  const mediaHTML = media?.src
    ? (media.type === 'video'
        ? `<video src="${escapeHtml(media.src)}" autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>`
        : `<img src="${escapeHtml(media.src)}" alt="${escapeHtml(media.alt || '')}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" />`)
    : ''

  // Section wrapper style
  const sectionWrapperStyle = `background-color: ${theme.colors.background}; color: ${theme.colors.foreground}; padding: var(--spacing-section) var(--spacing-container); ${sectionStyle}`

  if (variant === 'stacked') {
    const gapStyle = `gap: ${spaceBetween}px;`

    if (stackedLayout === 'option1') {
      // Option 1: A (headline+subheadline) → B (media) → C (paragraph+buttons right 50%)
      return `
      <section data-section-id="${id}" style="${sectionWrapperStyle}">
        <div style="max-width: 1200px; margin-left: auto; margin-right: auto; width: 100%; display: flex; flex-direction: column; ${gapStyle}">
          <div style="display: flex; flex-direction: column;">
            ${headline ? `<h1 data-field="headline" style="font-size: var(--text-5xl); font-weight: bold; line-height: 1.2; margin: 0; ${headlineStyle}">${escapeHtml(headline)}</h1>` : ''}
            ${subheadline ? `<p data-field="subheadline" style="font-size: var(--text-xl); color: ${theme.colors.mutedForeground}; margin: 0; max-width: 600px; ${subheadlineStyle}">${escapeHtml(subheadline)}</p>` : ''}
          </div>
          ${media?.src ? `<div style="width: 100%; min-height: 0; position: relative; overflow: hidden; aspect-ratio: 16 / 9;">${mediaHTML}</div>` : ''}
          <div style="display: flex; flex-direction: column; gap: var(--spacing-lg); margin-left: auto; width: 100%; max-width: 50%;">
            ${paragraph ? `<div data-field="paragraph" style="font-size: var(--text-base); color: ${theme.colors.mutedForeground}; margin: 0; ${paragraphStyle}">${paragraph}</div>` : ''}
            <div style="display: flex; gap: var(--spacing-md);">
              ${primaryCTA?.label ? `<a href="${escapeHtml(primaryCTA.url || '#')}" data-field="primaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: ${theme.colors.primary}; color: ${theme.colors.primaryForeground}; font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${primaryCTAStyle}">${escapeHtml(primaryCTA.label)}</a>` : ''}
              ${secondaryCTA?.label ? `<a href="${escapeHtml(secondaryCTA.url || '#')}" data-field="secondaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: ${theme.colors.secondary}; color: ${theme.colors.secondaryForeground}; font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${secondaryCTAStyle}">${escapeHtml(secondaryCTA.label)}</a>` : ''}
            </div>
          </div>
        </div>
      </section>`
    } else if (stackedLayout === 'option2') {
      // Option 2: A (headline+subheadline center) → C (paragraph+buttons center) → B (media)
      return `
      <section data-section-id="${id}" style="${sectionWrapperStyle}">
        <div style="max-width: 1200px; margin-left: auto; margin-right: auto; width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center; ${gapStyle}">
          <div style="display: flex; flex-direction: column; gap: var(--spacing-md); align-items: center;">
            ${headline ? `<h1 data-field="headline" style="font-size: var(--text-5xl); font-weight: bold; line-height: 1.2; margin: 0; ${headlineStyle}">${escapeHtml(headline)}</h1>` : ''}
            ${subheadline ? `<p data-field="subheadline" style="font-size: var(--text-xl); color: ${theme.colors.mutedForeground}; margin: 0; max-width: 600px; ${subheadlineStyle}">${escapeHtml(subheadline)}</p>` : ''}
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--spacing-lg); align-items: center;">
            ${paragraph ? `<div data-field="paragraph" style="font-size: var(--text-base); color: ${theme.colors.mutedForeground}; margin: 0; max-width: 600px; ${paragraphStyle}">${paragraph}</div>` : ''}
            <div style="display: flex; gap: var(--spacing-md); justify-content: center;">
              ${primaryCTA?.label ? `<a href="${escapeHtml(primaryCTA.url || '#')}" data-field="primaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: ${theme.colors.primary}; color: ${theme.colors.primaryForeground}; font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${primaryCTAStyle}">${escapeHtml(primaryCTA.label)}</a>` : ''}
              ${secondaryCTA?.label ? `<a href="${escapeHtml(secondaryCTA.url || '#')}" data-field="secondaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: ${theme.colors.secondary}; color: ${theme.colors.secondaryForeground}; font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${secondaryCTAStyle}">${escapeHtml(secondaryCTA.label)}</a>` : ''}
            </div>
          </div>
          ${media?.src ? `<div style="width: 100%; min-height: 0; position: relative; overflow: hidden; aspect-ratio: 16 / 9;">${mediaHTML}</div>` : ''}
        </div>
      </section>`
    } else {
      // Option 3: B (media) → A (headline+subheadline center) → C (paragraph+buttons center)
      return `
      <section data-section-id="${id}" style="${sectionWrapperStyle}">
        <div style="max-width: 1200px; margin-left: auto; margin-right: auto; width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center; ${gapStyle}">
          ${media?.src ? `<div style="width: 100%; min-height: 0; position: relative; overflow: hidden; aspect-ratio: 16 / 9;">${mediaHTML}</div>` : ''}
          <div style="display: flex; flex-direction: column; gap: var(--spacing-md); align-items: center;">
            ${headline ? `<h1 data-field="headline" style="font-size: var(--text-5xl); font-weight: bold; line-height: 1.2; margin: 0; ${headlineStyle}">${escapeHtml(headline)}</h1>` : ''}
            ${subheadline ? `<p data-field="subheadline" style="font-size: var(--text-xl); color: ${theme.colors.mutedForeground}; margin: 0; max-width: 600px; ${subheadlineStyle}">${escapeHtml(subheadline)}</p>` : ''}
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--spacing-lg); align-items: center;">
            ${paragraph ? `<div data-field="paragraph" style="font-size: var(--text-base); color: ${theme.colors.mutedForeground}; margin: 0; max-width: 600px; ${paragraphStyle}">${paragraph}</div>` : ''}
            <div style="display: flex; gap: var(--spacing-md); justify-content: center;">
              ${primaryCTA?.label ? `<a href="${escapeHtml(primaryCTA.url || '#')}" data-field="primaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: ${theme.colors.primary}; color: ${theme.colors.primaryForeground}; font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${primaryCTAStyle}">${escapeHtml(primaryCTA.label)}</a>` : ''}
              ${secondaryCTA?.label ? `<a href="${escapeHtml(secondaryCTA.url || '#')}" data-field="secondaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: ${theme.colors.secondary}; color: ${theme.colors.secondaryForeground}; font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${secondaryCTAStyle}">${escapeHtml(secondaryCTA.label)}</a>` : ''}
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

    return `
    <section data-section-id="${id}" style="display: flex; background-color: ${theme.colors.background}; color: ${theme.colors.foreground}; padding: var(--spacing-section) 0; min-height: ${minHeight}; ${sectionStyle}">
      <div style="max-width: 1200px; margin-left: auto; margin-right: auto; width: 100%; display: grid; grid-template-columns: repeat(2, 1fr); align-items: center;">
        <!-- Media Column -->
        <div style="height: 100%; order: ${mediaOrder};">
          ${media?.src ? `<div style="height: 100%;">${mediaHTML.replace('width: 100%; height: 100%;', 'width: 100%; height: 100%; border-radius: var(--radius-lg);')}</div>` : '<div style="height: 100%; background-color: var(--color-secondary); border-radius: var(--radius-lg);"></div>'}
        </div>
        <!-- Content Column -->
        <div style="display: flex; flex-direction: column; gap: ${spaceBetween}px; padding-left: var(--spacing-container); padding-right: var(--spacing-container); order: ${contentOrder};">
          <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            ${headline ? `<h1 data-field="headline" style="font-size: var(--text-5xl); font-weight: bold; line-height: 1.2; margin: 0; font-family: var(--font-heading); ${headlineStyle}">${escapeHtml(headline)}</h1>` : ''}
            ${subheadline ? `<p data-field="subheadline" style="font-size: var(--text-xl); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${subheadlineStyle}">${escapeHtml(subheadline)}</p>` : ''}
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            ${paragraph ? `<div data-field="paragraph" style="font-size: var(--text-base); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${paragraphStyle}">${paragraph}</div>` : ''}
            <div style="display: flex; gap: var(--spacing-md);">
              ${primaryCTA?.label ? `<a href="${escapeHtml(primaryCTA.url || '#')}" data-field="primaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: var(--color-primary); color: var(--color-primary-fg); font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${primaryCTAStyle}">${escapeHtml(primaryCTA.label)}</a>` : ''}
              ${secondaryCTA?.label ? `<a href="${escapeHtml(secondaryCTA.url || '#')}" data-field="secondaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: var(--color-secondary); color: var(--color-secondary-fg); font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${secondaryCTAStyle}">${escapeHtml(secondaryCTA.label)}</a>` : ''}
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

    // Position classes
    let positionStyle = 'position: absolute; z-index: 10; padding: var(--spacing-container) var(--spacing-section);'
    if (positionY === 'top') positionStyle += ' top: 0;'
    else if (positionY === 'bottom') positionStyle += ' bottom: 0;'
    else positionStyle += ' top: 50%; transform: translateY(-50%);'

    if (positionX === 'left') positionStyle += ' left: 0;'
    else if (positionX === 'right') positionStyle += ' right: 0;'
    else positionStyle += positionY === 'middle' ? ' left: 50%; transform: translate(-50%, -50%);' : ' left: 50%; transform: translateX(-50%);'

    const textAlign = positionX === 'left' ? 'left' : positionX === 'right' ? 'right' : 'center'
    const itemsAlign = positionX === 'left' ? 'flex-start' : positionX === 'right' ? 'flex-end' : 'center'

    return `
    <section data-section-id="${id}" style="position: relative; overflow: hidden; display: flex; min-height: ${minHeight};">
      ${media?.src ? `<div style="position: absolute; inset: 0;">${mediaHTML}</div>` : `<div style="position: absolute; inset: 0; background-color: var(--color-secondary);"></div>`}
      <div style="position: absolute; inset: 0; background-color: ${rgba}; ${overlayBlur > 0 ? `backdrop-filter: blur(${overlayBlur}px);` : ''}"></div>
      <div style="${positionStyle} width: 100%; max-width: 1200px; margin-left: auto; margin-right: auto;">
        <div style="display: flex; flex-direction: column; gap: ${spaceBetween}px; text-align: ${textAlign}; align-items: ${itemsAlign};">
          <div style="display: flex; flex-direction: column; gap: var(--spacing-sm); text-align: ${textAlign}; align-items: ${itemsAlign};">
            ${headline ? `<h1 data-field="headline" style="font-size: var(--text-5xl); font-weight: bold; line-height: 1.2; margin: 0; color: white; font-family: var(--font-heading); ${headlineStyle}">${escapeHtml(headline)}</h1>` : ''}
            ${subheadline ? `<p data-field="subheadline" style="font-size: var(--text-xl); margin: 0; color: rgba(255,255,255,0.9); font-family: var(--font-body); ${subheadlineStyle}">${escapeHtml(subheadline)}</p>` : ''}
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--spacing-md); text-align: ${textAlign}; align-items: ${itemsAlign};">
            ${paragraph ? `<div data-field="paragraph" style="font-size: var(--text-base); margin: 0; color: rgba(255,255,255,0.9); max-width: 600px; font-family: var(--font-body); ${paragraphStyle}">${paragraph}</div>` : ''}
            <div style="display: flex; gap: var(--spacing-md);">
              ${primaryCTA?.label ? `<a href="${escapeHtml(primaryCTA.url || '#')}" data-field="primaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: var(--color-primary); color: var(--color-primary-fg); font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${primaryCTAStyle}">${escapeHtml(primaryCTA.label)}</a>` : ''}
              ${secondaryCTA?.label ? `<a href="${escapeHtml(secondaryCTA.url || '#')}" data-field="secondaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: var(--color-secondary); color: var(--color-secondary-fg); font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${secondaryCTAStyle}">${escapeHtml(secondaryCTA.label)}</a>` : ''}
            </div>
          </div>
        </div>
      </div>
    </section>`
  }

  if (variant === 'presentation') {
    const layout = (styles as Record<string, unknown>)?.heroPresentationLayout ?? 'inline'

    if (layout === 'inline') {
      return `
      <section data-section-id="${id}" style="${sectionWrapperStyle}">
        <div style="max-width: 1200px; margin-left: auto; margin-right: auto; width: 100%; display: flex; flex-direction: row; align-items: flex-start; gap: ${spaceBetween}px;">
          <!-- Profile Image -->
          <div style="flex-shrink: 0;">
            ${media?.src && media.type === 'image' ? `<img src="${escapeHtml(media.src)}" alt="${escapeHtml(media.alt || '')}" style="width: 128px; height: 128px; border-radius: 50%; object-fit: cover;" />` : '<div style="width: 128px; height: 128px; border-radius: 50%; background-color: var(--color-secondary); display: flex; align-items: center; justify-content: center;"><span style="color: var(--color-muted); font-size: 12px;">Photo</span></div>'}
          </div>
          <!-- Content -->
          <div style="display: flex; flex-direction: column; gap: var(--spacing-md); flex: 1;">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--spacing-md);">
              ${headline ? `<h1 data-field="headline" style="font-size: var(--text-4xl); font-weight: bold; line-height: 1.2; margin: 0; font-family: var(--font-heading); ${headlineStyle}">${escapeHtml(headline)}</h1>` : ''}
              <div style="display: flex; gap: var(--spacing-sm);">
                ${primaryCTA?.label ? `<a href="${escapeHtml(primaryCTA.url || '#')}" data-field="primaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: var(--color-primary); color: var(--color-primary-fg); font-size: var(--text-sm); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${primaryCTAStyle}">${escapeHtml(primaryCTA.label)}</a>` : ''}
                ${secondaryCTA?.label ? `<a href="${escapeHtml(secondaryCTA.url || '#')}" data-field="secondaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: var(--color-secondary); color: var(--color-secondary-fg); font-size: var(--text-sm); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${secondaryCTAStyle}">${escapeHtml(secondaryCTA.label)}</a>` : ''}
              </div>
            </div>
            ${subheadline ? `<p data-field="subheadline" style="font-size: var(--text-lg); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${subheadlineStyle}">${escapeHtml(subheadline)}</p>` : ''}
            ${paragraph ? `<div data-field="paragraph" style="font-size: var(--text-base); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${paragraphStyle}">${paragraph}</div>` : ''}
          </div>
        </div>
      </section>`
    } else {
      // Stacked layout
      return `
      <section data-section-id="${id}" style="${sectionWrapperStyle}">
        <div style="max-width: 800px; margin-left: auto; margin-right: auto; width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center; gap: ${spaceBetween}px;">
          ${media?.src && media.type === 'image' ? `<img src="${escapeHtml(media.src)}" alt="${escapeHtml(media.alt || '')}" style="width: 128px; height: 128px; border-radius: 50%; object-fit: cover;" />` : '<div style="width: 128px; height: 128px; border-radius: 50%; background-color: var(--color-secondary); display: flex; align-items: center; justify-content: center;"><span style="color: var(--color-muted); font-size: 12px;">Photo</span></div>'}
          <div style="display: flex; flex-direction: column; gap: var(--spacing-md); align-items: center;">
            ${headline ? `<h1 data-field="headline" style="font-size: var(--text-4xl); font-weight: bold; line-height: 1.2; margin: 0; font-family: var(--font-heading); ${headlineStyle}">${escapeHtml(headline)}</h1>` : ''}
            ${subheadline ? `<p data-field="subheadline" style="font-size: var(--text-lg); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${subheadlineStyle}">${escapeHtml(subheadline)}</p>` : ''}
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--spacing-md); align-items: center;">
            ${paragraph ? `<div data-field="paragraph" style="font-size: var(--text-base); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${paragraphStyle}">${paragraph}</div>` : ''}
            <div style="display: flex; gap: var(--spacing-sm);">
              ${primaryCTA?.label ? `<a href="${escapeHtml(primaryCTA.url || '#')}" data-field="primaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: var(--color-primary); color: var(--color-primary-fg); font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${primaryCTAStyle}">${escapeHtml(primaryCTA.label)}</a>` : ''}
              ${secondaryCTA?.label ? `<a href="${escapeHtml(secondaryCTA.url || '#')}" data-field="secondaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: var(--color-secondary); color: var(--color-secondary-fg); font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${secondaryCTAStyle}">${escapeHtml(secondaryCTA.label)}</a>` : ''}
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

  // Field styles for header block
  const headlineFieldStyle = buildFieldStyle(fieldStyles, 'headline')
  const subheadlineFieldStyle = buildFieldStyle(fieldStyles, 'subheadline')
  const paragraphFieldStyle = buildFieldStyle(fieldStyles, 'paragraph')

  // Shared card styles
  const sharedContainerStyle = resolveSharedCardContainerStyles(styles as Record<string, unknown>)
  const sharedInnerGap = resolveSharedCardInnerGap(styles as Record<string, unknown>)
  const sharedMediaStyle = resolveSharedCardMediaStyles(styles as Record<string, unknown>)
  const sharedHeadlineStyle = resolveSharedCardTextStyles(styles as Record<string, unknown>, 'Headline')
  const sharedSubheadlineStyle = resolveSharedCardTextStyles(styles as Record<string, unknown>, 'Subheadline')
  const sharedParagraphStyle = resolveSharedCardTextStyles(styles as Record<string, unknown>, 'Paragraph')
  const sharedButtonStyle = resolveSharedCardButtonStyles(styles as Record<string, unknown>)

  // Section header block (matching SectionHeaderBlock.vue)
  const hasHeaderContent = headline || subheadline || paragraph
  const sectionHeaderHTML = hasHeaderContent ? `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
      ${headline ? `<h2 data-field="headline" style="font-size: var(--text-3xl); font-weight: bold; line-height: 1.2; margin: 0; font-family: var(--font-heading); ${headlineFieldStyle}">${escapeHtml(headline)}</h2>` : ''}
      ${subheadline ? `<h3 data-field="subheadline" style="font-size: var(--text-lg); color: var(--color-muted); margin: 0; font-family: var(--font-heading); ${subheadlineFieldStyle}">${escapeHtml(subheadline)}</h3>` : ''}
      ${paragraph ? `<div data-field="paragraph" style="font-size: var(--text-base); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${paragraphFieldStyle}">${paragraph}</div>` : ''}
    </div>
  ` : ''

  // Generate card HTML (used by all variants)
  function generateCardHTML(item: typeof items[0], index: number, additionalContainerStyle = ''): string {
    const mediaAspectRatio = getCardMediaAspectRatio((styles as Record<string, unknown>)?.cardMediaAspect as string)

    const mediaHTML = item.media?.src ? `
      <div style="width: 100%; overflow: hidden; ${sharedMediaStyle}">
        ${item.media.type === 'video'
          ? `<video src="${escapeHtml(item.media.src)}" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: ${mediaAspectRatio};" autoplay muted loop playsinline></video>`
          : `<img src="${escapeHtml(item.media.src)}" alt="${escapeHtml(item.media.alt || '')}" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: ${mediaAspectRatio};" loading="lazy" />`
        }
      </div>
    ` : ''

    const contentHTML = `
      <div style="padding: var(--spacing-md); display: flex; flex-direction: column; gap: ${sharedInnerGap};">
        ${item.headline ? `<h3 style="font-size: var(--text-xl); font-weight: 600; margin: 0; font-family: var(--font-heading); ${sharedHeadlineStyle}">${escapeHtml(item.headline)}</h3>` : ''}
        ${item.subheadline ? `<p style="font-size: var(--text-sm); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${sharedSubheadlineStyle}">${escapeHtml(item.subheadline)}</p>` : ''}
        ${item.paragraph ? `<div style="font-size: var(--text-base); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${sharedParagraphStyle}">${item.paragraph}</div>` : ''}
        ${item.buttonLabel && item.buttonUrl ? `<a href="${escapeHtml(item.buttonUrl)}" target="_blank" rel="noopener noreferrer" style="margin-top: var(--spacing-sm); display: inline-flex; align-items: center; justify-content: center; font-weight: 500; text-decoration: none; ${sharedButtonStyle}">${escapeHtml(item.buttonLabel)}</a>` : ''}
      </div>
    `

    return `${mediaHTML}${contentHTML}`
  }

  // Section wrapper style
  const sectionWrapperStyle = `background-color: var(--color-bg); color: var(--color-fg); padding: var(--spacing-section) var(--spacing-container); ${sectionStyle}`

  // Variant-specific layouts
  if (variant === 'grid') {
    const cardsHTML = items.map((item, index) => `
      <div key="${item.id || index}" data-field="items" data-index="${index}" style="display: flex; flex-direction: column; background-color: var(--color-surface); border-radius: var(--radius-lg); overflow: hidden; ${sharedContainerStyle}">
        ${generateCardHTML(item, index)}
      </div>
    `).join('')

    return `
    <section data-section-id="${id}" style="${sectionWrapperStyle}">
      <div style="display: flex; flex-direction: column; width: 100%; max-width: 1200px; margin-left: auto; margin-right: auto; gap: ${sectionSpaceBetween}px;">
        ${sectionHeaderHTML}
        <div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: ${itemsSpaceBetween}px;">
          ${cardsHTML}
        </div>
      </div>
    </section>`
  }

  if (variant === 'row') {
    const cardsHTML = items.map((item, index) => {
      const isMediaLeft = index % 2 === 0

      const mediaHTML = item.media?.src ? `
        <div style="${isMediaLeft ? '' : 'order: 2;'}">
          <div style="width: 100%; overflow: hidden; border-radius: var(--radius-lg); ${sharedMediaStyle}">
            ${item.media.type === 'video'
              ? `<video src="${escapeHtml(item.media.src)}" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: ${getCardMediaAspectRatio((styles as Record<string, unknown>)?.cardMediaAspect as string)};" autoplay muted loop playsinline></video>`
              : `<img src="${escapeHtml(item.media.src)}" alt="${escapeHtml(item.media.alt || '')}" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: ${getCardMediaAspectRatio((styles as Record<string, unknown>)?.cardMediaAspect as string)};" loading="lazy" />`
            }
          </div>
        </div>
      ` : `<div style="${isMediaLeft ? '' : 'order: 2;'}"><div style="width: 100%; aspect-ratio: 4/3; border-radius: var(--radius-lg); background-color: var(--color-surface); display: flex; align-items: center; justify-content: center;"><span style="color: var(--color-muted);">Add media</span></div></div>`

      const contentHTML = `
        <div style="display: flex; flex-direction: column; gap: ${sharedInnerGap}; ${isMediaLeft ? '' : 'order: 1;'}">
          ${item.headline ? `<h3 style="font-size: var(--text-3xl); font-weight: bold; line-height: 1.2; margin: 0; font-family: var(--font-heading); ${sharedHeadlineStyle}">${escapeHtml(item.headline)}</h3>` : ''}
          ${item.subheadline ? `<p style="font-size: var(--text-lg); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${sharedSubheadlineStyle}">${escapeHtml(item.subheadline)}</p>` : ''}
          ${item.paragraph ? `<div style="font-size: var(--text-base); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${sharedParagraphStyle}">${item.paragraph}</div>` : ''}
          ${item.buttonLabel && item.buttonUrl ? `<a href="${escapeHtml(item.buttonUrl)}" target="_blank" rel="noopener noreferrer" style="margin-top: var(--spacing-sm); display: inline-flex; align-items: center; justify-content: center; font-weight: 500; text-decoration: none; ${sharedButtonStyle}">${escapeHtml(item.buttonLabel)}</a>` : ''}
        </div>
      `

      return `
        <div key="${item.id || index}" data-field="items" data-index="${index}" style="display: grid; grid-template-columns: repeat(2, 1fr); align-items: center; gap: var(--spacing-xl); ${sharedContainerStyle}">
          ${mediaHTML}
          ${contentHTML}
        </div>
      `
    }).join('')

    return `
    <section data-section-id="${id}" style="${sectionWrapperStyle}">
      <div style="display: flex; flex-direction: column; width: 100%; max-width: 1200px; margin-left: auto; margin-right: auto; gap: ${sectionSpaceBetween}px;">
        ${sectionHeaderHTML}
        <div style="display: flex; flex-direction: column; width: 100%; gap: ${itemsSpaceBetween}px;">
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

    const cardsHTML = items.map((item, index) => `
      <div key="${item.id || index}" data-field="items" data-index="${index}" style="flex-shrink: 0; display: flex; flex-direction: column; background-color: var(--color-surface); border-radius: var(--radius-lg); overflow: hidden; width: ${cardWidth}; ${sharedContainerStyle}">
        ${generateCardHTML(item, index)}
      </div>
    `).join('')

    return `
    <section data-section-id="${id}" style="${sectionWrapperStyle}">
      <div style="display: flex; flex-direction: column; width: 100%; max-width: 1200px; margin-left: auto; margin-right: auto; gap: ${sectionSpaceBetween}px;">
        ${sectionHeaderHTML}
        <div style="position: relative; width: 100%;">
          <div style="display: flex; overflow-x: auto; padding-bottom: var(--spacing-md); gap: ${itemsSpaceBetween}px;">
            ${cardsHTML}
          </div>
        </div>
      </div>
    </section>`
  }

  if (variant === 'split') {
    const cardsHTML = items.map((item, index) => `
      <div key="${item.id || index}" data-field="items" data-index="${index}" style="flex: 1; display: flex; flex-direction: column; background-color: var(--color-surface); border-radius: var(--radius-lg); overflow: hidden; ${sharedContainerStyle}">
        ${generateCardHTML(item, index)}
      </div>
    `).join('')

    return `
    <section data-section-id="${id}" style="${sectionWrapperStyle}">
      <div style="max-width: 1200px; margin-left: auto; margin-right: auto; width: 100%; display: flex; flex-direction: row; align-items: flex-start; gap: ${sectionSpaceBetween}px;">
        ${hasHeaderContent ? `<div style="width: 33.333%; flex-shrink: 0;">${sectionHeaderHTML}</div>` : ''}
        <div style="display: flex; flex-direction: column; flex: 1; ${hasHeaderContent ? 'width: 66.667%;' : 'width: 100%;'} gap: ${itemsSpaceBetween}px;">
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

  // Height class (1=auto, 2=50vh, 3=100vh)
  const minHeight = ctaHeight === 3 ? '100vh' : ctaHeight === 2 ? '50vh' : 'auto'

  // Field styles
  const headlineFieldStyle = buildFieldStyle(fieldStyles, 'headline')
  const paragraphFieldStyle = buildFieldStyle(fieldStyles, 'paragraph')
  const primaryCTAFieldStyle = buildFieldStyle(fieldStyles, 'primaryCTA')
  const secondaryCTAFieldStyle = buildFieldStyle(fieldStyles, 'secondaryCTA')

  // Section wrapper style
  const sectionWrapperStyle = `background-color: var(--color-bg); color: var(--color-fg); padding: var(--spacing-section) var(--spacing-container); min-height: ${minHeight}; ${sectionStyle}`

  // Buttons HTML (used by all layouts)
  const primaryButtonHTML = primaryCTA?.label ? `
    <a href="${escapeHtml(primaryCTA.url || '#')}" data-field="primaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: var(--color-primary); color: var(--color-primary-fg); font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${primaryCTAFieldStyle}">${escapeHtml(primaryCTA.label)}</a>
  ` : ''

  const secondaryButtonHTML = secondaryCTA?.label ? `
    <a href="${escapeHtml(secondaryCTA.url || '#')}" data-field="secondaryCTA" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: var(--color-secondary); color: var(--color-secondary-fg); font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${secondaryCTAFieldStyle}">${escapeHtml(secondaryCTA.label)}</a>
  ` : ''

  if (variant === 'stacked') {
    if (ctaLayout === 'option1') {
      // Option 1: Centered
      return `
      <section data-section-id="${id}" style="${sectionWrapperStyle}">
        <div style="max-width: 800px; margin-left: auto; margin-right: auto; width: 100%; text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--spacing-md); ${ctaHeight !== 1 ? 'justify-content: center; height: 100%;' : ''}">
          <h2 data-field="headline" style="font-size: var(--text-3xl); font-weight: bold; line-height: 1.2; margin: 0; font-family: var(--font-heading); ${headlineFieldStyle}">${escapeHtml(headline)}</h2>
          ${paragraph ? `<div data-field="paragraph" style="font-size: var(--text-base); color: var(--color-muted); margin: 0; font-family: var(--font-body); max-width: 600px; ${paragraphFieldStyle}">${paragraph}</div>` : ''}
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; margin-top: var(--spacing-sm); gap: ${ctaWrapGap}px;">
            ${primaryButtonHTML}
            ${secondaryButtonHTML}
          </div>
        </div>
      </section>`
    }

    if (ctaLayout === 'option2') {
      // Option 2: Left-aligned
      return `
      <section data-section-id="${id}" style="${sectionWrapperStyle}">
        <div style="max-width: 800px; margin-left: auto; margin-right: auto; width: 100%; display: flex; flex-direction: column; gap: var(--spacing-md); ${ctaHeight !== 1 ? 'justify-content: center; height: 100%;' : ''}">
          <h2 data-field="headline" style="font-size: var(--text-3xl); font-weight: bold; line-height: 1.2; margin: 0; font-family: var(--font-heading); ${headlineFieldStyle}">${escapeHtml(headline)}</h2>
          ${paragraph ? `<div data-field="paragraph" style="font-size: var(--text-base); color: var(--color-muted); margin: 0; font-family: var(--font-body); max-width: 600px; ${paragraphFieldStyle}">${paragraph}</div>` : ''}
          <div style="display: flex; flex-wrap: wrap; align-items: center; margin-top: var(--spacing-sm); gap: ${ctaWrapGap}px;">
            ${primaryButtonHTML}
            ${secondaryButtonHTML}
          </div>
        </div>
      </section>`
    }

    // Option 3: Headline with inline buttons
    return `
    <section data-section-id="${id}" style="${sectionWrapperStyle}">
      <div style="max-width: 1200px; margin-left: auto; margin-right: auto; width: 100%; display: flex; flex-direction: column; gap: var(--spacing-md); ${ctaHeight !== 1 ? 'justify-content: center; height: 100%;' : ''}">
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: ${ctaWrapGap}px;">
          <h2 data-field="headline" style="font-size: var(--text-3xl); font-weight: bold; line-height: 1.2; margin: 0; font-family: var(--font-heading); ${headlineFieldStyle}">${escapeHtml(headline)}</h2>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: ${ctaWrapGap}px;">
            ${primaryButtonHTML}
            ${secondaryButtonHTML}
          </div>
        </div>
        ${paragraph ? `<div data-field="paragraph" style="font-size: var(--text-base); color: var(--color-muted); margin: 0; font-family: var(--font-body); max-width: 600px; ${paragraphFieldStyle}">${paragraph}</div>` : ''}
      </div>
    </section>`
  }

  if (variant === 'split') {
    const isButtonsFirst = splitLayout === 'buttons-content'
    const contentOrder = isButtonsFirst ? 2 : 1
    const buttonsOrder = isButtonsFirst ? 1 : 2
    const buttonsJustify = isButtonsFirst ? 'flex-start' : 'flex-end'

    return `
    <section data-section-id="${id}" style="${sectionWrapperStyle}">
      <div style="max-width: 1200px; margin-left: auto; margin-right: auto; width: 100%; display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-xl); align-items: center; ${ctaHeight !== 1 ? 'height: 100%;' : ''}">
        <!-- Content Column -->
        <div style="display: flex; flex-direction: column; gap: var(--spacing-md); order: ${contentOrder};">
          <h2 data-field="headline" style="font-size: var(--text-3xl); font-weight: bold; line-height: 1.2; margin: 0; font-family: var(--font-heading); ${headlineFieldStyle}">${escapeHtml(headline)}</h2>
          ${paragraph ? `<div data-field="paragraph" style="font-size: var(--text-base); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${paragraphFieldStyle}">${paragraph}</div>` : ''}
        </div>
        <!-- Buttons Column -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: ${buttonsJustify}; order: ${buttonsOrder}; gap: ${ctaWrapGap}px;">
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
  const { id, data, fieldStyles, itemStyles } = section

  // Match exact schema field names
  const headline = data.headline as string || ''
  const paragraph = data.paragraph as string || ''
  const items = data.items as Array<{
    image?: { src?: string; alt?: string }
    label?: string
    url?: string
    description?: string
  }> || []

  const headlineStyle = buildFieldStyle(fieldStyles, 'headline')
  const paragraphStyle = buildFieldStyle(fieldStyles, 'paragraph')

  // Item styles
  const itemStyle: string[] = []
  if (itemStyles?.backgroundColor) itemStyle.push(`background-color: ${itemStyles.backgroundColor}`)
  if (itemStyles?.borderRadius) itemStyle.push(`border-radius: ${itemStyles.borderRadius}px`)
  if (itemStyles?.spacingX) itemStyle.push(`padding-left: ${itemStyles.spacingX}px; padding-right: ${itemStyles.spacingX}px`)
  if (itemStyles?.spacingY) itemStyle.push(`padding-top: ${itemStyles.spacingY}px; padding-bottom: ${itemStyles.spacingY}px`)
  const itemStyleStr = itemStyle.join('; ')

  const linksHTML = items.map((link, index) => `
    <a class="ld-link-item" href="${escapeHtml(link.url || '#')}" data-field="items" data-index="${index}" style="${itemStyleStr}">
      ${link.image?.src ? `<img class="ld-link-item__image" src="${escapeHtml(link.image.src)}" alt="${escapeHtml(link.image.alt || '')}" loading="lazy" />` : ''}
      <span class="ld-link-item__label" data-item-field="label">${escapeHtml(link.label || '')}</span>
      ${link.description ? `<span class="ld-link-item__desc" data-item-field="description">${escapeHtml(link.description)}</span>` : ''}
    </a>
  `).join('')

  return `
  <section class="ld-links" data-section-id="${id}" style="${sectionStyle}">
    <div class="ld-links__header">
      ${headline ? `<h2 class="ld-links__headline" data-field="headline" style="${headlineStyle}">${escapeHtml(headline)}</h2>` : ''}
      ${paragraph ? `<p class="ld-links__paragraph" data-field="paragraph" style="${paragraphStyle}">${escapeHtml(paragraph)}</p>` : ''}
    </div>
    <div class="ld-links__list">
      ${linksHTML}
    </div>
  </section>`
}

// ============================================
// ACCORDION SECTION
// ============================================

function generateAccordionHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, data, fieldStyles, itemStyles } = section

  // Match exact schema field names
  const headline = data.headline as string || ''
  const paragraph = data.paragraph as string || ''
  const items = data.items as Array<{ headline?: string; content?: string }> || []

  const headlineStyle = buildFieldStyle(fieldStyles, 'headline')
  const paragraphStyle = buildFieldStyle(fieldStyles, 'paragraph')

  const itemsHTML = items.map((item, index) => `
    <details class="ld-accordion-item" data-field="items" data-index="${index}">
      <summary class="ld-accordion-item__headline" data-item-field="headline">${escapeHtml(item.headline || '')}</summary>
      <div class="ld-accordion-item__content" data-item-field="content">${escapeHtml(item.content || '')}</div>
    </details>
  `).join('')

  return `
  <section class="ld-accordion" data-section-id="${id}" style="${sectionStyle}">
    <div class="ld-accordion__header">
      ${headline ? `<h2 class="ld-accordion__headline" data-field="headline" style="${headlineStyle}">${escapeHtml(headline)}</h2>` : ''}
      ${paragraph ? `<p class="ld-accordion__paragraph" data-field="paragraph" style="${paragraphStyle}">${escapeHtml(paragraph)}</p>` : ''}
    </div>
    <div class="ld-accordion__list">
      ${itemsHTML}
    </div>
  </section>`
}

// ============================================
// HEADER SECTION
// ============================================

function generateHeaderHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, data, fieldStyles } = section

  // Match exact schema field names
  const logo = data.logo as { src?: string; alt?: string } | undefined
  const title = data.title as string || ''
  const link = data.link as { label?: string; url?: string } | undefined

  return `
  <header class="ld-header" data-section-id="${id}" style="${sectionStyle}">
    <div class="ld-header__brand">
      ${logo?.src ? `<img class="ld-header__logo" src="${escapeHtml(logo.src)}" alt="${escapeHtml(logo.alt || title)}" data-field="logo" />` : ''}
      ${title ? `<span class="ld-header__title" data-field="title">${escapeHtml(title)}</span>` : ''}
    </div>
    <nav class="ld-header__nav">
      ${link?.label ? `<a class="ld-header__link" href="${escapeHtml(link.url || '#')}" data-field="link">${escapeHtml(link.label)}</a>` : ''}
    </nav>
  </header>`
}

// ============================================
// FOOTER SECTION
// ============================================

function generateFooterHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, data, fieldStyles } = section

  // Match exact schema field names
  const logo = data.logo as string || ''
  const title = data.title as string || ''
  const paragraph = data.paragraph as string || ''
  const secondaryText = data.secondaryText as string || ''

  const titleStyle = buildFieldStyle(fieldStyles, 'title')
  const paragraphStyle = buildFieldStyle(fieldStyles, 'paragraph')
  const secondaryTextStyle = buildFieldStyle(fieldStyles, 'secondaryText')

  return `
  <footer class="ld-footer" data-section-id="${id}" style="${sectionStyle}">
    <div class="ld-footer__content">
      ${logo ? `<img class="ld-footer__logo" src="${escapeHtml(logo)}" alt="${escapeHtml(title)}" data-field="logo" />` : ''}
      ${title ? `<p class="ld-footer__title" data-field="title" style="${titleStyle}">${escapeHtml(title)}</p>` : ''}
      ${paragraph ? `<p class="ld-footer__paragraph" data-field="paragraph" style="${paragraphStyle}">${escapeHtml(paragraph)}</p>` : ''}
      ${secondaryText ? `<p class="ld-footer__secondary" data-field="secondaryText" style="${secondaryTextStyle}">${escapeHtml(secondaryText)}</p>` : ''}
    </div>
  </footer>`
}

// ============================================
// GALLERY SECTION
// ============================================

function generateGalleryHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, data, fieldStyles, itemStyles } = section
  const headline = data.headline as string || ''
  const subheadline = data.subheadline as string || ''
  const paragraph = data.paragraph as string || ''
  const items = data.items as Array<{
    media?: { type?: 'image' | 'video'; src?: string; alt?: string }
    link?: { url?: string }
  }> || []

  const headlineStyle = buildFieldStyle(fieldStyles, 'headline')
  const subheadlineStyle = buildFieldStyle(fieldStyles, 'subheadline')
  const paragraphStyle = buildFieldStyle(fieldStyles, 'paragraph')

  // Item styles
  const itemStyle: string[] = []
  if (itemStyles?.borderRadius) itemStyle.push(`border-radius: ${itemStyles.borderRadius}px`)
  const itemStyleStr = itemStyle.join('; ')

  const itemsHTML = items.map((item, index) => {
    const mediaSrc = item.media?.src || ''
    const mediaAlt = item.media?.alt || ''
    const mediaType = item.media?.type || 'image'

    const content = `
      <div class="ld-gallery__item" data-field="items" data-index="${index}" style="${itemStyleStr}">
        ${mediaType === 'image'
          ? `<img class="ld-gallery__image" src="${escapeHtml(mediaSrc)}" alt="${escapeHtml(mediaAlt)}" loading="lazy" />`
          : `<video class="ld-gallery__video" src="${escapeHtml(mediaSrc)}" controls></video>`
        }
      </div>
    `
    return item.link?.url
      ? `<a href="${escapeHtml(item.link.url)}" target="_blank" rel="noopener">${content}</a>`
      : content
  }).join('')

  return `
  <section class="ld-gallery" data-section-id="${id}" style="${sectionStyle}">
    <div class="ld-gallery__header">
      ${headline ? `<h2 class="ld-gallery__headline" data-field="headline" style="${headlineStyle}">${escapeHtml(headline)}</h2>` : ''}
      ${subheadline ? `<p class="ld-gallery__subheadline" data-field="subheadline" style="${subheadlineStyle}">${escapeHtml(subheadline)}</p>` : ''}
      ${paragraph ? `<p class="ld-gallery__paragraph" data-field="paragraph" style="${paragraphStyle}">${escapeHtml(paragraph)}</p>` : ''}
    </div>
    <div class="ld-gallery__grid">
      ${itemsHTML}
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

  const headlineFieldStyle = buildFieldStyle(fieldStyles, 'headline')
  const subheadlineFieldStyle = buildFieldStyle(fieldStyles, 'subheadline')
  const paragraphFieldStyle = buildFieldStyle(fieldStyles, 'paragraph')

  const sharedContainerStyle = resolveSharedProductContainerStyles(styles as Record<string, unknown>)
  const sharedInnerGap = resolveSharedProductInnerGap(styles as Record<string, unknown>)
  const sharedMediaStyle = resolveSharedProductMediaStyles(styles as Record<string, unknown>)
  const sharedNameStyle = resolveSharedProductTextStyles(styles as Record<string, unknown>, 'Name')
  const sharedDescriptionStyle = resolveSharedProductTextStyles(styles as Record<string, unknown>, 'Description')
  const sharedPriceStyle = resolveSharedProductTextStyles(styles as Record<string, unknown>, 'Price')
  const sharedButtonStyle = resolveSharedProductButtonStyles(styles as Record<string, unknown>)

  const hasHeaderContent = headline || subheadline || paragraph
  const sectionHeaderHTML = hasHeaderContent ? `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
      ${headline ? `<h2 data-field="headline" style="font-size: var(--text-3xl); font-weight: bold; line-height: 1.2; margin: 0; font-family: var(--font-heading); ${headlineFieldStyle}">${escapeHtml(headline)}</h2>` : ''}
      ${subheadline ? `<h3 data-field="subheadline" style="font-size: var(--text-lg); color: var(--color-muted); margin: 0; font-family: var(--font-heading); ${subheadlineFieldStyle}">${escapeHtml(subheadline)}</h3>` : ''}
      ${paragraph ? `<div data-field="paragraph" style="font-size: var(--text-base); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${paragraphFieldStyle}">${paragraph}</div>` : ''}
    </div>
  ` : ''

  function generateProductHTML(item: typeof items[0], index: number): string {
    const mediaAspectRatio = getCardMediaAspectRatio((styles as Record<string, unknown>)?.productMediaAspect as string)

    const mediaHTML = item.image?.src ? `
      <div style="width: 100%; overflow: hidden; ${sharedMediaStyle}">
        <img src="${escapeHtml(item.image.src)}" alt="${escapeHtml(item.image.alt || '')}" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: ${mediaAspectRatio};" loading="lazy" />
      </div>
    ` : ''

    const contentHTML = `
      <div style="padding: var(--spacing-md); display: flex; flex-direction: column; gap: ${sharedInnerGap};">
        ${item.name ? `<h3 style="font-size: var(--text-xl); font-weight: 600; margin: 0; font-family: var(--font-heading); ${sharedNameStyle}">${escapeHtml(item.name)}</h3>` : ''}
        ${item.description ? `<div style="font-size: var(--text-base); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${sharedDescriptionStyle}">${item.description}</div>` : ''}
        ${item.price ? `<p style="font-size: var(--text-lg); font-weight: 600; margin: 0; font-family: var(--font-body); ${sharedPriceStyle}">${escapeHtml(item.price)}</p>` : ''}
        ${item.ctaLabel && item.ctaUrl ? `<a href="${escapeHtml(item.ctaUrl)}" target="_blank" rel="noopener noreferrer" style="margin-top: var(--spacing-sm); display: inline-flex; align-items: center; justify-content: center; font-weight: 500; text-decoration: none; ${sharedButtonStyle}">${escapeHtml(item.ctaLabel)}</a>` : ''}
      </div>
    `

    return `${mediaHTML}${contentHTML}`
  }

  const sectionWrapperStyle = `background-color: var(--color-bg); color: var(--color-fg); padding: var(--spacing-section) var(--spacing-container); ${sectionStyle}`

  if (variant === 'grid') {
    const productsHTML = items.map((item, index) => `
      <div key="${item.id || index}" data-field="items" data-index="${index}" style="display: flex; flex-direction: column; background-color: var(--color-surface); border-radius: var(--radius-lg); overflow: hidden; ${sharedContainerStyle}">
        ${generateProductHTML(item, index)}
      </div>
    `).join('')

    return `
    <section data-section-id="${id}" style="${sectionWrapperStyle}">
      <div style="display: flex; flex-direction: column; width: 100%; max-width: 1200px; margin-left: auto; margin-right: auto; gap: ${sectionSpaceBetween}px;">
        ${sectionHeaderHTML}
        <div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: ${itemsSpaceBetween}px;">
          ${productsHTML}
        </div>
      </div>
    </section>`
  }

  if (variant === 'row') {
    const productsHTML = items.map((item, index) => {
      const isMediaLeft = index % 2 === 0
      const mediaAspectRatio = getCardMediaAspectRatio((styles as Record<string, unknown>)?.productMediaAspect as string)

      const mediaHTML = item.image?.src ? `
        <div style="${isMediaLeft ? '' : 'order: 2;'}">
          <div style="width: 100%; overflow: hidden; border-radius: var(--radius-lg); ${sharedMediaStyle}">
            <img src="${escapeHtml(item.image.src)}" alt="${escapeHtml(item.image.alt || '')}" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: ${mediaAspectRatio};" loading="lazy" />
          </div>
        </div>
      ` : `<div style="${isMediaLeft ? '' : 'order: 2;'}"><div style="width: 100%; aspect-ratio: 4/3; border-radius: var(--radius-lg); background-color: var(--color-surface); display: flex; align-items: center; justify-content: center;"><span style="color: var(--color-muted);">Add image</span></div></div>`

      const contentHTML = `
        <div style="display: flex; flex-direction: column; gap: ${sharedInnerGap}; ${isMediaLeft ? '' : 'order: 1;'}">
          ${item.name ? `<h3 style="font-size: var(--text-3xl); font-weight: bold; line-height: 1.2; margin: 0; font-family: var(--font-heading); ${sharedNameStyle}">${escapeHtml(item.name)}</h3>` : ''}
          ${item.description ? `<div style="font-size: var(--text-base); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${sharedDescriptionStyle}">${item.description}</div>` : ''}
          ${item.price ? `<p style="font-size: var(--text-xl); font-weight: 600; margin: 0; font-family: var(--font-body); ${sharedPriceStyle}">${escapeHtml(item.price)}</p>` : ''}
          ${item.ctaLabel && item.ctaUrl ? `<a href="${escapeHtml(item.ctaUrl)}" target="_blank" rel="noopener noreferrer" style="margin-top: var(--spacing-sm); display: inline-flex; align-items: center; justify-content: center; font-weight: 500; text-decoration: none; ${sharedButtonStyle}">${escapeHtml(item.ctaLabel)}</a>` : ''}
        </div>
      `

      return `
        <div key="${item.id || index}" data-field="items" data-index="${index}" style="display: grid; grid-template-columns: repeat(2, 1fr); align-items: center; gap: var(--spacing-xl); ${sharedContainerStyle}">
          ${mediaHTML}
          ${contentHTML}
        </div>
      `
    }).join('')

    return `
    <section data-section-id="${id}" style="${sectionWrapperStyle}">
      <div style="display: flex; flex-direction: column; width: 100%; max-width: 1200px; margin-left: auto; margin-right: auto; gap: ${sectionSpaceBetween}px;">
        ${sectionHeaderHTML}
        <div style="display: flex; flex-direction: column; width: 100%; gap: ${itemsSpaceBetween}px;">
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

    const productsHTML = items.map((item, index) => `
      <div key="${item.id || index}" data-field="items" data-index="${index}" style="flex-shrink: 0; display: flex; flex-direction: column; background-color: var(--color-surface); border-radius: var(--radius-lg); overflow: hidden; width: ${productWidth}; ${sharedContainerStyle}">
        ${generateProductHTML(item, index)}
      </div>
    `).join('')

    return `
    <section data-section-id="${id}" style="${sectionWrapperStyle}">
      <div style="display: flex; flex-direction: column; width: 100%; max-width: 1200px; margin-left: auto; margin-right: auto; gap: ${sectionSpaceBetween}px;">
        ${sectionHeaderHTML}
        <div style="position: relative; width: 100%;">
          <div style="display: flex; overflow-x: auto; padding-bottom: var(--spacing-md); gap: ${itemsSpaceBetween}px;">
            ${productsHTML}
          </div>
        </div>
      </div>
    </section>`
  }

  if (variant === 'split') {
    const productsHTML = items.map((item, index) => `
      <div key="${item.id || index}" data-field="items" data-index="${index}" style="flex: 1; display: flex; flex-direction: column; background-color: var(--color-surface); border-radius: var(--radius-lg); overflow: hidden; ${sharedContainerStyle}">
        ${generateProductHTML(item, index)}
      </div>
    `).join('')

    return `
    <section data-section-id="${id}" style="${sectionWrapperStyle}">
      <div style="max-width: 1200px; margin-left: auto; margin-right: auto; width: 100%; display: flex; flex-direction: row; align-items: flex-start; gap: ${sectionSpaceBetween}px;">
        ${hasHeaderContent ? `<div style="width: 33.333%; flex-shrink: 0;">${sectionHeaderHTML}</div>` : ''}
        <div style="display: flex; flex-direction: column; flex: 1; ${hasHeaderContent ? 'width: 66.667%;' : 'width: 100%;'} gap: ${itemsSpaceBetween}px;">
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
  const { id, data, fieldStyles, itemStyles } = section
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

  const headlineStyle = buildFieldStyle(fieldStyles, 'headline')
  const paragraphStyle = buildFieldStyle(fieldStyles, 'paragraph')

  const eventsHTML = items.map((item, index) => `
    <details class="ld-event-item" data-field="items" data-index="${index}">
      <summary class="ld-event-item__summary">
        <div class="ld-event-item__header">
          ${item.headline ? `<h3 class="ld-event-item__title" data-item-field="headline">${escapeHtml(item.headline)}</h3>` : ''}
          ${item.datetime ? `<p class="ld-event-item__datetime" data-item-field="datetime">${escapeHtml(item.datetime)}</p>` : ''}
          ${item.location ? `<p class="ld-event-item__location" data-item-field="location">${escapeHtml(item.location)}</p>` : ''}
        </div>
      </summary>
      <div class="ld-event-item__details">
        ${item.image?.src ? `<img class="ld-event-item__image" src="${escapeHtml(item.image.src)}" alt="${escapeHtml(item.image.alt || '')}" loading="lazy" />` : ''}
        ${item.details ? `<p class="ld-event-item__desc" data-item-field="details">${escapeHtml(item.details)}</p>` : ''}
        ${item.price ? `<p class="ld-event-item__price">Price: ${escapeHtml(item.price)}</p>` : ''}
        ${item.button?.label ? `<a class="ld-btn ld-event-item__btn" href="${escapeHtml(item.button.url || '#')}" data-item-field="button">${escapeHtml(item.button.label)}</a>` : ''}
      </div>
    </details>
  `).join('')

  return `
  <section class="ld-events" data-section-id="${id}" style="${sectionStyle}">
    <div class="ld-events__header">
      ${headline ? `<h2 class="ld-events__headline" data-field="headline" style="${headlineStyle}">${escapeHtml(headline)}</h2>` : ''}
      ${paragraph ? `<p class="ld-events__paragraph" data-field="paragraph" style="${paragraphStyle}">${escapeHtml(paragraph)}</p>` : ''}
    </div>
    <div class="ld-events__list">
      ${eventsHTML}
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

  // Field styles
  const headlineFieldStyle = buildFieldStyle(fieldStyles, 'headline')
  const subheadlineFieldStyle = buildFieldStyle(fieldStyles, 'subheadline')
  const submitButtonFieldStyle = buildFieldStyle(fieldStyles, 'submitButton')

  // Shared styles
  const sharedFormInputStyle = resolveSharedFormInputStyles(styles as Record<string, unknown>)
  const sharedLinkContainerStyle = resolveSharedLinkContainerStyles(styles as Record<string, unknown>)
  const sharedLinkLabelStyle = resolveSharedLinkTextStyles(styles as Record<string, unknown>, 'Label')
  const sharedLinkDescriptionStyle = resolveSharedLinkTextStyles(styles as Record<string, unknown>, 'Description')

  // Section wrapper style
  const sectionWrapperStyle = `background-color: var(--color-bg); color: var(--color-fg); padding: var(--spacing-section) var(--spacing-container); ${sectionStyle}`

  // Generate form fields HTML (all types)
  const formFieldsHTML = formFields.map((field, index) => {
    const fieldType = field.type || 'text'

    switch (fieldType) {
      case 'text':
      case 'email':
      case 'phone':
        return `<input type="${fieldType === 'phone' ? 'tel' : fieldType}" placeholder="${escapeHtml(field.label || '')}" style="width: 100%; ${sharedFormInputStyle}" />`

      case 'datetime':
        return `<input type="datetime-local" placeholder="${escapeHtml(field.label || '')}" style="width: 100%; ${sharedFormInputStyle}" />`

      case 'select':
        return `
          <select style="width: 100%; ${sharedFormInputStyle}">
            <option value="" disabled selected>${escapeHtml(field.label || '')}</option>
            ${(field.options || []).map(opt => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('')}
          </select>`

      case 'checkbox':
        return `
          <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
            ${(field.options || []).map(opt => `
              <label style="display: flex; align-items: center; gap: var(--spacing-sm); font-size: var(--text-base);">
                <input type="checkbox" value="${escapeHtml(opt)}" style="width: 16px; height: 16px;" />
                <span>${escapeHtml(opt)}</span>
              </label>
            `).join('')}
          </div>`

      case 'radio':
        return `
          <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
            ${(field.options || []).map(opt => `
              <label style="display: flex; align-items: center; gap: var(--spacing-sm); font-size: var(--text-base);">
                <input type="radio" name="radio-${index}" value="${escapeHtml(opt)}" style="width: 16px; height: 16px;" />
                <span>${escapeHtml(opt)}</span>
              </label>
            `).join('')}
          </div>`

      case 'textarea':
        return `<textarea placeholder="${escapeHtml(field.label || '')}" rows="4" style="width: 100%; resize: vertical; ${sharedFormInputStyle}"></textarea>`

      default:
        return `<input type="text" placeholder="${escapeHtml(field.label || '')}" style="width: 100%; ${sharedFormInputStyle}" />`
    }
  }).join('')

  // Generate social links HTML
  const socialLinksHTML = socialLinks.map((link, index) => `
    <a href="${escapeHtml(link.url || '#')}" data-field="socialLinks" data-index="${index}" style="display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-md); background-color: var(--color-surface); border-radius: var(--radius-md); text-decoration: none; ${sharedLinkContainerStyle}">
      ${link.image?.src ? `<img src="${escapeHtml(link.image.src)}" alt="${escapeHtml(link.image.alt || '')}" style="width: 40px; height: 40px; border-radius: var(--radius-sm); object-fit: cover; flex-shrink: 0;" />` : ''}
      <div style="display: flex; flex-direction: column; gap: var(--spacing-xs); min-width: 0; flex: 1;">
        <span style="font-size: var(--text-base); font-weight: 500; ${sharedLinkLabelStyle}">${escapeHtml(link.label || '')}</span>
        ${link.description ? `<span style="font-size: var(--text-sm); color: var(--color-muted); ${sharedLinkDescriptionStyle}">${escapeHtml(link.description)}</span>` : ''}
      </div>
      <i class="lni lni-arrow-right" style="color: var(--color-muted); flex-shrink: 0; margin-left: var(--spacing-md);"></i>
    </a>
  `).join('')

  if (variant === 'stacked') {
    return `
    <section data-section-id="${id}" style="${sectionWrapperStyle}">
      <div style="max-width: 600px; margin-left: auto; margin-right: auto; width: 100%;">
        <!-- Section Header -->
        ${(headline || subheadline) ? `
          <div style="text-align: center; margin-bottom: var(--spacing-xl);">
            ${headline ? `<h2 data-field="headline" style="font-size: var(--text-3xl); font-weight: bold; line-height: 1.2; margin: 0; margin-bottom: var(--spacing-sm); font-family: var(--font-heading); ${headlineFieldStyle}">${escapeHtml(headline)}</h2>` : ''}
            ${subheadline ? `<p data-field="subheadline" style="font-size: var(--text-lg); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${subheadlineFieldStyle}">${escapeHtml(subheadline)}</p>` : ''}
          </div>
        ` : ''}

        <!-- Paragraphs (Email, Phone, Address) -->
        ${paragraphs.length === 3 ? `
          <div style="display: flex; flex-direction: column; gap: var(--spacing-sm); margin-bottom: var(--spacing-xl); text-align: center;">
            ${paragraphs.map((p, i) => `<p data-field="paragraphs.${i}" style="font-size: var(--text-base); margin: 0; font-family: var(--font-body);">${escapeHtml(p)}</p>`).join('')}
          </div>
        ` : ''}

        <!-- Form -->
        <form style="display: flex; flex-direction: column; margin-bottom: var(--spacing-xl); ${formFieldsSpaceBetween !== undefined ? `gap: ${formFieldsSpaceBetween}px;` : ''}" onsubmit="event.preventDefault();">
          ${formFieldsHTML}
          ${submitButton?.label ? `<a href="${escapeHtml(submitButton.url || '#')}" data-field="submitButton" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: var(--color-primary); color: var(--color-primary-fg); font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${submitButtonFieldStyle}">${escapeHtml(submitButton.label)}</a>` : ''}
        </form>

        <!-- Social Links -->
        ${socialLinks.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: var(--spacing-sm); ${socialLinksSpaceBetween !== undefined ? `gap: ${socialLinksSpaceBetween}px;` : ''}">
            ${socialLinksHTML}
          </div>
        ` : ''}
      </div>
    </section>`
  }

  if (variant === 'split') {
    const isTitleFirst = splitLayout === 'title-content'
    const titleOrder = isTitleFirst ? 1 : 2
    const contentOrder = isTitleFirst ? 2 : 1

    return `
    <section data-section-id="${id}" style="${sectionWrapperStyle}">
      <div style="max-width: 1200px; margin-left: auto; margin-right: auto; width: 100%; display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-2xl); align-items: flex-start;">
        <!-- Form + Social Links Column -->
        <div style="display: flex; flex-direction: column; gap: var(--spacing-xl); order: ${contentOrder};">
          <!-- Form -->
          <form style="display: flex; flex-direction: column; ${formFieldsSpaceBetween !== undefined ? `gap: ${formFieldsSpaceBetween}px;` : ''}" onsubmit="event.preventDefault();">
            ${formFieldsHTML}
            ${submitButton?.label ? `<a href="${escapeHtml(submitButton.url || '#')}" data-field="submitButton" style="display: inline-flex; align-items: center; justify-content: center; padding: var(--btn-py) var(--btn-px); background-color: var(--color-primary); color: var(--color-primary-fg); font-size: var(--text-base); font-weight: var(--btn-weight); border-radius: var(--btn-radius); text-decoration: none; ${submitButtonFieldStyle}">${escapeHtml(submitButton.label)}</a>` : ''}
          </form>

          <!-- Social Links -->
          ${socialLinks.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: var(--spacing-sm); ${socialLinksSpaceBetween !== undefined ? `gap: ${socialLinksSpaceBetween}px;` : ''}">
              ${socialLinksHTML}
            </div>
          ` : ''}
        </div>

        <!-- Title Column -->
        <div style="display: flex; flex-direction: column; gap: var(--spacing-lg); order: ${titleOrder};">
          ${headline ? `<h2 data-field="headline" style="font-size: var(--text-3xl); font-weight: bold; line-height: 1.2; margin: 0; font-family: var(--font-heading); ${headlineFieldStyle}">${escapeHtml(headline)}</h2>` : ''}
          ${subheadline ? `<p data-field="subheadline" style="font-size: var(--text-lg); color: var(--color-muted); margin: 0; font-family: var(--font-body); ${subheadlineFieldStyle}">${escapeHtml(subheadline)}</p>` : ''}

          <!-- Paragraphs (Email, Phone, Address) -->
          ${paragraphs.length === 3 ? `
            <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
              ${paragraphs.map((p, i) => `<p data-field="paragraphs.${i}" style="font-size: var(--text-base); margin: 0; font-family: var(--font-body);">${escapeHtml(p)}</p>`).join('')}
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
  const { id, data, fieldStyles } = section
  const headline = data.headline as string || ''
  const subheadline = data.subheadline as string || ''
  const paragraph = data.paragraph as string || ''
  const emailPlaceholder = data.emailPlaceholder as string || 'Enter your email'
  const submitButton = data.submitButton as { label?: string } | undefined

  const headlineStyle = buildFieldStyle(fieldStyles, 'headline')
  const subheadlineStyle = buildFieldStyle(fieldStyles, 'subheadline')
  const paragraphStyle = buildFieldStyle(fieldStyles, 'paragraph')

  return `
  <section class="ld-subscribe" data-section-id="${id}" style="${sectionStyle}">
    <div class="ld-subscribe__content">
      ${headline ? `<h2 class="ld-subscribe__headline" data-field="headline" style="${headlineStyle}">${escapeHtml(headline)}</h2>` : ''}
      ${subheadline ? `<p class="ld-subscribe__subheadline" data-field="subheadline" style="${subheadlineStyle}">${escapeHtml(subheadline)}</p>` : ''}
      ${paragraph ? `<p class="ld-subscribe__paragraph" data-field="paragraph" style="${paragraphStyle}">${escapeHtml(paragraph)}</p>` : ''}
    </div>
    <form class="ld-subscribe__form">
      <input type="email" placeholder="${escapeHtml(emailPlaceholder)}" required data-field="emailPlaceholder" />
      ${submitButton?.label ? `<button type="submit" class="ld-btn" data-field="submitButton">${escapeHtml(submitButton.label)}</button>` : ''}
    </form>
  </section>`
}

// ============================================
// TEXT SECTION
// ============================================

function generateTextHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, data, fieldStyles } = section
  const headline = data.headline as string || ''
  const paragraph = data.paragraph as string || ''

  const headlineStyle = buildFieldStyle(fieldStyles, 'headline')
  const paragraphStyle = buildFieldStyle(fieldStyles, 'paragraph')

  return `
  <section class="ld-text" data-section-id="${id}" style="${sectionStyle}">
    <div class="ld-text__content">
      ${headline ? `<h2 class="ld-text__headline" data-field="headline" style="${headlineStyle}">${escapeHtml(headline)}</h2>` : ''}
      ${paragraph ? `<p class="ld-text__paragraph" data-field="paragraph" style="${paragraphStyle}">${escapeHtml(paragraph)}</p>` : ''}
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

function generateHTML(project: any, content: PageContent, settings: any, umamiSiteId?: string): string {
  const theme = getTheme(content.themeId)
  const title = settings?.meta_title || project.title || 'Untitled'
  const description = settings?.meta_description || project.description || ''
  const ogImage = settings?.og_image || ''
  const favicon = settings?.favicon || ''
  const keywords = settings?.keywords || ''

  // Generate sections HTML
  const sectionsHTML = content.sections
    .map(section => generateSectionHTML(section, theme))
    .join('\n')

  // Generate CSS
  const css = generateCSS(theme)

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

  // Font preload
  const fonts = new Set([theme.fonts.heading, theme.fonts.body])
  const fontLinks = Array.from(fonts)
    .filter(f => f && !f.includes('system'))
    .map(f => {
      const fontName = f.split(',')[0].replace(/'/g, '').trim()
      return `<link href="https://api.fontshare.com/v2/css?f[]=${encodeURIComponent(fontName.toLowerCase().replace(/\s+/g, '-'))}@400,500,600,700&display=swap" rel="stylesheet">`
    })
    .join('\n  ')

  return `<!DOCTYPE html>
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

  <style>
${css}
  </style>
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
}

// ============================================
// CLOUDFLARE KV STORAGE
// ============================================

interface SiteData {
  html: string
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
        translation: blocksData.translation as TranslationSettings | undefined,
        translations: blocksData.translations as Record<string, Record<string, Record<string, unknown>>> | undefined,
      }

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

      // Generate static HTML
      const html = generateHTML(project, hydratedContent, settings, umamiSiteId)

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
