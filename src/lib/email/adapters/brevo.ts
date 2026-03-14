import type { EmailAdapter, EmailSubscribePayload } from '../types'

export class BrevoAdapter implements EmailAdapter {
  constructor(
    private apiKey: string,
    private listId: string,
  ) {}

  async subscribe({ email, name }: EmailSubscribePayload): Promise<void> {
    // TODO: route through Supabase edge function /functions/v1/email-subscribe
    // with { provider: 'brevo', api_key, audience_id, email, name }
    const [firstName, ...rest] = (name ?? '').split(' ')
    await fetch(`https://api.brevo.com/v3/contacts`, {
      method: 'POST',
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes: name ? { FIRSTNAME: firstName, LASTNAME: rest.join(' ') } : undefined,
        listIds: [Number(this.listId)],
        updateEnabled: true,
      }),
    })
  }
}
