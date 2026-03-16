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
    // ─── Auth ───
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // ─── Auth: user-context client validates the JWT ───
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Admin client for privileged operations ───
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // ─── Input: optional transfer map ───
    // transferMap: Record<landId, collaboratorEmail | ''>
    // Empty string = delete the land. An email = transfer ownership.
    const { transferMap = {} } = await req.json() as { transferMap?: Record<string, string> }

    // ─── Fetch all lands owned by this user ───
    const { data: lands, error: landsError } = await supabase
      .from('lands')
      .select('id, handle')
      .eq('user_id', user.id)

    if (landsError) {
      return new Response(JSON.stringify({ error: landsError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    for (const land of lands ?? []) {
      const transferToEmail = transferMap[land.id] ?? ''

      if (transferToEmail) {
        // ─── Transfer ownership ───
        // Find the collaborator record for this email
        // Find the collaborator by email to get their auth user id
        const { data: collab } = await supabase
          .from('collaborators')
          .select('id, email')
          .eq('land_id', land.id)
          .eq('email', transferToEmail)
          .eq('status', 'active')
          .single()

        if (collab?.email) {
          // Look up the user id from auth.users via their email
          const { data: { users } } = await supabase.auth.admin.listUsers()
          const newOwner = users.find((u) => u.email === collab.email)

          if (newOwner) {
            await supabase
              .from('lands')
              .update({ user_id: newOwner.id })
              .eq('id', land.id)

            // Remove the new owner from collaborators table
            await supabase
              .from('collaborators')
              .delete()
              .eq('id', collab.id)
          }
        }
      } else {
        // ─── Delete land + all related data ───

        // Delete storage files for this land
        const { data: storageFiles } = await supabase.storage
          .from('lands')
          .list(land.handle)

        if (storageFiles && storageFiles.length > 0) {
          const paths = storageFiles.map((f) => `${land.handle}/${f.name}`)
          await supabase.storage.from('lands').remove(paths)
        }

        // Delete sections
        await supabase.from('sections').delete().eq('land_id', land.id)

        // Delete collaborators
        await supabase.from('collaborators').delete().eq('land_id', land.id)

        // Delete the land
        await supabase.from('lands').delete().eq('id', land.id)
      }
    }

    // ─── Remove from all collaborator roles on other lands ───
    await supabase.from('collaborators').delete().eq('email', user.email!)

    // ─── Delete profile ───
    await supabase.from('profiles').delete().eq('id', user.id)

    // ─── Delete auth user (must be last) ───
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id)
    if (deleteUserError) {
      return new Response(JSON.stringify({ error: deleteUserError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
