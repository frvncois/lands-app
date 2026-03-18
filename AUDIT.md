# Lands App — Engineering Audit
> Senior engineering review. Think Series A due diligence.
> Date: 2026-03-16

---

## Executive Summary

Vue 3 + TypeScript SPA with Supabase backend, Stripe integration, Cloudflare KV publishing. Solid architectural foundation with open issues across type safety, security, error handling, performance, and data model consistency.

**Overall Risk:** Low for MVP → Medium without addressing the issues below.

---

## Medium Severity

### M9 — Missing discriminated union for Section content
**File:** `src/types/section.ts`
**Severity:** MEDIUM

```ts
content: HeaderContent | TextContent | MediaContent | ... | null
```

Without a discriminated union, TypeScript can't narrow `content` based on `section.type`. Every usage requires manual casting with `as HeaderContent`.

**Fix (medium-term refactor):**
```ts
type Section =
  | { type: 'header';       content: HeaderContent;       settings_json: HeaderSettings }
  | { type: 'content_media'; content: ContentMediaContent; settings_json: ContentMediaSettings }
  | ...
```

---

## Low Severity

### L8 — `usePlan.ts` plan details are hardcoded
**File:** `src/composables/usePlan.ts`

Plan features (what's allowed on free vs paid) are hardcoded constants in frontend code. If you change plan structure, you must redeploy frontend.

**Fix (medium-term):** Fetch plan configuration from a backend endpoint or Supabase remote config.

---

### L10 — Cloudflare `cacheTtl: 0` performance cost
**File:** `worker/src/index.ts:30`

Bypassing Worker KV cache with `cacheTtl: 0` means every request hits Cloudflare's central KV store (~10-40ms latency) instead of edge cache (~1ms). At scale this is a bottleneck.

**Fix (post-launch):** Keep `cacheTtl: 0` for now (correctness > performance). Once publishing is stable, switch to short `cacheTtl: 10` (10s) + Cloudflare Cache Purge API call on publish. Best of both worlds.

---

## Production Readiness

### P1 — No error tracking
**Severity:** CRITICAL
No Sentry/Datadog/etc. Install `@sentry/vue`, init in `main.ts` with `VITE_SENTRY_DSN`. Add exception capture to Edge Functions too.

### P2 — No rate limiting on Edge Functions
**Severity:** CRITICAL
`publish`, `stripe-connect`, `subscribe` can be spammed with no protection. Fix with Supabase native rate limit headers or a Cloudflare Worker rate limiter in front.

### P3 — Environment variable completeness
**Severity:** CRITICAL
Verify all required vars (`ALLOWED_ORIGIN`, `STRIPE_*`, `CLOUDFLARE_*`, `SUPABASE_*`) exist in Supabase project secrets and `.env.production`. Add startup check to fail fast if any are missing.

### P4 — SEO / Open Graph on published lands
**Severity:** HIGH
Cloudflare Worker renders HTML but published lands may be missing `<meta og:title>`, `og:image`, `og:description>` tags. Without them social sharing is broken.

### P5 — Storefront not wired to router
**Severity:** HIGH
`src/components/storefront/` (HomeHero, FeaturesSection, MainHeader, ShowcaseSection) needs to be routed and live at `lands.app/` before driving traffic.

### P6 — Checkout views untested end-to-end
**Severity:** HIGH
`CheckoutSuccessView` and `CheckoutCancelView` need to be routed and verified end-to-end with Stripe test mode.

---

## Architecture Improvements (Non-Issues, Recommendations)

### A1 — Account-level plan model
Currently plan is per-land. As you grow, users need account-level plan with multiple lands. Add `plan_tier` to `users` table.

### A2 — Activity log / change history
No record of who changed what or when. Users can't revert. Essential for collaborative features.
- Add `land_events` table: `{ id, land_id, user_id, type, payload, created_at }`

### A3 — Rate limiting
No rate limiting on Edge Functions. Malicious actor could spam publish, subscribe, or stripe-connect endpoints.
- Use Supabase RLS + `pg_rate_limit` or a Cloudflare Worker rate limiter in front.

### A4 — Missing public `/:handle` route
Lands are only accessible at `handle.lands.app`. No way to share a link to a land from the main domain (`lands.app/username`).

### A5 — No structured error tracking
No Sentry/Datadog/etc. integration. When something breaks in production, you won't know until a user reports it.
- Add Sentry with `Vue.config.errorHandler` and Supabase Edge Function exception capture.

### A6 — Version history / undo
Users have no way to recover from accidental destructive edits beyond closing without saving. Implement content snapshots stored in Supabase (configurable retention, e.g., last 10 saves).

---

## Open Issues

| ID | Category | Severity | File |
|----|----------|----------|------|
| P1 | Observability | CRITICAL | main.ts + Edge Functions |
| P2 | Security | CRITICAL | Edge Functions |
| P3 | Config | CRITICAL | env vars |
| P4 | SEO | HIGH | worker/renderer.ts |
| P5 | Storefront | HIGH | src/components/storefront/ |
| P6 | Checkout | HIGH | src/views/checkout/ |
| M9 | Type safety | MEDIUM | types/section.ts |
| L8 | Config | LOW | usePlan.ts |
| L10 | Performance | LOW | worker/src/index.ts |

## Next Fix Order

1. **P1** — Add Sentry error tracking
2. **P2** — Rate limit Edge Functions
3. **P3** — Verify and guard env vars
4. **P4** — Add OG meta tags to published lands
5. **P5** — Wire storefront to router
6. **P6** — Test checkout flow end-to-end
7. **L10** — Enable KV edge cache post-launch
8. **L8** — Move plan config to backend when plan structure changes
9. **M9** — Discriminated union for Section (dedicated refactor sprint)
