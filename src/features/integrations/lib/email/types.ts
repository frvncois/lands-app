export interface EmailSubscribePayload {
  email: string
  name?: string
}

export interface EmailAdapter {
  subscribe(payload: EmailSubscribePayload): Promise<void>
}
