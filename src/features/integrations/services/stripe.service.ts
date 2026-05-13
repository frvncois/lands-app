import { supabase } from '@/shared/lib/supabase'

const STRIPE_CLIENT_ID = import.meta.env.VITE_STRIPE_CLIENT_ID as string | undefined

async function extractError(error: unknown): Promise<string> {
  try {
    const e = error as { context?: Response; message?: string }
    if (e.context?.json) {
      const json = await e.context.json() as { error?: string; message?: string }
      return json?.error ?? json?.message ?? 'Unknown error'
    }
    return e.message ?? 'Unknown error'
  } catch {
    return (error as Error).message ?? 'Unknown error'
  }
}

export const stripeService = {
  /**
   * Returns the Stripe Connect OAuth URL to redirect the user to.
   * Requires VITE_STRIPE_CLIENT_ID to be set.
   */
  connectUrl(landId: string): string {
    if (!STRIPE_CLIENT_ID) throw new Error('VITE_STRIPE_CLIENT_ID is not configured')
    const redirectUri = encodeURIComponent(
      (import.meta.env.VITE_STRIPE_REDIRECT_URI as string | undefined) ?? `${window.location.origin}/auth/stripe/callback`,
    )
    return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=${redirectUri}&state=${landId}`
  },

  /**
   * Exchanges the OAuth code for a Stripe account ID via a Supabase Edge Function.
   * The edge function calls Stripe's token endpoint and saves stripe_account_id to profiles.
   */
  async handleCallback(code: string, landId: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('stripe-connect', { body: { code, landId } })
    if (error) throw new Error(await extractError(error))
    if (data?.error) throw new Error(data.error)
  },

  /**
   * Disconnects the Stripe account via a Supabase Edge Function,
   * which revokes the OAuth token and clears stripe_account_id on the profile.
   */
  async disconnect(landId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('stripe-disconnect', { body: { landId } })
    if (error) throw new Error(error.message)
  },

  async createSubscriptionCheckout(landId: string, billing: 'monthly' | 'yearly'): Promise<string> {
    const origin = window.location.origin
    const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
      body: {
        landId,
        billing,
        successUrl: `${origin}/plans/success?land_id=${landId}`,
        cancelUrl: `${origin}/dashboard`,
      },
    })
    if (error) throw new Error(await extractError(error))
    if (data?.error) throw new Error(data.error)
    if (!data?.url) throw new Error('No checkout URL returned')
    return data.url as string
  },

  async createBillingPortal(landId: string): Promise<string> {
    const origin = window.location.origin
    const { data, error } = await supabase.functions.invoke('create-billing-portal', {
      body: { landId, returnUrl: `${origin}/dashboard` },
    })
    if (error) throw new Error(await extractError(error))
    if (data?.error) throw new Error(data.error)
    if (!data?.url) throw new Error('No portal URL returned')
    return data.url as string
  },
}
