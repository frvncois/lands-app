import { defineAsyncComponent } from 'vue'
import type { Component, FunctionalComponent } from 'vue'
import type { ThemePreset } from '@/types/theme'
import type { Section, SectionType } from '@/types/section'
import { SECTION_DEFAULTS } from '@/lib/primitives/sectionDefaults'
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

// Settings panels — sync imports (small, always needed in the editor)
import HeaderSettings from '@/components/editor/settings/HeaderSettings.vue'
import ContentMediaSettings from '@/components/editor/settings/ContentMediaSettings.vue'
import ListSettings from '@/components/editor/settings/ListSettings.vue'
import CollectionSettings from '@/components/editor/settings/CollectionSettings.vue'
import StoreSettings from '@/components/editor/settings/StoreSettings.vue'
import MonetizeSettings from '@/components/editor/settings/MonetizeSettings.vue'
import CampaignSettings from '@/components/editor/settings/CampaignSettings.vue'
import FooterSettings from '@/components/editor/settings/FooterSettings.vue'

// Variant components — async so each theme variant is a separate lazy chunk
const HeaderMinimal   = defineAsyncComponent(() => import('@/components/sections/header/HeaderMinimal.vue'))
const HeaderBaseline  = defineAsyncComponent(() => import('@/components/sections/header/HeaderBaseline.vue'))
const HeaderStructure = defineAsyncComponent(() => import('@/components/sections/header/HeaderStructure.vue'))

const ContentMediaMinimal   = defineAsyncComponent(() => import('@/components/sections/content-media/ContentMediaMinimal.vue'))
const ContentMediaBaseline  = defineAsyncComponent(() => import('@/components/sections/content-media/ContentMediaBaseline.vue'))
const ContentMediaStructure = defineAsyncComponent(() => import('@/components/sections/content-media/ContentMediaStructure.vue'))

const ListMinimal   = defineAsyncComponent(() => import('@/components/sections/list/ListMinimal.vue'))
const ListBaseline  = defineAsyncComponent(() => import('@/components/sections/list/ListBaseline.vue'))
const ListStructure = defineAsyncComponent(() => import('@/components/sections/list/ListStructure.vue'))

const CollectionMinimal   = defineAsyncComponent(() => import('@/components/sections/collection/CollectionMinimal.vue'))
const CollectionBaseline  = defineAsyncComponent(() => import('@/components/sections/collection/CollectionBaseline.vue'))
const CollectionStructure = defineAsyncComponent(() => import('@/components/sections/collection/CollectionStructure.vue'))

const StoreMinimal   = defineAsyncComponent(() => import('@/components/sections/store/StoreMinimal.vue'))
const StoreStructure = defineAsyncComponent(() => import('@/components/sections/store/StoreStructure.vue'))

const MonetizeMinimal   = defineAsyncComponent(() => import('@/components/sections/monetize/MonetizeMinimal.vue'))
const MonetizeBaseline  = defineAsyncComponent(() => import('@/components/sections/monetize/MonetizeBaseline.vue'))
const MonetizeStructure = defineAsyncComponent(() => import('@/components/sections/monetize/MonetizeStructure.vue'))

const CampaignMinimal   = defineAsyncComponent(() => import('@/components/sections/campaign/CampaignMinimal.vue'))
const CampaignBaseline  = defineAsyncComponent(() => import('@/components/sections/campaign/CampaignBaseline.vue'))
const CampaignStructure = defineAsyncComponent(() => import('@/components/sections/campaign/CampaignStructure.vue'))

const FooterMinimal   = defineAsyncComponent(() => import('@/components/sections/footer/FooterMinimal.vue'))
const FooterBaseline  = defineAsyncComponent(() => import('@/components/sections/footer/FooterBaseline.vue'))
const FooterStructure = defineAsyncComponent(() => import('@/components/sections/footer/FooterStructure.vue'))

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
  /** Settings panel component rendered in the editor sidebar. */
  settingsPanel: Component
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
    settingsPanel: HeaderSettings,
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
    settingsPanel: ContentMediaSettings,
    titleFrom: (s) => (s.type === 'content_media' ? s.content?.title ?? null : null),
  },

  list: {
    type: 'list',
    label: 'List',
    description: 'Links and external resources',
    icon: ListBulletIcon,
    defaults: SECTION_DEFAULTS.list,
    variants: { minimal: ListMinimal, baseline: ListBaseline, structure: ListStructure },
    settingsPanel: ListSettings,
    titleFrom: (s) => (s.type === 'list' ? s.content?.title ?? null : null),
  },

  collection: {
    type: 'collection',
    label: 'Collection',
    description: 'Curated groups of items',
    icon: RectangleStackIcon,
    defaults: SECTION_DEFAULTS.collection,
    variants: { minimal: CollectionMinimal, baseline: CollectionBaseline, structure: CollectionStructure },
    settingsPanel: CollectionSettings,
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
    settingsPanel: StoreSettings,
    titleFrom: (s) => (s.type === 'store' ? s.content?.stores?.[0]?.title ?? null : null),
  },

  monetize: {
    type: 'monetize',
    label: 'Monetize',
    description: 'Memberships and recurring revenue',
    icon: CreditCardIcon,
    defaults: SECTION_DEFAULTS.monetize,
    variants: { minimal: MonetizeMinimal, baseline: MonetizeBaseline, structure: MonetizeStructure },
    settingsPanel: MonetizeSettings,
    titleFrom: (s) => (s.type === 'monetize' ? s.content?.collections?.[0]?.title ?? null : null),
  },

  campaign: {
    type: 'campaign',
    label: 'Campaign',
    description: 'Call to action or newsletter',
    icon: MegaphoneIcon,
    defaults: SECTION_DEFAULTS.campaign,
    variants: { minimal: CampaignMinimal, baseline: CampaignBaseline, structure: CampaignStructure },
    settingsPanel: CampaignSettings,
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
    settingsPanel: FooterSettings,
    fixedPosition: 'last',
    titleFrom: () => null,
  },
}
