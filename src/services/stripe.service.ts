import { supabase } from '@/lib/supabase'

const STRIPE_CLIENT_ID = import.meta.env.VITE_STRIPE_CLIENT_ID as string | undefined

export const stripeService = {
  /**
   * Returns the Stripe Connect OAuth URL to redirect the user to.
   * Requires VITE_STRIPE_CLIENT_ID to be set.
   */
  connectUrl(landId: string): string {
    if (!STRIPE_CLIENT_ID) throw new Error('VITE_STRIPE_CLIENT_ID is not configured')
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/stripe/callback`)
    return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=${redirectUri}&state=${landId}`
  },

  /**
   * Exchanges the OAuth code for a Stripe account ID via a Supabase Edge Function.
   * The edge function calls Stripe's token endpoint and saves stripe_account_id to profiles.
   */
  async handleCallback(code: string, landId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('stripe-connect', { body: { code, landId } })
    if (error) throw new Error(error.message)
  },

  /**
   * Disconnects the Stripe account via a Supabase Edge Function,
   * which revokes the OAuth token and clears stripe_account_id on the profile.
   */
  async disconnect(landId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('stripe-disconnect', { body: { landId } })
    if (error) throw new Error(error.message)
  },
}
