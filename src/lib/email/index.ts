/**
 * Client-side email adapter factory.
 * NOTE: Email subscription is now handled server-side by the `subscribe` Supabase Edge Function.
 * This module is kept for potential local testing/preview use only.
 */
import type { CampaignIntegration } from '@/types/campaign'
import type { EmailAdapter } from './types'
import { MailchimpAdapter } from './adapters/mailchimp'
import { FlodeskAdapter } from './adapters/flodesk'
import { BrevoAdapter } from './adapters/brevo'
import { WebhookAdapter } from './adapters/webhook'

export type { EmailAdapter, EmailSubscribePayload } from './types'

export function createEmailAdapter(integration: CampaignIntegration): EmailAdapter | null {
  const { provider, config } = integration
  switch (provider) {
    case 'mailchimp': return new MailchimpAdapter(config.api_key ?? '', config.list_id ?? '')
    case 'flodesk':   return new FlodeskAdapter(config.api_key ?? '', config.list_id ?? '')
    case 'brevo':     return new BrevoAdapter(config.api_key ?? '', config.list_id ?? '')
    case 'webhook':
    case 'custom':    return new WebhookAdapter(config.webhook_url ?? '')
    default:          return null
  }
}
