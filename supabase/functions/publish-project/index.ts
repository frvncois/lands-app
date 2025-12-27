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
      return generateAccordionHTML(section, theme, sectionStyle)
    case 'header':
      return generateHeaderHTML(section, theme, sectionStyle)
    case 'footer':
      return generateFooterHTML(section, theme, sectionStyle)
    default:
      console.warn(`Skipping unknown section type: ${type} (section ${section.id})`)
      return ''
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
  const { id, variant, data, fieldStyles } = section
  const headline = data.headline as string || ''
  const subheadline = data.subheadline as string || ''
  const image = data.image as string || ''
  const button = data.button as { label?: string; url?: string } | undefined

  const headlineStyle = buildFieldStyle(fieldStyles, 'headline')
  const subheadlineStyle = buildFieldStyle(fieldStyles, 'subheadline')
  const buttonStyle = buildFieldStyle(fieldStyles, 'button')

  if (variant === 'full') {
    // Full-width hero with background image
    return `
    <section class="ld-hero ld-hero--full" data-section-id="${id}" style="${sectionStyle}">
      ${image ? `<div class="ld-hero__bg"><img src="${escapeHtml(image)}" alt="" loading="lazy" /></div>` : ''}
      <div class="ld-hero__content">
        <h1 class="ld-hero__headline" data-field="headline" style="${headlineStyle}">${escapeHtml(headline)}</h1>
        ${subheadline ? `<p class="ld-hero__subheadline" data-field="subheadline" style="${subheadlineStyle}">${escapeHtml(subheadline)}</p>` : ''}
        ${button?.label ? `<a class="ld-btn ld-hero__btn" href="${escapeHtml(button.url || '#')}" data-field="button" style="${buttonStyle}">${escapeHtml(button.label)}</a>` : ''}
      </div>
    </section>`
  } else if (variant === 'split') {
    // Split layout with image on side
    return `
    <section class="ld-hero ld-hero--split" data-section-id="${id}" style="${sectionStyle}">
      <div class="ld-hero__content">
        <h1 class="ld-hero__headline" data-field="headline" style="${headlineStyle}">${escapeHtml(headline)}</h1>
        ${subheadline ? `<p class="ld-hero__subheadline" data-field="subheadline" style="${subheadlineStyle}">${escapeHtml(subheadline)}</p>` : ''}
        ${button?.label ? `<a class="ld-btn ld-hero__btn" href="${escapeHtml(button.url || '#')}" data-field="button" style="${buttonStyle}">${escapeHtml(button.label)}</a>` : ''}
      </div>
      ${image ? `<div class="ld-hero__media"><img src="${escapeHtml(image)}" alt="" loading="lazy" /></div>` : ''}
    </section>`
  } else {
    // Centered (default)
    return `
    <section class="ld-hero ld-hero--centered" data-section-id="${id}" style="${sectionStyle}">
      <div class="ld-hero__content">
        <h1 class="ld-hero__headline" data-field="headline" style="${headlineStyle}">${escapeHtml(headline)}</h1>
        ${subheadline ? `<p class="ld-hero__subheadline" data-field="subheadline" style="${subheadlineStyle}">${escapeHtml(subheadline)}</p>` : ''}
        ${button?.label ? `<a class="ld-btn ld-hero__btn" href="${escapeHtml(button.url || '#')}" data-field="button" style="${buttonStyle}">${escapeHtml(button.label)}</a>` : ''}
      </div>
    </section>`
  }
}

// ============================================
// CARDS SECTION
// ============================================

function generateCardsHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, variant, data, fieldStyles, itemStyles } = section
  const headline = data.headline as string || ''
  const paragraph = data.paragraph as string || ''
  const cards = data.cards as Array<{ image?: string; title?: string; description?: string }> || []

  const headlineStyle = buildFieldStyle(fieldStyles, 'headline')
  const paragraphStyle = buildFieldStyle(fieldStyles, 'paragraph')

  // Item styles
  const itemStyle: string[] = []
  if (itemStyles?.fontSize) itemStyle.push(`font-size: ${itemStyles.fontSize}px`)
  if (itemStyles?.backgroundColor) itemStyle.push(`background-color: ${itemStyles.backgroundColor}`)
  if (itemStyles?.borderRadius) itemStyle.push(`border-radius: ${itemStyles.borderRadius}px`)
  if (itemStyles?.spacingX) itemStyle.push(`padding-left: ${itemStyles.spacingX}px; padding-right: ${itemStyles.spacingX}px`)
  if (itemStyles?.spacingY) itemStyle.push(`padding-top: ${itemStyles.spacingY}px; padding-bottom: ${itemStyles.spacingY}px`)
  const itemStyleStr = itemStyle.join('; ')

  const cardsHTML = cards.map((card, index) => `
    <div class="ld-card" data-field="cards" data-index="${index}" style="${itemStyleStr}">
      ${card.image ? `<img class="ld-card__image" src="${escapeHtml(card.image)}" alt="" loading="lazy" />` : ''}
      <h3 class="ld-card__title" data-item-field="title">${escapeHtml(card.title || '')}</h3>
      <p class="ld-card__desc" data-item-field="description">${escapeHtml(card.description || '')}</p>
    </div>
  `).join('')

  const gridClass = variant === 'two-column' ? 'ld-cards__grid--2' : variant === 'four-column' ? 'ld-cards__grid--4' : 'ld-cards__grid--3'

  return `
  <section class="ld-cards" data-section-id="${id}" style="${sectionStyle}">
    <div class="ld-cards__header">
      ${headline ? `<h2 class="ld-cards__headline" data-field="headline" style="${headlineStyle}">${escapeHtml(headline)}</h2>` : ''}
      ${paragraph ? `<p class="ld-cards__paragraph" data-field="paragraph" style="${paragraphStyle}">${escapeHtml(paragraph)}</p>` : ''}
    </div>
    <div class="ld-cards__grid ${gridClass}">
      ${cardsHTML}
    </div>
  </section>`
}

// ============================================
// CTA SECTION
// ============================================

function generateCTAHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, data, fieldStyles } = section
  const headline = data.headline as string || ''
  const paragraph = data.paragraph as string || ''
  const button = data.button as { label?: string; url?: string } | undefined

  const headlineStyle = buildFieldStyle(fieldStyles, 'headline')
  const paragraphStyle = buildFieldStyle(fieldStyles, 'paragraph')
  const buttonStyle = buildFieldStyle(fieldStyles, 'button')

  return `
  <section class="ld-cta" data-section-id="${id}" style="${sectionStyle}">
    <div class="ld-cta__content">
      ${headline ? `<h2 class="ld-cta__headline" data-field="headline" style="${headlineStyle}">${escapeHtml(headline)}</h2>` : ''}
      ${paragraph ? `<p class="ld-cta__paragraph" data-field="paragraph" style="${paragraphStyle}">${escapeHtml(paragraph)}</p>` : ''}
      ${button?.label ? `<a class="ld-btn ld-cta__btn" href="${escapeHtml(button.url || '#')}" data-field="button" style="${buttonStyle}">${escapeHtml(button.label)}</a>` : ''}
    </div>
  </section>`
}

// ============================================
// LINKS SECTION
// ============================================

function generateLinksHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, data, fieldStyles, itemStyles } = section
  const headline = data.headline as string || ''
  const paragraph = data.paragraph as string || ''
  const links = data.links as Array<{ label?: string; url?: string; description?: string }> || []

  const headlineStyle = buildFieldStyle(fieldStyles, 'headline')
  const paragraphStyle = buildFieldStyle(fieldStyles, 'paragraph')

  // Item styles
  const itemStyle: string[] = []
  if (itemStyles?.backgroundColor) itemStyle.push(`background-color: ${itemStyles.backgroundColor}`)
  if (itemStyles?.borderRadius) itemStyle.push(`border-radius: ${itemStyles.borderRadius}px`)
  if (itemStyles?.spacingX) itemStyle.push(`padding-left: ${itemStyles.spacingX}px; padding-right: ${itemStyles.spacingX}px`)
  if (itemStyles?.spacingY) itemStyle.push(`padding-top: ${itemStyles.spacingY}px; padding-bottom: ${itemStyles.spacingY}px`)
  const itemStyleStr = itemStyle.join('; ')

  const linksHTML = links.map((link, index) => `
    <a class="ld-link-item" href="${escapeHtml(link.url || '#')}" data-field="links" data-index="${index}" style="${itemStyleStr}">
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
  const headline = data.headline as string || ''
  const paragraph = data.paragraph as string || ''
  const items = data.items as Array<{ question?: string; answer?: string }> || []

  const headlineStyle = buildFieldStyle(fieldStyles, 'headline')
  const paragraphStyle = buildFieldStyle(fieldStyles, 'paragraph')

  const itemsHTML = items.map((item, index) => `
    <details class="ld-accordion-item" data-field="items" data-index="${index}">
      <summary class="ld-accordion-item__question" data-item-field="question">${escapeHtml(item.question || '')}</summary>
      <div class="ld-accordion-item__answer" data-item-field="answer">${escapeHtml(item.answer || '')}</div>
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
  const logo = data.logo as string || ''
  const title = data.title as string || ''
  const links = data.links as Array<{ label?: string; url?: string }> || []

  return `
  <header class="ld-header" data-section-id="${id}" style="${sectionStyle}">
    <div class="ld-header__brand">
      ${logo ? `<img class="ld-header__logo" src="${escapeHtml(logo)}" alt="${escapeHtml(title)}" />` : ''}
      ${title ? `<span class="ld-header__title" data-field="title">${escapeHtml(title)}</span>` : ''}
    </div>
    <nav class="ld-header__nav">
      ${links.map((link, i) => `<a class="ld-header__link" href="${escapeHtml(link.url || '#')}" data-field="links" data-index="${i}">${escapeHtml(link.label || '')}</a>`).join('')}
    </nav>
  </header>`
}

// ============================================
// FOOTER SECTION
// ============================================

function generateFooterHTML(section: SectionInstance, theme: ThemeTokens, sectionStyle: string): string {
  const { id, data, fieldStyles } = section
  const copyright = data.copyright as string || ''
  const links = data.links as Array<{ label?: string; url?: string }> || []

  return `
  <footer class="ld-footer" data-section-id="${id}" style="${sectionStyle}">
    <nav class="ld-footer__nav">
      ${links.map((link, i) => `<a class="ld-footer__link" href="${escapeHtml(link.url || '#')}" data-field="links" data-index="${i}">${escapeHtml(link.label || '')}</a>`).join('')}
    </nav>
    ${copyright ? `<p class="ld-footer__copyright" data-field="copyright">${escapeHtml(copyright)}</p>` : ''}
  </footer>`
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
      const html = generateHTML(project, content, settings, umamiSiteId)

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
