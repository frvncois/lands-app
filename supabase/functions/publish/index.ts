import { renderLand } from './renderer.ts'
import type { Land } from './types.ts'

const CLOUDFLARE_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')!
const CLOUDFLARE_API_TOKEN  = Deno.env.get('CLOUDFLARE_API_TOKEN')!
const CLOUDFLARE_KV_NS_ID   = Deno.env.get('CLOUDFLARE_KV_NS_ID')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { land } = await req.json() as { land: Land }

    if (!land?.handle) {
      return new Response(JSON.stringify({ error: 'Missing land data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const html = renderLand(land)
    const version = Date.now().toString()

    // Write html as plain text body; pass metadata as query param (supported by KV REST API).
    // The worker reads the metadata cheaply to build an ETag without hashing the full body.
    const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NS_ID}/values/${land.handle}?metadata=${encodeURIComponent(JSON.stringify({ version }))}`

    const cfRes = await fetch(kvUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'text/html; charset=utf-8',
      },
      body: html,
    })

    if (!cfRes.ok) {
      const detail = await cfRes.text()
      console.error('Cloudflare KV error:', detail)
      return new Response(JSON.stringify({ error: 'Failed to publish to Cloudflare' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ url: `https://${land.handle}.lands.app` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('Publish error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
