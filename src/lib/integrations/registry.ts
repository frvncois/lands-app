/**
 * Integration Registry
 *
 * Central registry for all integrations. New integrations are added here.
 * The registry pattern makes it easy to add new integrations in the future.
 */

import type { IntegrationDefinition, IntegrationCategory } from './types'
import type { SectionType } from '@/types/sections'

// All available integrations
export const INTEGRATIONS: IntegrationDefinition[] = [
  // ============================================
  // EMAIL MARKETING
  // ============================================
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Grow your audience with email campaigns and automations.',
    category: 'email',
    authMethod: 'oauth',
    icon: 'mailchimp',
    docsUrl: 'https://mailchimp.com/developer/',
    boundTo: ['subscribe', 'contact'],
    status: 'available',
    oauth: {
      authUrl: 'https://login.mailchimp.com/oauth2/authorize',
      scopes: [],
    },
    settingsFields: [
      {
        key: 'listId',
        label: 'Audience',
        type: 'select',
        helpText: 'Select which audience to add subscribers to',
      },
    ],
  },
  {
    id: 'convertkit',
    name: 'ConvertKit',
    description: 'Email marketing for creators. Build your audience.',
    category: 'email',
    authMethod: 'api_key',
    icon: 'convertkit',
    docsUrl: 'https://developers.convertkit.com/',
    boundTo: ['subscribe', 'contact'],
    status: 'available',
    configFields: [
      {
        key: 'apiSecret',
        label: 'API Secret',
        type: 'password',
        placeholder: 'Enter your API Secret',
        required: true,
        helpText: 'Find this in ConvertKit Settings > Advanced > API',
      },
    ],
    settingsFields: [
      {
        key: 'formId',
        label: 'Form',
        type: 'select',
        helpText: 'Select which form to subscribe users to',
      },
    ],
  },
  {
    id: 'buttondown',
    name: 'Buttondown',
    description: 'Simple, powerful newsletter tool for writers.',
    category: 'email',
    authMethod: 'api_key',
    icon: 'buttondown',
    docsUrl: 'https://api.buttondown.email/',
    boundTo: ['subscribe', 'contact'],
    status: 'available',
    configFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter your API key',
        required: true,
        helpText: 'Find this in Buttondown Settings > API',
      },
    ],
  },
  {
    id: 'beehiiv',
    name: 'Beehiiv',
    description: 'The newsletter platform built for growth.',
    category: 'email',
    authMethod: 'api_key',
    icon: 'beehiiv',
    docsUrl: 'https://developers.beehiiv.com/',
    boundTo: ['subscribe', 'contact'],
    status: 'available',
    configFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter your API key',
        required: true,
      },
      {
        key: 'publicationId',
        label: 'Publication ID',
        type: 'text',
        placeholder: 'pub_xxxxx',
        required: true,
        helpText: 'Find this in your Beehiiv dashboard URL',
      },
    ],
  },

  // ============================================
  // PAYMENTS
  // ============================================
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments and sell products securely.',
    category: 'payment',
    authMethod: 'oauth',
    icon: 'stripe',
    docsUrl: 'https://stripe.com/docs',
    boundTo: ['products'],
    status: 'available',
    oauth: {
      authUrl: 'https://connect.stripe.com/oauth/authorize',
      scopes: ['read_write'],
    },
  },
  {
    id: 'lemonsqueezy',
    name: 'Lemon Squeezy',
    description: 'All-in-one platform for selling digital products.',
    category: 'payment',
    authMethod: 'api_key',
    icon: 'lemonsqueezy',
    docsUrl: 'https://docs.lemonsqueezy.com/',
    boundTo: ['products'],
    status: 'available',
    configFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter your API key',
        required: true,
        helpText: 'Find this in Lemon Squeezy Settings > API',
      },
    ],
    settingsFields: [
      {
        key: 'storeId',
        label: 'Store',
        type: 'select',
        helpText: 'Select which store to use',
      },
    ],
  },
  {
    id: 'gumroad',
    name: 'Gumroad',
    description: 'Sell digital products directly to your audience.',
    category: 'payment',
    authMethod: 'oauth',
    icon: 'gumroad',
    docsUrl: 'https://app.gumroad.com/api',
    boundTo: ['products'],
    status: 'available',
    oauth: {
      authUrl: 'https://gumroad.com/oauth/authorize',
      scopes: ['view_sales', 'mark_sales_as_shipped'],
    },
  },

  // ============================================
  // AUTOMATION
  // ============================================
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to thousands of apps and automate workflows.',
    category: 'automation',
    authMethod: 'webhook',
    icon: 'zapier',
    docsUrl: 'https://zapier.com/developer',
    boundTo: 'global',
    status: 'available',
    configFields: [
      {
        key: 'webhookUrl',
        label: 'Webhook URL',
        type: 'url',
        placeholder: 'https://hooks.zapier.com/...',
        required: true,
        helpText: 'Create a Zap with "Webhooks by Zapier" trigger to get this URL',
      },
    ],
  },
  {
    id: 'make',
    name: 'Make (Integromat)',
    description: 'Visual automation platform for complex workflows.',
    category: 'automation',
    authMethod: 'webhook',
    icon: 'make',
    docsUrl: 'https://www.make.com/en/help',
    boundTo: 'global',
    status: 'available',
    configFields: [
      {
        key: 'webhookUrl',
        label: 'Webhook URL',
        type: 'url',
        placeholder: 'https://hook.make.com/...',
        required: true,
        helpText: 'Create a scenario with a Webhook module to get this URL',
      },
    ],
  },
  {
    id: 'webhook',
    name: 'Custom Webhook',
    description: 'Send data to your own server endpoint.',
    category: 'automation',
    authMethod: 'webhook',
    icon: 'webhook',
    boundTo: 'global',
    status: 'available',
    configFields: [
      {
        key: 'url',
        label: 'Webhook URL',
        type: 'url',
        placeholder: 'https://your-server.com/webhook',
        required: true,
      },
      {
        key: 'secret',
        label: 'Signing Secret',
        type: 'password',
        placeholder: 'Optional secret for signature verification',
        required: false,
        helpText: 'We\'ll include a signature header for verification',
      },
    ],
  },

  // ============================================
  // ANALYTICS
  // ============================================
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    description: 'Track website traffic and user behavior.',
    category: 'analytics',
    authMethod: 'api_key',
    icon: 'google',
    docsUrl: 'https://developers.google.com/analytics',
    boundTo: 'global',
    status: 'available',
    configFields: [
      {
        key: 'measurementId',
        label: 'Measurement ID',
        type: 'text',
        placeholder: 'G-XXXXXXXXXX',
        required: true,
        helpText: 'Find this in GA4 Admin > Data Streams',
      },
    ],
  },
  {
    id: 'plausible',
    name: 'Plausible',
    description: 'Privacy-friendly Google Analytics alternative.',
    category: 'analytics',
    authMethod: 'api_key',
    icon: 'plausible',
    docsUrl: 'https://plausible.io/docs',
    boundTo: 'global',
    status: 'available',
    configFields: [
      {
        key: 'domain',
        label: 'Site Domain',
        type: 'text',
        placeholder: 'yourdomain.com',
        required: true,
        helpText: 'The domain you registered in Plausible',
      },
    ],
  },

  // ============================================
  // CALENDAR
  // ============================================
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Display events and enable booking from your calendar.',
    category: 'calendar',
    authMethod: 'oauth',
    icon: 'google-calendar',
    boundTo: ['accordion'],
    status: 'coming-soon',
    oauth: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    },
  },

  // ============================================
  // MUSIC & AUDIO
  // ============================================
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Embed tracks, albums, and playlists.',
    category: 'music',
    authMethod: 'api_key',
    icon: 'spotify',
    boundTo: ['cards', 'links', 'media-text'],
    status: 'available',
    configFields: [
      {
        key: 'embedUrl',
        label: 'Spotify URL',
        type: 'url',
        placeholder: 'https://open.spotify.com/...',
        required: true,
        helpText: 'Paste any Spotify track, album, or playlist URL',
      },
    ],
  },
  {
    id: 'apple_music',
    name: 'Apple Music',
    description: 'Embed songs and albums from Apple Music.',
    category: 'music',
    authMethod: 'api_key',
    icon: 'apple-music',
    boundTo: ['cards', 'links', 'media-text'],
    status: 'coming-soon',
    configFields: [
      {
        key: 'embedUrl',
        label: 'Apple Music URL',
        type: 'url',
        placeholder: 'https://music.apple.com/...',
        required: true,
      },
    ],
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    description: 'Embed tracks and sets from SoundCloud.',
    category: 'music',
    authMethod: 'api_key',
    icon: 'soundcloud',
    boundTo: ['cards', 'links', 'media-text'],
    status: 'available',
    configFields: [
      {
        key: 'embedUrl',
        label: 'SoundCloud URL',
        type: 'url',
        placeholder: 'https://soundcloud.com/...',
        required: true,
      },
    ],
  },
  {
    id: 'bandcamp',
    name: 'Bandcamp',
    description: 'Embed albums and tracks from Bandcamp.',
    category: 'music',
    authMethod: 'api_key',
    icon: 'bandcamp',
    boundTo: ['cards', 'links', 'media-text'],
    status: 'available',
    configFields: [
      {
        key: 'embedUrl',
        label: 'Bandcamp URL',
        type: 'url',
        placeholder: 'https://artist.bandcamp.com/...',
        required: true,
      },
    ],
  },

  // Additional EMAIL integrations
  {
    id: 'brevo',
    name: 'Brevo',
    description: 'Add contacts to your email lists (formerly Sendinblue).',
    category: 'email',
    authMethod: 'api_key',
    icon: 'brevo',
    boundTo: ['subscribe', 'contact'],
    status: 'available',
    configFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'xkeysib-...',
        required: true,
        helpText: 'Find this in Brevo > SMTP & API > API Keys',
      },
    ],
    settingsFields: [
      {
        key: 'listId',
        label: 'List',
        type: 'select',
        helpText: 'Select which list to add contacts to',
      },
    ],
  },
  {
    id: 'flodesk',
    name: 'Flodesk',
    description: 'Grow your subscriber list with beautiful emails.',
    category: 'email',
    authMethod: 'api_key',
    icon: 'flodesk',
    boundTo: ['subscribe', 'contact'],
    status: 'available',
    configFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter your API key',
        required: true,
        helpText: 'Find this in Flodesk > Settings > Integrations',
      },
    ],
  },

  // Additional PAYMENT integrations
  {
    id: 'stripe_express',
    name: 'Stripe Express',
    description: 'Accept payments with the fastest checkout experience.',
    category: 'payment',
    authMethod: 'oauth',
    icon: 'stripe',
    boundTo: ['products'],
    status: 'available',
    oauth: {
      authUrl: 'https://connect.stripe.com/express/oauth/authorize',
      scopes: ['read_write'],
    },
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync products and inventory from your store.',
    category: 'payment',
    authMethod: 'oauth',
    icon: 'shopify',
    boundTo: ['products'],
    status: 'coming-soon',
    oauth: {
      authUrl: '',
      scopes: [],
    },
  },
]

// Category metadata for UI
export const INTEGRATION_CATEGORIES: { id: IntegrationCategory; title: string; icon: string }[] = [
  { id: 'analytics', title: 'Analytics', icon: 'lni-stats-up' },
  { id: 'calendar', title: 'Calendar', icon: 'lni-calendar' },
  { id: 'payment', title: 'Payments & E-commerce', icon: 'lni-credit-cards' },
  { id: 'music', title: 'Music & Audio', icon: 'lni-music' },
  { id: 'email', title: 'Email Marketing', icon: 'lni-envelope' },
  { id: 'automation', title: 'Automation', icon: 'lni-bolt' },
]

// Get integration by ID
export function getIntegration(id: string): IntegrationDefinition | undefined {
  return INTEGRATIONS.find(i => i.id === id)
}

// Get integrations by category
export function getIntegrationsByCategory(category: IntegrationCategory): IntegrationDefinition[] {
  return INTEGRATIONS.filter(i => i.category === category)
}

// Get integrations by section type
export function getIntegrationsForSection(sectionType: SectionType): IntegrationDefinition[] {
  return INTEGRATIONS.filter(i =>
    i.boundTo === 'global' || (Array.isArray(i.boundTo) && i.boundTo.includes(sectionType))
  )
}

// Get all categories with their integrations
export function getIntegrationCategories(): { category: IntegrationCategory; label: string; integrations: IntegrationDefinition[] }[] {
  return INTEGRATION_CATEGORIES.map(c => ({
    category: c.id,
    label: c.title,
    integrations: getIntegrationsByCategory(c.id),
  }))
}

// Check if integration uses OAuth
export function isOAuthIntegration(id: string): boolean {
  const integration = getIntegration(id)
  return integration?.authMethod === 'oauth'
}

// Check if integration uses API key
export function isApiKeyIntegration(id: string): boolean {
  const integration = getIntegration(id)
  return integration?.authMethod === 'api_key'
}

// Check if integration uses webhook
export function isWebhookIntegration(id: string): boolean {
  const integration = getIntegration(id)
  return integration?.authMethod === 'webhook'
}
