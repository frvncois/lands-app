export interface Env {
  LANDS_PAGES: KVNamespace
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
    const html = await env.LANDS_PAGES.get(handle)

    if (!html) {
      return new Response(notFoundPage(handle), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
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
