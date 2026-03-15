# Production TODO

Audit performed 2026-03-14. Items ordered by priority.

---

## 🔴 Blockers — must fix before launch

- [ ] **XSS — sanitize markdown output**
  Wrap `renderMarkdown()` output in `DOMPurify.sanitize()` in `TextMinimal.vue`, `TextBold.vue`, `TextEditorial.vue`.

- [ ] **Stripe OAuth CSRF**
  Generate a random token before redirecting to Stripe, store in `sessionStorage`, validate it in `StripeCallbackView.vue` on return. Currently `?state=landId` is trusted blindly.

- [ ] **Environment variable guard**
  Add startup validation in `src/lib/supabase.ts` — throw a clear error if `VITE_SUPABASE_URL` or `VITE_SUPABASE_KEY` are empty instead of silently failing.

- [ ] **Mock data must be DEV-only**
  Gate `initMockData()` in `App.vue` behind `import.meta.env.DEV`. Must never run in a production build.

- [ ] **Collaborator mutations are local-only**
  `src/composables/useCollaboratorActions.ts` — invite, updateRole, remove, resendInvite all mutate Pinia only. No backend calls. Changes are lost on refresh.

- [ ] **Account deletion does nothing**
  `AccountView.vue` calls `authService.logout()` only. Implement a Supabase Edge Function that cascades-deletes the user's account, all lands, sections, storage files, and Stripe associations. Required for GDPR.

- [ ] **Billing upgrade is a fake timeout**
  `PlansView.vue` has `setTimeout(800)` in place of a real Stripe subscription call. Users who upgrade are not charged.

- [ ] **Email integrations are stubs**
  All adapters (Mailchimp, Kit, Flodesk, Brevo) have `// TODO: route through Supabase edge function`. Campaign section email capture does nothing.

---

## 🟠 High priority — fix shortly after launch

- [ ] **30+ unsafe type casts**
  Replace `as any` and `as unknown as` throughout `useEditorActions.ts`, `SectionSettingsModal.vue`, and section components with proper discriminated union type guards.

- [ ] **Auth state stale on app load**
  `App.vue` only reacts to `SIGNED_IN` event. A user whose session expired between visits won't be redirected until they hit a protected action. Validate session on mount.

- [ ] **Non-null assertion on land array**
  `src/stores/land.ts` line 29: `data[0]!.id` crashes if API returns empty array. Use `data[0]?.id ?? null`.

- [ ] **Storage deletion swallowed**
  `useEditorActions.ts` discards Supabase Storage deletion failures with `.catch(() => {})`. Orphaned files accumulate. Log failures at minimum; consider a retry queue.

- [ ] **Replace `JSON.parse/stringify` deep clone**
  Used in `editor.ts` and `useEditorActions.ts` for snapshots. Replace with `structuredClone()`.

- [ ] **Centralized error logging**
  Integrate Sentry (or equivalent). No production errors are currently observable.

---

## 🟡 Medium priority — next sprint

- [ ] **CSS variable fallbacks**
  Add default values for `--theme-main`, `--theme-accent`, `--theme-surface`, `--theme-font-title`, `--theme-font-body` in `main.css` so components don't render broken before `useThemeVars` runs.

- [ ] **Plan limits should be database-driven**
  `usePlan.ts` has hardcoded flat limits (free=6 sections, paid=25). Move to DB to support trials, custom overrides, and graduated tiers without code changes.

- [ ] **Input validation on registration**
  Email format and password strength are only validated in `AccountView`. Add the same checks at registration time in `RegisterView.vue`.

- [ ] **Hide incomplete features**
  Account deletion UI exists but does nothing. Email integrations show in UI but have no backend. Gate behind feature flags or mark "coming soon" to avoid user confusion.

- [ ] **Consolidate modal state**
  Two modal systems exist: `useAppModals` store and local `ref` state in `AppHeader.vue`. Unify into a single pattern.

- [ ] **Security headers**
  Configure CSP, `X-Frame-Options`, and `Referrer-Policy` at the CDN/hosting layer before launch.

---

## 🔵 Low / polish

- [ ] **No `robots.txt`** — add before indexing is desirable.
- [ ] **`window.*` calls without SSR guards** — `stripe.service.ts`, `SupportView.vue` etc. Fine now, fragile if SSR is introduced.
- [ ] **Inconsistent error messaging** — some surfaces show raw API errors, others show generic "try again". Centralize error-to-message mapping.
- [ ] **No rate limiting on password reset** — client-side only; add exponential backoff.
- [ ] **Missing `<meta>` description and OG tags** — required for social sharing and SEO.
