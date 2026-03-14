import type { CampaignConnection } from '@/types/campaign'
import type { EmailAdapter } from './types'
import { MailchimpAdapter } from './adapters/mailchimp'
import { MailerLiteAdapter } from './adapters/mailerlite'
import { KitAdapter } from './adapters/kit'
import { FlodeskAdapter } from './adapters/flodesk'
import { BrevoAdapter } from './adapters/brevo'
import { WebhookAdapter } from './adapters/webhook'

export type { EmailAdapter, EmailSubscribePayload } from './types'

export function createEmailAdapter(connection: CampaignConnection): EmailAdapter {
  switch (connection.provider) {
    case 'mailchimp':  return new MailchimpAdapter(connection.api_key, connection.audience_id)
    case 'mailerlite': return new MailerLiteAdapter(connection.api_key, connection.audience_id)
    case 'kit':        return new KitAdapter(connection.api_key, connection.audience_id)
    case 'flodesk':    return new FlodeskAdapter(connection.api_key, connection.audience_id)
    case 'brevo':      return new BrevoAdapter(connection.api_key, connection.audience_id)
    case 'webhook':    return new WebhookAdapter(connection.webhook_url)
  }
}
