export interface Env {
  LANDS_PAGES: KVNamespace
}

// Fast 32-bit hash — good enough for a change-detection ETag
function hashString(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0
  }
  return (h >>> 0).toString(36)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const parts = url.hostname.split('.')

    // Must be a subdomain (handle.lands.app), not lands.app itself
    if (parts.length < 3) {
      return new Response(notFoundPage(), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    const handle = parts[0]

    // Read html + metadata (version written by publish function)
    // cacheTtl: 0 bypasses the Worker runtime's 60-second KV read cache so updates are instant
    const { value: html, metadata } = await env.LANDS_PAGES.getWithMetadata<{ version: string }>(handle, { cacheTtl: 0 })

    if (!html) {
      return new Response(notFoundPage(handle), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    // Use stored version as ETag when available, fall back to hashing the body
    const etag = `"${(metadata as any)?.version ?? hashString(html)}"`

    // Respond 304 if client already has this version
    if (request.headers.get('If-None-Match') === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          'Cache-Control': 'no-cache',
          'ETag': etag,
        },
      })
    }

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // no-cache: browser always revalidates — ETag makes it a cheap 304 when nothing changed
        'Cache-Control': 'no-cache',
        'ETag': etag,
      },
    })
  },
}

function notFoundPage(handle?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Not found — Lands</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fafafa; }
    .wrap { text-align: center; display: flex; flex-direction: column; gap: 0.5rem; align-items: center; }
    h1 { font-size: 0.875rem; font-weight: 500; color: #374151; }
    p { font-size: 0.75rem; color: #9ca3af; }
    a { font-size: 0.75rem; color: #9ca3af; text-decoration: none; margin-top: 1rem; display: block; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${handle ? `${handle}.lands.app` : 'Page not found'}</h1>
    <p>This page hasn't been published yet.</p>
    <a href="https://lands.app">← Back to Lands</a>
  </div>
</body>
</html>`
}
