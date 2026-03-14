import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { code, landId } = await req.json()

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: 'STRIPE_SECRET_KEY not configured' }), { status: 500, headers: corsHeaders })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: corsHeaders })
    }
    const userId = getUserIdFromJwt(authHeader)
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: corsHeaders })
    }

    // Exchange OAuth code for Stripe access token
    const tokenRes = await fetch('https://connect.stripe.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_secret: stripeSecretKey,
        code,
        grant_type: 'authorization_code',
      }),
    })
    const tokenData = await tokenRes.json()
    if (tokenData.error) {
      return new Response(JSON.stringify({ error: tokenData.error_description }), { status: 400, headers: corsHeaders })
    }

    const stripe_user_id: string = tokenData.stripe_user_id

    // Fetch account name from Stripe
    const accountRes = await fetch(`https://api.stripe.com/v1/accounts/${stripe_user_id}`, {
      headers: { Authorization: `Bearer ${stripeSecretKey}` },
    })
    const account = await accountRes.json()
    const stripe_account_name: string =
      account.business_profile?.name ?? account.display_name ?? account.email ?? stripe_user_id

    // Save to lands table
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { error } = await supabase
      .from('lands')
      .update({ stripe_account_id: stripe_user_id, stripe_account_name })
      .eq('id', landId)
      .eq('user_id', userId)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders })
  }
})
