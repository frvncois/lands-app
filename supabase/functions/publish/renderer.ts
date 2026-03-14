import type {
  Land, LandTheme, Section,
  HeaderContent, HeaderSettings,
  ContentMediaContent,
  ListContent,
  CollectionContent, CollectionSettings,
  StoreContent, StoreSettings,
  CampaignContent,
  FooterContent, FooterSettings,
  ContentMediaButton,
} from './types.ts'

// ─── Utilities ───

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

const FONT_MAP: Record<string, string> = {
  sans:  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
  mono:  'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace',
}

// ─── Stylesheet ───

function buildCSS(theme: LandTheme): string {
  const font = FONT_MAP[theme.typography_style] ?? FONT_MAP.sans
  return `
:root {
  --main:    ${theme.color_main};
  --accent:  ${theme.color_accent};
  --surface: ${theme.color_surface};
  --font:    ${font};
}

*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  font-family: var(--font);
  color: var(--main);
  background: #fff;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

img { display: block; max-width: 100%; }
a   { color: inherit; text-decoration: none; }

/* ── Buttons ── */
.btns { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.25rem; }
.btn {
  display: inline-block;
  padding: .625rem 1.375rem;
  border: 1.5px solid var(--main);
  border-radius: 9999px;
  font-size: .875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity .15s;
}
.btn:hover { opacity: .65; }
.btn-solid {
  background: var(--main);
  color: #fff;
  border-color: var(--main);
}

/* ── Header: Minimal ── */
.header-minimal { display: flex; flex-direction: column; }
.header-minimal__text {
  height: 40em;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 1.25rem;
}
.header-minimal__cover {
  position: relative;
  height: 40em;
  overflow: hidden;
  background: var(--accent);
}
.header-minimal__cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── Header: Bold ── */
.header-bold { display: flex; flex-direction: column; padding: 2.5rem; }
.header-bold__cover {
  position: relative;
  height: 40em;
  overflow: hidden;
  border-radius: 2rem;
  background: var(--accent);
}
.header-bold__cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.header-bold__text { padding: 2rem 0; display: flex; flex-direction: column; gap: 1rem; }

/* ── Header: Editorial ── */
.header-editorial {
  padding: 3rem 1.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.header-editorial__cover {
  width: 100%;
  height: 10rem;
  overflow: hidden;
  border-radius: .5rem;
}
.header-editorial__cover img { width: 100%; height: 100%; object-fit: cover; }
.header-editorial__meta { display: flex; align-items: center; gap: 1rem; }
.header-editorial__divider { width: 3rem; height: 1px; background: var(--accent); }

/* ── Typography ── */
.h-huge  { font-size: clamp(3rem, 8vw, 5rem); font-weight: 600; line-height: 1; color: var(--main); }
.h-bold  { font-size: clamp(3rem, 8vw, 5rem); font-weight: 700; line-height: 1; color: var(--main); }
.h-edit  { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 700; line-height: 1.2; color: var(--main); }
.sub     { font-size: clamp(1rem, 3vw, 1.5rem); color: var(--main); opacity: .5; }
.eyebrow { font-size: .75rem; text-transform: uppercase; letter-spacing: .1em; color: #9ca3af; }
.logo    { height: 2rem; width: auto; object-fit: contain; object-position: left; }

/* ── Content + Media ── */
.cm { padding: 4rem 2rem; }
.cm__inner {
  max-width: 72rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}
.cm__inner.reversed .cm__media { order: 2; }
.cm__inner.reversed .cm__text  { order: 1; }
.cm__media { border-radius: .75rem; overflow: hidden; }
.cm__media img  { width: 100%; border-radius: .75rem; }
.cm__media-placeholder { width: 100%; aspect-ratio: 4/3; background: var(--surface); border-radius: .75rem; }
.cm__video { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: .75rem; }
.cm__video iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
.cm__text { display: flex; flex-direction: column; gap: .875rem; }
.cm__eyebrow  { font-size: .875rem; font-weight: 500; color: var(--accent); }
.cm__title    { font-size: 2rem; font-weight: 700; line-height: 1.2; color: var(--main); }
.cm__body     { color: var(--main); opacity: .7; line-height: 1.7; }

/* ── List ── */
.list { padding: 4rem 2rem; }
.list__inner { max-width: 40rem; margin: 0 auto; }
.list__title  { font-size: 1.25rem; font-weight: 600; color: var(--main); margin-bottom: 1.5rem; }
.list__item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: .875rem 0;
  border-bottom: 1px solid var(--surface);
  color: inherit;
}
.list__item:hover { opacity: .75; }
.list__icon {
  width: 2rem; height: 2rem;
  border-radius: .375rem;
  object-fit: cover;
  flex-shrink: 0;
}
.list__icon-placeholder {
  width: 2rem; height: 2rem;
  border-radius: .375rem;
  background: var(--surface);
  flex-shrink: 0;
}
.list__label { font-size: .875rem; font-weight: 500; color: var(--main); }
.list__desc  { font-size: .75rem; color: var(--main); opacity: .5; margin-top: .125rem; }
.list__arrow { margin-left: auto; opacity: .3; flex-shrink: 0; }

/* ── Collection ── */
.collection { padding: 4rem 2rem; }
.collection__inner { max-width: 72rem; margin: 0 auto; }
.collection__title { font-size: 1.25rem; font-weight: 600; color: var(--main); margin-bottom: 2rem; }
.collection__grid  { display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 1.5rem; }
.collection__card  { border-radius: .75rem; overflow: hidden; background: var(--surface); }
.collection__card img       { width: 100%; aspect-ratio: 4/3; object-fit: cover; }
.collection__card-placeholder { width: 100%; aspect-ratio: 4/3; background: var(--surface); filter: brightness(.93); }
.collection__card-body { padding: 1rem; }
.collection__card-title { font-size: .9375rem; font-weight: 500; color: var(--main); }
.collection__card-desc  { font-size: .8125rem; color: var(--main); opacity: .5; margin-top: .25rem; }

.collection__list-item { display: flex; align-items: center; gap: 1.5rem; padding: 1rem 0; border-bottom: 1px solid var(--surface); }
.collection__list-item img { width: 4rem; height: 4rem; border-radius: .5rem; object-fit: cover; flex-shrink: 0; }

/* ── Store ── */
.store { padding: 4rem 2rem; }
.store__inner { max-width: 72rem; margin: 0 auto; }
.store__title { font-size: 1.25rem; font-weight: 600; color: var(--main); margin-bottom: 2rem; }
.store__grid  { display: grid; grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); gap: 1.5rem; }
.store__card  { border-radius: .75rem; overflow: hidden; background: var(--surface); display: flex; flex-direction: column; }
.store__card img            { width: 100%; aspect-ratio: 1; object-fit: cover; }
.store__card-placeholder    { width: 100%; aspect-ratio: 1; background: var(--surface); filter: brightness(.93); }
.store__card-body  { padding: 1rem; flex: 1; display: flex; flex-direction: column; gap: .375rem; }
.store__card-name  { font-size: .9375rem; font-weight: 500; color: var(--main); }
.store__card-desc  { font-size: .8125rem; color: var(--main); opacity: .5; }
.store__card-price { font-size: 1rem; font-weight: 600; color: var(--main); margin-top: auto; padding-top: .5rem; }

.store__list-item  { display: flex; align-items: center; gap: 1.5rem; padding: 1rem 0; border-bottom: 1px solid var(--surface); }
.store__list-item img { width: 4rem; height: 4rem; border-radius: .5rem; object-fit: cover; flex-shrink: 0; }
.store__list-body  { flex: 1; }
.store__list-name  { font-size: .9375rem; font-weight: 500; color: var(--main); }
.store__list-desc  { font-size: .8125rem; color: var(--main); opacity: .5; margin-top: .25rem; }
.store__list-price { font-size: .9375rem; font-weight: 600; color: var(--main); flex-shrink: 0; }

/* ── Campaign ── */
.campaign {
  padding: 5rem 2rem;
  background: var(--surface);
  text-align: center;
}
.campaign__inner {
  max-width: 36rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}
.campaign__title { font-size: 2rem; font-weight: 700; color: var(--main); }
.campaign__desc  { color: var(--main); opacity: .6; line-height: 1.7; }
.campaign__form  { display: flex; gap: .75rem; width: 100%; max-width: 28rem; }
.campaign__input {
  flex: 1;
  padding: .75rem 1rem;
  border: 1.5px solid var(--main);
  border-radius: .5rem;
  font-size: .875rem;
  font-family: var(--font);
  background: transparent;
  color: var(--main);
  outline: none;
}
.campaign__input::placeholder { opacity: .4; }

/* ── Footer ── */
.footer { padding: 4rem 2rem; background: var(--surface); }
.footer__cover { width: 100%; height: 16rem; overflow: hidden; border-radius: .75rem; margin-bottom: 2rem; }
.footer__cover img { width: 100%; height: 100%; object-fit: cover; }
.footer__inner { max-width: 72rem; margin: 0 auto; }
.footer__title  { font-size: 1.5rem; font-weight: 600; color: var(--main); }
.footer__sub    { font-size: .9375rem; color: var(--main); opacity: .5; margin-top: .5rem; }
.footer__credit { font-size: .75rem; color: var(--main); opacity: .3; margin-top: 2rem; }
.footer__credit a { opacity: 1; }

/* ── Monetize ── */
.monetize { padding: 5rem 2rem; background: var(--surface); text-align: center; }
.monetize__inner { max-width: 32rem; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
.monetize__title { font-size: 1.75rem; font-weight: 700; color: var(--main); }
.monetize__price { font-size: 2.5rem; font-weight: 700; color: var(--main); }
.monetize__price span { font-size: 1rem; font-weight: 400; opacity: .5; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .cm__inner { grid-template-columns: 1fr; gap: 2rem; }
  .cm__inner.reversed .cm__media { order: unset; }
  .cm__inner.reversed .cm__text  { order: unset; }
  .header-minimal__text { height: auto; padding: 3rem 2rem; }
  .header-minimal__cover { height: 20em; }
  .header-bold { padding: 1.5rem; }
  .header-bold__cover { height: 20em; }
  .campaign__form { flex-direction: column; }
}
`.trim()
}

// ─── Shared helpers ───

function renderButtons(buttons: ContentMediaButton[]): string {
  if (!buttons?.length) return ''
  const items = buttons.map(b =>
    `<a href="${esc(b.url)}" class="btn">${esc(b.label)}</a>`
  ).join('')
  return `<div class="btns">${items}</div>`
}

// ─── Header ───

function renderHeader(section: Section, theme: LandTheme): string {
  const c = (section.content ?? {}) as unknown as HeaderContent
  const s = section.settings_json as unknown as HeaderSettings

  if (theme.theme_preset === 'bold')      return renderHeaderBold(c, s)
  if (theme.theme_preset === 'editorial') return renderHeaderEditorial(c, s)
  return renderHeaderMinimal(c, s)
}

function renderHeaderMinimal(c: HeaderContent, s: HeaderSettings): string {
  return `
<section class="header-minimal">
  <div class="header-minimal__text">
    ${c.logo ? `<img src="${esc(c.logo)}" class="logo" alt="Logo">` : ''}
    ${c.title    ? `<h1 class="h-huge">${esc(c.title)}</h1>` : ''}
    ${c.subtitle ? `<p class="sub">${esc(c.subtitle)}</p>` : ''}
    ${renderButtons(c.buttons ?? [])}
  </div>
  <div class="header-minimal__cover">
    ${s.cover_media_value ? `<img src="${esc(s.cover_media_value)}" alt="">` : ''}
  </div>
</section>`
}

function renderHeaderBold(c: HeaderContent, s: HeaderSettings): string {
  return `
<section class="header-bold">
  <div class="header-bold__cover">
    ${s.cover_media_value ? `<img src="${esc(s.cover_media_value)}" alt="">` : ''}
  </div>
  <div class="header-bold__text">
    ${c.logo    ? `<img src="${esc(c.logo)}" class="logo" alt="Logo">` : ''}
    ${c.title   ? `<h1 class="h-bold">${esc(c.title)}</h1>` : ''}
    ${c.subtitle ? `<p class="sub">${esc(c.subtitle)}</p>` : ''}
    ${renderButtons(c.buttons ?? [])}
  </div>
</section>`
}

function renderHeaderEditorial(c: HeaderContent, s: HeaderSettings): string {
  return `
<section class="header-editorial">
  ${s.cover_media_value ? `<div class="header-editorial__cover"><img src="${esc(s.cover_media_value)}" alt=""></div>` : ''}
  <div class="header-editorial__meta">
    ${c.logo     ? `<img src="${esc(c.logo)}" class="logo" alt="Logo">` : ''}
    ${c.subtitle ? `<p class="eyebrow">${esc(c.subtitle)}</p>` : ''}
  </div>
  ${c.title ? `<h1 class="h-edit">${esc(c.title)}</h1>` : ''}
  <div class="header-editorial__divider"></div>
  ${renderButtons(c.buttons ?? [])}
</section>`
}

// ─── Content + Media ───

function renderContentMedia(section: Section): string {
  const c = (section.content ?? {}) as unknown as ContentMediaContent
  const reversed = section.style_variant === 'reversed' ? ' reversed' : ''

  const media = c.media_type === 'video'
    ? `<div class="cm__video"><iframe src="${esc(c.media_url)}" allowfullscreen></iframe></div>`
    : c.media_url
      ? `<div class="cm__media"><img src="${esc(c.media_url)}" alt=""></div>`
      : `<div class="cm__media-placeholder"></div>`

  return `
<section class="cm">
  <div class="cm__inner${reversed}">
    ${media}
    <div class="cm__text">
      ${c.subtitle ? `<p class="cm__eyebrow">${esc(c.subtitle)}</p>` : ''}
      ${c.title    ? `<h2 class="cm__title">${esc(c.title)}</h2>` : ''}
      ${c.body     ? `<p class="cm__body">${esc(c.body)}</p>` : ''}
      ${renderButtons(c.buttons ?? [])}
    </div>
  </div>
</section>`
}

// ─── List ───

function renderList(section: Section): string {
  const c = (section.content ?? {}) as unknown as ListContent
  const items = sortByPosition(c.items ?? [])

  const rows = items.map(item => `
    <a href="${esc(item.url)}" class="list__item">
      ${item.icon
        ? `<img src="${esc(item.icon)}" class="list__icon" alt="">`
        : `<div class="list__icon-placeholder"></div>`}
      <div>
        <p class="list__label">${esc(item.title)}</p>
        ${item.description ? `<p class="list__desc">${esc(item.description)}</p>` : ''}
      </div>
      <svg class="list__arrow" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
    </a>`).join('')

  return `
<section class="list">
  <div class="list__inner">
    ${c.title ? `<h2 class="list__title">${esc(c.title)}</h2>` : ''}
    ${rows || '<p style="text-align:center;opacity:.4;padding:3rem 0;font-size:.875rem;">No links yet.</p>'}
  </div>
</section>`
}

// ─── Collection ───

function renderCollection(section: Section): string {
  const c = (section.content ?? {}) as unknown as CollectionContent
  const s = section.settings_json as unknown as CollectionSettings
  const collection = c.collections?.[0]
  if (!collection) return ''

  const items = sortByPosition(collection.items ?? [])
  const isList = s?.style === 'list'

  const inner = isList
    ? items.map(item => `
        <div class="collection__list-item">
          ${item.media_url ? `<img src="${esc(item.media_url)}" alt="">` : ''}
          <div>
            <p class="collection__card-title">${esc(item.title)}</p>
            ${item.description ? `<p class="collection__card-desc">${esc(item.description)}</p>` : ''}
          </div>
        </div>`).join('')
    : `<div class="collection__grid">${items.map(item => `
        <div class="collection__card">
          ${item.media_url
            ? `<img src="${esc(item.media_url)}" alt="">`
            : `<div class="collection__card-placeholder"></div>`}
          <div class="collection__card-body">
            <p class="collection__card-title">${esc(item.title)}</p>
            ${item.description ? `<p class="collection__card-desc">${esc(item.description)}</p>` : ''}
          </div>
        </div>`).join('')}</div>`

  return `
<section class="collection">
  <div class="collection__inner">
    ${collection.title ? `<h2 class="collection__title">${esc(collection.title)}</h2>` : ''}
    ${inner}
  </div>
</section>`
}

// ─── Store ───

function renderStore(section: Section): string {
  const c = (section.content ?? {}) as unknown as StoreContent
  const s = section.settings_json as unknown as StoreSettings
  const store = c.stores?.[0]
  if (!store) return ''

  const items = sortByPosition(store.items ?? [])
  const isList = s?.style === 'list'

  const inner = isList
    ? items.map(item => `
        <div class="store__list-item">
          ${item.image ? `<img src="${esc(item.image)}" alt="">` : ''}
          <div class="store__list-body">
            <p class="store__list-name">${esc(item.title)}</p>
            ${item.description ? `<p class="store__list-desc">${esc(item.description)}</p>` : ''}
          </div>
          ${item.price > 0 ? `<p class="store__list-price">$${item.price.toFixed(2)}</p>` : ''}
        </div>`).join('')
    : `<div class="store__grid">${items.map(item => `
        <div class="store__card">
          ${item.image
            ? `<img src="${esc(item.image)}" alt="">`
            : `<div class="store__card-placeholder"></div>`}
          <div class="store__card-body">
            <p class="store__card-name">${esc(item.title)}</p>
            ${item.description ? `<p class="store__card-desc">${esc(item.description)}</p>` : ''}
            ${item.price > 0 ? `<p class="store__card-price">$${item.price.toFixed(2)}</p>` : ''}
          </div>
        </div>`).join('')}</div>`

  return `
<section class="store">
  <div class="store__inner">
    ${store.title ? `<h2 class="store__title">${esc(store.title)}</h2>` : ''}
    ${inner}
  </div>
</section>`
}

// ─── Campaign ───

function renderCampaign(section: Section): string {
  const c = (section.content ?? {}) as unknown as CampaignContent
  return `
<section class="campaign">
  <div class="campaign__inner">
    ${c.title       ? `<h2 class="campaign__title">${esc(c.title)}</h2>` : ''}
    ${c.description ? `<p class="campaign__desc">${esc(c.description)}</p>` : ''}
    <form class="campaign__form" onsubmit="return false">
      <input class="campaign__input" type="email" placeholder="${esc(c.placeholder || 'Your email address')}">
      <button type="submit" class="btn btn-solid">${esc(c.button_label || 'Subscribe')}</button>
    </form>
  </div>
</section>`
}

// ─── Monetize ───

function renderMonetize(section: Section): string {
  const c = (section.content ?? {}) as Record<string, unknown>
  const col = (c.collections as Array<{ title?: string; price?: number }>)?.[0]
  return `
<section class="monetize">
  <div class="monetize__inner">
    ${col?.title ? `<h2 class="monetize__title">${esc(col.title)}</h2>` : ''}
    ${col?.price ? `<p class="monetize__price">$${(col.price as number).toFixed(2)}<span>/month</span></p>` : ''}
    <button class="btn btn-solid">Subscribe</button>
  </div>
</section>`
}

// ─── Footer ───

function renderFooter(section: Section): string {
  const c = (section.content ?? {}) as unknown as FooterContent
  const s = section.settings_json as unknown as FooterSettings
  return `
<footer class="footer">
  ${s?.cover_media_value ? `<div class="footer__cover"><img src="${esc(s.cover_media_value)}" alt=""></div>` : ''}
  <div class="footer__inner">
    ${c.title    ? `<h2 class="footer__title">${esc(c.title)}</h2>` : ''}
    ${c.subtitle ? `<p class="footer__sub">${esc(c.subtitle)}</p>` : ''}
    <p class="footer__credit">Made with <a href="https://lands.app">Lands</a></p>
  </div>
</footer>`
}

// ─── Dispatcher ───

function renderSection(section: Section, theme: LandTheme): string {
  switch (section.type) {
    case 'header':        return renderHeader(section, theme)
    case 'content_media': return renderContentMedia(section)
    case 'list':          return renderList(section)
    case 'collection':    return renderCollection(section)
    case 'store':         return renderStore(section)
    case 'campaign':      return renderCampaign(section)
    case 'monetize':      return renderMonetize(section)
    case 'footer':        return renderFooter(section)
    default:              return ''
  }
}

// ─── Main ───

export function renderLand(land: Land): string {
  const sorted = sortByPosition(land.sections)
  const body   = sorted.map(s => renderSection(s, land.theme)).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(land.title || land.handle)}</title>
  ${land.description ? `<meta name="description" content="${esc(land.description)}">` : ''}
  <meta property="og:title" content="${esc(land.title || land.handle)}">
  ${land.description ? `<meta property="og:description" content="${esc(land.description)}">` : ''}
  <style>${buildCSS(land.theme)}</style>
</head>
<body>
${body}
</body>
</html>`
}
