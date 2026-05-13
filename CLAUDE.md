# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Vite — HTTPS enabled via basic-ssl)
npm run build        # Type-check + build for production
npm run type-check   # Run vue-tsc type checking only
npm run build-only   # Build without type-check
npm run preview      # Preview production build
```

No test runner is configured.

## Environment Variables

Required in `.env`:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_KEY` — Supabase publishable (anon) key
- `VITE_STRIPE_CLIENT_ID` — Stripe Connect OAuth client ID

## Architecture Overview

**Lands** is a Vue 3 + TypeScript SPA for building personal landing pages ("lands"). It uses Vite, Pinia, Vue Router, and Tailwind CSS v4. Path alias: `@` → `src/`.

### Routing & Layouts

Four layout shells, each wrapping a `<RouterView>`:

| Layout | Path | Purpose |
|---|---|---|
| _(none)_ | `/` | Storefront / marketing homepage |
| `AuthLayout` | `/auth` | Login, register, password reset — two-column with logo |
| `OnboardingLayout` | `/onboarding` | New user setup |
| `AppLayout` | `/dashboard` | Main app — `AppHeader` + scrollable content area |

Dashboard child routes: `/dashboard` (ProjectView → EditorPreview), `/dashboard/account`, `/dashboard/plans`, `/dashboard/support`.

**Router guard** (`beforeEach`): checks cached then live Supabase session; `requiresAuth` redirects to `/auth`; redirects authenticated users with no lands to `/onboarding` (unless `?invite=` query is present).

### Core Data Model

A **Land** is the central entity — a user's public page identified by `handle` (subdomain slug). Each land has:
- `sections: Section[]` — ordered by fractional index (`position` field via `fractional-indexing`)
- `theme: LandTheme` — preset (`minimal` | `bold` | `editorial`) + color/typography overrides
- `plan`, `collaborators`, `campaign_integration`

**Section** is polymorphic via `type: SectionType` (`header | text | media | content_media | list | collection | store | campaign | footer`). Each section has:
- `style_variant` — per-type style string (see table below)
- `settings_json: SectionSettings` — typed settings per section type
- `content` — typed content payload per section type

**Style variants by section type:**

| Type | Variants |
|---|---|
| `header` | `below \| overlapping \| overlay` (profile photo position vs. cover) |
| `text` | `default \| centered \| wide` |
| `media` | `default \| fullwidth \| compact` |
| `content_media` | `default \| reversed` (flips grid column order) |
| `list` | `default \| compact` |
| `collection` | `grid \| list \| cards` |
| `store` | `grid \| list` |
| `campaign` | `default \| minimal` |
| `footer` | `default` |

### Section Rendering

`EditorPreview.vue` maps section types to components via `componentMap`. Each `SectionXxx.vue` delegates to a style-variant sub-component (e.g. `TextMinimal`, `TextBold`, `TextEditorial`) found in `src/components/sections/{type}/`.

Theme presets drive which style variant renders — see `src/lib/primitives/themePresets.ts`.

### State (Pinia Stores)

- `useLandStore` — list of lands, `activeLand`, section CRUD
- `useEditorStore` — editor mode (`isEditMode`), `activeSection`, `isDirty` / `isPublished` flags, panel position
- `useProjectStore` — project mode (`preview | editor`)
- `useThemeStore` — active land theme, synced to CSS variables via `useThemeVars` composable
- `useUserStore` — current user profile
- `useAuthStore` — auth loading/error state
- `useAppModalsStore` — global modal open/close state (delete project, invite, etc.)
- `useCampaignStore` — campaign integration editor state

All section/land mutations go through the editor composables and call `editorStore.markDirty()`.

### Theme System

`useThemeVars` (called in `App.vue`) writes CSS custom properties (`--theme-font`, `--theme-color-main`, etc.) to `:root`. Components consume these vars directly in styles. Theme configuration lives in `src/lib/primitives/themePresets.ts`.

### Services

All services delegate to Supabase (auth, database, storage, Edge Functions). Services are the API layer — they do not touch Pinia stores directly.

- **land.service.ts** — `getMyLands()`, `createLand()`, `save()` (sections+theme only; uses `AbortController` to cancel stale in-flight saves), `updateLand()` (metadata: handle, title, images, plan, publish state), `deleteLand()`
- **auth.service.ts** — `login()`, `register()`, `verifyOtp()`, `forgotPassword()`, `resetPassword(newPassword)`, `logout()`, `getSession()`
- **user.service.ts** — `getMe()`, `updateMe()` (profile table), `deleteAccount()`
- **storage.service.ts** — `upload()` (auto-converts to WebP), `remove()`. Utility: `extractSectionUrls()` scans section content/settings for storage URLs.
- **stripe.service.ts** — `connectUrl()`, `handleCallback()`, `disconnect()`, `createSubscriptionCheckout()`, `createBillingPortal()` (all via Edge Functions)
- **integration.service.ts** — `saveCampaignIntegration()`, `removeCampaignIntegration()`, `fetchProviderLists()`
- **collaborator.service.ts** — `invite()`, `updateRole()`, `remove()`, `resendInvite()`, `acceptInvite()`, `refuseInvite()`
- **domain.service.ts** — `connect()`, `disconnect()`, `verify()` (custom domain via Edge Function)
- **publish.service.ts** — `publish()` with exponential backoff retry (500ms → 1s → 1.5s)

### Composables

- **useEditorActions** — All land/section mutations: `updateSectionContent()`, `updateSectionSettings()`, `updateSectionStyleVariant()`, `restoreSectionSnapshot()`, `updateLandImages()`, `updateTheme()`, land settings mutations. Re-exports the focused composables below.
- **useSectionLifecycle** — `addSection()`, `deleteSection()`, `duplicateSection()`, `reorderSection()`. Enforces plan limits; cleans up storage URLs on delete; seeds content from `purposeDefaults.ts`.
- **useListActions / useCollectionActions / useStoreActions** — Section-specific item CRUD
- **usePlan** — Feature gates and content limits from `PLAN_DETAILS`. Free tier: 2 lands, 6 sections, 2 collection sections. Paid: 25 sections, unlimited collections/lands.
- **useToast** — Module-level singleton queue. `addToast(message, type, duration, options)`. Options: `persistent`, `action: { label, onClick }`.
- **useDragSort** — Fractional indexing drag-and-drop for section reordering
- **useKeyboard** — Global shortcuts: Escape (deselect/exit edit mode), Cmd/Ctrl+E (toggle edit mode). Skips when input is focused.
- **useIsMobile** — `isMobile` ref, breakpoint at 1024px
- **useCollaboratorActions** — `getCollaborators()`, `invite()`, `updateRole()`, `remove()`, `resendInvite()`

### Save Flow

- **Editor save**: `AppHeader.save()` → `landService.save()` (sections + theme only)
- **Settings auto-save**: `updateLandSettings()` fires in preview mode (no save button)
- **Dirty tracking**: any mutation via editor composables calls `editorStore.markDirty()`

### Mock Data

`src/lib/mock/` seeds all stores with realistic Faker.js data. Two builders:
- `buildMockLand()` — full land with header, list, collection, store, footer, random theme, 0–3 collaborators
- `buildMinimalMockLand()` — header + footer only (blank-state for new projects)

### UI Components

All reusable primitives are in `src/components/ui/` prefixed with `Base` (e.g. `BaseButton`, `BaseInput`, `BaseDropdown`, `BaseModal`, `BasePlanGate`, `BaseToast`). Do not create one-off replacements — extend or use existing Base components.

`BasePlanGate` is the standard paywall wrapper — use it to gate paid features in the UI.

### Campaign Integrations

Supported email providers (stored as `land.campaign_integration`): Kit, Loops, Brevo, Flodesk, Resend, Mailchimp, Webhook. Each has a provider-specific config shape in `src/types/campaign.ts`. UI lives in `IntegrationSettingsModal.vue`.

### Key Source Files

- `src/composables/useEditorActions.ts` — all section/land mutations
- `src/composables/useSectionLifecycle.ts` — section add/delete/reorder with plan enforcement
- `src/components/shared/AppHeader.vue` — save/publish/discard flow, editor mode toggle
- `src/lib/primitives/styleVariants.ts` — `STYLE_VARIANTS_BY_SECTION` map
- `src/lib/primitives/sectionDefaults.ts` — default content/settings per section type
- `src/lib/primitives/themePresets.ts` — theme preset definitions
- `src/sections/index.ts` — `SectionPrimitive[]` (add section picker data)

### Known Pre-existing Type Errors

TipTap node view components (`AudioBlock`, `VideoBlock`, `FileBlock`) and `RichTextEditor` have type errors with `SetContentOptions` and `NodeViewProps`. These are known upstream compatibility issues — do not fix unless explicitly requested.
