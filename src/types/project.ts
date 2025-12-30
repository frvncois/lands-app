/**
 * PROJECT TYPES
 *
 * Clean, consolidated project type definitions.
 */

import type { SectionInstance } from '@/types/sections'

// ============================================
// PAGE CONTENT
// ============================================

/** SEO and metadata for a page */
export interface PageMeta {
  title: string
  description: string
  ogImage?: string
  favicon?: string
}

/** Translation settings */
export interface TranslationSettings {
  defaultLanguage: string
  languages: string[]
}

/** Translated content for a section (only text and image fields) */
export type TranslatedSectionData = Record<string, unknown>

/** Translations map: language code -> section id -> field data */
export type TranslationsMap = Record<string, Record<string, TranslatedSectionData>>

/** The content of a page - what the editor manipulates */
export interface PageContent {
  themeId: string
  sections: SectionInstance[]
  meta: PageMeta
  /** Translation settings (optional) */
  translation?: TranslationSettings
  /** Translated content per language */
  translations?: TranslationsMap
}

// ============================================
// PROJECT
// ============================================

export type ProjectPlan = 'free' | 'pro' | 'business'

export interface Project {
  id: string
  userId: string
  title: string
  slug: string
  description?: string
  thumbnail?: string
  isPublished: boolean
  publishedUrl?: string
  customDomain?: string
  plan: ProjectPlan
  createdAt: string
  updatedAt: string
}

// ============================================
// PLANS & FEATURES
// ============================================

export type PlanFeature =
  | 'landsDomain'
  | 'customDomain'
  | 'noWatermark'
  | 'analytics'
  | 'integrations'
  | 'collaborators'
  | 'customFonts'
  | 'customCode'

export interface PlanDefinition {
  id: ProjectPlan
  name: string
  price: number
  description: string
  features: Record<PlanFeature, boolean>
  featureLabels: string[]
}

export const PLAN_DEFINITIONS: Record<ProjectPlan, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Get started with the basics',
    features: {
      landsDomain: true,
      customDomain: false,
      noWatermark: false,
      analytics: false,
      integrations: false,
      collaborators: false,
      customFonts: false,
      customCode: false,
    },
    featureLabels: [
      'Lands subdomain (yoursite.lands.app)',
      'Unlimited pages',
      'Basic editor features',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 6,
    description: 'Everything you need to grow',
    features: {
      landsDomain: true,
      customDomain: true,
      noWatermark: true,
      analytics: true,
      integrations: true,
      collaborators: true,
      customFonts: true,
      customCode: true,
    },
    featureLabels: [
      'Custom domain support',
      'No Lands watermark',
      'Full analytics dashboard',
      'All integrations (email, payments, etc.)',
      'Team collaboration',
      'Priority support',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 15,
    description: 'For teams and agencies',
    features: {
      landsDomain: true,
      customDomain: true,
      noWatermark: true,
      analytics: true,
      integrations: true,
      collaborators: true,
      customFonts: true,
      customCode: true,
    },
    featureLabels: [
      'Everything in Pro',
      'Unlimited team members',
      'White label option',
      'API access',
      'Dedicated support',
    ],
  },
}

export function planHasFeature(plan: ProjectPlan, feature: PlanFeature): boolean {
  return PLAN_DEFINITIONS[plan]?.features[feature] ?? false
}

export function getPlanDefinition(plan: ProjectPlan): PlanDefinition {
  return PLAN_DEFINITIONS[plan]
}

// ============================================
// COLLABORATORS
// ============================================

export type CollaboratorRole = 'admin' | 'editor'
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface Collaborator {
  id: string
  projectId: string
  userId: string
  email: string
  name?: string
  avatar?: string
  role: CollaboratorRole
  joinedAt: string
}

export interface CollaboratorInvite {
  id: string
  projectId: string
  email: string
  role: CollaboratorRole
  status: InviteStatus
  token: string
  invitedBy: string
  invitedByName?: string
  createdAt: string
  expiresAt: string
}

export const COLLABORATOR_ROLE_INFO: Record<CollaboratorRole, { label: string; description: string }> = {
  admin: {
    label: 'Admin',
    description: 'Can edit content, manage settings, and invite other collaborators',
  },
  editor: {
    label: 'Editor',
    description: 'Can edit content and preview, but cannot change settings or invite others',
  },
}

// ============================================
// INTEGRATIONS
// ============================================

export type IntegrationType = 'email' | 'payment' | 'other'

export type IntegrationProvider =
  | 'mailchimp'
  | 'convertkit'
  | 'buttondown'
  | 'stripe'
  | 'gumroad'
  | 'lemonsqueezy'
  | 'zapier'
  | 'webhook'

export interface ProjectIntegration {
  id: string
  projectId: string
  provider: IntegrationProvider
  config: Record<string, string>
  isConnected: boolean
  createdAt: string
  updatedAt: string
}

export interface IntegrationConfigField {
  key: string
  label: string
  type: 'text' | 'password' | 'url'
  placeholder: string
  required: boolean
  helpText?: string
}

export interface IntegrationDefinition {
  id: IntegrationProvider
  name: string
  description: string
  category: IntegrationType
  configFields: IntegrationConfigField[]
}

export const INTEGRATION_DEFINITIONS: IntegrationDefinition[] = [
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Collect emails and manage your mailing list with Mailchimp.',
    category: 'email',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your API key', required: true },
      { key: 'listId', label: 'List ID', type: 'text', placeholder: 'Enter list ID', required: false, helpText: 'Leave empty to use default list' },
    ],
  },
  {
    id: 'convertkit',
    name: 'ConvertKit',
    description: 'Email marketing for creators. Build your audience.',
    category: 'email',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your API key', required: true },
      { key: 'formId', label: 'Form ID', type: 'text', placeholder: 'Enter form ID', required: false },
    ],
  },
  {
    id: 'buttondown',
    name: 'Buttondown',
    description: 'Simple, powerful newsletter tool for independent writers.',
    category: 'email',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your API key', required: true },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments and sell products with Stripe.',
    category: 'payment',
    configFields: [
      { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_live_...', required: true },
      { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...', required: true },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'whsec_...', required: false, helpText: 'Required for handling webhooks' },
    ],
  },
  {
    id: 'gumroad',
    name: 'Gumroad',
    description: 'Sell digital products directly to your audience.',
    category: 'payment',
    configFields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Enter your access token', required: true },
    ],
  },
  {
    id: 'lemonsqueezy',
    name: 'Lemon Squeezy',
    description: 'All-in-one platform for selling digital products.',
    category: 'payment',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your API key', required: true },
      { key: 'storeId', label: 'Store ID', type: 'text', placeholder: 'Enter store ID', required: true },
    ],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect your site to thousands of apps and automate workflows.',
    category: 'other',
    configFields: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://hooks.zapier.com/...', required: true },
    ],
  },
  {
    id: 'webhook',
    name: 'Custom Webhook',
    description: 'Send data to your own server with custom webhooks.',
    category: 'other',
    configFields: [
      { key: 'url', label: 'Webhook URL', type: 'url', placeholder: 'https://your-server.com/webhook', required: true },
      { key: 'secret', label: 'Secret Key', type: 'password', placeholder: 'Optional signing secret', required: false, helpText: 'Used to sign webhook payloads' },
    ],
  },
]

export function getIntegrationDefinition(provider: IntegrationProvider): IntegrationDefinition | undefined {
  return INTEGRATION_DEFINITIONS.find(d => d.id === provider)
}

export function getIntegrationsByCategory(category: IntegrationType): IntegrationDefinition[] {
  return INTEGRATION_DEFINITIONS.filter(d => d.category === category)
}

// ============================================
// PROJECT SETTINGS
// ============================================

export interface SEOSettings {
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
  favicon?: string
  keywords?: string
}

export interface AnalyticsSettings {
  enabled: boolean
  umamiSiteId?: string
  umamiEnabled?: boolean
  customHeadCode?: string
  googleAnalyticsId?: string
}

export interface PublishSettings {
  isPublished: boolean
  publishedAt?: string
  visibility: 'public' | 'private' | 'password'
  password?: string
}

export interface DomainSettings {
  subdomain: string
  customDomain?: string
  customDomainVerified: boolean
}

export interface ProjectSettings {
  id: string
  title: string
  slug: string
  description?: string
  createdAt: string
  updatedAt: string
  seo: SEOSettings
  analytics: AnalyticsSettings
  publish: PublishSettings
  domain: DomainSettings
  plan: ProjectPlan
}

export function getDefaultProjectSettings(): ProjectSettings {
  return {
    id: '',
    title: 'Untitled Project',
    slug: 'untitled-project',
    description: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seo: {
      metaTitle: '',
      metaDescription: '',
      ogImage: '',
      favicon: '',
      keywords: '',
    },
    analytics: {
      enabled: true,
      umamiSiteId: '',
      umamiEnabled: false,
      customHeadCode: '',
    },
    publish: {
      isPublished: false,
      visibility: 'public',
    },
    domain: {
      subdomain: 'untitled-project',
      customDomain: '',
      customDomainVerified: false,
    },
    plan: 'free',
  }
}

// ============================================
// DEFAULTS
// ============================================

export function createDefaultPageMeta(): PageMeta {
  return {
    title: '',
    description: '',
  }
}

export function createDefaultPageContent(): PageContent {
  return {
    themeId: 'modern',
    sections: [],
    meta: createDefaultPageMeta(),
  }
}
