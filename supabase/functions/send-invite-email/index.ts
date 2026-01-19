import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SITE_URL = Deno.env.get('SITE_URL') || 'https://lands.app'

// ✅ SECURITY FIX: Restrict CORS to allowed origins only
const ALLOWED_ORIGINS = [
  'https://lands.app',
  'https://app.lands.app',
  'https://www.lands.app',
  Deno.env.get('ALLOWED_ORIGIN'),
].filter(Boolean) as string[]

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

interface CollaboratorInvite {
  id: string
  projectId: string
  email: string
  role: 'admin' | 'editor'
  token: string
  invitedByName?: string
  expiresAt: string
}

interface RequestBody {
  invite: CollaboratorInvite
  projectTitle?: string
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ✅ SECURITY FIX: Require and validate auth token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const { invite, projectTitle: providedTitle } = await req.json() as RequestBody

    // ✅ SECURITY FIX: Validate invite token exists in database
    const { data: dbInvite, error: inviteError } = await supabase
      .from('collaborator_invites')
      .select('id, project_id, email, token, status')
      .eq('token', invite.token)
      .eq('status', 'pending')
      .single()

    if (inviteError || !dbInvite) {
      return new Response(JSON.stringify({ error: 'Invalid or expired invite' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // ✅ SECURITY FIX: Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id, title')
      .eq('id', dbInvite.project_id)
      .single()

    if (projectError || !project || project.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const projectTitle = providedTitle || project.title || 'a project'
    const inviteUrl = `${SITE_URL}/invite/${invite.token}`

    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: Deno.env.get('RESEND_FROM_EMAIL') || 'Lands <noreply@lands.app>',
          to: [dbInvite.email], // ✅ Use email from DB, not request
          subject: `${invite.invitedByName || 'Someone'} invited you to collaborate on "${projectTitle}"`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #f9fafb; border-radius: 12px; padding: 32px; text-align: center;">
                <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 600;">You're invited!</h1>
                <p style="margin: 0; color: #6b7280; font-size: 16px;">
                  <strong>${invite.invitedByName || 'A user'}</strong> has invited you to collaborate on <strong>"${projectTitle}"</strong>
                </p>
              </div>

              <div style="padding: 32px 0; text-align: center;">
                <p style="margin: 0 0 8px; color: #6b7280;">You'll be joining as:</p>
                <span style="display: inline-block; padding: 6px 16px; background: ${invite.role === 'admin' ? '#dbeafe' : '#dcfce7'}; color: ${invite.role === 'admin' ? '#1e40af' : '#166534'}; border-radius: 9999px; font-size: 14px; font-weight: 500;">
                  ${invite.role === 'admin' ? 'Admin' : 'Editor'}
                </span>
              </div>

              <div style="text-align: center; padding: 16px 0;">
                <a href="${inviteUrl}" style="display: inline-block; padding: 14px 32px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>

              <p style="text-align: center; color: #9ca3af; font-size: 13px; margin-top: 32px;">
                This invitation expires on ${new Date(invite.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

              <p style="text-align: center; color: #9ca3af; font-size: 12px; margin: 0;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </body>
            </html>
          `,
        }),
      })

      if (!res.ok) {
        const error = await res.text()
        console.error('Resend error:', error)
        throw new Error(`Failed to send email: ${error}`)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error) {
    console.error('Error sending invite email:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
