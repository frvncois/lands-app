import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateContentRequest {
  presetId: string
  projectName: string
  projectDescription?: string
  referenceUrl?: string
  themeId: string
}

interface SectionTemplate {
  type: string
  variant: string
  data: Record<string, unknown>
}

// System prompt for content generation
const SYSTEM_PROMPT = `You are an AI content generator for a landing page builder called Lands.

Your task is to generate realistic, relevant content for landing page sections based on the user's project details.

## RULES:
1. Generate content that matches the project name and description
2. Create engaging, professional copy that sounds natural
3. For repeating items (cards, products, links, etc.), generate 3-6 realistic examples
4. Use proper formatting and appropriate tone
5. Make headlines concise and impactful (5-10 words)
6. Make descriptions informative but brief (1-2 sentences)
7. Use realistic placeholder CTAs like "Get Started", "Learn More", "Contact Us"
8. If a reference URL is provided, try to match its tone and style
9. Return ONLY valid JSON with the exact structure provided

## OUTPUT FORMAT:
{
  "sections": [
    {
      "type": "hero",
      "data": {
        "headline": "...",
        "subheadline": "...",
        "primaryCTA": {"label": "...", "url": "#"},
        "secondaryCTA": {"label": "...", "url": "#"}
      }
    },
    {
      "type": "cards",
      "data": {
        "headline": "...",
        "subheadline": "...",
        "items": [
          {"title": "...", "description": "...", "icon": "content-icon"},
          ...
        ]
      }
    }
  ]
}

IMPORTANT: Your response must be valid JSON that can be parsed. Do not include any explanation or markdown formatting.`

serve(async (req) => {
  // Handle CORS preflight
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

    const {
      presetId,
      projectName,
      projectDescription,
      referenceUrl,
      themeId
    }: GenerateContentRequest = await req.json()

    // Get the template structure for this preset
    // In a real implementation, this would fetch from the presets system
    // For now, we'll construct a simplified version
    const templateStructure = await getTemplateStructure(presetId)

    // Fetch reference website content if URL provided
    let referenceContent = ''
    if (referenceUrl) {
      try {
        referenceContent = await fetchReferenceWebsite(referenceUrl)
      } catch (error) {
        console.error('Failed to fetch reference URL:', error)
        // Continue without reference content
      }
    }

    // Build the prompt for OpenAI
    const userPrompt = buildUserPrompt({
      projectName,
      projectDescription,
      referenceContent,
      templateStructure,
      themeId
    })

    // Call OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4096,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
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
      project_id: null, // No project ID yet since we're creating it
      tokens_used: tokensUsed,
    })

    // Parse the generated JSON
    let generatedContent
    try {
      const trimmed = assistantContent.trim()

      // Remove markdown code blocks if present
      let jsonStr = trimmed
      if (trimmed.startsWith('```json')) {
        jsonStr = trimmed.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (trimmed.startsWith('```')) {
        jsonStr = trimmed.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      generatedContent = JSON.parse(jsonStr)
    } catch (error) {
      console.error('Failed to parse OpenAI response:', assistantContent)
      throw new Error('Invalid JSON response from AI')
    }

    return new Response(
      JSON.stringify(generatedContent),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error generating content:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

/**
 * Get template structure for a preset
 * TODO: This should fetch from the actual presets system
 */
async function getTemplateStructure(presetId: string): Promise<SectionTemplate[]> {
  // Simplified - return a basic structure
  // In production, this would query the presets system
  return [
    { type: 'hero', variant: 'stacked', data: {} },
    { type: 'cards', variant: 'grid', data: { items: [] } },
    { type: 'contact', variant: 'stacked', data: {} }
  ]
}

/**
 * Fetch and extract content from reference website
 */
async function fetchReferenceWebsite(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Lands Content Generator Bot)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()

    // Extract text content (simplified - just get title and meta description)
    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
    const descMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/i)

    const title = titleMatch ? titleMatch[1] : ''
    const description = descMatch ? descMatch[1] : ''

    return `Reference site title: ${title}\nReference site description: ${description}`
  } catch (error) {
    console.error('Failed to fetch reference URL:', error)
    return ''
  }
}

/**
 * Build the user prompt for OpenAI
 */
function buildUserPrompt(params: {
  projectName: string
  projectDescription?: string
  referenceContent: string
  templateStructure: SectionTemplate[]
  themeId: string
}): string {
  const { projectName, projectDescription, referenceContent, templateStructure, themeId } = params

  let prompt = `Generate landing page content for this project:

**Project Name:** ${projectName}

${projectDescription ? `**Description:** ${projectDescription}\n` : ''}
${referenceContent ? `**Reference Website:**\n${referenceContent}\n` : ''}
**Theme:** ${themeId}

**Template Structure:**
${JSON.stringify(templateStructure, null, 2)}

Please generate engaging, relevant content for each section following the template structure above. Fill in all text fields with realistic content that matches the project.`

  return prompt
}
