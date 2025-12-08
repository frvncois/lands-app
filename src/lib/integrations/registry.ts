/**
 * Integration Registry
 *
 * Central registry for all integrations. New integrations are added here.
 * The registry pattern makes it easy to add new integrations in the future.
 */

import type { IntegrationDefinition, IntegrationCategory } from './types'

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
]

// Get integration by ID
export function getIntegration(id: string): IntegrationDefinition | undefined {
  return INTEGRATIONS.find(i => i.id === id)
}

// Get integrations by category
export function getIntegrationsByCategory(category: IntegrationCategory): IntegrationDefinition[] {
  return INTEGRATIONS.filter(i => i.category === category)
}

// Get all categories with their integrations
export function getIntegrationCategories(): { category: IntegrationCategory; label: string; integrations: IntegrationDefinition[] }[] {
  const categories: { category: IntegrationCategory; label: string }[] = [
    { category: 'email', label: 'Email Marketing' },
    { category: 'payment', label: 'Payments' },
    { category: 'automation', label: 'Automation' },
    { category: 'analytics', label: 'Analytics' },
  ]

  return categories.map(c => ({
    ...c,
    integrations: getIntegrationsByCategory(c.category),
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
