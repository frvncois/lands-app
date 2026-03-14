import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PLATFORM_FEE_PERCENT: Record<string, number> = {
  free: 5,
  paid: 2,
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { landId, sectionId, storeId, itemId, origin } = await req.json()

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: 'STRIPE_SECRET_KEY not configured' }), { status: 500, headers: corsHeaders })
    }

    // Look up land and find the item
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: land, error: landError } = await supabase
      .from('lands')
      .select('sections, stripe_account_id, plan')
      .eq('id', landId)
      .single()

    if (landError || !land) {
      return new Response(JSON.stringify({ error: 'Land not found' }), { status: 404, headers: corsHeaders })
    }
    if (!land.stripe_account_id) {
      return new Response(JSON.stringify({ error: 'No Stripe account connected for this land' }), { status: 400, headers: corsHeaders })
    }

    // Find the item price/title from section content
    const section = land.sections.find((s: any) => s.id === sectionId)
    const store = section?.content?.stores?.find((s: any) => s.id === storeId)
    const item = store?.items?.find((i: any) => i.id === itemId)

    if (!item) {
      return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404, headers: corsHeaders })
    }

    const feePercent = PLATFORM_FEE_PERCENT[land.plan] ?? PLATFORM_FEE_PERCENT.free
    const unitAmount = Math.round(item.price * 100)
    const feeAmount = Math.round(unitAmount * feePercent / 100)

    // Create Stripe Checkout session (destination charge — platform collects then transfers)
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': item.title,
        'line_items[0][price_data][unit_amount]': String(unitAmount),
        'line_items[0][quantity]': '1',
        'mode': 'payment',
        'success_url': `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${origin}/checkout/cancel`,
        'payment_intent_data[application_fee_amount]': String(feeAmount),
        'payment_intent_data[transfer_data][destination]': land.stripe_account_id,
      }),
    })

    const session = await res.json()
    if (session.error) {
      return new Response(JSON.stringify({ error: session.error.message }), { status: 400, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: corsHeaders })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders })
  }
})
