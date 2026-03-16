import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function vercelHeaders(token: string) {
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const vercelToken = Deno.env.get('VERCEL_TOKEN')!
    const vercelProjectId = Deno.env.get('VERCEL_PROJECT_ID')!
    const vercelTeamId = Deno.env.get('VERCEL_TEAM_ID') ?? ''

    const teamQuery = vercelTeamId ? `?teamId=${vercelTeamId}` : ''
    const vercelBase = `https://api.vercel.com/v10/projects/${vercelProjectId}/domains`

    // ─── Auth ───
    const authHeader = req.headers.get('Authorization') ?? ''
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { action, landId, domain } = await req.json() as {
      action: 'connect' | 'disconnect'
      landId: string
      domain?: string
    }

    // ─── Verify caller owns this land ───
    const { data: land, error: landError } = await supabase
      .from('lands')
      .select('id, user_id, custom_domain')
      .eq('id', landId)
      .single()

    if (landError || !land) {
      return new Response(JSON.stringify({ error: 'Land not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (land.user_id !== caller.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── CONNECT ───
    if (action === 'connect') {
      if (!domain) {
        return new Response(JSON.stringify({ error: 'domain is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const domainRe = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
      if (!domainRe.test(domain)) {
        return new Response(JSON.stringify({ error: 'Invalid domain format' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Check domain not already used by another land
      const { data: existing } = await supabase
        .from('lands')
        .select('id')
        .eq('custom_domain', domain)
        .neq('id', landId)
        .maybeSingle()

      if (existing) {
        return new Response(JSON.stringify({ error: 'This domain is already connected to another project' }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Remove old domain from Vercel if switching domains
      if (land.custom_domain && land.custom_domain !== domain) {
        await fetch(`${vercelBase}/${encodeURIComponent(land.custom_domain)}${teamQuery}`, {
          method: 'DELETE',
          headers: vercelHeaders(vercelToken),
        })
      }

      // Add new domain to Vercel project
      const vercelRes = await fetch(`${vercelBase}${teamQuery}`, {
        method: 'POST',
        headers: vercelHeaders(vercelToken),
        body: JSON.stringify({ name: domain }),
      })
      const vercelData = await vercelRes.json()

      // Vercel returns error.code when domain config is invalid
      if (vercelData.error && vercelData.error.code !== 'domain_already_in_use') {
        return new Response(JSON.stringify({ error: vercelData.error.message ?? 'Failed to register domain' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      await supabase
        .from('lands')
        .update({ custom_domain: domain, custom_domain_status: 'pending' })
        .eq('id', landId)

      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── DISCONNECT ───
    if (action === 'disconnect') {
      if (land.custom_domain) {
        await fetch(`${vercelBase}/${encodeURIComponent(land.custom_domain)}${teamQuery}`, {
          method: 'DELETE',
          headers: vercelHeaders(vercelToken),
        })
      }

      await supabase
        .from('lands')
        .update({ custom_domain: null, custom_domain_status: null })
        .eq('id', landId)

      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
