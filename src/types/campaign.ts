export const CAMPAIGN_PROVIDER_TYPES = {
  mailchimp:     'mailchimp',
  flodesk:       'flodesk',
  convertkit:    'convertkit',
  custom_api:    'custom_api',
  custom_script: 'custom_script',
} as const

export type CampaignProviderType = typeof CAMPAIGN_PROVIDER_TYPES[keyof typeof CAMPAIGN_PROVIDER_TYPES]

export interface CampaignProviderMeta {
  id: CampaignProviderType
  label: string
  description: string
  fields: ('api_key' | 'audience_id' | 'script')[]
}

export const CAMPAIGN_PROVIDERS: CampaignProviderMeta[] = [
  {
    id: 'mailchimp',
    label: 'Mailchimp',
    description: 'Connect your Mailchimp audience',
    fields: ['api_key', 'audience_id'],
  },
  {
    id: 'flodesk',
    label: 'Flodesk',
    description: 'Connect your Flodesk form',
    fields: ['api_key'],
  },
  {
    id: 'convertkit',
    label: 'ConvertKit',
    description: 'Connect your ConvertKit form',
    fields: ['api_key', 'audience_id'],
  },
  {
    id: 'custom_api',
    label: 'Custom API',
    description: 'Use your own endpoint to receive emails',
    fields: ['api_key'],
  },
  {
    id: 'custom_script',
    label: 'Custom Script',
    description: 'Embed a custom script or form',
    fields: ['script'],
  },
]

export interface CampaignConnection {
  provider: CampaignProviderType
  api_key: string
  audience_id: string
  script: string
}
