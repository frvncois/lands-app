import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // ─── Auth: user-context client validates the JWT ───
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

    // ─── Admin client for privileged operations ───
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // ─── Input ───
    const { landId, email, role } = await req.json() as {
      landId: string
      email: string
      role: 'admin' | 'editor'
    }

    if (!landId || !email || !role) {
      return new Response(JSON.stringify({ error: 'landId, email and role are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Verify caller owns or admins this land ───
    const { data: land, error: landError } = await supabaseAdmin
      .from('lands')
      .select('id, user_id')
      .eq('id', landId)
      .single()

    if (landError || !land) {
      return new Response(JSON.stringify({ error: 'Land not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const isOwner = land.user_id === caller.id

    if (!isOwner) {
      const { data: callerCollab } = await supabaseAdmin
        .from('collaborators')
        .select('role')
        .eq('land_id', landId)
        .eq('user_id', caller.id)
        .eq('status', 'active')
        .single()

      if (callerCollab?.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // ─── Check for existing collaborator ───
    const { data: existing } = await supabaseAdmin
      .from('collaborators')
      .select('id, status')
      .eq('land_id', landId)
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return new Response(JSON.stringify({ error: 'This email has already been invited' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Insert collaborator record ───
    const { data: collaborator, error: insertError } = await supabaseAdmin
      .from('collaborators')
      .insert({
        land_id: landId,
        email,
        role,
        status: 'pending',
        invited_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Send invite email via Supabase Auth (best-effort) ───
    // inviteUserByEmail fails for already-registered users — that's fine.
    // The collaborator row is already inserted; existing users will see the
    // InviteAcceptModal on their next dashboard visit.
    const appUrl = Deno.env.get('APP_URL') ?? 'https://lands.app'
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${appUrl}/auth/accept-invite?land=${landId}`,
      data: { invited_to_land: landId, invited_role: role },
    })

    return new Response(JSON.stringify({ collaborator }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
