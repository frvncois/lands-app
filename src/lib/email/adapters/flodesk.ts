import type { EmailAdapter, EmailSubscribePayload } from '../types'

export class FlodeskAdapter implements EmailAdapter {
  constructor(
    private apiKey: string,
    private segmentId: string,
  ) {}

  async subscribe({ email, name }: EmailSubscribePayload): Promise<void> {
    // TODO: route through Supabase edge function /functions/v1/email-subscribe
    // with { provider: 'flodesk', api_key, audience_id, email, name }
    const [first_name, ...rest] = (name ?? '').split(' ')
    await fetch(`https://api.flodesk.com/v1/subscribers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        first_name: first_name || undefined,
        last_name: rest.join(' ') || undefined,
        segments: [{ id: this.segmentId }],
      }),
    })
  }
}
