import type { EmailAdapter, EmailSubscribePayload } from '../types'

export class MailchimpAdapter implements EmailAdapter {
  constructor(
    private apiKey: string,
    private audienceId: string,
  ) {}

  async subscribe({ email, name }: EmailSubscribePayload): Promise<void> {
    // Mailchimp API requires a server-side proxy (CORS restriction).
    // TODO: route through Supabase edge function /functions/v1/email-subscribe
    // with { provider: 'mailchimp', api_key, audience_id, email, name }
    const dc = this.apiKey.split('-').pop()
    const [firstName, ...rest] = (name ?? '').split(' ')
    await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${this.audienceId}/members`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        merge_fields: name ? { FNAME: firstName, LNAME: rest.join(' ') } : undefined,
      }),
    })
  }
}
