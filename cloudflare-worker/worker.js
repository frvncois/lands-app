/**
 * Lands.app Cloudflare Worker
 *
 * Serves published landing pages from KV storage.
 * Supports: subdomains, custom domains, password protection, caching, separate CSS files
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const hostname = url.hostname
    const pathname = url.pathname

    // Security headers for all responses
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-XSS-Protection': '1; mode=block',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cloud.umami.is https://static.cloudflareinsights.com",
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self' https://cdn.fontshare.com https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://cloud.umami.is https://static.cloudflareinsights.com",
        "frame-ancestors 'none'",
      ].join('; '),
    }

    // Handle favicon requests
    if (pathname === '/favicon.ico') {
      return new Response(null, { status: 204 })
    }

    // Handle robots.txt
    if (pathname === '/robots.txt') {
      return new Response('User-agent: *\nAllow: /', {
        headers: { 'Content-Type': 'text/plain', ...securityHeaders }
      })
    }

    // Check if KV is bound
    if (!env.LANDS_SITES) {
      return new Response('Service temporarily unavailable', {
        status: 503,
        headers: { 'Content-Type': 'text/plain', ...securityHeaders }
      })
    }

    // Determine the site key (slug) to look up
    let siteKey = null
    let isCustomDomain = false

    // Check for naked domain (lands.app or lands-app.pages.dev)
    if (hostname === 'lands.app' || hostname === 'www.lands.app' || hostname === 'lands-app.pages.dev') {
      return new Response(getSplashPage('Welcome to Lands', 'Create beautiful landing pages in minutes.'), {
        status: 200,
        headers: { 'Content-Type': 'text/html;charset=UTF-8', ...securityHeaders }
      })
    }
    // Check if this is a lands.app subdomain
    else if (hostname.endsWith('.lands.app') || hostname.endsWith('.lands-app.pages.dev')) {
      const parts = hostname.split('.')
      const subdomain = parts[0]

      // Skip for www subdomain
      if (subdomain === 'www') {
        return new Response(getSplashPage('Welcome to Lands', 'Create beautiful landing pages in minutes.'), {
          status: 200,
          headers: { 'Content-Type': 'text/html;charset=UTF-8', ...securityHeaders }
        })
      }

      siteKey = subdomain
    }
    // Check for workers.dev development URL
    else if (hostname.includes('workers.dev')) {
      return new Response(getSplashPage('Lands Worker', 'Worker is running. Access sites via subdomain.lands.app'), {
        status: 200,
        headers: { 'Content-Type': 'text/html;charset=UTF-8', ...securityHeaders }
      })
    }
    // Custom domain - look up the domain mapping
    else {
      isCustomDomain = true
      // Look up custom domain in the DOMAINS_KV namespace
      if (env.DOMAINS_KV) {
        siteKey = await env.DOMAINS_KV.get(hostname)
      }

      // Fallback: check if hostname itself is stored as a key (legacy support)
      if (!siteKey) {
        siteKey = hostname
      }
    }

    if (!siteKey) {
      return new Response(getSplashPage('Domain Not Configured', 'This domain is not connected to any Lands site.'), {
        status: 404,
        headers: { 'Content-Type': 'text/html;charset=UTF-8', ...securityHeaders }
      })
    }

    // Handle CSS file requests
    if (pathname === '/style.css') {
      return serveCSSFile(env.LANDS_SITES, siteKey, securityHeaders, request)
    }

    // Fetch site data from KV
    // We now store JSON with metadata: { html, css, visibility, passwordHash, updatedAt }
    const siteDataRaw = await env.LANDS_SITES.get(siteKey, { type: 'text' })

    if (!siteDataRaw) {
      return new Response(getSplashPage('Site Not Found', 'This site is either unpublished or doesn\'t exist.'), {
        status: 404,
        headers: { 'Content-Type': 'text/html;charset=UTF-8', ...securityHeaders }
      })
    }

    // Parse site data - support both legacy (raw HTML) and new format (JSON with metadata)
    let html, css, visibility, passwordHash, updatedAt

    try {
      // Try to parse as JSON (new format)
      const siteData = JSON.parse(siteDataRaw)
      html = siteData.html
      css = siteData.css
      visibility = siteData.visibility || 'public'
      passwordHash = siteData.passwordHash
      updatedAt = siteData.updatedAt
    } catch {
      // Legacy format - raw HTML string
      html = siteDataRaw
      css = null
      visibility = 'public'
      passwordHash = null
      updatedAt = null
    }

    // Handle visibility settings
    if (visibility === 'private') {
      return new Response(getSplashPage('Private Site', 'This site is private and not publicly accessible.'), {
        status: 403,
        headers: { 'Content-Type': 'text/html;charset=UTF-8', ...securityHeaders }
      })
    }

    // Handle password protection
    if (visibility === 'password' && passwordHash) {
      // Check for password in cookie or query param
      const cookies = parseCookies(request.headers.get('Cookie') || '')
      const authCookie = cookies[`lands_auth_${siteKey}`]
      const queryPassword = url.searchParams.get('password')

      let isAuthenticated = false

      if (authCookie) {
        // ✅ SECURITY FIX: Verify the session token instead of plaintext password
        isAuthenticated = await verifySessionToken(authCookie, siteKey, passwordHash)
      }

      if (!isAuthenticated && queryPassword) {
        // Check query param password
        isAuthenticated = await verifyPassword(queryPassword, passwordHash)

        if (isAuthenticated) {
          // ✅ SECURITY FIX: Generate session token instead of storing plaintext password
          const sessionToken = await generateSessionToken(siteKey, passwordHash)

          // Set auth cookie with session token and redirect to clean URL
          const response = new Response(null, {
            status: 302,
            headers: {
              'Location': url.pathname,
              'Set-Cookie': `lands_auth_${siteKey}=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
              ...securityHeaders
            }
          })
          return response
        }
      }

      if (!isAuthenticated) {
        // Show password form
        return new Response(getPasswordPage(siteKey), {
          status: 401,
          headers: { 'Content-Type': 'text/html;charset=UTF-8', ...securityHeaders }
        })
      }
    }

    // Build cache headers
    const cacheHeaders = {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      ...securityHeaders
    }

    // Add ETag if we have updatedAt
    if (updatedAt) {
      cacheHeaders['ETag'] = `"${btoa(updatedAt).slice(0, 16)}"`
      cacheHeaders['Last-Modified'] = new Date(updatedAt).toUTCString()

      // Check for conditional request
      const ifNoneMatch = request.headers.get('If-None-Match')
      const ifModifiedSince = request.headers.get('If-Modified-Since')

      if (ifNoneMatch === cacheHeaders['ETag']) {
        return new Response(null, { status: 304, headers: cacheHeaders })
      }

      if (ifModifiedSince && new Date(ifModifiedSince) >= new Date(updatedAt)) {
        return new Response(null, { status: 304, headers: cacheHeaders })
      }
    }

    return new Response(html, { headers: cacheHeaders })
  }
}

/**
 * Serve CSS file from KV storage
 */
async function serveCSSFile(kvNamespace, siteKey, securityHeaders, request) {
  try {
    // Fetch site data from KV
    const siteDataRaw = await kvNamespace.get(siteKey, { type: 'text' })

    if (!siteDataRaw) {
      return new Response('/* Site not found */', {
        status: 404,
        headers: { 'Content-Type': 'text/css;charset=UTF-8', ...securityHeaders }
      })
    }

    // Parse site data
    let css, updatedAt

    try {
      const siteData = JSON.parse(siteDataRaw)
      css = siteData.css
      updatedAt = siteData.updatedAt
    } catch {
      // Legacy format - no CSS available
      return new Response('/* Legacy site - no CSS file */', {
        status: 404,
        headers: { 'Content-Type': 'text/css;charset=UTF-8', ...securityHeaders }
      })
    }

    if (!css) {
      return new Response('/* No CSS available */', {
        status: 404,
        headers: { 'Content-Type': 'text/css;charset=UTF-8', ...securityHeaders }
      })
    }

    // Build cache headers for CSS
    const cacheHeaders = {
      'Content-Type': 'text/css;charset=UTF-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400', // Cache CSS for 24 hours, use ETag for invalidation
      'Access-Control-Allow-Origin': '*', // Allow CORS for CSS
      ...securityHeaders
    }

    // Add ETag if we have updatedAt
    if (updatedAt) {
      const etag = `"css-${btoa(updatedAt).slice(0, 16)}"`
      cacheHeaders['ETag'] = etag
      cacheHeaders['Last-Modified'] = new Date(updatedAt).toUTCString()

      // Check for conditional request headers (to support cache revalidation)
      if (request && request.headers) {
        const ifNoneMatch = request.headers.get('If-None-Match')
        const ifModifiedSince = request.headers.get('If-Modified-Since')

        if (ifNoneMatch === etag) {
          return new Response(null, { status: 304, headers: cacheHeaders })
        }

        if (ifModifiedSince && new Date(ifModifiedSince) >= new Date(updatedAt)) {
          return new Response(null, { status: 304, headers: cacheHeaders })
        }
      }
    }

    return new Response(css, { headers: cacheHeaders })
  } catch (error) {
    console.error('Error serving CSS:', error)
    return new Response('/* Error loading CSS */', {
      status: 500,
      headers: { 'Content-Type': 'text/css;charset=UTF-8', ...securityHeaders }
    })
  }
}

/**
 * Parse cookies from header string
 */
function parseCookies(cookieString) {
  const cookies = {}
  if (!cookieString) return cookies

  cookieString.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=')
    if (name) {
      cookies[name] = rest.join('=')
    }
  })
  return cookies
}

/**
 * Verify password against stored hash
 * For simplicity, using direct comparison - in production, use proper hashing
 */
async function verifyPassword(password, storedHash) {
  // Simple hash verification - the publish function should store hashed passwords
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex === storedHash
}

/**
 * ✅ SECURITY FIX: Generate session token from site key and password hash
 * Instead of storing plaintext password in cookie, we derive a secure token
 */
async function generateSessionToken(siteKey, passwordHash) {
  const encoder = new TextEncoder()
  const data = encoder.encode(`${siteKey}:${passwordHash}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * ✅ SECURITY FIX: Verify session token matches expected value
 */
async function verifySessionToken(token, siteKey, passwordHash) {
  const expectedToken = await generateSessionToken(siteKey, passwordHash)
  return token === expectedToken
}

/**
 * Password protection page
 */
function getPasswordPage(siteKey) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Required - Lands</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%);
      color: #ffffff;
      padding: 2rem;
    }
    .container {
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    .lock-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.5rem;
      background: rgba(102, 126, 234, 0.1);
      border: 1px solid rgba(102, 126, 234, 0.3);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lock-icon svg {
      width: 28px;
      height: 28px;
      color: #667eea;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    p {
      font-size: 0.9375rem;
      color: #a0a0a0;
      margin-bottom: 1.5rem;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    input {
      width: 100%;
      padding: 0.875rem 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
      color: #fff;
      font-size: 1rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus {
      border-color: #667eea;
    }
    input::placeholder {
      color: #606060;
    }
    button {
      width: 100%;
      padding: 0.875rem 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
      font-size: 1rem;
      font-family: inherit;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    }
    .error {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: -0.5rem;
      display: none;
    }
    .error.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="lock-icon">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
      </svg>
    </div>
    <h1>Password Protected</h1>
    <p>This site requires a password to view.</p>
    <form method="GET" action="">
      <input
        type="password"
        name="password"
        placeholder="Enter password"
        required
        autofocus
      />
      <button type="submit">View Site</button>
    </form>
  </div>
</body>
</html>`
}

/**
 * Splash/error page template
 */
function getSplashPage(title, message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Lands</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%);
      color: #ffffff;
      padding: 2rem;
    }
    .container {
      text-align: center;
      max-width: 480px;
    }
    .logo {
      width: 64px;
      height: 64px;
      margin: 0 auto 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
    }
    h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    p {
      font-size: 1.125rem;
      color: #a0a0a0;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.75rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      text-decoration: none;
      border-radius: 0.5rem;
      font-weight: 500;
      font-size: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
    }
    .footer {
      margin-top: 4rem;
      font-size: 0.875rem;
      color: #606060;
    }
    .footer a {
      color: #808080;
      text-decoration: none;
    }
    .footer a:hover {
      color: #a0a0a0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">L</div>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <a href="https://lands.app" class="btn">
      <span>Create Your Own</span>
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
      </svg>
    </a>
    <div class="footer">
      Powered by <a href="https://lands.app">Lands</a>
    </div>
  </div>
</body>
</html>`
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
