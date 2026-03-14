export const CAMPAIGN_PROVIDER_TYPES = {
  mailchimp:  'mailchimp',
  mailerlite: 'mailerlite',
  kit:        'kit',
  flodesk:    'flodesk',
  brevo:      'brevo',
  webhook:    'webhook',
} as const

export type CampaignProviderType = typeof CAMPAIGN_PROVIDER_TYPES[keyof typeof CAMPAIGN_PROVIDER_TYPES]

export interface CampaignProviderMeta {
  id: CampaignProviderType
  label: string
  description: string
  fields: ('api_key' | 'audience_id' | 'webhook_url')[]
  audienceLabel?: string
}

export const CAMPAIGN_PROVIDERS: CampaignProviderMeta[] = [
  {
    id: 'mailchimp',
    label: 'Mailchimp',
    description: 'Sync subscribers with a Mailchimp audience',
    fields: ['api_key', 'audience_id'],
    audienceLabel: 'Audience ID',
  },
  {
    id: 'mailerlite',
    label: 'MailerLite',
    description: 'Add subscribers to a MailerLite group',
    fields: ['api_key', 'audience_id'],
    audienceLabel: 'Group ID',
  },
  {
    id: 'kit',
    label: 'Kit',
    description: 'Add subscribers to a Kit (ConvertKit) form',
    fields: ['api_key', 'audience_id'],
    audienceLabel: 'Form ID',
  },
  {
    id: 'flodesk',
    label: 'Flodesk',
    description: 'Add subscribers to a Flodesk segment',
    fields: ['api_key', 'audience_id'],
    audienceLabel: 'Segment ID',
  },
  {
    id: 'brevo',
    label: 'Brevo',
    description: 'Add contacts to a Brevo list',
    fields: ['api_key', 'audience_id'],
    audienceLabel: 'List ID',
  },
  {
    id: 'webhook',
    label: 'Webhook',
    description: 'POST subscriber data to your own endpoint',
    fields: ['webhook_url'],
  },
]

export interface CampaignConnection {
  provider: CampaignProviderType
  api_key: string
  audience_id: string
  webhook_url: string
}
