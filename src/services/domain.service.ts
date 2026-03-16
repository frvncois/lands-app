import { supabase } from '@/lib/supabase'

export type DomainStatus = 'pending' | 'active' | 'error'

export const domainService = {
  async connect(landId: string, domain: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('manage-domain', {
      body: { action: 'connect', landId, domain },
    })
    if (error) {
      let message = error.message
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body = await (error as any).context?.json?.()
        if (body?.error) message = body.error
      } catch { /* ignore */ }
      throw new Error(message)
    }
    if (data?.error) throw new Error(data.error)
  },

  async disconnect(landId: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('manage-domain', {
      body: { action: 'disconnect', landId },
    })
    if (error) {
      let message = error.message
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body = await (error as any).context?.json?.()
        if (body?.error) message = body.error
      } catch { /* ignore */ }
      throw new Error(message)
    }
    if (data?.error) throw new Error(data.error)
  },

  async verify(landId: string): Promise<{ status: DomainStatus }> {
    const { data, error } = await supabase.functions.invoke('verify-domain', {
      body: { landId },
    })
    if (error) {
      let message = error.message
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body = await (error as any).context?.json?.()
        if (body?.error) message = body.error
      } catch { /* ignore */ }
      throw new Error(message)
    }
    if (data?.error) throw new Error(data.error)
    return { status: data.status as DomainStatus }
  },
}
