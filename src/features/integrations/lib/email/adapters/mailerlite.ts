import type { EmailAdapter, EmailSubscribePayload } from '../types'

export class MailerLiteAdapter implements EmailAdapter {
  constructor(
    private apiKey: string,
    private groupId: string,
  ) {}

  async subscribe({ email, name }: EmailSubscribePayload): Promise<void> {
    // TODO: route through Supabase edge function /functions/v1/email-subscribe
    // with { provider: 'mailerlite', api_key, audience_id, email, name }
    await fetch(`https://connect.mailerlite.com/api/subscribers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        fields: name ? { name } : undefined,
        groups: [this.groupId],
      }),
    })
  }
}
