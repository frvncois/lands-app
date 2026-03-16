import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts = sigHeader.split(',').reduce((acc: Record<string, string>, part) => {
    const [k, v] = part.split('=')
    acc[k] = v
    return acc
  }, {})

  const timestamp = parts['t']
  const expectedSig = parts['v1']
  if (!timestamp || !expectedSig) return false

  // Reject events older than 5 minutes
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false

  const signedPayload = `${timestamp}.${payload}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
  const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return computed === expectedSig
}

serve(async (req) => {
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!webhookSecret) {
    return new Response('STRIPE_WEBHOOK_SECRET not configured', { status: 500 })
  }

  const sigHeader = req.headers.get('stripe-signature')
  if (!sigHeader) return new Response('Missing stripe-signature', { status: 400 })

  const body = await req.text()

  const valid = await verifyStripeSignature(body, sigHeader, webhookSecret)
  if (!valid) return new Response('Invalid signature', { status: 400 })

  const event = JSON.parse(body)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // ── Subscription created via Checkout ──
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    if (session.mode !== 'subscription') return new Response(JSON.stringify({ received: true }), { status: 200 })

    const landId = session.client_reference_id
    const subscriptionId = session.subscription
    const customerId = session.customer

    if (landId) {
      await supabase.from('lands').update({
        plan: 'paid',
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId,
      }).eq('id', landId)
    }
  }

  // ── Subscription cancelled / expired ──
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const landId = subscription.metadata?.land_id

    if (landId) {
      await supabase.from('lands').update({
        plan: 'free',
        stripe_subscription_id: null,
      }).eq('id', landId)
    }
  }

  // ── Subscription updated (e.g. billing period change) ──
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object
    const landId = subscription.metadata?.land_id
    const status = subscription.status // active | past_due | canceled | etc.

    if (landId) {
      const plan = status === 'active' ? 'paid' : 'free'
      await supabase.from('lands').update({ plan }).eq('id', landId)
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
