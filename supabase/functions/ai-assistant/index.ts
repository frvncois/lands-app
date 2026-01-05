import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!

const DAILY_LIMITS: Record<string, number> = {
  free: 10,
  pro: 50,
  business: 200,
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

// Compact system prompt to stay under token limits
const BASE_SYSTEM_PROMPT = `You are Lands AI for a visual page builder. Respond with ONLY valid JSON: {"message": "...", "actions": [...]}

## CRITICAL RULES
1. You MUST include actions to make changes - just text does nothing
2. When CHILD TEMPLATE is provided, COPY its exact structure and styles for new items
3. Use project COLORS from context
4. Include complete nested children with content

## ACTIONS

UPDATE_PAGE_SETTINGS - Change site-wide colors, fonts, theme (USE THIS FOR REDESIGNS):
{"type":"update_page_settings","settings":{"fontFamily":"Inter","backgroundColor":"#faf8f5","textColor":"#2d2a26","primaryColor":"#c4a574","secondaryColor":"#8b7355","accentColor":"#d4a574"}}
Available fonts: Inter, Geist, Plus Jakarta Sans, DM Sans, Outfit, Space Grotesk, Sora, Manrope, Poppins, Lora, Playfair Display, Merriweather, Libre Baskerville

ADD_CHILDREN - Add items to selected block (COPY the CHILD TEMPLATE structure if provided):
{"type":"add_children","blockId":"selected","children":[...copy child template structure with new content...]}

UPDATE_BLOCK - Update selected block:
{"type":"update_block","blockId":"selected","settings":{"content":"New text"},"styles":{"color":"#000"}}

CREATE_SECTION - New section:
{"type":"create_section","section":{"name":"Section","container":{"settings":{},"styles":{"padding":{"top":"64","bottom":"64","left":"24","right":"24"}}},"children":[...]}}

ADD_ANIMATION:
{"type":"add_animation","blockId":"selected","animation":{"type":"fade-up","duration":500,"delay":0,"easing":"ease-out"}}

## BLOCKS

Layout (have children): container, stack, grid
Content: heading (content, level:h1-h6), text (content), button (label, url), image (src, alt), icon (icon, size)

Stack settings: direction (horizontal/vertical), gap, align (start/center/end)
Styles: padding/margin {top,bottom,left,right}, gap, fontSize, fontWeight (400-700), color, backgroundColor, borderRadius`

const PROJECT_EDIT_SYSTEM_PROMPT = `You are a landing page editor assistant for Lands.

## RESPONSE FORMAT
Always respond with valid JSON:
{
  "message": "Description of what you did, or clarifying question",
  "actions": []
}

## ACTIONS YOU CAN TAKE

ADD_SECTION - Add a new section
{"type": "ADD_SECTION", "sectionType": "cards", "variant": "grid", "position": "end", "data": {"headline": "...", "items": [...]}}

UPDATE_SECTION - Modify existing section content or styles
{"type": "UPDATE_SECTION", "sectionId": "xxx", "data": {"headline": "New Title"}, "styles": {"backgroundColor": "#f5f5f5"}}

DELETE_SECTION - Remove a section
{"type": "DELETE_SECTION", "sectionId": "xxx"}

REORDER_SECTION - Change section position
{"type": "REORDER_SECTION", "sectionId": "xxx", "position": 0}

UPDATE_THEME - Change theme colors or fonts
{"type": "UPDATE_THEME", "colors": {"primary": "#007bff"}, "fonts": {"heading": "Playfair Display"}}

SELECT_SECTION - Select a section for editing
{"type": "SELECT_SECTION", "sectionId": "xxx"}

## RULES
1. Only use section types from AVAILABLE SECTIONS
2. For testimonials/reviews, use "cards" section
3. For FAQ, use accordion type "faq"
4. For pricing, use "cards" or "products" section
5. When generating content, create realistic placeholder text relevant to the context
6. If request is unclear, ask a clarifying question with empty actions array
7. You can execute multiple actions in one response
8. Preserve existing content unless explicitly asked to change it
9. When asked to "change design" or "make it look better", update styles not content
10. Use theme colors (var(--color-primary), etc.) when setting colors unless specific color requested`

interface RequestBody {
  message: string
  projectId?: string
  context?: {
    pageSettings?: Record<string, unknown>
    seoSettings?: Record<string, unknown>
    blockStructure?: string
    selectedBlock?: Record<string, unknown>
    projectAnalysis?: string
    styleInstructions?: string
    translatableContent?: unknown[]
    // New intent-based context fields
    schemaDocumentation?: string
    compactSchema?: string
    quickReference?: string
    relevantExamples?: Array<{
      name: string
      description: string
      actions: unknown[]
    }>
    // Project editing context
    availableSections?: Array<{
      type: string
      displayName: string
      description: string
      useCases?: string[]
      variants: string[]
      contentFields: string[]
    }>
    currentPage?: {
      sections?: Array<{
        id: string
        type: string
        variant: string
        position: number
      }>
      theme?: {
        id: string
        primaryColor: string
        backgroundColor: string
        fontHeading: string
        fontBody: string
      }
    }
    selectedSection?: {
      id: string
      type: string
      variant: string
    }
  }
  history?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body: RequestBody = await req.json()
    const { message, projectId, context, history } = body

    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get plan
    let userPlan = 'free'
    if (projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('plan')
        .eq('id', projectId)
        .single()
      if (project?.plan) userPlan = project.plan
    }

    // Check usage
    const today = new Date().toISOString().split('T')[0]
    const { count: dailyUsage } = await supabase
      .from('ai_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`)

    const limit = DAILY_LIMITS[userPlan] || DAILY_LIMITS.free

    if ((dailyUsage || 0) >= limit) {
      return new Response(
        JSON.stringify({ error: 'Daily limit reached', limit, used: dailyUsage, plan: userPlan }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build enhanced system prompt
    let systemPrompt = BASE_SYSTEM_PROMPT

    // Check if we're in project editing mode
    if (context?.availableSections && Array.isArray(context.availableSections)) {
      systemPrompt = PROJECT_EDIT_SYSTEM_PROMPT

      // Add available sections documentation
      systemPrompt += '\n\n## AVAILABLE SECTIONS\n'
      for (const section of context.availableSections) {
        systemPrompt += `\n### ${section.displayName} (${section.type})\n`
        systemPrompt += `Description: ${section.description}\n`
        if (section.useCases?.length > 0) {
          systemPrompt += `Use cases: ${section.useCases.join(', ')}\n`
        }
        systemPrompt += `Variants: ${section.variants.join(', ')}\n`
        systemPrompt += `Fields: ${section.contentFields.join(', ')}\n`
      }

      // Add current page state
      if (context.currentPage) {
        systemPrompt += '\n\n## CURRENT PAGE STATE\n'
        if (context.currentPage.sections?.length > 0) {
          systemPrompt += 'Current sections:\n'
          for (const section of context.currentPage.sections) {
            systemPrompt += `${section.position + 1}. ${section.type} (${section.variant}) - ID: ${section.id}\n`
          }
        } else {
          systemPrompt += 'Page is currently empty.\n'
        }

        // Add theme info
        if (context.currentPage.theme) {
          systemPrompt += `\nTheme: ${context.currentPage.theme.id}\n`
          systemPrompt += `Primary: ${context.currentPage.theme.primaryColor}\n`
          systemPrompt += `Background: ${context.currentPage.theme.backgroundColor}\n`
          systemPrompt += `Font heading: ${context.currentPage.theme.fontHeading}\n`
          systemPrompt += `Font body: ${context.currentPage.theme.fontBody}\n`
        }
      }

      // Add selected section if any
      if (context.selectedSection) {
        systemPrompt += '\n\n## SELECTED SECTION\n'
        systemPrompt += `Type: ${context.selectedSection.type}\n`
        systemPrompt += `Variant: ${context.selectedSection.variant}\n`
        systemPrompt += `ID: ${context.selectedSection.id}\n`
      }
    } else {
      // Original flow - add existing context logic
      if (context?.exampleTemplate) {
        systemPrompt += `\n\n## TEMPLATE FOR THIS REQUEST\nUse this as your template:\n${context.exampleTemplate}`
      }

      if (context?.styleInstructions) {
        systemPrompt += `\n\n## PROJECT STYLES (USE THESE COLORS)\n${context.styleInstructions}`
      }
    }

    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt }
    ]

    // Add history (limited to last 2 exchanges to save tokens)
    if (history?.length) {
      for (const msg of history.slice(-4)) {
        messages.push({ role: msg.role, content: msg.content })
      }
    }

    // Build user message with compact context (avoid token limits)
    let userMessage = message
    const contextParts: string[] = []

    if (context) {
      // Page colors (compact, one line)
      if (context.pageSettings) {
        const ps = context.pageSettings as Record<string, string>
        contextParts.push(`COLORS: primary=${ps.primaryColor || '#6366f1'}, secondary=${ps.secondaryColor || '#171717'}, bg=${ps.backgroundColor || '#ffffff'}, text=${ps.textColor || '#171717'}`)
      }

      // Selected block - include styles for copying
      if (context.selectedBlock) {
        const sb = context.selectedBlock as Record<string, unknown>
        const childCount = Array.isArray(sb.children) ? sb.children.length : 0
        contextParts.push(`SELECTED: type=${sb.type}, name="${sb.name}", id=${sb.id}`)

        // Include selected block's styles (compact JSON)
        if (sb.styles) {
          contextParts.push(`SELECTED STYLES: ${JSON.stringify(sb.styles)}`)
        }
        if (sb.settings) {
          contextParts.push(`SELECTED SETTINGS: ${JSON.stringify(sb.settings)}`)
        }

        // Include first child's structure as template (critical for "build more of this")
        if (childCount > 0) {
          const children = sb.children as Array<Record<string, unknown>>
          const firstChild = children[0]
          if (firstChild) {
            contextParts.push(`CHILD TEMPLATE (copy this structure): ${JSON.stringify(firstChild)}`)
          }
        }
      }
    }

    if (contextParts.length > 0) {
      userMessage += `\n\n---\n${contextParts.join('\n')}`
    }

    messages.push({ role: 'user', content: userMessage })

    // Call OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 4096,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    })

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text())
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiData = await openaiResponse.json()
    const assistantContent = openaiData.choices?.[0]?.message?.content || ''
    const tokensUsed = openaiData.usage?.total_tokens || 0

    // Log usage
    await supabase.from('ai_usage').insert({
      user_id: user.id,
      project_id: projectId || null,
      tokens_used: tokensUsed,
    })

    // Parse response - try multiple strategies
    let parsedResponse: { message: string; actions: unknown[] }

    try {
      // First, try to parse the whole content as JSON directly
      const trimmed = assistantContent.trim()
      
      // Remove markdown code blocks if present
      let jsonStr = trimmed
      if (trimmed.startsWith('```json')) {
        jsonStr = trimmed.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (trimmed.startsWith('```')) {
        jsonStr = trimmed.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      // Try parsing
      parsedResponse = JSON.parse(jsonStr)
      
      // Validate structure
      if (typeof parsedResponse.message !== 'string') {
        parsedResponse.message = String(parsedResponse.message || assistantContent)
      }
      if (!Array.isArray(parsedResponse.actions)) {
        parsedResponse.actions = []
      }
    } catch (e1) {
      // Try to find JSON object in the response
      try {
        const jsonMatch = assistantContent.match(/\{[\s\S]*"message"[\s\S]*"actions"[\s\S]*\}/)
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found')
        }
      } catch {
        // Last resort: treat as plain message
        parsedResponse = { message: assistantContent, actions: [] }
      }
    }

    return new Response(
      JSON.stringify({
        message: parsedResponse.message,
        actions: parsedResponse.actions || [],
        tokens: tokensUsed,
        usage: { used: (dailyUsage || 0) + 1, limit },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('AI assistant error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})