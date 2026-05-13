import { defineAsyncComponent } from 'vue'
import type { Component, FunctionalComponent } from 'vue'
import type { ThemePreset } from '@/features/theme/types'
import type { Section, SectionType } from '@/features/sections/types'
import { SECTION_DEFAULTS } from '@/features/sections/defaults'
import {
  UserCircleIcon,
  ListBulletIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  MegaphoneIcon,
  Bars3BottomLeftIcon,
  NewspaperIcon,
} from '@heroicons/vue/24/outline'

// Settings panels — lazy to avoid circular import:
// registry → settingsPanel → BaseLinkPicker → useSectionTree → sections/index → registry (TDZ)
const HeaderDefaultSettings  = defineAsyncComponent(() => import('@/features/editor/components/settings/header/HeaderDefaultSettings.vue'))
const HeaderMinimalSettings  = defineAsyncComponent(() => import('@/features/editor/components/settings/header/HeaderMinimalSettings.vue'))
const HeaderStructureSettings = defineAsyncComponent(() => import('@/features/editor/components/settings/header/HeaderStructureSettings.vue'))
const FooterDefaultSettings  = defineAsyncComponent(() => import('@/features/editor/components/settings/footer/FooterDefaultSettings.vue'))
const FooterMinimalSettings  = defineAsyncComponent(() => import('@/features/editor/components/settings/footer/FooterMinimalSettings.vue'))
const ContentMediaSettings   = defineAsyncComponent(() => import('@/features/editor/components/settings/ContentMediaSettings.vue'))
const ListSettings           = defineAsyncComponent(() => import('@/features/editor/components/settings/ListSettings.vue'))
const CollectionSettings     = defineAsyncComponent(() => import('@/features/editor/components/settings/CollectionSettings.vue'))
const StoreSettings          = defineAsyncComponent(() => import('@/features/editor/components/settings/StoreSettings.vue'))
const MonetizeSettings       = defineAsyncComponent(() => import('@/features/editor/components/settings/MonetizeSettings.vue'))
const CampaignSettings       = defineAsyncComponent(() => import('@/features/editor/components/settings/CampaignSettings.vue'))

// Variant components — async so each theme variant is a separate lazy chunk
const HeaderMinimal   = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/header/HeaderMinimal.vue'))
const HeaderBaseline  = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/header/HeaderBaseline.vue'))
const HeaderStructure = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/header/HeaderStructure.vue'))

const ContentMediaMinimal   = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/content-media/ContentMediaMinimal.vue'))
const ContentMediaBaseline  = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/content-media/ContentMediaBaseline.vue'))
const ContentMediaStructure = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/content-media/ContentMediaStructure.vue'))

const ListMinimal   = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/list/ListMinimal.vue'))
const ListBaseline  = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/list/ListBaseline.vue'))
const ListStructure = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/list/ListStructure.vue'))

const CollectionMinimal   = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/collection/CollectionMinimal.vue'))
const CollectionBaseline  = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/collection/CollectionBaseline.vue'))
const CollectionStructure = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/collection/CollectionStructure.vue'))

const StoreMinimal   = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/store/StoreMinimal.vue'))
const StoreStructure = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/store/StoreStructure.vue'))

const MonetizeMinimal   = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/monetize/MonetizeMinimal.vue'))
const MonetizeBaseline  = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/monetize/MonetizeBaseline.vue'))
const MonetizeStructure = defineAsyncComponent(() => import('@/features/editor/components/sections/variants/monetize/MonetizeStructure.vue'))

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
    titleFrom: (s) => (s.type === 'content_media' ? s.content?.title ?? null : null),
  },

  list: {
    type: 'list',
    label: 'List',
    description: 'Links and external resources',
    icon: ListBulletIcon,
    defaults: SECTION_DEFAULTS.list,
    variants: { minimal: ListMinimal, baseline: ListBaseline, structure: ListStructure },
    settingsPanel: { default: ListSettings },
    titleFrom: (s) => (s.type === 'list' ? s.content?.title ?? null : null),
  },

  collection: {
    type: 'collection',
    label: 'Collection',
    description: 'Curated groups of items',
    icon: RectangleStackIcon,
    defaults: SECTION_DEFAULTS.collection,
    variants: { minimal: CollectionMinimal, baseline: CollectionBaseline, structure: CollectionStructure },
    settingsPanel: { default: CollectionSettings },
    titleFrom: (s) => (s.type === 'collection' ? s.content?.collections?.[0]?.title ?? null : null),
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
    titleFrom: (s) => (s.type === 'store' ? s.content?.stores?.[0]?.title ?? null : null),
  },

  monetize: {
    type: 'monetize',
    label: 'Monetize',
    description: 'Memberships and recurring revenue',
    icon: CreditCardIcon,
    defaults: SECTION_DEFAULTS.monetize,
    variants: { minimal: MonetizeMinimal, baseline: MonetizeBaseline, structure: MonetizeStructure },
    settingsPanel: { default: MonetizeSettings },
    titleFrom: (s) => (s.type === 'monetize' ? s.content?.collections?.[0]?.title ?? null : null),
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
