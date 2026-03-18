const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? 'https://lands.app',
  'Access-Control-Allow-Headers': 'content-type, authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export interface ProviderList {
  id: string
  name: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { provider, api_key } = await req.json() as { provider: string; api_key: string }

    if (!provider || !api_key) {
      return json({ error: 'Missing provider or api_key' }, 400)
    }

    switch (provider) {
      case 'kit':       return await fetchKitForms(api_key)
      case 'loops':     return await fetchLoopsLists(api_key)
      case 'brevo':     return await fetchBrevoLists(api_key)
      case 'flodesk':   return await fetchFlodeskSegments(api_key)
      case 'resend':    return await fetchResendAudiences(api_key)
      case 'mailchimp': return await fetchMailchimpAudiences(api_key)
      default:          return json({ error: 'Unsupported provider' }, 400)
    }
  } catch (err) {
    console.error('fetch-campaign-lists error:', err)
    return json({ error: 'Internal error' }, 500)
  }
})

// ─── Kit ──────────────────────────────────────────────────────────────────────

async function fetchKitForms(apiKey: string): Promise<Response> {
  const res = await fetch(`https://api.convertkit.com/v3/forms?api_secret=${encodeURIComponent(apiKey)}`)
  if (!res.ok) return json({ error: 'Invalid API key or Kit request failed' }, 502)
  const data = await res.json()
  const lists: ProviderList[] = (data.forms ?? []).map((f: { id: number; name: string }) => ({
    id: String(f.id),
    name: f.name,
  }))
  return json({ lists })
}

// ─── Loops ────────────────────────────────────────────────────────────────────

async function fetchLoopsLists(apiKey: string): Promise<Response> {
  const res = await fetch('https://app.loops.so/api/v1/lists', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return json({ error: 'Invalid API key or Loops request failed' }, 502)
  const data = await res.json()
  const lists: ProviderList[] = (Array.isArray(data) ? data : []).map((l: { id: string; name: string }) => ({
    id: l.id,
    name: l.name,
  }))
  return json({ lists })
}

// ─── Brevo ────────────────────────────────────────────────────────────────────

async function fetchBrevoLists(apiKey: string): Promise<Response> {
  const res = await fetch('https://api.brevo.com/v3/contacts/lists?limit=50', {
    headers: { 'api-key': apiKey },
  })
  if (!res.ok) return json({ error: 'Invalid API key or Brevo request failed' }, 502)
  const data = await res.json()
  const lists: ProviderList[] = (data.lists ?? []).map((l: { id: number; name: string }) => ({
    id: String(l.id),
    name: l.name,
  }))
  return json({ lists })
}

// ─── Flodesk ──────────────────────────────────────────────────────────────────

async function fetchFlodeskSegments(apiKey: string): Promise<Response> {
  const credentials = btoa(`${apiKey}:${apiKey}`)
  const res = await fetch('https://api.flodesk.com/v1/segments', {
    headers: { Authorization: `Basic ${credentials}` },
  })
  if (!res.ok) return json({ error: 'Invalid API key or Flodesk request failed' }, 502)
  const data = await res.json()
  const lists: ProviderList[] = (Array.isArray(data) ? data : []).map((s: { id: string; name: string }) => ({
    id: s.id,
    name: s.name,
  }))
  return json({ lists })
}

// ─── Resend ───────────────────────────────────────────────────────────────────

async function fetchResendAudiences(apiKey: string): Promise<Response> {
  const res = await fetch('https://api.resend.com/audiences', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return json({ error: 'Invalid API key or Resend request failed' }, 502)
  const data = await res.json()
  const lists: ProviderList[] = (data.data ?? []).map((a: { id: string; name: string }) => ({
    id: a.id,
    name: a.name,
  }))
  return json({ lists })
}

// ─── Mailchimp ────────────────────────────────────────────────────────────────

async function fetchMailchimpAudiences(apiKey: string): Promise<Response> {
  const dc = apiKey.split('-').pop()
  if (!dc) return json({ error: 'Invalid Mailchimp API key format' }, 400)

  const credentials = btoa(`anystring:${apiKey}`)
  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists?count=100`, {
    headers: { Authorization: `Basic ${credentials}` },
  })
  if (!res.ok) return json({ error: 'Invalid API key or Mailchimp request failed' }, 502)
  const data = await res.json()
  const lists: ProviderList[] = (data.lists ?? []).map((l: { id: string; name: string }) => ({
    id: l.id,
    name: l.name,
  }))
  return json({ lists })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
