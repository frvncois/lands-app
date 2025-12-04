import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CLOUDFLARE_API_TOKEN = Deno.env.get('CLOUDFLARE_API_TOKEN')
const CLOUDFLARE_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')
const CLOUDFLARE_KV_NAMESPACE_ID = Deno.env.get('CLOUDFLARE_KV_NAMESPACE_ID')
const UMAMI_API_URL = Deno.env.get('UMAMI_API_URL') || 'https://cloud.umami.is'

interface RequestBody {
  projectId: string
  action: 'publish' | 'unpublish'
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate static HTML for the published site
function generateHTML(project: any, content: any, settings: any, umamiSiteId?: string): string {
  const { pageSettings, blocks } = content
  const seo = settings || {}

  const title = seo.meta_title || project.title
  const description = seo.meta_description || project.description || ''
  const ogImage = seo.og_image || ''
  const favicon = seo.favicon || ''
  const keywords = seo.keywords || ''

  // Generate Umami analytics script for Pro/Business plans
  const umamiScript = umamiSiteId
    ? `\n  <!-- Umami Analytics -->\n  <script defer src="${UMAMI_API_URL}/script.js" data-website-id="${umamiSiteId}"></script>`
    : ''

  // Generate blocks HTML
  const blocksHTML = blocks.map((block: any) => generateBlockHTML(block, pageSettings)).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}">` : ''}

  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://${project.slug}.lands.app">
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ''}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}">` : ''}

  ${favicon ? `<link rel="icon" href="${escapeHtml(favicon)}">` : ''}
  ${umamiScript}

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(pageSettings.fontFamily || 'Inter')}:wght@400;500;600;700&display=swap" rel="stylesheet">

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: '${pageSettings.fontFamily || 'Inter'}', system-ui, sans-serif;
      background-color: ${pageSettings.backgroundColor || '#ffffff'};
      color: ${pageSettings.textColor || '#000000'};
      line-height: 1.6;
      min-height: 100vh;
    }
    img { max-width: 100%; height: auto; }
    a { color: inherit; }
    .section { width: 100%; }
    .container { max-width: ${pageSettings.maxWidth || '1200px'}; margin: 0 auto; padding: 0 1rem; }
    .btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 500; text-decoration: none; transition: opacity 0.2s; cursor: pointer; border: none; }
    .btn:hover { opacity: 0.9; }
    .btn-primary { background-color: ${pageSettings.primaryColor || '#000000'}; color: ${pageSettings.backgroundColor || '#ffffff'}; }
    .btn-secondary { background-color: transparent; border: 1px solid currentColor; }

    @media (max-width: 768px) {
      .container { padding: 0 1rem; }
    }
  </style>
</head>
<body>
  ${blocksHTML}

  <!-- Powered by Lands -->
  <div style="text-align: center; padding: 2rem; font-size: 0.75rem; color: #9ca3af;">
    <a href="https://lands.app" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">
      Built with Lands
    </a>
  </div>
</body>
</html>`
}

function generateBlockHTML(block: any, pageSettings: any): string {
  const styles = block.styles || {}
  const bgColor = styles.backgroundColor || 'transparent'
  const padding = styles.padding || { top: 64, bottom: 64 }

  let innerHTML = ''

  // Handle different block types
  switch (block.type) {
    case 'hero':
    case 'text-image':
    case 'features':
    case 'cta':
    case 'text':
      innerHTML = generateStandardBlockContent(block, pageSettings)
      break
    case 'post':
      innerHTML = generatePostBlockContent(block)
      break
    case 'link':
      innerHTML = generateLinkBlockContent(block)
      break
    case 'product':
      innerHTML = generateProductBlockContent(block)
      break
    default:
      innerHTML = generateStandardBlockContent(block, pageSettings)
  }

  return `
  <section class="section" style="background-color: ${bgColor}; padding-top: ${padding.top}px; padding-bottom: ${padding.bottom}px;">
    <div class="container">
      ${innerHTML}
    </div>
  </section>`
}

function generateStandardBlockContent(block: any, pageSettings: any): string {
  const children = block.children || []
  const alignment = block.styles?.alignment || 'center'

  return `
    <div style="display: flex; flex-direction: column; align-items: ${alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start'}; text-align: ${alignment}; gap: 1rem;">
      ${children.map((item: any) => generateItemHTML(item, pageSettings)).join('')}
    </div>`
}

function generateItemHTML(item: any, pageSettings: any): string {
  const settings = item.settings || {}
  const styles = item.styles || {}

  const inlineStyles = buildInlineStyles(styles)

  switch (item.type) {
    case 'heading':
      const level = settings.level || 'h2'
      return `<${level} style="${inlineStyles}">${escapeHtml(settings.content || '')}</${level}>`

    case 'subheading':
      return `<p style="font-size: 1.25rem; opacity: 0.8; ${inlineStyles}">${escapeHtml(settings.content || '')}</p>`

    case 'text':
      return `<p style="${inlineStyles}">${escapeHtml(settings.content || '')}</p>`

    case 'button':
      const variant = settings.variant || 'primary'
      const href = settings.url || '#'
      return `<a href="${escapeHtml(href)}" class="btn btn-${variant}" style="${inlineStyles}">${escapeHtml(settings.title || 'Button')}</a>`

    case 'image':
      if (!settings.src) return ''
      return `<img src="${escapeHtml(settings.src)}" alt="${escapeHtml(settings.alt || '')}" style="border-radius: 0.5rem; ${inlineStyles}">`

    case 'video':
      if (!settings.src) return ''
      return `<video src="${escapeHtml(settings.src)}" ${settings.autoplay ? 'autoplay' : ''} ${settings.loop ? 'loop' : ''} ${settings.muted ? 'muted' : ''} controls style="border-radius: 0.5rem; width: 100%; ${inlineStyles}"></video>`

    default:
      return ''
  }
}

function generatePostBlockContent(block: any): string {
  const posts = block.postSettings?.posts || []
  const layout = block.postSettings?.layout || 'grid'

  const postsHTML = posts.map((post: any) => `
    <article style="background: rgba(0,0,0,0.03); border-radius: 0.5rem; overflow: hidden;">
      ${post.image ? `<img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;">` : ''}
      <div style="padding: 1.5rem;">
        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">${escapeHtml(post.title)}</h3>
        ${post.excerpt ? `<p style="opacity: 0.7; font-size: 0.875rem;">${escapeHtml(post.excerpt)}</p>` : ''}
        ${post.url ? `<a href="${escapeHtml(post.url)}" style="display: inline-block; margin-top: 1rem; font-weight: 500;">Read more →</a>` : ''}
      </div>
    </article>
  `).join('')

  return `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">${postsHTML}</div>`
}

function generateLinkBlockContent(block: any): string {
  const links = block.linkSettings?.links || []

  const linksHTML = links.map((link: any) => `
    <a href="${escapeHtml(link.url || '#')}" target="_blank" rel="noopener" style="display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; background: rgba(0,0,0,0.03); border-radius: 0.5rem; text-decoration: none; transition: background 0.2s;">
      ${link.icon ? `<img src="${escapeHtml(link.icon)}" alt="" style="width: 2.5rem; height: 2.5rem; border-radius: 0.375rem;">` : ''}
      <div style="flex: 1;">
        <div style="font-weight: 500;">${escapeHtml(link.title)}</div>
        ${link.description ? `<div style="font-size: 0.875rem; opacity: 0.7;">${escapeHtml(link.description)}</div>` : ''}
      </div>
      <svg style="width: 1.25rem; height: 1.25rem; opacity: 0.5;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
    </a>
  `).join('')

  return `<div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 600px; margin: 0 auto;">${linksHTML}</div>`
}

function generateProductBlockContent(block: any): string {
  const products = block.productSettings?.products || []

  const productsHTML = products.map((product: any) => `
    <div style="background: rgba(0,0,0,0.03); border-radius: 0.5rem; overflow: hidden;">
      ${product.image ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" style="width: 100%; aspect-ratio: 1; object-fit: cover;">` : ''}
      <div style="padding: 1.5rem;">
        <h3 style="font-size: 1rem; font-weight: 600;">${escapeHtml(product.title)}</h3>
        ${product.price ? `<p style="font-size: 1.25rem; font-weight: 600; margin-top: 0.5rem;">${escapeHtml(product.price)}</p>` : ''}
        ${product.url ? `<a href="${escapeHtml(product.url)}" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Buy Now</a>` : ''}
      </div>
    </div>
  `).join('')

  return `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem;">${productsHTML}</div>`
}

function buildInlineStyles(styles: any): string {
  const parts: string[] = []

  if (styles.fontSize) parts.push(`font-size: ${styles.fontSize}`)
  if (styles.fontWeight) parts.push(`font-weight: ${styles.fontWeight}`)
  if (styles.color) parts.push(`color: ${styles.color}`)
  if (styles.textAlign) parts.push(`text-align: ${styles.textAlign}`)
  if (styles.margin) {
    const m = styles.margin
    parts.push(`margin: ${m.top || 0}px ${m.right || 0}px ${m.bottom || 0}px ${m.left || 0}px`)
  }

  return parts.join('; ')
}

function escapeHtml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Store HTML in Cloudflare KV
async function storeInKV(key: string, value: string): Promise<void> {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_KV_NAMESPACE_ID) {
    console.log('Cloudflare credentials not configured, skipping KV storage')
    return
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'text/html',
    },
    body: value,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to store in KV: ${error}`)
  }
}

// Delete from Cloudflare KV
async function deleteFromKV(key: string): Promise<void> {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_KV_NAMESPACE_ID) {
    console.log('Cloudflare credentials not configured, skipping KV deletion')
    return
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`

  console.log(`Deleting from KV: ${key}`)
  console.log(`KV URL: ${url}`)

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    },
  })

  const responseText = await response.text()
  console.log(`KV delete response: ${response.status} - ${responseText}`)

  if (!response.ok) {
    throw new Error(`Failed to delete from KV: ${responseText}`)
  }

  console.log(`Successfully deleted ${key} from KV`)
}

serve(async (req) => {
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

    if (action === 'publish') {
      // Fetch project content
      const { data: content, error: contentError } = await supabase
        .from('project_content')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (contentError || !content) {
        return new Response(JSON.stringify({ error: 'Project content not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      // Fetch project settings (SEO, etc.)
      const { data: settings } = await supabase
        .from('project_settings')
        .select('*')
        .eq('project_id', projectId)
        .single()

      // Get Umami site ID for Pro/Business plans
      const umamiSiteId = project.plan !== 'free' && settings?.umami_site_id
        ? settings.umami_site_id
        : undefined

      // Generate static HTML
      const html = generateHTML(project, {
        pageSettings: content.page_settings,
        blocks: content.blocks,
      }, settings, umamiSiteId)

      // Store in Cloudflare KV using slug as key
      await storeInKV(project.slug, html)

      // Update project as published
      const publishedUrl = `https://${project.slug}.lands.app`
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          is_published: true,
          published_url: publishedUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)

      if (updateError) {
        throw updateError
      }

      // Update project_settings with published_at
      await supabase
        .from('project_settings')
        .upsert({
          project_id: projectId,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'project_id' })

      console.log(`Project ${project.slug} published to ${publishedUrl}`)

      return new Response(JSON.stringify({
        success: true,
        publishedUrl,
        message: 'Project published successfully'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })

    } else if (action === 'unpublish') {
      // Delete from Cloudflare KV
      await deleteFromKV(project.slug)

      // Update project as unpublished
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          is_published: false,
          published_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)

      if (updateError) {
        throw updateError
      }

      console.log(`Project ${project.slug} unpublished`)

      return new Response(JSON.stringify({
        success: true,
        message: 'Project unpublished successfully'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

  } catch (error) {
    console.error('Error publishing project:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
