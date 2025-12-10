import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GOOGLE_FONT_API_KEY = Deno.env.get('GOOGLE_FONT_API')!

interface GoogleFont {
  family: string
  variants: string[]
  subsets: string[]
  category: string
  files: Record<string, string>
}

interface GoogleFontsResponse {
  kind: string
  items: GoogleFont[]
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache fonts in memory for 1 hour to reduce API calls
let cachedFonts: GoogleFont[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

async function fetchGoogleFonts(): Promise<GoogleFont[]> {
  const now = Date.now()

  // Return cached fonts if still valid
  if (cachedFonts && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedFonts
  }

  const response = await fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONT_API_KEY}&sort=popularity`
  )

  if (!response.ok) {
    throw new Error(`Google Fonts API error: ${response.status}`)
  }

  const data: GoogleFontsResponse = await response.json()
  cachedFonts = data.items
  cacheTimestamp = now

  return data.items
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const category = url.searchParams.get('category') || ''
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let fonts = await fetchGoogleFonts()

    // Filter by search term
    if (search) {
      fonts = fonts.filter(font =>
        font.family.toLowerCase().includes(search)
      )
    }

    // Filter by category
    if (category) {
      fonts = fonts.filter(font => font.category === category)
    }

    // Get total count before pagination
    const total = fonts.length

    // Apply pagination
    fonts = fonts.slice(offset, offset + limit)

    // Return simplified font data
    const simplifiedFonts = fonts.map(font => ({
      family: font.family,
      category: font.category,
      variants: font.variants,
    }))

    return new Response(JSON.stringify({
      fonts: simplifiedFonts,
      total,
      categories: ['sans-serif', 'serif', 'display', 'handwriting', 'monospace'],
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

  } catch (error) {
    console.error('Google Fonts fetch error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
