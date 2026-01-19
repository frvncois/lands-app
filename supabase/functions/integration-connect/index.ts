import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

// API validation endpoints for each provider
const API_VALIDATORS: Record<string, {
  validate: (config: Record<string, string>) => Promise<{ valid: boolean; accountInfo?: any; error?: string }>
}> = {
  // ConvertKit - uses POST to avoid API secret in query string logs
  convertkit: {
    async validate(config) {
      const { apiSecret } = config
      if (!apiSecret) return { valid: false, error: 'API Secret is required' }

      try {
        // Use POST with body to avoid exposing API secret in URL/logs
        const response = await fetch('https://api.convertkit.com/v3/account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ api_secret: apiSecret }),
        })
        if (!response.ok) {
          return { valid: false, error: 'Invalid API Secret' }
        }
        const data = await response.json()
        return {
          valid: true,
          accountInfo: {
            id: data.primary_email_address,
            email: data.primary_email_address,
            name: data.name,
          },
        }
      } catch (e) {
        return { valid: false, error: 'Failed to validate credentials' }
      }
    },
  },

  // Buttondown
  buttondown: {
    async validate(config) {
      const { apiKey } = config
      if (!apiKey) return { valid: false, error: 'API Key is required' }

      try {
        const response = await fetch('https://api.buttondown.email/v1/ping', {
          headers: {
            'Authorization': `Token ${apiKey}`,
          },
        })
        if (!response.ok) {
          return { valid: false, error: 'Invalid API Key' }
        }
        return {
          valid: true,
          accountInfo: {
            id: 'buttondown-user',
          },
        }
      } catch (e) {
        return { valid: false, error: 'Failed to validate credentials' }
      }
    },
  },

  // Beehiiv
  beehiiv: {
    async validate(config) {
      const { apiKey, publicationId } = config
      if (!apiKey) return { valid: false, error: 'API Key is required' }
      if (!publicationId) return { valid: false, error: 'Publication ID is required' }

      try {
        const response = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        })
        if (!response.ok) {
          return { valid: false, error: 'Invalid API Key or Publication ID' }
        }
        const data = await response.json()
        return {
          valid: true,
          accountInfo: {
            id: publicationId,
            name: data.data?.name,
          },
        }
      } catch (e) {
        return { valid: false, error: 'Failed to validate credentials' }
      }
    },
  },

  // Lemon Squeezy
  lemonsqueezy: {
    async validate(config) {
      const { apiKey } = config
      if (!apiKey) return { valid: false, error: 'API Key is required' }

      try {
        const response = await fetch('https://api.lemonsqueezy.com/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/vnd.api+json',
          },
        })
        if (!response.ok) {
          return { valid: false, error: 'Invalid API Key' }
        }
        const data = await response.json()
        return {
          valid: true,
          accountInfo: {
            id: data.data?.id,
            email: data.data?.attributes?.email,
            name: data.data?.attributes?.name,
          },
        }
      } catch (e) {
        return { valid: false, error: 'Failed to validate credentials' }
      }
    },
  },

  // Google Analytics (just validates format, no API call needed)
  google_analytics: {
    async validate(config) {
      const { measurementId } = config
      if (!measurementId) return { valid: false, error: 'Measurement ID is required' }

      // Validate format: G-XXXXXXXXXX
      if (!/^G-[A-Z0-9]+$/.test(measurementId)) {
        return { valid: false, error: 'Invalid Measurement ID format. Should be G-XXXXXXXXXX' }
      }

      return {
        valid: true,
        accountInfo: {
          id: measurementId,
          name: measurementId,
        },
      }
    },
  },

  // Plausible (just validates domain format)
  plausible: {
    async validate(config) {
      const { domain } = config
      if (!domain) return { valid: false, error: 'Domain is required' }

      // Basic domain validation
      if (!/^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/.test(domain)) {
        return { valid: false, error: 'Invalid domain format' }
      }

      return {
        valid: true,
        accountInfo: {
          id: domain,
          name: domain,
        },
      }
    },
  },
}

interface RequestBody {
  action: 'connect' | 'validate' | 'test'
  integrationId: string
  projectId: string
  config: Record<string, string>
}

// ✅ SECURITY FIX (H-4): Derive encryption key with unique salt per credential
// Use user_id + integration_type to ensure different keys for different credentials
async function deriveKey(secret: string, userId: string, integrationType: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  // Create unique salt per credential using user_id and integration type
  const salt = encoder.encode(`lands-integration-${userId}-${integrationType}`)

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 600000, // ✅ Increased from 100,000 to 600,000
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

// Encrypt credentials using AES-GCM
async function encryptCredentials(data: string, userId: string, integrationType: string): Promise<string> {
  const key = await deriveKey(SUPABASE_SERVICE_ROLE_KEY, userId, integrationType)
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

// Decrypt credentials using AES-GCM
async function decryptCredentials(encrypted: string, userId: string, integrationType: string): Promise<string> {
  const key = await deriveKey(SUPABASE_SERVICE_ROLE_KEY, userId, integrationType)
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
  const corsHeaders = getCorsHeaders(req)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as RequestBody
    const { action, integrationId, projectId, config } = body

    if (!integrationId || !projectId || !config) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

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

    // Get validator for this integration
    const validator = API_VALIDATORS[integrationId]

    if (!validator) {
      return new Response(JSON.stringify({
        error: `Integration ${integrationId} is not supported for API key connection`,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    switch (action) {
      case 'connect': {
        // Validate credentials
        const result = await validator.validate(config)

        if (!result.valid) {
          return new Response(JSON.stringify({
            success: false,
            message: result.error,
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        // Encrypt and store credentials
        const encryptedCredentials = await encryptCredentials(JSON.stringify(config), user.id, integrationId)

        // Store connection
        const { error: upsertError } = await supabase
          .from('integration_connections')
          .upsert({
            project_id: projectId,
            provider_id: integrationId,
            is_connected: true,
            connected_at: new Date().toISOString(),
            encrypted_credentials: encryptedCredentials,
            account_info: result.accountInfo,
            settings: {},
          }, { onConflict: 'project_id,provider_id' })

        if (upsertError) {
          console.error('Failed to store connection:', upsertError)
          return new Response(JSON.stringify({
            success: false,
            message: 'Failed to save connection',
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        return new Response(JSON.stringify({
          success: true,
          accountInfo: result.accountInfo,
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      case 'validate': {
        // Just validate without storing
        const result = await validator.validate(config)

        return new Response(JSON.stringify({
          valid: result.valid,
          error: result.error,
          accountInfo: result.accountInfo,
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      case 'test': {
        // Test existing connection
        const { data: connection } = await supabase
          .from('integration_connections')
          .select('encrypted_credentials')
          .eq('project_id', projectId)
          .eq('provider_id', integrationId)
          .single()

        if (!connection?.encrypted_credentials) {
          return new Response(JSON.stringify({
            success: false,
            message: 'No connection found',
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        // Decrypt and validate
        const storedConfig = JSON.parse(await decryptCredentials(connection.encrypted_credentials, user.id, integrationId))
        const result = await validator.validate(storedConfig)

        return new Response(JSON.stringify({
          success: result.valid,
          message: result.error,
        }), {
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
    console.error('Integration connect error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
