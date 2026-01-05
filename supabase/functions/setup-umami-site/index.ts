import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const UMAMI_API_URL = Deno.env.get('UMAMI_API_URL') || 'https://cloud.umami.is'
const UMAMI_API_KEY = Deno.env.get('UMAMI_API_KEY')

interface RequestBody {
  projectId: string
  action: 'create' | 'delete'
}

interface UmamiWebsite {
  id: string
  name: string
  domain: string
  shareId: string | null
  createdAt: string
}

const ALLOWED_ORIGINS = [
  'https://lands.app',
  'https://app.lands.app',
  'https://www.lands.app',
  Deno.env.get('ALLOWED_ORIGIN'), // For local dev
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

// Create a website in Umami
async function createUmamiWebsite(name: string, domain: string): Promise<UmamiWebsite> {
  if (!UMAMI_API_KEY) {
    throw new Error('UMAMI_API_KEY not configured')
  }

  const response = await fetch(`${UMAMI_API_URL}/api/websites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-umami-api-key': UMAMI_API_KEY,
    },
    body: JSON.stringify({
      name,
      domain,
      shareId: null,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Umami API error:', error)
    throw new Error(`Failed to create Umami website: ${error}`)
  }

  return await response.json()
}

// Delete a website from Umami
async function deleteUmamiWebsite(websiteId: string): Promise<void> {
  if (!UMAMI_API_KEY) {
    throw new Error('UMAMI_API_KEY not configured')
  }

  const response = await fetch(`${UMAMI_API_URL}/api/websites/${websiteId}`, {
    method: 'DELETE',
    headers: {
      'x-umami-api-key': UMAMI_API_KEY,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Umami API error:', error)
    throw new Error(`Failed to delete Umami website: ${error}`)
  }
}

// Get website stats from Umami
async function getUmamiStats(websiteId: string, startAt: number, endAt: number): Promise<any> {
  if (!UMAMI_API_KEY) {
    throw new Error('UMAMI_API_KEY not configured')
  }

  const response = await fetch(
    `${UMAMI_API_URL}/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`,
    {
      headers: {
        'x-umami-api-key': UMAMI_API_KEY,
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get Umami stats: ${error}`)
  }

  return await response.json()
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { projectId, action } = await req.json() as RequestBody

    if (!projectId || !action) {
      return new Response(JSON.stringify({ error: 'Missing projectId or action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    if (!UMAMI_API_KEY) {
      console.error('UMAMI_API_KEY is not configured')
      return new Response(JSON.stringify({ error: 'Umami API not configured. Please add UMAMI_API_KEY to edge function secrets.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Check if project is Pro or Business plan
    if (project.plan === 'free') {
      return new Response(JSON.stringify({ error: 'Analytics requires Pro or Business plan' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Get existing settings
    const { data: settings } = await supabase
      .from('project_settings')
      .select('*')
      .eq('project_id', projectId)
      .single()

    if (action === 'create') {
      // Check if site already exists
      if (settings?.umami_site_id) {
        return new Response(JSON.stringify({
          success: true,
          siteId: settings.umami_site_id,
          message: 'Umami site already exists',
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      // Create new Umami website
      const domain = `${project.slug}.lands.app`
      const website = await createUmamiWebsite(project.title, domain)

      // Save the site ID to project_settings
      const { error: updateError } = await supabase
        .from('project_settings')
        .upsert({
          project_id: projectId,
          umami_site_id: website.id,
          umami_enabled: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'project_id' })

      if (updateError) {
        console.error('Failed to save Umami site ID:', updateError)
        // Try to delete the created site to avoid orphans
        try {
          await deleteUmamiWebsite(website.id)
        } catch (e) {
          console.error('Failed to cleanup Umami site:', e)
        }
        throw updateError
      }

      // Generate the tracking script
      const trackingScript = `<script defer src="${UMAMI_API_URL}/script.js" data-website-id="${website.id}"></script>`

      return new Response(JSON.stringify({
        success: true,
        siteId: website.id,
        trackingScript,
        message: 'Umami analytics site created successfully',
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })

    } else if (action === 'delete') {
      if (!settings?.umami_site_id) {
        return new Response(JSON.stringify({
          success: true,
          message: 'No Umami site to delete',
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      // Delete from Umami
      await deleteUmamiWebsite(settings.umami_site_id)

      // Remove from project_settings
      const { error: updateError } = await supabase
        .from('project_settings')
        .update({
          umami_site_id: null,
          umami_enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq('project_id', projectId)

      if (updateError) {
        throw updateError
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Umami analytics site deleted successfully',
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

  } catch (error) {
    console.error('Error in setup-umami-site:', error)
    console.error('Error stack:', error.stack)
    return new Response(JSON.stringify({
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
