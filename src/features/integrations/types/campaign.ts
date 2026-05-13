// ─── Provider types ───────────────────────────────────────────────────────────

export type CampaignProviderType = 'brevo' | 'flodesk' | 'kit' | 'loops' | 'resend' | 'mailchimp' | 'webhook' | 'custom'

export interface CampaignProviderMeta {
  id: CampaignProviderType
  label: string
  description: string
  color: string   // Tailwind bg class for the icon badge
  letter: string  // Initial shown in the icon badge
  /** Label for the list concept (e.g. "Form", "Audience"). If set, a list picker is shown after key entry. */
  listLabel?: string
  /** If true the user must pick a list before connecting. */
  listRequired?: boolean
  instructions: { text: string; url?: string }[]
  comingSoon?: boolean
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface CampaignConfig {
  api_key?: string
  list_id?: string
  list_name?: string  // human-readable name of the selected list, stored for display
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
    id: 'kit',
    label: 'Kit',
    description: 'Grow your audience with Kit forms',
    color: 'bg-orange-100 text-orange-600',
    letter: 'K',
    listLabel: 'Form',
    listRequired: true,
    instructions: [
      { text: 'Log in to your Kit account', url: 'https://app.kit.com' },
      { text: 'Go to Settings → Developer → API Secret' },
      { text: 'Copy your API Secret (not the public API key)' },
    ],
  },
  {
    id: 'loops',
    label: 'Loops',
    description: 'Add contacts to your Loops audience',
    color: 'bg-violet-100 text-violet-600',
    letter: 'L',
    listLabel: 'Mailing list',
    listRequired: false,
    instructions: [
      { text: 'Log in to your Loops account', url: 'https://app.loops.so' },
      { text: 'Go to Settings → API Keys' },
      { text: 'Create a new key, name it Lands, and copy it' },
    ],
  },
  {
    id: 'brevo',
    label: 'Brevo',
    description: 'Add subscribers to a Brevo contact list',
    color: 'bg-blue-100 text-blue-600',
    letter: 'B',
    listLabel: 'List',
    listRequired: false,
    instructions: [
      { text: 'Log in to your Brevo account', url: 'https://app.brevo.com' },
      { text: 'Go to your name → SMTP & API → API Keys tab' },
      { text: 'Click "Create a new API key", name it Lands, then copy the key' },
    ],
  },
  {
    id: 'flodesk',
    label: 'Flodesk',
    description: 'Add subscribers to a Flodesk segment',
    color: 'bg-rose-100 text-rose-600',
    letter: 'F',
    listLabel: 'Segment',
    listRequired: false,
    instructions: [
      { text: 'Log in to your Flodesk account', url: 'https://app.flodesk.com' },
      { text: 'Click your name in the top-right → Account → API' },
      { text: 'Click "Generate API Key" and copy it' },
    ],
  },
  {
    id: 'resend',
    label: 'Resend',
    description: 'Collect contacts into a Resend audience',
    color: 'bg-black text-white',
    letter: 'R',
    listLabel: 'Audience',
    listRequired: true,
    instructions: [
      { text: 'Log in to your Resend account', url: 'https://resend.com' },
      { text: 'Go to API Keys and create a new key with full access' },
      { text: 'Copy the key — you won\'t be able to see it again' },
    ],
  },
  {
    id: 'mailchimp',
    label: 'Mailchimp',
    description: 'Sync subscribers with a Mailchimp audience',
    color: 'bg-yellow-100 text-yellow-700',
    letter: 'M',
    listLabel: 'Audience',
    listRequired: true,
    instructions: [
      { text: 'Log in to your Mailchimp account', url: 'https://mailchimp.com' },
      { text: 'Go to Profile → Extras → API keys' },
      { text: 'Click "Create A Key", name it Lands, and copy it' },
    ],
  },
  {
    id: 'webhook',
    label: 'Webhook',
    description: 'POST subscriber data to your own endpoint',
    color: 'bg-gray-100 text-gray-600',
    letter: '↗',
    instructions: [
      { text: 'Provide a URL that accepts POST requests with { email, name } as JSON' },
      { text: 'Your endpoint should return a 2xx status code on success' },
    ],
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Any URL with optional auth headers',
    color: 'bg-purple-100 text-purple-600',
    letter: 'C',
    instructions: [
      { text: 'Enter the URL of your endpoint. It will receive a POST with { email, name } as JSON' },
      { text: 'Add any authentication headers below (e.g. Authorization: Bearer your-token)' },
    ],
  },
]

