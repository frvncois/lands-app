import type {
  Land, LandTheme, Section,
  HeaderContent, HeaderSettings,
  ContentMediaContent,
  CollectionContent,
  StoreContent,
  CampaignContent,
  FooterContent, FooterSettings,
  ContentMediaButton,
} from './types.ts'

// ─── Utilities ───

function getTextColorForAccent(theme: LandTheme): string {
  const c = theme.color_accent.replace('#', '')
  const m = c.match(/[0-9a-f]{2}/gi)
  if (!m || m.length < 3) return 'color-mix(in srgb, var(--theme-accent) 15%, white)'
  const r = parseInt(m[0], 16) / 255
  const g = parseInt(m[1], 16) / 255
  const b = parseInt(m[2], 16) / 255
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  return lum > 0.5
    ? 'color-mix(in srgb, var(--theme-accent) 50%, black)'
    : 'color-mix(in srgb, var(--theme-accent) 15%, white)'
}

function esc(s: unknown): string {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sortByPosition<T extends { position: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.position.localeCompare(b.position))
}

function smartColumns(count: number): number {
  if (count <= 0) return 2
  if (count <= 4) return count
  const score = (cols: number) => count % cols === 0 ? cols : count % cols
  return [4, 3, 2].reduce((a, b) => score(a) >= score(b) ? a : b)
}

function extractFontName(stack: string): string | null {
  const m = stack.match(/["']([^"']+)["']/)
  return m ? m[1] : null
}

function buildFontLinks(theme: LandTheme): string {
  const fonts = new Set<string>()
  const t = extractFontName(theme.font_title)
  const b = extractFontName(theme.font_body)
  if (t) fonts.add(t)
  if (b) fonts.add(b)
  if (!fonts.size) return ''
  const families = Array.from(fonts)
    .map(f => `family=${encodeURIComponent(f)}:ital,wght@0,400;0,500;0,600;0,700`)
    .join('&')
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?${families}&display=swap" rel="stylesheet">`
}

function buildBaseStyles(theme: LandTheme): string {
  return `
<style>
  :root {
    --theme-main:    ${theme.color_main};
    --theme-accent:  ${theme.color_accent};
    --theme-surface: ${theme.color_surface};
  }
  body {
    font-family: ${theme.font_body};
    -webkit-font-smoothing: antialiased;
    margin: 0;
    color: ${theme.color_main};
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.font_title};
    margin: 0;
  }
  a { text-decoration: none; }
  * { box-sizing: border-box; }
</style>
<script>
  tailwind.config = {
    theme: {
      extend: {
        lineHeight: { '22': '5.5rem' },
      }
    }
  }
</script>
<script src="https://cdn.tailwindcss.com"></script>`.trim()
}

// ─── Header nav (shared) ───

function renderNav(c: HeaderContent, land: Land): string {
  const brand = c.logo
    ? `<img src="${esc(c.logo)}" class="h-8 w-auto object-contain object-left" alt="logo">`
    : `<span class="text-sm font-semibold uppercase tracking-widest" style="color: var(--theme-main); opacity: 0.6">${esc(land.title || land.handle)}</span>`

  const links = (c.buttons ?? []).length
    ? `<div class="flex items-center gap-4">${(c.buttons ?? []).map(b =>
        `<a href="${esc(b.url)}" class="text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-60" style="color: var(--theme-main)">${esc(b.label)}</a>`
      ).join('')}</div>`
    : ''

  return `<div class="flex justify-between">${brand}${links}</div>`
}

// ─── Header: Minimal ───

function renderHeaderMinimal(c: HeaderContent, s: HeaderSettings, land: Land): string {
  const cover = s.cover_media_value
    ? `<img src="${esc(s.cover_media_value)}" class="absolute inset-0 w-full h-full object-cover" alt="">`
    : ''
  return `
<div class="flex flex-col p-8 gap-8">
  <div class="flex flex-col justify-between h-[40em]">
    ${renderNav(c, land)}
    <div class="space-y-6">
      ${c.title       ? `<h1 class="text-8xl font-semibold max-w-[15ch] leading-[5.5rem]" style="color: var(--theme-main)">${esc(c.title)}</h1>` : ''}
      ${c.description ? `<p class="max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">${esc(c.description)}</p>` : c.subtitle ? `<p class="max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">${esc(c.subtitle)}</p>` : ''}
    </div>
  </div>
  <div class="relative h-[40em] overflow-hidden rounded-md" style="background: var(--theme-accent)">
    ${cover}
  </div>
</div>`
}

// ─── Header: Baseline ───

function renderHeaderBaseline(c: HeaderContent, s: HeaderSettings, land: Land): string {
  const cover = s.cover_media_value
    ? `<img src="${esc(s.cover_media_value)}" class="absolute inset-0 w-full h-full object-cover" alt="">`
    : ''
  return `
<div class="flex h-screen">
  <div class="flex flex-1 flex-col justify-between p-8">
    ${renderNav(c, land)}
    <div class="space-y-6">
      ${c.title       ? `<h1 class="text-8xl font-semibold max-w-[15ch] leading-[5.5rem]" style="color: var(--theme-main)">${esc(c.title)}</h1>` : ''}
      ${c.description ? `<p class="max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">${esc(c.description)}</p>` : c.subtitle ? `<p class="max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">${esc(c.subtitle)}</p>` : ''}
    </div>
  </div>
  <div class="relative flex-1 overflow-hidden" style="background: var(--theme-accent)">
    ${cover}
  </div>
</div>`
}

// ─── Header: Structure ───

function renderHeaderStructure(c: HeaderContent, land: Land): string {
  const brand = c.logo
    ? `<img src="${esc(c.logo)}" class="h-8 w-auto object-contain" alt="logo">`
    : `<span class="text-2xl font-semibold" style="color: var(--theme-main)">${esc(land.title || land.handle)}</span>`
  const btns = (c.buttons ?? []).length
    ? `<div class="flex flex-wrap items-center justify-center gap-3">${(c.buttons ?? []).map(b =>
        `<a href="${esc(b.url)}" class="inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-xl border-2 transition-opacity hover:opacity-80" style="border-color: var(--theme-main); color: var(--theme-main)">${esc(b.label)}</a>`
      ).join('')}</div>`
    : ''
  return `
<div class="flex flex-col">
  <div class="flex flex-col gap-6 justify-center items-center text-center h-[40em] p-16 relative">
    <div class="absolute top-12">${brand}</div>
    <div class="flex flex-col pt-12 gap-6 items-center">
      ${c.subtitle    ? `<h1 class="text-xs border rounded-xl px-2 tracking-widest uppercase" style="color: var(--theme-accent)">${esc(c.subtitle)}</h1>` : ''}
      ${c.title       ? `<h2 class="text-6xl w-[15ch]" style="color: var(--theme-accent)">${esc(c.title)}</h2>` : ''}
      ${c.description ? `<p class="w-[35ch] leading-tight" style="color: var(--theme-main)">${esc(c.description)}</p>` : ''}
      ${btns}
    </div>
  </div>
</div>`
}

function renderHeader(section: Section, theme: LandTheme, land: Land): string {
  const c = (section.content ?? {}) as unknown as HeaderContent
  const s = section.settings_json as unknown as HeaderSettings
  if (theme.theme_preset === 'structure') return renderHeaderStructure(c, land)
  if (theme.theme_preset === 'baseline')  return renderHeaderBaseline(c, s, land)
  return renderHeaderMinimal(c, s, land)
}

// ─── Text ───

interface TextContent {
  title?: string; subtitle?: string; body?: string; buttons?: ContentMediaButton[]
}

function renderText(section: Section): string {
  const c = (section.content ?? {}) as TextContent
  const v = section.style_variant ?? 'default'

  const containerClass = v === 'wide' ? 'py-5 max-w-none px-0' : v === 'centered' ? 'py-5 max-w-2xl mx-auto px-6' : 'py-5 max-w-none px-6'
  const innerClass = v === 'centered' ? 'flex flex-col gap-3 items-center text-center' : 'flex flex-col gap-3 items-start'

  const btns = (c.buttons ?? []).length
    ? `<div class="flex flex-wrap gap-2 pt-1">${(c.buttons ?? []).map(b =>
        `<a href="${esc(b.url)}" class="inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80" style="background: var(--theme-accent); color: var(--theme-surface)">${esc(b.label)}</a>`
      ).join('')}</div>`
    : ''

  return `
<div class="${containerClass}">
  <div class="${innerClass}">
    ${c.subtitle ? `<p class="text-xs font-medium tracking-wide uppercase" style="color: var(--theme-accent)">${esc(c.subtitle)}</p>` : ''}
    ${c.title    ? `<h2 class="text-xl font-semibold leading-tight" style="color: var(--theme-main)">${esc(c.title)}</h2>` : ''}
    ${c.body     ? `<div class="prose prose-sm max-w-none text-sm leading-relaxed" style="--tw-prose-headings: var(--theme-main); --tw-prose-links: var(--theme-accent)">${c.body}</div>` : ''}
    ${btns}
  </div>
</div>`
}

// ─── Media ───

interface MediaContent {
  media_type?: 'image' | 'video'; url?: string; caption?: string
}

function getVideoEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return null
}

function renderMedia(section: Section): string {
  const m = (section.content ?? {}) as MediaContent
  const v = section.style_variant ?? 'default'
  const containerClass = v === 'fullwidth' ? 'p-0' : 'px-6 py-4'
  const mediaClass = v === 'fullwidth'
    ? 'overflow-hidden bg-gray-200 aspect-video'
    : v === 'compact'
      ? 'rounded-xl overflow-hidden bg-gray-200 max-h-48'
      : 'rounded-xl overflow-hidden bg-gray-200 aspect-video'

  let inner = ''
  if (m.media_type === 'image' && m.url) {
    inner = `<img src="${esc(m.url)}" class="w-full h-full object-cover" alt="${esc(m.caption ?? '')}">`
  } else if (m.media_type === 'video' && m.url) {
    const embed = getVideoEmbed(m.url)
    if (embed) {
      inner = `<iframe src="${esc(embed)}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>`
    }
  }

  return `
<div class="${containerClass}">
  <div class="${mediaClass}">${inner}</div>
  ${m.caption ? `<p class="mt-2 text-xs text-gray-400">${esc(m.caption)}</p>` : ''}
</div>`
}

// ─── Content + Media ───

function renderContentMediaEmbed(url: string, mediaType: string): string {
  if (mediaType === 'video') {
    const embed = getVideoEmbed(url)
    if (embed) return `<iframe src="${esc(embed)}" class="w-full h-full pointer-events-none" frameborder="0" allowfullscreen></iframe>`
  }
  if (url) return `<img src="${esc(url)}" class="w-full h-full object-cover" alt="">`
  return ''
}

function renderContentMedia(section: Section, theme: LandTheme): string {
  const c = (section.content ?? {}) as unknown as ContentMediaContent

  // Structure theme: side-by-side
  if (theme.theme_preset === 'structure') {
    const rev = section.style_variant === 'reversed'
    const mediaInner = c.media_type === 'image' && c.media_url
      ? `<img src="${esc(c.media_url)}" class="w-full h-full object-cover" alt="">`
      : ''
    const btns = (c.buttons ?? []).length
      ? `<div class="flex flex-wrap gap-2">${(c.buttons ?? []).map(b => `<a href="${esc(b.url)}" class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl border transition-colors" style="border-color: var(--theme-accent); color: var(--theme-accent)">${esc(b.label)}</a>`).join('')}</div>`
      : ''
    return `
<div class="py-16 grid grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
  <div class="${rev ? 'order-2' : 'order-1'} rounded-xl overflow-hidden aspect-square" style="background: color-mix(in srgb, var(--theme-accent) 8%, transparent)">${mediaInner}</div>
  <div class="${rev ? 'order-1' : 'order-2'} flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      ${c.subtitle ? `<p class="text-xs uppercase tracking-widest" style="color: var(--theme-main)">${esc(c.subtitle)}</p>` : ''}
      ${c.title    ? `<h2 class="text-4xl font-medium" style="color: var(--theme-main)">${esc(c.title)}</h2>` : ''}
      ${c.body     ? `<p class="text-sm leading-relaxed opacity-60" style="color: var(--theme-main)">${esc(c.body)}</p>` : ''}
    </div>
    ${btns}
  </div>
</div>`
  }

  // Minimal / Baseline: stacked (text then media below)
  const btns = (c.buttons ?? []).length
    ? `<div class="flex flex-wrap gap-4">${(c.buttons ?? []).map(b => `<a href="${esc(b.url)}" class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors">${esc(b.label)}</a>`).join('')}</div>`
    : ''

  const mediaEl = c.media_type === 'video' && c.media_url
    ? `<iframe src="${esc(getVideoEmbed(c.media_url) ?? c.media_url)}" class="w-full h-full pointer-events-none" frameborder="0" allowfullscreen></iframe>`
    : c.media_url
      ? `<img src="${esc(c.media_url)}" class="w-full h-full object-cover" alt="">`
      : ''

  return `
<div class="flex flex-col p-8 gap-8">
  <div class="flex flex-col gap-16">
    <div class="flex flex-col gap-8">
      <div class="space-y-2">
        ${c.subtitle ? `<p class="text-xs font-medium uppercase tracking-widest text-gray-400">${esc(c.subtitle)}</p>` : ''}
        ${c.title    ? `<h2 class="text-4xl font-semibold text-gray-900">${esc(c.title)}</h2>` : ''}
      </div>
      ${c.body ? `<p class="text-sm leading-relaxed max-w-[70ch]" style="color: var(--theme-main); opacity: 0.5">${esc(c.body)}</p>` : ''}
      ${btns}
    </div>
  </div>
  <div class="rounded-md overflow-hidden bg-gray-200 aspect-video">${mediaEl}</div>
</div>`
}

// ─── List ───

function renderList(section: Section, theme: LandTheme): string {
  const c = (section.content ?? {}) as any
  const items = sortByPosition(c.items ?? [])
  const title: string = c.title ?? ''
  const description: string = c.description ?? ''
  const compact = section.style_variant === 'compact'

  // Structure theme
  if (theme.theme_preset === 'structure') {
    const rows = items.map((item: any) => `
      <a href="${esc(item.url)}" target="_blank" class="flex items-center gap-4 rounded-2xl ${compact ? 'p-4' : 'p-6'} transition-opacity hover:opacity-80" style="background-color: color-mix(in srgb, var(--theme-accent) 10%, transparent)">
        ${item.icon ? `<div class="${compact ? 'h-9 w-9' : 'h-12 w-12'} shrink-0 rounded-xl overflow-hidden bg-gray-100"><img src="${esc(item.icon)}" class="w-full h-full object-cover"></div>` : ''}
        <div class="flex flex-col gap-0.5 min-w-0 flex-1">
          <p class="${compact ? 'text-sm' : 'text-base'} font-medium leading-tight truncate" style="color: var(--theme-main)">${esc(item.title)}</p>
          ${item.subtitle ? `<p class="text-xs opacity-60 truncate" style="color: var(--theme-main)">${esc(item.subtitle)}</p>` : ''}
        </div>
      </a>`).join('')
    return `
<div class="max-w-5xl py-16 mx-auto">
  ${title ? `<h2 class="text-4xl font-medium mb-8" style="color: var(--theme-main)">${esc(title)}</h2>` : ''}
  <div class="flex flex-col gap-2">${rows}</div>
</div>`
  }

  // Minimal / Baseline
  const rows = items.map((item: any) => `
    <li class="border-b" style="border-color: var(--theme-main)">
      <a href="${esc(item.url)}" target="_blank" class="${compact ? 'py-3 flex justify-between items-end gap-4' : 'py-8 flex justify-between items-end gap-8'} group">
        <h1 class="${compact ? 'text-2xl font-semibold leading-tight tracking-tight' : 'text-8xl font-bold leading-none tracking-tight'}" style="color: var(--theme-main)">${esc(item.title)}</h1>
        ${item.description ? `<p class="text-sm text-gray-400 shrink-0 pb-1">${esc(item.description)}</p>` : ''}
      </a>
    </li>`).join('')

  return `
<div class="flex flex-col mx-auto px-8 py-32 gap-16">
  ${(title || description) ? `<div class="flex flex-col gap-4">${title ? `<h2 class="text-4xl font-semibold" style="color: var(--theme-main)">${esc(title)}</h2>` : ''}${description ? `<p class="text-sm leading-relaxed max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">${esc(description)}</p>` : ''}</div>` : ''}
  <ul>${rows}</ul>
</div>`
}

// ─── Collection ───

function renderCollection(section: Section, theme: LandTheme): string {
  const c = (section.content ?? {}) as unknown as CollectionContent
  const collections = sortByPosition(c.collections ?? [])
  if (!collections.length) return ''

  // Structure theme
  if (theme.theme_preset === 'structure') {
    const variant = section.style_variant
    return collections.map(col => {
      const items = sortByPosition(col.items ?? [])
      const isList = variant === 'list'
      const gridClass = isList ? 'flex flex-col divide-y' : variant === 'cards' ? 'grid grid-cols-2 gap-8' : 'grid grid-cols-3 gap-8'
      const rows = isList
        ? items.map(item => `
            <li class="flex gap-4 py-3">
              <div class="h-14 w-20 shrink-0 overflow-hidden" style="background: var(--theme-main); opacity: 0.15">
                ${item.media_url ? `<img src="${esc(item.media_url)}" class="w-full h-full object-cover" style="opacity: 100%">` : ''}
              </div>
              <div>
                <h3 class="text-base font-medium" style="color: var(--theme-main)">${esc(item.title)}</h3>
                ${item.description ? `<p class="text-xs mt-1" style="color: var(--theme-main); opacity: 0.5">${esc(item.description)}</p>` : ''}
              </div>
            </li>`).join('')
        : items.map(item => `
            <li class="flex flex-col gap-2 pb-4">
              <div class="overflow-hidden rounded-xl ${variant === 'cards' ? 'aspect-video' : 'flex-1 aspect-square'}" style="background: var(--theme-main)">
                ${item.media_url ? `<img src="${esc(item.media_url)}" class="w-full h-full object-cover">` : ''}
              </div>
              <div>
                <h3 class="text-2xl font-medium" style="color: var(--theme-main)">${esc(item.title)}</h3>
                ${(item as any).subtitle ? `<p class="text-sm" style="color: var(--theme-main); opacity: 0.5">${esc((item as any).subtitle)}</p>` : ''}
              </div>
            </li>`).join('')
      return `
<div class="max-w-5xl mx-auto py-8 space-y-8">
  <h2 class="text-4xl font-semibold" style="color: var(--theme-main)">${esc(col.title)}</h2>
  <ul class="${gridClass}">${rows}</ul>
</div>`
    }).join('')
  }

  // Minimal / Baseline — grid cols computed from total items across all collections (matches Vue)
  const variant = section.style_variant
  const totalItems = collections.reduce((sum, col) => sum + (col.items ?? []).length, 0)
  const totalCols = smartColumns(totalItems)
  return collections.map(col => {
    const items = sortByPosition(col.items ?? [])
    const cols = totalCols
    const imgCls = variant === 'cards' ? 'aspect-video' : 'flex-1 aspect-square'
    const rows = items.map(item => `
      <li class="flex flex-col gap-8">
        <div class="overflow-hidden rounded-md ${imgCls}" style="background: var(--theme-main)">
          ${item.media_url ? `<img src="${esc(item.media_url)}" class="w-full h-full object-cover">` : ''}
        </div>
        <div>
          <h3 class="text-2xl font-medium" style="color: var(--theme-main)">${esc(item.title)}</h3>
          ${(item as any).subtitle ? `<p class="text-sm" style="color: var(--theme-main); opacity: 0.5">${esc((item as any).subtitle)}</p>` : ''}
        </div>
      </li>`).join('')
    return `
<div class="flex flex-col mx-auto px-8 py-32 gap-16">
  <div class="flex flex-col gap-4">
    <h2 class="text-4xl font-semibold" style="color: var(--theme-main)">${esc(col.title)}</h2>
    ${col.description ? `<p class="text-sm leading-relaxed max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">${esc(col.description)}</p>` : ''}
  </div>
  <ul class="grid grid-cols-${cols} gap-8">${rows}</ul>
</div>`
  }).join('')
}

// ─── Monetize ───

function renderMonetize(section: Section, theme: LandTheme): string {
  const c = (section.content ?? {}) as any
  const collections = sortByPosition(c.collections ?? [])
  if (!collections.length) return ''

  // Structure theme: same gradient card layout as minimal/baseline (matches MonetizeStructure.vue)

  // Minimal / Baseline: big card with gradient
  return collections.map(col => {
    const period = col.billing_period === 'yearly' ? '/ year' : '/ month'
    const priceLabel = col.price ? `$${(col.price as number).toFixed(2)} ${period}` : 'Free'
    return `
<div class="py-4 px-6">
  <div class="max-w-5xl mx-auto my-16 rounded-2xl overflow-hidden relative" style="min-height: 600px; background-color: color-mix(in srgb, var(--theme-accent) 50%, transparent)">
    ${col.cover_url ? `<img src="${esc(col.cover_url)}" class="absolute inset-0 w-full h-full object-cover">` : ''}
    <div class="absolute inset-0" style="background: linear-gradient(to bottom, transparent 5%, color-mix(in srgb, var(--theme-accent) 95%, black 5%) 100%)"></div>
    <div class="absolute bottom-0 left-0 right-0 p-10 flex items-end justify-between gap-8">
      <div class="flex flex-col gap-1.5 min-w-0">
        ${col.subtitle    ? `<p class="text-xs uppercase tracking-widest font-medium text-white" style="opacity: 0.7">${esc(col.subtitle)}</p>` : ''}
        <h2 class="text-3xl font-bold text-white leading-tight">${esc(col.title || 'Untitled')}</h2>
        ${col.description ? `<p class="text-sm text-white leading-relaxed max-w-md" style="opacity: 0.7">${esc(col.description)}</p>` : ''}
        <p class="text-lg font-semibold text-white mt-1">${esc(priceLabel)}</p>
      </div>
      <button class="shrink-0 px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap" style="background: white; color: var(--theme-accent)">Access content</button>
    </div>
  </div>
</div>`
  }).join('')
}

// ─── Store ───

function renderStore(section: Section, theme: LandTheme): string {
  const c = (section.content ?? {}) as unknown as StoreContent
  const stores = sortByPosition(c.stores ?? [])
  if (!stores.length) return ''

  // Structure theme
  if (theme.theme_preset === 'structure') {
    const isList = section.style_variant === 'list'
    return stores.map(store => {
      const items = sortByPosition(store.items ?? [])
      const inner = isList
        ? `<ul class="flex flex-col divide-y">${items.map(item => `
          <li class="flex gap-4 py-3 items-center">
            <div class="h-14 w-20 shrink-0 overflow-hidden" style="background: var(--theme-main); opacity: 0.15">
              ${item.image ? `<img src="${esc(item.image)}" class="w-full h-full object-cover" style="opacity: 100%">` : ''}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-medium" style="color: var(--theme-main)">${esc(item.title)}</h3>
              ${item.price > 0 ? `<p class="text-sm font-semibold mt-0.5" style="color: var(--theme-main)">$${item.price.toFixed(2)}</p>` : ''}
            </div>
            ${item.price > 0 ? `<button class="shrink-0 px-4 py-2 text-sm font-medium" style="color: var(--theme-main); border: 1.5px solid var(--theme-main)">Buy</button>` : ''}
          </li>`).join('')}</ul>`
        : `<ul class="grid grid-cols-3 gap-8">${items.map(item => `
          <li class="flex flex-col gap-2 pb-4">
            <div class="aspect-square overflow-hidden rounded-xl" style="background: var(--theme-accent)">
              ${item.image ? `<img src="${esc(item.image)}" class="w-full h-full object-cover">` : ''}
            </div>
            <div>
              <h3 class="text-2xl font-medium" style="color: var(--theme-main)">${esc(item.title)}</h3>
              ${item.price > 0 ? `<p class="text-sm mt-0.5" style="color: var(--theme-main); opacity: 0.5">$${item.price.toFixed(2)}</p>` : ''}
              ${item.price > 0 ? `<button class="mt-3 px-4 py-2 text-sm font-medium" style="color: var(--theme-main); border: 1.5px solid var(--theme-main)">Buy</button>` : ''}
            </div>
          </li>`).join('')}</ul>`
      return `
<div class="max-w-5xl mx-auto py-8 space-y-8">
  <h2 class="text-4xl font-medium" style="color: var(--theme-main)">${esc(store.title)}</h2>
  ${inner}
</div>`
    }).join('')
  }

  // Minimal / Baseline — grid cols computed from total items across all stores (matches Vue)
  const totalStoreItems = stores.reduce((sum, s) => sum + (s.items ?? []).length, 0)
  const storeCols = smartColumns(totalStoreItems)
  return stores.map(store => {
    const items = sortByPosition(store.items ?? [])
    const cols = storeCols
    const rows = items.map(item => `
      <li class="flex flex-col gap-4">
        <div class="aspect-square overflow-hidden rounded-md" style="background: var(--theme-main)">
          ${item.image ? `<img src="${esc(item.image)}" class="w-full h-full object-cover">` : ''}
        </div>
        <div class="flex flex-col gap-4">
          <div class="flex justify-between items-start">
            <h3 class="text-2xl font-semibold" style="color: var(--theme-main)">${esc(item.title)}</h3>
            ${item.price > 0 ? `<p class="text-sm font-medium" style="color: var(--theme-main)">$${item.price.toFixed(2)}</p>` : ''}
          </div>
          ${item.description ? `<p class="text-sm" style="color: var(--theme-main); opacity: 0.5">${esc(item.description)}</p>` : ''}
          ${item.price > 0 ? `<button class="mt-2 py-2 text-sm font-medium rounded-lg text-gray-100" style="background: var(--theme-accent)">Buy</button>` : ''}
        </div>
      </li>`).join('')
    return `
<div class="flex flex-col mx-auto px-8 py-32 gap-16">
  <div class="flex flex-col gap-4">
    <h2 class="text-4xl font-semibold" style="color: var(--theme-main)">${esc(store.title)}</h2>
    ${(store as any).description ? `<p class="text-sm leading-relaxed max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">${esc((store as any).description)}</p>` : ''}
  </div>
  <ul class="grid grid-cols-${cols} gap-8">${rows}</ul>
</div>`
  }).join('')
}

// ─── Campaign ───

function renderCampaign(section: Section, theme: LandTheme): string {
  const c = (section.content ?? {}) as unknown as CampaignContent

  // Structure theme
  if (theme.theme_preset === 'structure') {
    const tc = getTextColorForAccent(theme)
    return `
<div class="max-w-5xl mx-auto p-24 my-16 rounded-2xl text-center space-y-6" style="background-color: var(--theme-accent)">
  <div class="space-y-3">
    ${c.title       ? `<h1 class="text-8xl leading-none tracking-tight" style="color: ${tc}">${esc(c.title)}</h1>` : ''}
    ${c.description ? `<p class="text-sm leading-relaxed max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">${esc(c.description)}</p>` : ''}
  </div>
  <div class="flex flex-col items-center gap-3 max-w-sm mx-auto">
    <input type="email" placeholder="${esc(c.placeholder || 'your@email.com')}" class="w-full px-4 py-2.5 rounded-xl text-sm outline-none border" style="border-color: color-mix(in srgb, ${tc} 30%, transparent); color: ${tc}; background: transparent">
    <button class="w-full px-6 py-2.5 rounded-xl text-sm font-medium" style="background-color: ${tc}; color: var(--theme-accent)">${esc(c.button_label || 'Subscribe')}</button>
  </div>
</div>`
  }

  // Minimal / Baseline
  return `
<div class="flex flex-1 flex-col gap-8 items-center py-36 px-6">
  ${c.title       ? `<h1 class="text-8xl font-bold leading-none tracking-tight" style="color: var(--theme-main)">${esc(c.title)}</h1>` : ''}
  ${c.description ? `<p class="text-sm leading-relaxed max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">${esc(c.description)}</p>` : ''}
  <form class="flex items-center gap-2 shrink-0" onsubmit="return false">
    <input type="email" placeholder="${esc(c.placeholder || 'email@example.com')}" class="border bg-transparent outline-none text-sm p-4 rounded-xl h-14 w-96" style="border-color: var(--theme-main); color: var(--theme-main)">
    <button type="submit" class="py-4 px-8 text-sm font-medium rounded-xl h-14 text-gray-100" style="background: var(--theme-accent)">${esc(c.button_label || 'Subscribe')}</button>
  </form>
</div>`
}

// ─── Footer ───

function renderFooter(section: Section, theme: LandTheme, land: Land): string {
  const c = (section.content ?? {}) as unknown as FooterContent
  const s = (section.settings_json ?? {}) as unknown as FooterSettings

  // Structure theme
  if (theme.theme_preset === 'structure') {
    const tc = getTextColorForAccent(theme)
    const links = (c.buttons ?? []).length
      ? `<div class="flex flex-wrap gap-x-6 gap-y-2 justify-end shrink-0">${(c.buttons ?? []).map(b =>
          `<a href="${esc(b.url)}" class="text-sm font-medium transition-opacity hover:opacity-60" style="color: ${tc}">${esc(b.label)}</a>`
        ).join('')}</div>`
      : ''
    return `
<div class="mx-auto mt-16 overflow-hidden relative" style="background-color: var(--theme-accent); min-height: 280px">
  ${s?.cover_media_value ? `<img src="${esc(s.cover_media_value)}" class="absolute inset-0 w-full h-full object-cover opacity-20">` : ''}
  <div class="relative flex flex-col justify-between h-full p-14" style="min-height: 280px">
    <p class="text-xs uppercase tracking-widest font-medium opacity-60" style="color: ${tc}">${esc(land.title || land.handle)}</p>
    <div class="flex items-end justify-between gap-8 mt-auto pt-12">
      <div class="flex flex-col gap-1">
        <h2 class="text-4xl font-bold leading-tight" style="color: ${tc}">${esc(c.title || '')}</h2>
        ${c.subtitle ? `<p class="text-sm opacity-60" style="color: ${tc}">${esc(c.subtitle)}</p>` : ''}
      </div>
      ${links}
    </div>
  </div>
</div>
<div class="mx-auto flex items-center justify-between px-10 py-4 gap-4" style="background-color: color-mix(in srgb, var(--theme-accent) 85%, black)">
  <div class="flex items-center gap-6">
    <a href="#" class="text-xs transition-opacity hover:opacity-80" style="color: ${tc}; opacity: 0.5">Privacy Policy</a>
    <a href="#" class="text-xs transition-opacity hover:opacity-80" style="color: ${tc}; opacity: 0.5">Terms &amp; Conditions</a>
  </div>
  <a href="https://lands.app" target="_blank" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-opacity hover:opacity-80" style="background-color: color-mix(in srgb, ${tc} 10%, transparent)">
    <span class="text-[10px] uppercase tracking-widest" style="color: ${tc}; opacity: 0.5">Made with</span>
    <span class="text-[10px] font-bold uppercase tracking-widest" style="color: ${tc}">Lands</span>
  </a>
</div>`
  }

  // Minimal / Baseline
  const navLinks = (c.buttons ?? []).length
    ? `<div class="flex items-center gap-6">${(c.buttons ?? []).map(b =>
        `<a href="${esc(b.url)}" class="text-sm font-medium transition-opacity hover:opacity-60" style="color: var(--theme-main)">${esc(b.label)}</a>`
      ).join('')}</div>`
    : ''

  return `
<div class="flex flex-col px-8 py-16 gap-12" style="background: var(--theme-surface)">
  <div class="flex items-center justify-between">
    <span class="text-sm font-semibold uppercase tracking-widest" style="color: var(--theme-main); opacity: 0.6">${esc(land.title || land.handle)}</span>
    ${navLinks}
  </div>
  ${c.description ? `<p class="text-sm leading-relaxed max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">${esc(c.description)}</p>` : ''}
  <div class="flex items-center justify-between border-t pt-6" style="border-color: var(--theme-main); opacity: 0.2"></div>
  <div class="flex items-center justify-between -mt-6">
    <div class="flex items-center gap-6">
      <span class="text-xs" style="color: var(--theme-main); opacity: 0.4">Privacy Policy</span>
      <span class="text-xs" style="color: var(--theme-main); opacity: 0.4">Terms &amp; Conditions</span>
    </div>
    <a href="https://lands.app" target="_blank" class="text-xs" style="color: var(--theme-main); opacity: 0.4">Made with Lands</a>
  </div>
</div>`
}

// ─── Dispatcher ───

function renderSection(section: Section, theme: LandTheme, land: Land): string {
  switch (section.type) {
    case 'header':        return renderHeader(section, theme, land)
    case 'text':          return renderText(section)
    case 'media':         return renderMedia(section)
    case 'content_media': return renderContentMedia(section, theme)
    case 'list':          return renderList(section, theme)
    case 'collection':    return renderCollection(section, theme)
    case 'store':         return renderStore(section, theme)
    case 'campaign':      return renderCampaign(section, theme)
    case 'monetize':      return renderMonetize(section, theme)
    case 'footer':        return renderFooter(section, theme, land)
    default:              return ''
  }
}

// ─── Main ───

export function renderLand(land: Land): string {
  const body = sortByPosition(land.sections).map(s => renderSection(s, land.theme, land)).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(land.meta_title || land.title || land.handle)}</title>
  ${(land.meta_description || land.description) ? `<meta name="description" content="${esc(land.meta_description || land.description)}">` : ''}
  <meta property="og:title" content="${esc(land.meta_title || land.title || land.handle)}">
  ${(land.meta_description || land.description) ? `<meta property="og:description" content="${esc(land.meta_description || land.description)}">` : ''}
  ${land.og_image ? `<meta property="og:image" content="${esc(land.og_image)}">` : ''}
  ${buildFontLinks(land.theme)}
  ${buildBaseStyles(land.theme)}
</head>
<body>
${body}
</body>
</html>`
}
