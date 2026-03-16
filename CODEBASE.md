# Lands App — Codebase Reference

> Generated 2026-03-15. Vue 3 + TypeScript SPA. Vite + Pinia + Vue Router + Tailwind CSS v4.

---

## Table of Contents

1. [Types](#types)
2. [Stores](#stores)
3. [Composables](#composables)
4. [Services](#services)
5. [Lib / Utilities](#lib--utilities)
6. [Router](#router)
7. [Layouts](#layouts)
8. [Views](#views)
9. [Components — Shared & Editor](#components--shared--editor)
10. [Components — Sections](#components--sections)
11. [Components — Dashboard](#components--dashboard)
12. [Components — Modals](#components--modals)
13. [Components — Integrations](#components--integrations)
14. [Components — UI (Base)](#components--ui-base)
15. [Sections Index](#sections-index)
16. [Supabase Edge Functions](#supabase-edge-functions)
17. [Key Patterns & Conventions](#key-patterns--conventions)

---

## Types

> `src/types/`

### `land.ts`
Central domain entity.

| Export | Description |
|--------|-------------|
| `Land` | `id, user_id, handle` (URL slug)`, title, description, sections[], theme, plan, collaborators[], stripe_account_id, stripe_customer_id, stripe_subscription_id, custom_domain, is_published, is_private, private_password` |

---

### `section.ts`
Polymorphic section types.

| Export | Description |
|--------|-------------|
| `SECTION_TYPES` | `{ header, content_media, list, collection, store, monetize, campaign, footer }` |
| `SectionType` | Union of above |
| `Section` | `id, land_id, type, position` (fractional)`, style_variant, settings_json, content, created_at` |
| `HeaderSettings` | `profile_position, cover_media_type, cover_image, cover_video_url, cover_color` |
| `CollectionSettings` | `display` (grid/list/cards) |
| `StoreSettings` | `display` (grid/list), `mode` (products/membership) |
| `MonetizeSettings` | Same shape as StoreSettings |
| `CampaignSettings` | `show_name_field, provider, api_key, webhook_url, audience_id` |
| `FooterSettings` | Footer-specific fields |
| `SectionSettings` | Discriminated union of all settings |
| `HeaderContent` | `title, subtitle, logo_image, avatar_image, cover_image` |
| `TextContent` | `body` (rich text JSON) |
| `MediaContent` | `media_url, media_type, caption` |
| `ContentMediaContent` | `title, subtitle, body, media_url, media_type, link_label, link_url` |
| `CampaignContent` | `title, subtitle, button_label` |
| `FooterContent` | `title, subtitle, links[]` |

---

### `theme.ts`

| Export | Description |
|--------|-------------|
| `THEME_PRESETS` | `{ minimal, bold, editorial }` |
| `ThemePreset` | Union of above |
| `LandTheme` | `theme_preset, color_main, color_accent, color_surface, font_title, font_body` |

---

### `plan.ts`

| Export | Description |
|--------|-------------|
| `LAND_PLANS` | `{ free, paid }` |
| `LandPlan` | Union of above |
| `PLAN_DETAILS` | Record of limits per plan (max_lands, max_sections, max_collection_sections, collaborators, campaign, custom_domain, price_monthly, price_yearly) |

---

### `user.ts`

| Export | Description |
|--------|-------------|
| `User` | `id, first_name, last_name, email, avatar_image, created_at` |

---

### `collaborator.ts`

| Export | Description |
|--------|-------------|
| `COLLABORATOR_ROLES` | `{ admin, editor }` |
| `COLLABORATOR_STATUSES` | `{ pending, active, declined }` |
| `Collaborator` | `id, land_id, email, role, status, invited_at, joined_at` |

---

### `collection.ts`

| Export | Description |
|--------|-------------|
| `CollectionItem` | `id, collection_id, title, subtitle, description, media_url, content, external_url, position, created_at` |
| `Collection` | `id, section_id, title, description, price?, position, items[]` |

---

### `store.ts`

| Export | Description |
|--------|-------------|
| `StoreVariantOption` | `{ value, inventory }` |
| `StoreVariant` | `{ id, name, options[] }` |
| `StoreItem` | `id, store_id, type` (product/membership)`, title, description, image, price, product_type` (physical/digital)`, variants[], inventory, file_url, position, created_at` |
| `Store` | `id, section_id, title, mode` (products/membership)`, membership_price, position, items[]` |

---

### `campaign.ts`

| Export | Description |
|--------|-------------|
| `CAMPAIGN_PROVIDER_TYPES` | `{ mailchimp, mailerlite, kit, flodesk, brevo, webhook }` |
| `CampaignProviderMeta` | Provider config with fields, labels, descriptions |
| `CAMPAIGN_PROVIDERS` | Array of provider definitions |
| `CampaignConnection` | `{ provider, api_key, audience_id, webhook_url }` |

---

## Stores

> `src/stores/` — Pinia

### `user.ts` — `useUserStore()`

| Member | Type | Description |
|--------|------|-------------|
| `user` | `ref<User \| null>` | Authenticated user |
| `isAuthenticated` | `ref<boolean>` | Auth state |
| `isLoading` | `ref<boolean>` | Loading flag |
| `fullName` | computed | First + last name |
| `initials` | computed | 2-char initials or `?` |
| `setUser(user)` | fn | Set user, mark authenticated |
| `clearUser()` | fn | Clear user, mark unauthenticated |

---

### `auth.ts` — `useAuthStore()`

| Member | Type | Description |
|--------|------|-------------|
| `isLoading` | `ref<boolean>` | Auth action in progress |
| `error` | `ref<string \| null>` | Current error message |
| `signingIn` | `ref<boolean>` | Controls AuthLayout expansion animation |
| `resetEmailSent` | `ref<boolean>` | Password reset email sent |
| `passwordResetSuccess` | `ref<boolean>` | Password reset completed |
| `needsOnboarding` | `ref<boolean>` | Redirect trigger after register |
| `setLoading(v)` | fn | Set loading flag |
| `setError(msg)` | fn | Set error + clear loading |
| `clearError()` | fn | Clear error |
| `$reset()` | fn | Reset all state |

---

### `land.ts` — `useLandStore()`

| Member | Type | Description |
|--------|------|-------------|
| `lands` | `ref<Land[]>` | All user's lands |
| `activeLandId` | `ref<string \| null>` | Selected land ID |
| `isLoading` | `ref<boolean>` | Loading flag |
| `activeLand` | computed | Active land object or null |
| `landCount` | computed | Total land count |
| `canCreateLand` | computed | Plan-gated create permission |
| `isStripeConnected` | computed | Whether active land has stripe_account_id |
| `setLands(data)` | fn | Initialize lands; auto-selects first if none active |
| `setActiveLand(id)` | fn | Switch active land + sync theme store |
| `addLand(land)` | fn | Add land, set as active |
| `updateLand(id, data)` | fn | Merge updates into land |
| `removeLand(id)` | fn | Delete land; fallback to first remaining |
| `clearLands()` | fn | Clear all |

---

### `editor.ts` — `useEditorStore()`

| Member | Type | Description |
|--------|------|-------------|
| `isEditMode` | `ref<boolean>` | Edit mode toggle |
| `activeSection` | `ref<Section \| null>` | Currently selected section |
| `showSectionSettings` | `ref<boolean>` | Open section settings panel |
| `isDirty` | `ref<boolean>` | Unsaved changes exist |
| `landSnapshot` | `ref<Land \| null>` | Snapshot for discard |
| `themeSnapshot` | `ref<LandTheme \| null>` | Theme snapshot for discard |
| `panelPos` | `ref<{x,y}>` | Draggable panel position |
| `enterEditMode()` | fn | Enable edit mode |
| `exitEditMode()` | fn | Disable edit mode, clear selection |
| `takeSnapshot(land, theme)` | fn | Save state for undo |
| `setActiveSection(section, openSettings?)` | fn | Select section |
| `markDirty()` | fn | Flag unsaved changes |
| `markClean()` | fn | Clear dirty flag |
| `setPanelPos(pos)` | fn | Update panel position |

---

### `theme.ts` — `useThemeStore()`

| Member | Type | Description |
|--------|------|-------------|
| `theme` | `ref<LandTheme \| null>` | Active theme config |
| `setTheme(data)` | fn | Replace theme |
| `updateThemeField(field, value)` | fn | Patch single field |
| `clearTheme()` | fn | Clear theme |

---

### `campaign.ts` — `useCampaignStore()`

| Member | Type | Description |
|--------|------|-------------|
| `connection` | `ref<Partial<CampaignConnection>>` | Active email provider config |
| `isConnected` | computed | Whether a provider is configured |
| `setConnection(c)` | fn | Merge connection update |
| `clearConnection()` | fn | Reset |

---

### `appModals.ts` — `useAppModals()`

Global modal controller. Single source of truth for which modal is open.

| Member | Type | Description |
|--------|------|-------------|
| `activeModal` | `ref<'integrations' \| 'upgrade' \| null>` | Currently open modal |
| `activeIntegration` | `ref<IntegrationId \| null>` | Selected integration tab |
| `dashboardDetail` | `ref<DashboardDetail \| null>` | Selected dashboard detail panel |
| `publishTrigger` | `ref<number>` | Increment to trigger publish side effects |
| `openIntegrations(integration?)` | fn | Show integrations modal |
| `openDashboardDetail(detail)` | fn | Show dashboard detail panel |
| `openUpgrade()` | fn | Show plan/upgrade modal |
| `close()` | fn | Close all modals |

---

## Composables

> `src/composables/`

### `useEditorActions.ts`

**The main mutation layer.** All section/theme/land edits go through here. Calls `editorStore.markDirty()` on every mutation.

**Section CRUD**:

| Function | Description |
|----------|-------------|
| `addSection(type, position)` | Create section with plan gate + seeded content |
| `deleteSection(sectionId)` | Remove section + clean up storage URLs |
| `updateSectionContent(sectionId, content)` | Patch section content |
| `updateSectionSettings(sectionId, settings)` | Patch section `settings_json` |
| `updateSectionStyleVariant(sectionId, variant)` | Change style variant |
| `restoreSectionSnapshot(sectionId, data)` | Restore from snapshot (undo) |
| `duplicateSection(sectionId)` | Clone section with new ID + next position |
| `reorderSection(sectionId, newPosition)` | Update position string |

**List Items**:

| Function | Description |
|----------|-------------|
| `addListItem(sectionId, data)` | Create new list link/item |
| `updateListItem(sectionId, itemId, data)` | Patch list item |
| `deleteListItem(sectionId, itemId)` | Remove item |
| `reorderListItem(sectionId, itemId, newPosition)` | Reorder |

**Collections**:

| Function | Description |
|----------|-------------|
| `addCollection(sectionId)` | Create collection (plan-gated) |
| `updateCollection(sectionId, collectionId, data)` | Patch collection metadata |
| `deleteCollection(sectionId, collectionId)` | Remove collection |
| `reorderCollection(sectionId, collectionId, newPosition)` | Reorder |
| `addCollectionItem(sectionId, collectionId, data)` | Create item (plan-gated) |
| `updateCollectionItem(sectionId, collectionId, itemId, data)` | Patch item |
| `deleteCollectionItem(sectionId, collectionId, itemId)` | Remove item |
| `reorderCollectionItem(sectionId, collectionId, itemId, newPosition)` | Reorder |

**Store Items**:

| Function | Description |
|----------|-------------|
| `addStoreItem(sectionId, storeId, data)` | Create store item (plan-gated) |
| `updateStoreItem(sectionId, storeId, itemId, data)` | Patch item |
| `deleteStoreItem(sectionId, storeId, itemId)` | Remove item |
| `updateStore(sectionId, storeId, data)` | Patch store metadata |
| `reorderStoreItem(sectionId, storeId, itemId, newPosition)` | Reorder |

**Land & Theme**:

| Function | Description |
|----------|-------------|
| `updateLandImages(data)` | Update `cover_image` / `avatar_image` + sync API |
| `updateTheme(data)` | Patch theme + mark dirty |
| `updateLandSettings(data)` | Update `handle`, `title`, `description` + call API |

---

### `useThemeVars.ts`

Watches `useThemeStore().theme` and writes CSS custom properties to `:root`.

| CSS Variable | Source |
|---|---|
| `--theme-main` | `color_main` |
| `--theme-accent` | `color_accent` |
| `--theme-surface` | `color_surface` |
| `--theme-font-title` | `font_title` |
| `--theme-font-body` | `font_body` |
| `--theme-font` | `font_body` (alias) |

---

### `usePlan.ts`

Plan-aware feature gates and content limits.

| Return | Description |
|--------|-------------|
| `plan` | `'free' \| 'paid'` — current land plan |
| `details` | Full plan limit config from `PLAN_DETAILS` |
| `isPaid` | Boolean |
| `canUseCollaborators` | Boolean |
| `canUseCampaign` | Boolean |
| `canUseCustomDomain` | Boolean |
| `maxSections` | Max non-header/footer sections |
| `maxCollectionSections` | Max collection-type sections |
| `maxCollectionsPerSection` | Max collections per section |
| `maxItemsPerCollection` | Max items per collection |
| `withinSectionLimit(n)` | Boolean validator |
| `withinCollectionSectionLimit(n)` | Boolean validator |
| `withinCollectionLimit(n)` | Boolean validator |
| `withinItemLimit(n)` | Boolean validator |
| `canAddSectionType(type)` | Boolean — gates campaign on free plan |

---

### `useDragSort.ts`

Drag-and-drop reordering with fractional indexing.

| Return | Description |
|--------|-------------|
| `isDragging` | `ref<boolean>` |
| `onDragStart()` | Mark dragging start |
| `onDragEnd({ oldIndex, newIndex })` | Calculate new fractional position + invoke `onReorder` callback |

**Signature**: `useDragSort<T extends Positionable>(getItems: () => T[], onReorder: (id, pos) => void)`

---

### `useToast.ts`

Singleton toast notification system (shared `toasts` array across all call sites).

| Return | Description |
|--------|-------------|
| `toasts` | `ref<Toast[]>` — Shared list |
| `addToast(message, type?, duration?)` | Queue toast with auto-dismiss |
| `removeToast(id)` | Manually remove |

**Types**: `type: 'success' | 'error' | 'info'`

---

### `useKeyboard.ts`

Global keyboard shortcuts (registered in `App.vue`).

| Shortcut | Action |
|----------|--------|
| `Esc` | Deselect section or exit edit mode |
| `Cmd/Ctrl+E` | Toggle edit mode |

Skips shortcuts when an input/textarea/contenteditable is focused.

---

### `useCollaboratorActions.ts`

Collaborator management.

| Function | Description |
|----------|-------------|
| `getCollaborators()` | Get active land's collaborators |
| `invite(email, role)` | Invite via edge function + optimistic update |
| `updateRole(collaboratorId, role)` | Update role + sync locally |
| `remove(collaboratorId)` | Delete collaborator |
| `resendInvite(collaboratorId)` | Re-invoke invite function |

---

## Services

> `src/services/` — API layer for Supabase + edge functions.

### `land.service.ts` — `landService`

| Function | Description |
|----------|-------------|
| `getMyLands()` | Fetch owned lands + lands where user is active collaborator (merged, deduped) |
| `createLand({ handle, title })` | Create new land |
| `save(id, { sections?, theme? })` | Persist sections + theme (main save flow) |
| `updateLand(id, updates)` | Update metadata: `handle, title, description, images, plan, is_published, is_private, private_password, stripe_*` |
| `deleteLand(id)` | Delete land |

**Internal**: `normalizeLand()` merges defaults, normalizes theme, ensures `sections` is array.

---

### `user.service.ts` — `userService`

| Function | Description |
|----------|-------------|
| `getMe()` | Fetch profile from `profiles` table + merge `authUser.email` |
| `updateMe(updates)` | Update `first_name`, `last_name`, `avatar_image` (excludes `email`) |

---

### `auth.service.ts` — `authService`

| Function | Description |
|----------|-------------|
| `login({ email, password })` | Supabase sign-in |
| `register({ first_name, last_name, email, password })` | Supabase sign-up with profile metadata |
| `verifyOtp(email, token)` | Verify OTP for sign-up |
| `forgotPassword(email)` | Send reset link (redirects to `/auth/reset`) |
| `resetPassword(newPassword)` | Update password via `supabase.auth.updateUser` (requires valid session) |
| `logout()` | Sign out |
| `getSession()` | Get current session |

---

### `storage.service.ts` — `storageService`

| Function | Description |
|----------|-------------|
| `upload(file)` | Upload to `projects/{userId}/{uuid}.ext`, returns public URL |
| `remove(url)` | Delete file by extracting path from public URL |
| `extractSectionUrls(section)` | Recursively scan section content/settings for `projects` bucket URLs |

**Bucket**: `projects`

---

### `collaborator.service.ts` — `collaboratorService`

| Function | Description |
|----------|-------------|
| `invite(landId, email, role)` | Call `invite-collaborator` edge function |
| `updateRole(collaboratorId, role)` | Update role in `collaborators` table |
| `remove(collaboratorId)` | Delete collaborator record |
| `resendInvite(landId, email, role)` | Re-invoke invite (handles 409 conflict) |
| `acceptInvite(landId)` | Call `accept-invite` edge function |
| `refuseInvite(landId)` | Delete collaborator by email + landId |
| `deleteAccount(transferMap)` | Call `delete-account` edge function with land transfer map |

---

### `stripe.service.ts` — `stripeService`

| Function | Description |
|----------|-------------|
| `connectUrl(landId)` | Build Stripe Connect OAuth URL (requires `VITE_STRIPE_CLIENT_ID`) |
| `handleCallback(code, landId)` | Exchange OAuth code via `stripe-connect` edge function |
| `disconnect(landId)` | Revoke OAuth token via `stripe-disconnect` edge function |
| `createSubscriptionCheckout(landId, billing)` | Create Stripe checkout session → returns redirect URL |
| `createBillingPortal(landId)` | Create Stripe billing portal URL → returns redirect URL |

---

### `domain.service.ts` — `domainService`

| Function | Description |
|----------|-------------|
| `connect(landId, domain)` | Invoke `manage-domain` with `action='connect'` |
| `disconnect(landId)` | Invoke `manage-domain` with `action='disconnect'` |
| `verify(landId)` | Invoke `verify-domain` → returns `{ status: 'pending'\|'active'\|'error' }` |

---

### `publish.service.ts` — `publishService`

| Function | Description |
|----------|-------------|
| `publish(land)` | Invoke `publish` edge function → returns `{ url: string }` |

---

## Lib / Utilities

> `src/lib/`

### `supabase.ts`
Exports configured `supabase` client. Requires `VITE_SUPABASE_URL` + `VITE_SUPABASE_KEY`.

---

### `lib/utils/position.ts`
Fractional indexing utilities.

| Function | Description |
|----------|-------------|
| `generatePositionAfter(last)` | Position for appending to end |
| `generatePositionBefore(first)` | Position for prepending |
| `generatePositionBetween(before, after)` | Position between two items |
| `generatePositions(count, before?, after?)` | N evenly-spaced positions |
| `sortByPosition<T>(items)` | Sort lexicographically by `position` field |

---

### `lib/primitives/sectionDefaults.ts`

| Export | Description |
|--------|-------------|
| `SectionDefault` | `{ style_variant, settings_json, content }` |
| `SECTION_DEFAULTS` | Default content + settings per `SectionType` |

---

### `lib/primitives/themePresets.ts`

| Export | Description |
|--------|-------------|
| `FontOption` | `{ id, label, fontFamily, googleFont? }` |
| `ThemePresetDefinition` | `{ label, description, colorSlots, fonts, defaults }` |
| `THEME_PRESET_DEFINITIONS` | Definitions for `minimal`, `bold`, `editorial` — each with 4 title fonts + 4 body fonts |

---

### `lib/primitives/styleVariants.ts`

| Export | Description |
|--------|-------------|
| `StyleVariantOption` | `{ value, label }` |
| `STYLE_VARIANTS_BY_SECTION` | Variant options per `SectionType` |

**Variants per type**:

| Type | Variants |
|------|----------|
| `header` | `below`, `overlapping`, `overlay` (profile position) |
| `content_media` | `default`, `reversed` |
| `list` | `default`, `compact` |
| `collection` | `grid`, `list`, `cards` |
| `store` | `grid`, `list` |
| `monetize` | `grid`, `list`, `cards` |
| `campaign` | `default`, `minimal` |
| `footer` | `default` |

---

### `lib/primitives/purposeDefaults.ts`

| Export | Description |
|--------|-------------|
| `Purpose` | `'artist' \| 'product' \| 'business' \| 'creator' \| 'event' \| 'writing' \| 'custom'` |
| `PURPOSE_OPTIONS` | Pre-configured section lists per purpose for onboarding |

---

### `lib/mock/`
Development-only mock data. Not used in production.

| File | Description |
|------|-------------|
| `generators.ts` | Random data generators |
| `landBuilder.ts` | Build mock lands |
| `mockSectionContent.ts` | Placeholder section content |

---

### `lib/email/`
Email marketing adapter abstraction (used by campaign edge functions).

| File | Description |
|------|-------------|
| `types.ts` | Adapter interface |
| `index.ts` | Adapter factory/router |
| `adapters/mailchimp.ts` | Mailchimp adapter |
| `adapters/mailerlite.ts` | MailerLite adapter |
| `adapters/kit.ts` | Kit (ConvertKit) adapter |
| `adapters/flodesk.ts` | Flodesk adapter |
| `adapters/brevo.ts` | Brevo adapter |
| `adapters/webhook.ts` | Generic webhook adapter |

---

## Router

> `src/router/index.ts`

### Routes

| Path | Component | Guard |
|------|-----------|-------|
| `/` | `HomeView` | — |
| `/auth` | `AuthLayout` > `LoginView` | `requiresGuest` |
| `/auth/register` | `AuthLayout` > `RegisterView` | `requiresGuest` |
| `/auth/reset` | `AuthLayout` > `LostPasswordView` | `requiresGuest` |
| `/auth/stripe/callback` | `StripeCallbackView` | — |
| `/auth/accept-invite` | `AcceptInviteView` | — |
| `/dashboard` | `AppLayout` > `ProjectView` | `requiresAuth` |
| `/dashboard/account` | `AppLayout` > `AccountView` | `requiresAuth` |
| `/dashboard/plans` | `AppLayout` > `PlansView` | `requiresAuth` |
| `/dashboard/support` | `AppLayout` > `SupportView` | `requiresAuth` |
| `/onboarding` | `OnboardingLayout` > `OnboardingView` | `requiresAuth` |
| `/plans/success` | `PlansSuccessView` | — |
| `/checkout/success` | `CheckoutSuccessView` | — |
| `/checkout/cancel` | `CheckoutCancelView` | — |

### Guard Logic (`beforeEach`)
1. Use cached auth state or fall back to `supabase.auth.getSession()`
2. `requiresAuth` + not authenticated → `/auth`
3. `requiresGuest` + authenticated → `/dashboard`
4. Authenticated with no lands → `/onboarding` (unless invite in query/sessionStorage)
5. `/onboarding` with existing lands → `/dashboard`

---

## Layouts

> `src/layouts/`

### `AppLayout.vue`
Main dashboard shell. Mounts `AppHeader` + router view. Controls `PlanModal` (Teleport to body). Defines route depth for page transitions.

### `AuthLayout.vue`
Two-column layout: left sidebar with logo (expands full-width on sign-in via `authStore.signingIn`), right dark background. Starts at fixed width — no grow animation on load.

### `OnboardingLayout.vue`
Minimal shell — just a `<RouterView>`. No header.

---

## Views

> `src/views/`

### Dashboard

| File | Description |
|------|-------------|
| `ProjectView.vue` | Three-pane layout: `LandsDashboard` (left) + `EditorPreview` (center) + `EditorSidebar` (right). Collapses dashboard in edit mode. |
| `AccountView.vue` | Profile form (first/last name), password change, account deletion. Watches `userStore.user` to repopulate fields on async load. |
| `PlansView.vue` | Billing/subscription management page. |
| `PlansSuccessView.vue` | Post-checkout confirmation. Polls `landService.getMyLands()` every 1s (max 10 attempts) until `plan === 'paid'`, then auto-redirects. |
| `SupportView.vue` | Help/support resources. |

### Auth

| File | Description |
|------|-------------|
| `LoginView.vue` | Email + password login form |
| `RegisterView.vue` | Sign-up form (first name, last name, email, password) |
| `LostPasswordView.vue` | Password reset request form |
| `StripeCallbackView.vue` | Stripe Connect OAuth callback handler |
| `AcceptInviteView.vue` | Accept/decline collaborator invite |

### Onboarding

| File | Description |
|------|-------------|
| `OnboardingView.vue` | Purpose selection + initial land creation |

### Storefront

| File | Description |
|------|-------------|
| `HomeView.vue` | Public marketing landing page |

### Checkout

| File | Description |
|------|-------------|
| `CheckoutSuccessView.vue` | Post-checkout confirmation |
| `CheckoutCancelView.vue` | Checkout cancellation page |

---

## Components — Shared & Editor

> `src/components/shared/` + `src/components/editor/`

### Shared

| Component | Description |
|-----------|-------------|
| `AppHeader.vue` | Top navigation. Save/Publish/Discard buttons (edit mode). Edit mode toggle. Opens Integrations modal, Custom Domain modal, Settings modal. Dirty guard warns before navigation. |
| `OnboardingTour.vue` | First-use guided tour |

### Editor

| Component | Description |
|-----------|-------------|
| `EditorPreview.vue` | Main preview canvas. Vuedraggable sections. Section selection + context menu (duplicate, delete, move up/down). Dynamic section component routing via `componentMap`. |
| `LandsPreview.vue` | Read-only preview (no edit handlers) |
| `EditorSidebar.vue` | Right panel. Tabs: Content (add sections, section list, plan limit card) + Options (style variants, theme, publish settings, upgrade card). Contains publish settings: Published toggle → `ConfirmUnpublishModal`, Private toggle + password input. |
| `LandsLoading.vue` | Loading spinner |

### Editor — Content Editor

| Component | Description |
|-----------|-------------|
| `content/RichTextEditor.vue` | TipTap-based rich text editor with custom extensions |
| `content/AudioBlockView.vue` | TipTap node view for audio embeds |
| `content/VideoBlockView.vue` | TipTap node view for video embeds |
| `content/FileBlockView.vue` | TipTap node view for file attachments |

---

## Components — Sections

> `src/components/sections/`

### Section Router Components
Map `SectionType` to style-variant sub-components. Each receives `section: Section` prop.

| Component | Routes to |
|-----------|-----------|
| `SectionHeader.vue` | `HeaderMinimal`, `HeaderBold`, `HeaderEditorial` |
| `SectionContentMedia.vue` | `ContentMediaMinimal`, `ContentMediaBold`, `ContentMediaEditorial` |
| `SectionText.vue` | `TextMinimal`, `TextBold`, `TextEditorial` |
| `SectionList.vue` | `ListMinimal`, `ListBold`, `ListEditorial` |
| `SectionCollection.vue` | `CollectionMinimal`, `CollectionBold`, `CollectionEditorial` |
| `SectionStore.vue` | `StoreMinimal` |
| `SectionMonetize.vue` | (similar to collection) |
| `SectionCampaign.vue` | `CampaignMinimal`, `CampaignBold`, `CampaignEditorial` |
| `SectionMedia.vue` | `MediaMinimal`, `MediaBold`, `MediaEditorial` |

### Style Variant Sub-Components

Each reads `props.section.style_variant` to determine layout.

| Directory | Variants | Style variant controls |
|-----------|----------|----------------------|
| `header/` | Minimal, Bold, Editorial | `settings_json.profile_position` (below/overlapping/overlay) |
| `content-media/` | Minimal, Bold, Editorial | `style_variant` → `md:order-1/2` on grid children |
| `text/` | Minimal, Bold, Editorial | `style_variant` → CSS classes on prose div |
| `list/` | Minimal, Bold, Editorial | `style_variant` → font size / padding |
| `collection/` | Minimal, Bold, Editorial | `style_variant` → grid vs list vs cards layout |
| `store/` | Minimal | `style_variant` → grid vs list layout |
| `campaign/` | Minimal, Bold, Editorial | `style_variant` → show/hide title section |
| `media/` | Minimal, Bold, Editorial | `style_variant` → container/media wrapper classes |

---

## Components — Dashboard

> `src/components/dashboard/`

| Component | Description |
|-----------|-------------|
| `LandsDashboard.vue` | Left sidebar. Land list, land selector, new land button, upgrade card (free plan). Uses `appModals.openUpgrade()`. |
| `detail/AnalyticsDetail.vue` | Analytics dashboard panel |
| `detail/OrdersDetail.vue` | Orders dashboard panel |
| `detail/SellDetail.vue` | Sell dashboard panel |
| `detail/CampaignDetail.vue` | Campaign dashboard panel |
| `detail/MonetizeDetail.vue` | Monetize dashboard panel |

---

## Components — Modals

> `src/components/modals/`

### Editor Modals

| Component | Description |
|-----------|-------------|
| `SectionsModal.vue` | Add new section dialog (section picker) |
| `SectionSettingsModal.vue` | Section-specific settings editor |
| `SettingsModal.vue` | Land-wide settings (handle, title, description) |
| `CollectionItemContentModal.vue` | Edit collection item (title, description, media, external URL, rich content) |

### Project Management

| Component | Description |
|-----------|-------------|
| `CreateProjectModal.vue` | Create new land |
| `DeleteProjectModal.vue` | Delete land with confirmation (calls API first, then store) |

### Publishing

| Component | Description |
|-----------|-------------|
| `ConfirmPublishedModal.vue` | Confirm publish action |
| `ConfirmUnpublishModal.vue` | Confirm unpublish — emits `confirm` + `cancel` |

### Domain & Integration

| Component | Description |
|-----------|-------------|
| `CustomDomainModal.vue` | Connect/disconnect custom domain |
| `IntegrationsModal.vue` | Master integrations modal. Lists integrations (analytics, campaign, collaborators, sell/monetize, custom domain). Routes clicks to sub-panels. Emits `openCustomDomain` for paid plan domain click. |
| `IntegrationSettingsModal.vue` | Configure specific integration. `custom_domain` case has plan gate UI → `appModals.openUpgrade()`. |

### Collaborators

| Component | Description |
|-----------|-------------|
| `InviteCollaboratorModal.vue` | Invite collaborator by email + role |
| `InviteAcceptModal.vue` | Accept/decline collaborator invite |
| `ConfirmLeaveModal.vue` | Warn before leaving with unsaved changes |

### Account

| Component | Description |
|-----------|-------------|
| `ConfirmDeleteAccountModal.vue` | Delete account with land transfer options |

### Billing

| Component | Description |
|-----------|-------------|
| `PlanModal.vue` | Upgrade modal. Single Pro card with billing toggle (monthly/yearly). Animated price + CTA on billing change. Calls `stripeService.createSubscriptionCheckout()`. Paid plan: "Manage subscription" → `stripeService.createBillingPortal()`. |
| `EditorModal.vue` | (Editor-specific modal wrapper) |
| `PluginsModal.vue` | (Plugin/extension modal) |

---

## Components — Integrations

> `src/components/integrations/` and `src/components/plugins/`

| Component | Description |
|-----------|-------------|
| `CampaignPanel.vue` | Campaign setup (select provider, enter API key/webhook) |
| `CollaboratorsPanel.vue` | Manage collaborators (invite, role change, remove) |
| `StorePanel.vue` | Store payment settings (Stripe Connect) |

---

## Components — UI (Base)

> `src/components/ui/` — All prefixed `Base`. Never create one-off replacements.

### Forms

| Component | Description |
|-----------|-------------|
| `BaseInput.vue` | Text input |
| `BaseColorInput.vue` | Color picker input (hex string) |
| `BaseColorPicker.vue` | Color picker UI |
| `BaseSelect.vue` | Select dropdown |
| `BaseToggle.vue` | Toggle switch. Supports default slot for revealing content when on. |
| `BaseUpload.vue` | File upload |
| `BaseFont.vue` | Font selector |

### Navigation & Layout

| Component | Description |
|-----------|-------------|
| `BaseButton.vue` | Button — variants: `solid`, `outline`, `ghost`, `danger` — sizes: `sm`, `md`, `lg` |
| `BaseMenu.vue` | Dropdown menu |
| `BaseDropdown.vue` | Generic dropdown |
| `BaseContextMenu.vue` | Right-click context menu |
| `BaseTab.vue` | Tab navigation |
| `BaseTree.vue` | Tree/nested list widget |

### Display

| Component | Description |
|-----------|-------------|
| `BaseCard.vue` | Card container |
| `BaseModal.vue` | Modal dialog (emits `close`) |
| `BaseToast.vue` | Single toast notification |
| `BaseToastContainer.vue` | Renders all active toasts (mounted in `App.vue`) |
| `BaseBadge.vue` | Badge/tag |
| `BaseAvatar.vue` | User avatar |
| `BaseChart.vue` | Chart component |

### Special

| Component | Description |
|-----------|-------------|
| `BaseItem.vue` | Reusable list item |
| `BaseProject.vue` | Land/project card |
| `BasePlanGate.vue` | Plan-aware gate — calls `appModals.openUpgrade()` |
| `Accordion.vue` | Collapsible accordion |

---

## Sections Index

> `src/sections/index.ts`

| Export | Description |
|--------|-------------|
| `SectionPrimitive` | `{ id: SectionType, label, description, icon }` |
| `sectionPrimitives` | Array of all section options shown in the section picker |

---

## Supabase Edge Functions

> `supabase/functions/` — Deno HTTP handlers. All deployed with `--no-verify-jwt` (auth handled per-function).

### `publish/index.ts`
Render land to HTML + store in Cloudflare KV.

- **Input**: `POST { land: Land }`
- **Output**: `{ url: string }` (`https://{handle}.lands.app`)
- **Flow**: `renderLand()` → Cloudflare KV upload

### `publish/renderer.ts`
Converts `Land` data to static HTML (handles theme, sections, asset embedding).

---

### `invite-collaborator/index.ts`
Invite user to land.

- **Input**: `POST { landId, email, role }`
- **Auth**: Caller must be owner or admin
- **Flow**: Check existing → `admin.auth.inviteUserByEmail()` → create `collaborators` record (status=pending)
- **Output**: `{ collaborator }`

---

### `accept-invite/index.ts`
Accept collaborator invite.

- **Input**: `POST { landId }`
- **Flow**: Update `collaborators` record to `status='active'`, `joined_at=now`

---

### `stripe-connect/index.ts`
Exchange Stripe OAuth code for account ID.

- **Input**: `POST { code, landId }`
- **Flow**: Exchange code → fetch account details → update `lands.stripe_account_id`

---

### `stripe-disconnect/index.ts`
Revoke Stripe OAuth token and clear account ID.

- **Input**: `POST { landId }`
- **Flow**: Revoke token → clear `lands.stripe_account_id`

---

### `create-subscription-checkout/index.ts`
Create Stripe Checkout session for subscription.

- **Input**: `POST { landId, billing: 'monthly'|'yearly', successUrl, cancelUrl }`
- **Output**: `{ url }` (always 200; errors returned as `{ error }`)
- **Flow**: Verify JWT → get land → get/create Stripe Customer → create Checkout Session (subscription mode, `client_reference_id=landId`)
- **Note**: `stripe_customer_id` fetched in separate try-catch (column may not exist yet)

---

### `create-billing-portal/index.ts`
Create Stripe Customer Portal URL.

- **Input**: `POST { landId, returnUrl }`
- **Output**: `{ url }`
- **Flow**: Verify JWT → get `stripe_customer_id` from land → create Billing Portal session

---

### `stripe-subscription-webhook/index.ts`
Handle Stripe subscription webhook events.

- **Auth**: HMAC-SHA256 signature verification (Web Crypto API)
- **Events handled**:
  - `checkout.session.completed` → `plan='paid'`, save `stripe_subscription_id`
  - `customer.subscription.deleted` → `plan='free'`, clear `stripe_subscription_id`
  - `customer.subscription.updated` → status-based plan update

---

### `manage-domain/index.ts`
Connect or disconnect custom domain.

- **Input**: `POST { action: 'connect'|'disconnect', landId, domain? }`

---

### `verify-domain/index.ts`
Check domain DNS configuration.

- **Input**: `POST { landId }`
- **Output**: `{ status: 'pending'|'active'|'error' }`

---

### `delete-account/index.ts`
Delete user account with optional land transfers.

- **Input**: `POST { transferMap: Record<landId, newOwnerUserId> }`
- **Flow**: Transfer lands → delete profile → revoke Supabase auth user

---

## Key Patterns & Conventions

### Mutation Flow
```
User action
  → useEditorActions composable
    → landStore.updateLand() / section mutation
    → editorStore.markDirty()
  → AppHeader save() → landService.save()
    → editorStore.markClean()
```

### Section Rendering
```
EditorPreview componentMap
  → SectionXxx.vue (router by type)
    → reads theme preset + style_variant
    → renders XxxMinimal / XxxBold / XxxEditorial
```

### Plan Gating
- All limits defined in `PLAN_DETAILS` in `src/types/plan.ts`
- `usePlan()` composable exposes validators
- `useEditorActions` enforces limits on add operations
- UI gates use `usePlan().isPaid` / `appModals.openUpgrade()`

### Theme System
```
useThemeStore (data)
  → useThemeVars (writes CSS vars to :root)
    → Components consume --theme-* vars
```

### Fractional Indexing
- All orderable items use `position: string` (lexicographic sort)
- `sortByPosition<T extends { position: string }>()` — must use `computed<T[]>(() => ...)` with explicit type parameter

### Modal System
- `useAppModals()` is the single entry point for global modals
- `appModals.openUpgrade()` — everywhere upgrade is needed
- `appModals.openIntegrations(id?)` — opens integrations with optional pre-selected tab
- Local modals (per-component) use local `ref<boolean>` + `v-if`

### Upgrade Entry Points
All upgrade buttons call `appModals.openUpgrade()` — never `router.push('/dashboard/plans')`.

### Save vs Auto-save
- **Edit mode changes**: `markDirty()` → manual save via AppHeader
- **Settings/metadata**: `updateLandSettings()` auto-saves immediately (no save button)

### TypeScript Gotchas
- `SectionPrimitive.id` is `SectionType`, not `string`
- `sortByPosition` generic requires explicit type: `computed<MyType[]>(() => ...)`
- TipTap node view components have known type errors (`SetContentOptions`, `NodeViewProps`) — upstream issue, do not fix
