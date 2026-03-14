import type { EmailAdapter, EmailSubscribePayload } from '../types'

export class WebhookAdapter implements EmailAdapter {
  constructor(private webhookUrl: string) {}

  async subscribe(payload: EmailSubscribePayload): Promise<void> {
    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }
}
