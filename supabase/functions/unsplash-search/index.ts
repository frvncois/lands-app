import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const UNSPLASH_ACCESS_KEY = Deno.env.get('UNSPLASH_ACCESS_KEY')!

interface UnsplashPhoto {
  id: string
  width: number
  height: number
  color: string
  blur_hash: string
  description: string | null
  alt_description: string | null
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  user: {
    id: string
    name: string
    username: string
    links: {
      html: string
    }
  }
}

interface UnsplashSearchResponse {
  total: number
  total_pages: number
  results: UnsplashPhoto[]
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, page = 1, per_page = 30, orientation, order_by } = await req.json()

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Build URL with parameters
    const params = new URLSearchParams({
      query,
      page: String(page),
      per_page: String(per_page),
    })

    if (orientation) {
      params.set('orientation', orientation)
    }

    if (order_by) {
      params.set('order_by', order_by)
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?${params.toString()}`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Unsplash API error:', response.status, errorText)
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data: UnsplashSearchResponse = await response.json()

    // Return simplified photo data
    const photos = data.results.map(photo => ({
      id: photo.id,
      width: photo.width,
      height: photo.height,
      color: photo.color,
      description: photo.alt_description || photo.description || '',
      urls: {
        thumb: photo.urls.thumb,
        small: photo.urls.small,
        regular: photo.urls.regular,
        full: photo.urls.full,
      },
      user: {
        name: photo.user.name,
        username: photo.user.username,
        link: photo.user.links.html,
      },
    }))

    return new Response(JSON.stringify({
      photos,
      total: data.total,
      total_pages: data.total_pages,
      page,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

  } catch (error) {
    console.error('Unsplash search error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
