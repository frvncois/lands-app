import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// OAuth credentials (stored as Supabase secrets)
const OAUTH_CREDENTIALS: Record<string, { clientId: string; clientSecret: string }> = {
  mailchimp: {
    clientId: Deno.env.get('MAILCHIMP_CLIENT_ID') || '',
    clientSecret: Deno.env.get('MAILCHIMP_CLIENT_SECRET') || '',
  },
  stripe: {
    clientId: Deno.env.get('STRIPE_CLIENT_ID') || '',
    clientSecret: Deno.env.get('STRIPE_CLIENT_SECRET') || '',
  },
  gumroad: {
    clientId: Deno.env.get('GUMROAD_CLIENT_ID') || '',
    clientSecret: Deno.env.get('GUMROAD_CLIENT_SECRET') || '',
  },
}

// OAuth provider configurations
const OAUTH_CONFIGS: Record<string, {
  authUrl: string
  tokenUrl: string
  scopes: string[]
  userInfoUrl?: string
}> = {
  mailchimp: {
    authUrl: 'https://login.mailchimp.com/oauth2/authorize',
    tokenUrl: 'https://login.mailchimp.com/oauth2/token',
    scopes: [],
    userInfoUrl: 'https://login.mailchimp.com/oauth2/metadata',
  },
  stripe: {
    authUrl: 'https://connect.stripe.com/oauth/authorize',
    tokenUrl: 'https://connect.stripe.com/oauth/token',
    scopes: ['read_write'],
  },
  gumroad: {
    authUrl: 'https://gumroad.com/oauth/authorize',
    tokenUrl: 'https://api.gumroad.com/oauth/token',
    scopes: ['view_sales', 'mark_sales_as_shipped'],
    userInfoUrl: 'https://api.gumroad.com/v2/user',
  },
}

interface RequestBody {
  action: 'initiate' | 'callback' | 'disconnect' | 'refresh'
  integrationId?: string
  projectId?: string
  redirectUri?: string
  code?: string
  state?: string
}

// CORS - restrict to your app domain in production
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'http://localhost:5173'

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate secure random state
function generateState(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

// Derive encryption key from service role key using PBKDF2
async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('lands-integration-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

// Encrypt token data using AES-GCM
async function encryptToken(data: string, secret: string): Promise<string> {
  const key = await deriveKey(secret)
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12)) // 96-bit IV for AES-GCM

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  )

  // Combine IV + encrypted data and encode as base64
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)

  return btoa(String.fromCharCode(...combined))
}

// Decrypt token data using AES-GCM
async function decryptToken(encrypted: string, secret: string): Promise<string> {
  const key = await deriveKey(secret)
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))

  const iv = combined.slice(0, 12)
  const data = combined.slice(12)

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  return new TextDecoder().decode(decrypted)
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as RequestBody
    const { action, integrationId, projectId, redirectUri, code } = body

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    switch (action) {
      case 'initiate': {
        if (!integrationId || !projectId || !redirectUri) {
          return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        const config = OAUTH_CONFIGS[integrationId]
        const creds = OAUTH_CREDENTIALS[integrationId]

        if (!config || !creds?.clientId) {
          return new Response(JSON.stringify({ error: 'Integration not supported for OAuth' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        // Verify user owns this project
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('id, user_id')
          .eq('id', projectId)
          .single()

        if (projectError || !project || project.user_id !== user.id) {
          return new Response(JSON.stringify({ error: 'Project not found or access denied' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        // Generate state for CSRF protection
        const state = generateState()

        // Store state temporarily (expires in 10 minutes)
        await supabase
          .from('oauth_states')
          .upsert({
            state,
            user_id: user.id,
            project_id: projectId,
            integration_id: integrationId,
            redirect_uri: redirectUri,
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          })

        // Build OAuth URL
        const params = new URLSearchParams({
          client_id: creds.clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          state,
        })

        if (config.scopes.length > 0) {
          params.set('scope', config.scopes.join(' '))
        }

        // Special handling for Stripe Connect
        if (integrationId === 'stripe') {
          params.set('stripe_user[email]', user.email || '')
        }

        const authUrl = `${config.authUrl}?${params.toString()}`

        return new Response(JSON.stringify({ authUrl, state }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      case 'callback': {
        const { state } = body

        if (!code || !integrationId || !projectId || !state) {
          return new Response(JSON.stringify({ error: 'Missing required parameters (code, integrationId, projectId, state)' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        const config = OAUTH_CONFIGS[integrationId]
        const creds = OAUTH_CREDENTIALS[integrationId]

        if (!config || !creds?.clientId || !creds?.clientSecret) {
          return new Response(JSON.stringify({ error: 'Integration not configured' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        // Get stored state info and VALIDATE state parameter for CSRF protection
        const { data: stateData } = await supabase
          .from('oauth_states')
          .select('*')
          .eq('state', state) // Match the exact state from callback
          .eq('project_id', projectId)
          .eq('integration_id', integrationId)
          .eq('user_id', user.id)
          .single()

        if (!stateData) {
          return new Response(JSON.stringify({ error: 'Invalid or expired OAuth state - possible CSRF attack' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        // Check if state has expired
        if (new Date(stateData.expires_at) < new Date()) {
          // Clean up expired state
          await supabase.from('oauth_states').delete().eq('state', state)
          return new Response(JSON.stringify({ error: 'OAuth session expired, please try again' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        // Exchange code for tokens
        const tokenParams = new URLSearchParams({
          client_id: creds.clientId,
          client_secret: creds.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: stateData.redirect_uri,
        })

        const tokenResponse = await fetch(config.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: tokenParams.toString(),
        })

        if (!tokenResponse.ok) {
          const error = await tokenResponse.text()
          console.error('Token exchange failed:', error)
          return new Response(JSON.stringify({ error: 'Failed to exchange code for tokens' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        const tokens = await tokenResponse.json()

        // Get user info if available
        let accountInfo: { id: string; email?: string; name?: string } | null = null

        if (config.userInfoUrl && tokens.access_token) {
          try {
            const userInfoResponse = await fetch(config.userInfoUrl, {
              headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
              },
            })

            if (userInfoResponse.ok) {
              const userInfo = await userInfoResponse.json()

              // Handle different provider response formats
              if (integrationId === 'mailchimp') {
                accountInfo = {
                  id: userInfo.user_id || userInfo.login?.login_id,
                  email: userInfo.login?.email,
                  name: userInfo.accountname,
                }
              } else if (integrationId === 'gumroad') {
                accountInfo = {
                  id: userInfo.user?.user_id,
                  email: userInfo.user?.email,
                  name: userInfo.user?.name,
                }
              }
            }
          } catch (e) {
            console.error('Failed to fetch user info:', e)
          }
        }

        // For Stripe, use the response data
        if (integrationId === 'stripe' && tokens.stripe_user_id) {
          accountInfo = {
            id: tokens.stripe_user_id,
            name: tokens.stripe_user_id,
          }
        }

        // Encrypt and store tokens
        const encryptedTokens = await encryptToken(JSON.stringify({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: tokens.expires_in
            ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            : null,
          scope: tokens.scope,
          // Provider-specific data
          ...(integrationId === 'mailchimp' && { dc: tokens.dc }), // Mailchimp datacenter
          ...(integrationId === 'stripe' && { stripeUserId: tokens.stripe_user_id }),
        }), SUPABASE_SERVICE_ROLE_KEY)

        // Store connection
        const { error: upsertError } = await supabase
          .from('integration_connections')
          .upsert({
            project_id: projectId,
            provider_id: integrationId,
            is_connected: true,
            connected_at: new Date().toISOString(),
            encrypted_tokens: encryptedTokens,
            account_info: accountInfo,
            settings: {},
          }, { onConflict: 'project_id,provider_id' })

        if (upsertError) {
          console.error('Failed to store connection:', upsertError)
          return new Response(JSON.stringify({ error: 'Failed to save connection' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        // Clean up state
        await supabase
          .from('oauth_states')
          .delete()
          .eq('state', stateData.state)

        return new Response(JSON.stringify({
          success: true,
          accountInfo,
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      case 'disconnect': {
        if (!integrationId || !projectId) {
          return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        // Verify user owns this project
        const { data: project } = await supabase
          .from('projects')
          .select('id, user_id')
          .eq('id', projectId)
          .single()

        if (!project || project.user_id !== user.id) {
          return new Response(JSON.stringify({ error: 'Access denied' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        // Get connection to potentially revoke tokens
        const { data: connection } = await supabase
          .from('integration_connections')
          .select('encrypted_tokens')
          .eq('project_id', projectId)
          .eq('provider_id', integrationId)
          .single()

        // TODO: Optionally revoke tokens at provider
        // This varies by provider and some don't support it

        // Delete connection (tokens are deleted with it)
        await supabase
          .from('integration_connections')
          .delete()
          .eq('project_id', projectId)
          .eq('provider_id', integrationId)

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      case 'refresh': {
        // TODO: Implement token refresh for integrations that support it
        return new Response(JSON.stringify({ error: 'Not implemented' }), {
          status: 501,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
    }

  } catch (error) {
    console.error('OAuth error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
