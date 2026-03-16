import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Always respond 200 so supabase-js puts the body in `data` (not `error`)
function ok(body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status: 200, headers: corsHeaders })
}

function getUserIdFromJwt(authHeader: string): string | null {
  try {
    const token = authHeader.replace('Bearer ', '')
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    return payload.sub ?? null
  } catch {
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { landId, billing, successUrl, cancelUrl } = await req.json()

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    const monthlyPriceId = Deno.env.get('STRIPE_MONTHLY_PRICE_ID')
    const yearlyPriceId = Deno.env.get('STRIPE_YEARLY_PRICE_ID')

    if (!stripeKey) return ok({ error: 'STRIPE_SECRET_KEY not configured' })
    if (!monthlyPriceId || !yearlyPriceId) return ok({ error: 'Stripe Price IDs not configured' })

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return ok({ error: 'Unauthorized' })

    const userId = getUserIdFromJwt(authHeader)
    if (!userId) return ok({ error: 'Invalid token' })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Get the land — must belong to the calling user
    const { data: land, error: landError } = await supabase
      .from('lands')
      .select('id, plan')
      .eq('id', landId)
      .eq('user_id', userId)
      .single()

    if (landError || !land) return ok({ error: landError?.message ?? 'Land not found' })
    if (land.plan === 'paid') return ok({ error: 'Already on paid plan' })

    const priceId = billing === 'yearly' ? yearlyPriceId : monthlyPriceId

    // Try to get stripe_customer_id (column may not exist yet — ignore errors)
    let customerId: string | null = null
    try {
      const { data: extra } = await supabase
        .from('lands')
        .select('stripe_customer_id')
        .eq('id', landId)
        .single()
      customerId = (extra as { stripe_customer_id?: string | null })?.stripe_customer_id ?? null
    } catch { /* column not yet in schema */ }

    if (!customerId) {
      const { data: { user } } = await supabase.auth.admin.getUserById(userId)
      const email = user?.email ?? ''

      const customerRes = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email,
          'metadata[user_id]': userId,
          'metadata[land_id]': landId,
        }),
      })

      const customer = await customerRes.json()
      if (customer.error) return ok({ error: `Stripe customer error: ${customer.error.message}` })

      customerId = customer.id

      try {
        await supabase.from('lands').update({ stripe_customer_id: customerId }).eq('id', landId)
      } catch { /* best-effort */ }
    }

    // Create Checkout Session in subscription mode
    const params = new URLSearchParams({
      customer: customerId!,
      mode: 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: landId,
      'subscription_data[metadata][land_id]': landId,
    })

    const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    const session = await sessionRes.json()
    if (session.error) return ok({ error: `Stripe session error: ${session.error.message}` })
    if (!session.url) return ok({ error: `No URL in session: ${JSON.stringify(session)}` })

    return ok({ url: session.url })
  } catch (e) {
    return ok({ error: String(e) })
  }
})
