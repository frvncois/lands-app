import type { EmailAdapter, EmailSubscribePayload } from '../types'

export class KitAdapter implements EmailAdapter {
  constructor(
    private apiKey: string,
    private formId: string,
  ) {}

  async subscribe({ email, name }: EmailSubscribePayload): Promise<void> {
    // TODO: route through Supabase edge function /functions/v1/email-subscribe
    // with { provider: 'kit', api_key, audience_id, email, name }
    await fetch(`https://api.kit.com/v4/forms/${this.formId}/subscribers`, {
      method: 'POST',
      headers: {
        'X-Kit-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_address: email, first_name: name }),
    })
  }
}
