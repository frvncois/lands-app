import { defineAsyncComponent } from 'vue'
import type { Component, FunctionalComponent } from 'vue'
import type { ThemePreset } from '@/features/theme/types'
import type { Section, SectionType } from '@/features/sections/types'
import { SECTION_DEFAULTS } from '@/features/sections/defaults'
import {
  UserCircleIcon,
  ListBulletIcon,
  DocumentTextIcon,
  MusicalNoteIcon,
  TicketIcon,
  ShoppingBagIcon,
  MegaphoneIcon,
  Bars3BottomLeftIcon,
  NewspaperIcon,
  InformationCircleIcon,
  VideoCameraIcon,
} from '@heroicons/vue/24/outline'

// Settings panels — lazy to avoid circular import:
// registry → settingsPanel → BaseLinkPicker → useSectionTree → sections/index → registry (TDZ)
const HeaderDefaultSettings  = defineAsyncComponent(() => import('@/features/editor/components/settings/header/HeaderDefaultSettings.vue'))
const HeaderMinimalSettings  = defineAsyncComponent(() => import('@/features/editor/components/settings/header/HeaderMinimalSettings.vue'))
const HeaderStructureSettings = defineAsyncComponent(() => import('@/features/editor/components/settings/header/HeaderStructureSettings.vue'))
const FooterDefaultSettings  = defineAsyncComponent(() => import('@/features/editor/components/settings/footer/FooterDefaultSettings.vue'))
const FooterMinimalSettings  = defineAsyncComponent(() => import('@/features/editor/components/settings/footer/FooterMinimalSettings.vue'))
const ContentMediaSettings   = defineAsyncComponent(() => import('@/features/editor/components/settings/ContentMediaSettings.vue'))
const LinksSettings          = defineAsyncComponent(() => import('@/features/editor/components/settings/LinksSettings.vue'))
const CollectionSettings     = defineAsyncComponent(() => import('@/features/editor/components/settings/CollectionSettings.vue'))
const StoreSettings          = defineAsyncComponent(() => import('@/features/editor/components/settings/StoreSettings.vue'))
const CampaignSettings       = defineAsyncComponent(() => import('@/features/editor/components/settings/CampaignSettings.vue'))

// Variant components — async so each theme variant is a separate lazy chunk
const HeaderMinimal   = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/header/HeaderMinimal.vue'))
const HeaderBaseline  = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/header/HeaderBaseline.vue'))
const HeaderStructure = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/header/HeaderStructure.vue'))

const ContentMediaMinimal   = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/content-media/ContentMediaMinimal.vue'))
const ContentMediaBaseline  = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/content-media/ContentMediaBaseline.vue'))
const ContentMediaStructure = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/content-media/ContentMediaStructure.vue'))

const LinksMinimal   = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/links/LinksMinimal.vue'))
const LinksBaseline  = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/links/LinksBaseline.vue'))
const LinksStructure = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/links/LinksStructure.vue'))

const CollectionMinimal   = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/collection/CollectionMinimal.vue'))
const CollectionBaseline  = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/collection/CollectionBaseline.vue'))
const CollectionStructure = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/collection/CollectionStructure.vue'))

const StoreMinimal   = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/store/StoreMinimal.vue'))
const StoreStructure = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/store/StoreStructure.vue'))

const CampaignMinimal   = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/campaign/CampaignMinimal.vue'))
const CampaignBaseline  = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/campaign/CampaignBaseline.vue'))
const CampaignStructure = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/campaign/CampaignStructure.vue'))

const FooterMinimal   = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/footer/FooterMinimal.vue'))
const FooterBaseline  = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/footer/FooterBaseline.vue'))
const FooterStructure = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/footer/FooterStructure.vue'))

// ─── Registry shape ───────────────────────────────────────────────────────────

export interface SectionDefinition {
  type: SectionType
  label: string
  description: string
  icon: FunctionalComponent
  defaults: {
    style_variant: string
    settings_json: Record<string, unknown>
    content: Record<string, unknown> | null
  }
  /** One renderer component per theme preset. Falls back to 'minimal' if the preset has no entry. */
  variants: Partial<Record<ThemePreset, Component>> & { minimal: Component }
  /**
   * Settings panel(s) for the editor sidebar.
   * 'default' is the fallback; per-preset keys override it (same resolution as `variants`).
   */
  settingsPanel: Partial<Record<ThemePreset, Component>> & { default: Component }
  plan?: { requires: 'free' | 'paid' }
  /** Only content_media can be added by the user post-seeding. */
  userAddable?: boolean
  /** Include this section type as a nav item in the header. */
  inHeaderNav?: boolean
  /** 'first' = header (always position 0), 'last' = footer (always last). */
  fixedPosition?: 'first' | 'last'
  /** Returns a subtitle label from the section's content, or null to use the static type label. */
  titleFrom?: (section: Section) => string | null
}

export const SECTION_REGISTRY: Record<SectionType, SectionDefinition> = {
  header: {
    type: 'header',
    label: 'Header',
    description: 'Name, bio and profile photo',
    icon: UserCircleIcon,
    defaults: SECTION_DEFAULTS.header,
    variants: { minimal: HeaderMinimal, baseline: HeaderBaseline, structure: HeaderStructure },
    settingsPanel: { minimal: HeaderMinimalSettings, baseline: HeaderMinimalSettings, structure: HeaderStructureSettings, default: HeaderDefaultSettings },
    fixedPosition: 'first',
    titleFrom: () => null,
  },

  content_media: {
    type: 'content_media',
    label: 'Content + Media',
    description: 'Text, buttons and an image or video',
    icon: NewspaperIcon,
    defaults: SECTION_DEFAULTS.content_media,
    variants: { minimal: ContentMediaMinimal, baseline: ContentMediaBaseline, structure: ContentMediaStructure },
    settingsPanel: { default: ContentMediaSettings },
    userAddable: true,
    titleFrom: (s) => (s.type === 'content_media' ? s.content?.title ?? null : null),
  },

  about: {
    type: 'about',
    label: 'About',
    description: 'Your story and background',
    icon: InformationCircleIcon,
    defaults: SECTION_DEFAULTS.about,
    variants: { minimal: ContentMediaMinimal, baseline: ContentMediaBaseline, structure: ContentMediaStructure },
    settingsPanel: { default: ContentMediaSettings },
    inHeaderNav: true,
    titleFrom: (s) => (s.type === 'about' ? s.content?.title ?? null : null),
  },

  links: {
    type: 'links',
    label: 'Links',
    description: 'Links and external resources',
    icon: ListBulletIcon,
    defaults: SECTION_DEFAULTS.links,
    variants: { minimal: LinksMinimal, baseline: LinksBaseline, structure: LinksStructure },
    settingsPanel: { default: LinksSettings },
    titleFrom: (s) => (s.type === 'links' ? s.content?.title ?? null : null),
  },

  post: {
    type: 'post',
    label: 'Post',
    description: 'Articles, essays and curated content',
    icon: DocumentTextIcon,
    defaults: SECTION_DEFAULTS.post,
    variants: { minimal: CollectionMinimal, baseline: CollectionBaseline, structure: CollectionStructure },
    settingsPanel: { default: CollectionSettings },
    inHeaderNav: true,
    titleFrom: (s) => (s.type === 'post' ? s.content?.collections?.[0]?.title ?? null : null),
  },

  releases: {
    type: 'releases',
    label: 'Releases',
    description: 'Albums, EPs and music releases',
    icon: MusicalNoteIcon,
    defaults: SECTION_DEFAULTS.releases,
    variants: { minimal: CollectionMinimal, baseline: CollectionBaseline, structure: CollectionStructure },
    settingsPanel: { default: CollectionSettings },
    inHeaderNav: true,
    titleFrom: (s) => (s.type === 'releases' ? s.content?.collections?.[0]?.title ?? null : null),
  },

  concert: {
    type: 'concert',
    label: 'Dates',
    description: 'Tour dates, events and shows',
    icon: TicketIcon,
    defaults: SECTION_DEFAULTS.concert,
    variants: { minimal: CollectionMinimal, baseline: CollectionBaseline, structure: CollectionStructure },
    settingsPanel: { default: CollectionSettings },
    inHeaderNav: true,
    titleFrom: (s) => (s.type === 'concert' ? s.content?.collections?.[0]?.title ?? null : null),
  },

  videos: {
    type: 'videos',
    label: 'Videos',
    description: 'Video gallery',
    icon: VideoCameraIcon,
    defaults: SECTION_DEFAULTS.videos,
    variants: { minimal: CollectionMinimal, baseline: CollectionBaseline, structure: CollectionStructure },
    settingsPanel: { default: CollectionSettings },
    inHeaderNav: true,
    titleFrom: (s) => (s.type === 'videos' ? s.content?.collections?.[0]?.title ?? null : null),
  },

  store: {
    type: 'store',
    label: 'Store',
    description: 'Sell products and digital goods',
    icon: ShoppingBagIcon,
    defaults: SECTION_DEFAULTS.store,
    // No baseline variant — falls back to minimal in SectionRenderer
    variants: { minimal: StoreMinimal, structure: StoreStructure },
    settingsPanel: { default: StoreSettings },
    inHeaderNav: true,
    titleFrom: (s) => (s.type === 'store' ? s.content?.stores?.[0]?.title ?? null : null),
  },

  campaign: {
    type: 'campaign',
    label: 'Campaign',
    description: 'Call to action or newsletter',
    icon: MegaphoneIcon,
    defaults: SECTION_DEFAULTS.campaign,
    variants: { minimal: CampaignMinimal, baseline: CampaignBaseline, structure: CampaignStructure },
    settingsPanel: { default: CampaignSettings },
    plan: { requires: 'paid' },
    titleFrom: () => null,
  },

  footer: {
    type: 'footer',
    label: 'Footer',
    description: 'Social links and closing info',
    icon: Bars3BottomLeftIcon,
    defaults: SECTION_DEFAULTS.footer,
    variants: { minimal: FooterMinimal, baseline: FooterBaseline, structure: FooterStructure },
    settingsPanel: { minimal: FooterMinimalSettings, baseline: FooterMinimalSettings, default: FooterDefaultSettings },
    fixedPosition: 'last',
    titleFrom: () => null,
  },
}
