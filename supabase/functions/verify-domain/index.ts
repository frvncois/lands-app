import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const { landId } = await req.json() as { landId: string }

    // ─── Get land ───
    const { data: land, error: landError } = await supabase
      .from('lands')
      .select('id, user_id, custom_domain, custom_domain_status')
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
    if (!land.custom_domain) {
      return new Response(JSON.stringify({ error: 'No domain configured' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Get domain status from Vercel ───
    const statusRes = await fetch(
      `https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${encodeURIComponent(land.custom_domain)}${teamQuery}`,
      { headers: { Authorization: `Bearer ${vercelToken}` } },
    )
    const statusData = await statusRes.json()

    if (statusData.error) {
      return new Response(JSON.stringify({ status: 'pending' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const verified: boolean = statusData.verified ?? false

    // Trigger Vercel's verification check
    if (!verified) {
      await fetch(
        `https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${encodeURIComponent(land.custom_domain)}/verify${teamQuery}`,
        { method: 'POST', headers: { Authorization: `Bearer ${vercelToken}` } },
      )
    }

    const newStatus = verified ? 'active' : 'pending'

    if (newStatus !== land.custom_domain_status) {
      await supabase
        .from('lands')
        .update({ custom_domain_status: newStatus })
        .eq('id', landId)
    }

    return new Response(JSON.stringify({ status: newStatus, verified }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
