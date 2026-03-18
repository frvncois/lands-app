import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? 'https://lands.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

function ok(body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status: 200, headers: corsHeaders })
}

function err(body: Record<string, unknown>, status = 400) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, landId } = await req.json()

    if (!code) return err({ error: 'Missing OAuth code' })
    if (!landId) return err({ error: 'Missing landId' })

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) return err({ error: 'STRIPE_SECRET_KEY not configured' }, 500)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return err({ error: 'Missing Authorization header' }, 401)

    // Validate JWT server-side via Supabase — avoids fragile manual atob() parsing
    const supabaseForAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user }, error: authError } = await supabaseForAuth.auth.getUser()
    if (authError || !user) return err({ error: 'Invalid or expired token' }, 401)
    const userId = user.id

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
      console.error('Stripe OAuth error:', JSON.stringify(tokenData))
      return err({ error: tokenData.error_description ?? tokenData.error, stripe_error: tokenData.error })
    }

    const stripe_user_id: string = tokenData.stripe_user_id
    if (!stripe_user_id) {
      console.error('Missing stripe_user_id in OAuth response:', JSON.stringify(tokenData))
      return err({ error: 'stripe_user_id missing from OAuth response' }, 502)
    }

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
      console.error('Supabase update error:', error.message)
      return err({ error: error.message }, 500)
    }

    return ok({ success: true, stripe_account_name })
  } catch (e) {
    console.error('Unhandled error:', e)
    return err({ error: String(e) }, 500)
  }
})
