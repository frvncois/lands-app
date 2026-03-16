import { createClient } from 'jsr:@supabase/supabase-js@2'
import type { CampaignIntegration } from '../publish/types.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { handle, email, name } = await req.json() as { handle: string; email: string; name?: string }

    if (!handle || !email) {
      return json({ error: 'Missing handle or email' }, 400)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: land, error } = await supabase
      .from('lands')
      .select('campaign_integration')
      .eq('handle', handle)
      .single()

    if (error || !land?.campaign_integration) {
      return json({ error: 'No campaign integration configured' }, 400)
    }

    const integration = land.campaign_integration as CampaignIntegration

    switch (integration.provider) {
      case 'brevo':     return await subscribeBrevo(integration, email, name)
      case 'flodesk':   return await subscribeFlodesk(integration, email, name)
      case 'webhook':
      case 'custom':    return await subscribeWebhook(integration, email, name)
      default:          return json({ error: 'Unsupported provider' }, 400)
    }
  } catch (err) {
    console.error('Subscribe error:', err)
    return json({ error: 'Internal error' }, 500)
  }
})

// ─── Provider implementations ─────────────────────────────────────────────────

async function subscribeBrevo(
  { config }: CampaignIntegration,
  email: string,
  name?: string,
): Promise<Response> {
  const body: Record<string, unknown> = {
    email,
    updateEnabled: true,
    ...(name ? { attributes: { FIRSTNAME: name } } : {}),
    ...(config.list_id ? { listIds: [parseInt(config.list_id)] } : {}),
  }

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': config.api_key!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok && res.status !== 204) {
    const detail = await res.text()
    console.error('Brevo error:', detail)
    return json({ error: 'Failed to subscribe via Brevo' }, 502)
  }

  return json({ ok: true })
}

async function subscribeFlodesk(
  { config }: CampaignIntegration,
  email: string,
  name?: string,
): Promise<Response> {
  const credentials = btoa(`${config.api_key}:${config.api_key}`)
  const body: Record<string, unknown> = {
    email,
    ...(name ? { first_name: name } : {}),
    ...(config.list_id ? { segments: [{ id: config.list_id }] } : {}),
  }

  const res = await fetch('https://api.flodesk.com/v1/subscribers', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const detail = await res.text()
    console.error('Flodesk error:', detail)
    return json({ error: 'Failed to subscribe via Flodesk' }, 502)
  }

  return json({ ok: true })
}

async function subscribeWebhook(
  { config }: CampaignIntegration,
  email: string,
  name?: string,
): Promise<Response> {
  const res = await fetch(config.webhook_url!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: JSON.stringify({ email, name }),
  })

  if (!res.ok) {
    console.error('Webhook error:', res.status)
    return json({ error: 'Webhook returned non-2xx status' }, 502)
  }

  return json({ ok: true })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
