// ─── Provider types ───────────────────────────────────────────────────────────

export type CampaignProviderType = 'brevo' | 'flodesk' | 'webhook' | 'custom' | 'mailchimp'

export interface CampaignProviderField {
  key: keyof CampaignConfig
  label: string
  placeholder: string
  type: 'text' | 'password' | 'url'
  required: boolean
  hint?: string
}

export interface CampaignProviderMeta {
  id: CampaignProviderType
  label: string
  description: string
  color: string   // Tailwind bg class for the icon badge
  letter: string  // Initial shown in the icon badge
  fields: CampaignProviderField[]
  instructions: { text: string; url?: string }[]
  comingSoon?: boolean
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface CampaignConfig {
  api_key?: string
  list_id?: string
  webhook_url?: string
  headers?: Record<string, string>
}

export interface CampaignIntegration {
  provider: CampaignProviderType
  config: CampaignConfig
}

// ─── Providers registry ───────────────────────────────────────────────────────

export const CAMPAIGN_PROVIDERS: CampaignProviderMeta[] = [
  {
    id: 'brevo',
    label: 'Brevo',
    description: 'Add subscribers to a Brevo contact list',
    color: 'bg-blue-100 text-blue-600',
    letter: 'B',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        placeholder: 'xkeysib-...',
        type: 'password',
        required: true,
        hint: 'Starts with xkeysib-',
      },
      {
        key: 'list_id',
        label: 'List ID',
        placeholder: '12',
        type: 'text',
        required: false,
        hint: 'Optional — subscribers are added to the list with this ID',
      },
    ],
    instructions: [
      { text: 'Log in to your Brevo account', url: 'https://app.brevo.com' },
      { text: 'Go to your name → SMTP & API → API Keys tab' },
      { text: 'Click "Create a new API key", name it Lands, then copy the key' },
      { text: 'Optional: go to Contacts → Lists to find the ID of the list you want to use' },
    ],
  },
  {
    id: 'flodesk',
    label: 'Flodesk',
    description: 'Add subscribers to a Flodesk segment',
    color: 'bg-rose-100 text-rose-600',
    letter: 'F',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        placeholder: 'fdk_...',
        type: 'password',
        required: true,
      },
      {
        key: 'list_id',
        label: 'Segment ID',
        placeholder: 'abc123',
        type: 'text',
        required: false,
        hint: 'Optional — subscribers are added to this segment',
      },
    ],
    instructions: [
      { text: 'Log in to your Flodesk account', url: 'https://app.flodesk.com' },
      { text: 'Click your name in the top-right → Account → API' },
      { text: 'Click "Generate API Key" and copy it' },
      { text: 'Optional: go to Audience → Segments to find the segment ID you want' },
    ],
  },
  {
    id: 'webhook',
    label: 'Webhook',
    description: 'POST subscriber data to your own endpoint',
    color: 'bg-gray-100 text-gray-600',
    letter: '↗',
    fields: [
      {
        key: 'webhook_url',
        label: 'Endpoint URL',
        placeholder: 'https://your-app.com/subscribe',
        type: 'url',
        required: true,
        hint: 'Receives a POST request with { email, name } as JSON',
      },
    ],
    instructions: [
      { text: 'Provide a URL that accepts POST requests with a JSON body containing email and name fields' },
      { text: 'Your endpoint should return a 2xx status code on success' },
    ],
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Any URL with optional auth headers',
    color: 'bg-purple-100 text-purple-600',
    letter: 'C',
    fields: [
      {
        key: 'webhook_url',
        label: 'Endpoint URL',
        placeholder: 'https://your-app.com/subscribe',
        type: 'url',
        required: true,
      },
    ],
    instructions: [
      { text: 'Enter the URL of your endpoint. It will receive a POST with { email, name } as JSON' },
      { text: 'Add any authentication headers below (e.g. Authorization: Bearer your-token)' },
    ],
  },
  {
    id: 'mailchimp',
    label: 'Mailchimp',
    description: 'Sync subscribers with a Mailchimp audience',
    color: 'bg-yellow-100 text-yellow-600',
    letter: 'M',
    fields: [],
    instructions: [],
    comingSoon: true,
  },
]

// Legacy compat — kept for any code still referencing CAMPAIGN_PROVIDER_TYPES
export const CAMPAIGN_PROVIDER_TYPES = {
  brevo: 'brevo',
  flodesk: 'flodesk',
  webhook: 'webhook',
  custom: 'custom',
  mailchimp: 'mailchimp',
} as const

// Legacy interface — still used in old campaign store refs
export interface CampaignConnection {
  provider: CampaignProviderType
  api_key: string
  audience_id: string
  webhook_url: string
}
