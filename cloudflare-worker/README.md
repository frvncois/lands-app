# Lands.app Cloudflare Worker

This Cloudflare Worker serves published Lands.app sites from Cloudflare KV storage.

## Features

- Serves HTML pages from KV storage
- Serves CSS files separately at `/style.css` for better caching
- Handles password-protected sites
- Supports custom domains
- Fast edge delivery worldwide

## Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Update Configuration

Edit `wrangler.toml` and replace `YOUR_KV_NAMESPACE_ID` with your actual KV namespace ID from the Cloudflare dashboard.

You can find it in:
- Cloudflare Dashboard → Workers & Pages → KV → Your namespace → Copy the ID

### 4. Deploy

```bash
wrangler deploy
```

## Testing Locally

```bash
wrangler dev
```

Then visit `http://localhost:8787` with a test subdomain.

## Environment Variables

The worker expects a KV namespace binding named `LANDS_SITES` which contains site data in this format:

```json
{
  "html": "<html>...</html>",
  "css": "body { ... }",
  "visibility": "public|private|password",
  "passwordHash": "sha256hash",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Routes

- `GET /` - Serves the HTML page
- `GET /style.css` - Serves the CSS stylesheet

## How It Works

1. User publishes a project in Lands.app
2. The publish function stores HTML + CSS in Cloudflare KV under the slug key
3. User visits `{slug}.lands.app`
4. Worker reads from KV and serves the content
5. Browser loads HTML, then fetches `/style.css`
6. CSS is cached for 1 hour for optimal performance

## Updates

When you redeploy the worker, all published sites are automatically updated since they read from the same KV storage.
