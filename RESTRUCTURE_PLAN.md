# Lands App — Restructure Plan

> This is the authoritative plan for the codebase restructure. It is written to be handed to Claude Code one phase at a time. Each phase is self-contained, leaves the app shippable, and has explicit acceptance criteria.

---

## Mission

Restructure the Lands app codebase for scalability and idiomatic Vue 3, without changing any visible behavior or design. The app is not yet published, so breaking internal APIs and types is acceptable as long as the rendered UI is identical at the end of each phase.

**Goals**

- Eliminate duplication (section tree logic, position math, settings-panel boilerplate, Stripe-connect flow, clipboard copy, polling, etc.)
- Pull script logic out of fat `.vue` files into reusable composables
- Make `Section` a properly discriminated type so casts disappear
- Drive section rendering and settings from a single registry, not parallel `v-if`/`switch` chains
- Reorganize folders by feature once the logic is clean

**Non-goals (do not do during this work)**

- Visual / UX changes of any kind
- Backend / Supabase schema changes
- Edge function changes (`supabase/functions/`)
- Cloudflare Worker changes (`worker/`)
- Adding a test framework (do typecheck-only verification)
- Storefront work (`src/components/storefront/`, `src/views/storefront/`) — explicitly out of scope
- Production-readiness items from `AUDIT.md` (Sentry, rate limiting, etc.)

---

## How to use this document with Claude Code

The plan is split into 11 phases. Each phase has a copy-pasteable prompt at the end of its section labeled **"Claude Code prompt"**.

Recommended workflow per phase:

1. Open a new Claude Code session.
2. Paste the phase prompt. Claude Code reads this file and executes the phase.
3. When Claude Code reports done, run the verification commands listed in that phase.
4. Eyeball the app: dev server, click through the key flows.
5. Commit. Move to next phase.

Phases are sequenced so that each phase is independently shippable. If you stop after any phase, the app still works. Do not skip ahead — later phases depend on earlier ones.

---

## Hard constraints (every phase)

These are non-negotiable and apply to every change Claude Code makes:

1. **Do not change templates, CSS classes, Tailwind utilities, transitions, animations, colors, sizes, spacing, or any visible markup.** The design is finished. Script changes only, unless a phase explicitly says otherwise.
2. **Do not touch** `supabase/`, `worker/`, `public/`, `src/components/storefront/`, `src/views/storefront/`, or `src/assets/`. They are out of scope.
3. **Preserve route paths and query parameters** exactly. The router structure stays the same; only the files behind the routes change.
4. **Preserve Pinia store IDs.** `defineStore('land', ...)` stays `'land'`. Devtools and any persisted state must not break.
5. **Use TypeScript strictly.** No `any` casts unless the existing code already had one (in which case, replace it with a proper type during the discriminated-section phase, not before).
6. **Run `npm run type-check` after every meaningful change** and before reporting a phase complete. Zero new type errors. The TipTap node-view type errors noted in `CODEBASE.md` are pre-existing — leave them alone.
7. **No new runtime dependencies.** Existing `package.json` is the budget.
8. **Commit per phase.** Use imperative commit messages: `refactor(sections): extract useSectionTree composable`.

---

## Glossary

- **Land** — A user's public page. Has a `handle` (subdomain), sections, theme, plan, etc.
- **Section** — A polymorphic block on a Land. Has a `type`, a `style_variant`, settings, and content.
- **Section type** — One of: `header`, `content_media`, `list`, `collection`, `store`, `monetize`, `campaign`, `footer`. Defined in `src/types/section.ts`.
- **Style variant** — A per-type layout string (e.g. `default` / `reversed` for content_media).
- **Theme preset** — One of `minimal`, `baseline`, `structure` (the values referenced in the section renderer switches; verify against `src/lib/primitives/themePresets.ts` since some older docs use different names).
- **Registry** — The future single source of truth for "what is a section type" (see Phase 3).

---

## Target architecture

Final folder structure. Phases 1–9 do logic work; Phase 10 moves files. Do not reshape folders before then.

```
src/
  app/
    App.vue
    main.ts
    router/
      index.ts
      guards.ts
  shared/
    ui/                       Base* components (unchanged contents)
    composables/              cross-feature: useToast, useIsMobile,
                              useKeyboardShortcuts, useDragSort,
                              useClipboardCopy, usePolling
    lib/
      supabase.ts
      position.ts
      slug.ts
      fonts.ts
  features/
    auth/
      views/                  LoginView, RegisterView, LostPasswordView,
                              AcceptInviteView, StripeCallbackView
      components/             AuthLayout
      composables/            useAuthForm, useOtpInput
      services/               auth.service.ts
      stores/                 session.ts            (user + isAuthenticated only)
    onboarding/
      views/                  OnboardingView (thin)
      components/             OnboardingStepName, OnboardingStepPurpose,
                              OnboardingStepTheme, OnboardingStepStyle
      composables/            useLandCreator
    dashboard/
      views/                  DashboardView (was ProjectView),
                              AccountView, PlansView, SupportView,
                              PlansSuccessView
      components/
        DashboardSidebar.vue                       (was LandsDashboard)
        DashboardDetail.vue
        detail/                                    AnalyticsDetail, OrdersDetail,
                                                   SellDetail, CampaignDetail,
                                                   MonetizeDetail
        cards/                                     MetricCard, UpgradeCard,
                                                   ConnectStripeCard
      composables/            useDashboardMetrics, useDashboardDetail,
                              useCountUpStats, useStripeConnect
    editor/
      components/
        EditorShell.vue
        EditorPreview.vue
        panel/
          EditorPanel.vue                          unified content for sidebar+mobile
          ContentTab.vue
          DesignTab.vue
          PublishSettingsCard.vue
          DangerZoneCard.vue
        mobile/
          MobileEditorBar.vue                      thin shell over EditorPanel
        sections/
          SectionRenderer.vue                      registry-driven, replaces all SectionXxx.vue dispatchers
          variants/                                Header/Minimal.vue, ContentMedia/Baseline.vue, …
                                                   (same files as today, just regrouped)
        settings/
          SectionSettingsPanel.vue                 registry-driven, replaces SectionSettings.vue
          panels/                                  one panel per section type, each thin
      composables/
        useSectionTree.ts
        useSectionInsert.ts
        useSectionLifecycle.ts
        useSectionForm.ts
        useSectionSnapshot.ts
        useNestedItems.ts
        useEditorMutations.ts                     replaces useEditorActions (no spread/barrel)
        usePublishFlow.ts
        useEditorPanel.ts
        useThemeApply.ts
      stores/
        editor.ts                                 isEditMode, activeSection,
                                                  isDirty, hasUnpublishedChanges,
                                                  snapshots — only
        editorUi.ts                               panelPos, showSectionSettings,
                                                  isSubItemEditing
    sections/                                     domain layer for "what is a section"
      registry.ts                                 the ONE config
      types.ts                                    discriminated union for Section
      defaults.ts
      style-variants.ts
    theme/
      presets.ts
      stores/theme.ts
      composables/
        useThemeVars.ts
        useThemePreset.ts
        useThemeApply.ts
    lands/
      stores/land.ts                              lands[] + activeLandId
      services/land.service.ts
      composables/useActiveLand.ts
    plan/
      types.ts
      composables/usePlan.ts
      components/PlanGate.vue, UpgradeCard.vue
    modals/
      AppModalsHost.vue
      composables/useAppModals.ts
      modals/                                     individual modal components by domain
    integrations/
      panels/                                     campaign, collaborators, store, qr, seo
      services/                                   campaign, collaborator, domain, stripe,
                                                  publish, storage
      composables/                                useCollaboratorActions, useDomain,
                                                  useCampaignProvider
  styles/
    main.css
    tokens.css
```

---

## Conventions

### Composables

- Named `useSomething` in camelCase, file matches export.
- Default to returning an object of refs/computeds/functions. Plain values only when there's just one return.
- A composable that needs the active land does not take `landId` as an argument unless it can be used outside the active-land context. Default to reading from `useLandStore().activeLand`.
- Composables that mutate go through `useEditorMutations` (was `useEditorActions`) and call `markDirty()` themselves. Never call services directly from a composable that has a sibling mutation composable.
- Composables that depend on other composables call them inside the function body, not at the module top level.
- Disposable composables (those holding intervals, listeners) return a `dispose()` function and register `onScopeDispose` themselves.

### Stores

- Pinia stores hold **persisted or shared** state. Form state, modal toggles, animation refs go in components or `*Ui` stores.
- Setup-syntax composition API stores (no options API).
- Store IDs match filenames. Never rename store IDs.

### Section type discrimination contract

Phase 2 changes `Section` to a discriminated union. The shape:

```ts
// src/features/sections/types.ts (Phase 10) — until then, src/types/section.ts

type Section =
  | HeaderSection
  | ContentMediaSection
  | ListSection
  | CollectionSection
  | StoreSection
  | MonetizeSection
  | CampaignSection
  | FooterSection

interface BaseSection<TType extends SectionType, TContent, TSettings> {
  id: string
  land_id: string
  type: TType
  position: string
  style_variant: string
  settings_json: TSettings
  content: TContent
  created_at: string
}

type HeaderSection = BaseSection<'header', HeaderContent, HeaderSettings>
// …one per type
```

After this lands, every `section.content as HeaderContent` cast is replaced with a `if (section.type === 'header')` narrow.

### Section registry contract

Phase 3 introduces `src/features/sections/registry.ts` as the only place new section types are registered. Shape:

```ts
interface SectionDefinition<S extends Section> {
  type: S['type']
  label: string
  description: string
  icon: FunctionalComponent
  defaults: { content: S['content']; settings_json: S['settings_json']; style_variant: string }
  variants: Record<ThemePreset, Component>      // renderer per theme
  settingsPanel: Component                       // editor panel
  plan?: { requires: 'free' | 'paid' }
  fixedPosition?: 'first' | 'last'              // header/footer
  titleFrom?: (section: S) => string | null     // for section tree label
}

export const SECTION_REGISTRY: { [K in SectionType]: SectionDefinition<Extract<Section, { type: K }>> }
```

`SectionRenderer.vue`, `SectionSettingsPanel.vue`, `useSectionTree`, `useSectionInsert`, `useSectionLifecycle`, and `usePlan` all read from this.

The following pre-existing constructs **collapse into the registry**:

- `sectionPrimitives` (`src/sections/index.ts`)
- `SECTION_DEFAULTS` (`src/lib/primitives/sectionDefaults.ts`)
- `STYLE_VARIANTS_BY_SECTION` (`src/lib/primitives/styleVariants.ts`)
- `SECTION_SETTINGS_CONFIG` (`src/lib/primitives/sectionSettingsConfig.ts`)
- `componentMap` in `EditorPreview.vue`
- The `switch` over `theme_preset` in every `SectionXxx.vue`
- The `v-if` chain in `SectionSettings.vue`
- The hardcoded `FIXED_LABEL_TYPES` set (becomes the `titleFrom` field per registry entry)

---

# Phases

Each phase has: **Goal**, **Scope**, **Files affected**, **Acceptance criteria**, **Notes**, and a **Claude Code prompt** at the end.

---

## Phase 0 — Baseline & branch setup

**Goal:** establish a working baseline and prepare the branch.

**Scope**

- Verify `npm install`, `npm run type-check`, `npm run build`, `npm run dev` all succeed on the current `main`.
- Create a long-lived branch `refactor/restructure` off `main`.
- Commit this `RESTRUCTURE_PLAN.md` to the repo root.
- Take a screenshot/Loom of the current app's key flows for visual regression reference (manual — not Claude Code's job).

**Acceptance**

- `npm run type-check` passes on the new branch.
- The branch is pushed.

**Claude Code prompt**

```
We are starting a multi-phase restructure of the Lands codebase.
Read RESTRUCTURE_PLAN.md at the repo root — it is the source of truth.
Confirm Phase 0:
1. Run `npm install`, then `npm run type-check`. Both must succeed.
2. Create and check out a branch named `refactor/restructure` off the current branch.
3. Commit RESTRUCTURE_PLAN.md.
Report the type-check output and the branch name. Do not make any other changes.
```

---

## Phase 1 — Extract small, high-leverage composables (no breaking changes)

**Goal:** kill the small duplications first. These are safe, isolated, and reduce noise in later phases.

**Scope**

Create these composables in `src/composables/` (folder restructure comes in Phase 10):

1. **`useSectionTree.ts`** — returns `{ sectionIconMap, sectionLabelMap, getSectionTitle(section), nodes }`. Centralizes the four-place duplication of section tree logic.
2. **`useSectionInsert.ts`** — returns `{ insertAt(type, index), moveTo(sectionId, index), moveUp(sectionId), moveDown(sectionId), insertBeforeFooter(type) }`. All position math + header-first / footer-last pinning rules live here. Calls `useEditorMutations`.
3. **`useClipboardCopy.ts`** — `{ copy(text), copied }` with a 2s reset.
4. **`useStripeConnect.ts`** — `{ connectStripe(), isConnecting }` using `landStore.activeLand`.
5. **`usePolling.ts`** — `{ start(fn, opts), stop() }` with `intervalMs`, `maxAttempts`, automatic `onScopeDispose` cleanup.

Refactor consumers to use them:

- `useSectionTree` → `EditorSidebar.vue`, `MobileEditorBar.vue`, `SectionSettings.vue`, `BaseLinkPicker.vue`
- `useSectionInsert` → `EditorSidebar.vue` (×3), `MobileEditorBar.vue` (×2), `EditorPreview.vue` (moveUp/moveDown)
- `useClipboardCopy` → `ShareModal.vue`, `ConfirmPublishedModal.vue`, `CustomDomainModal.vue`
- `useStripeConnect` → `LandsDashboard.vue`, `MonetizeSettings.vue`, `StoreSettings.vue`, `StorePanel.vue`
- `usePolling` → `CustomDomainModal.vue`, `PlansSuccessView.vue`

**Files affected**

- New: 5 composable files
- Edit: 10 component/view files
- Delete: none

**Acceptance**

- `npm run type-check` passes
- Dev server runs, all five flows still work:
  - Share modal copies the link
  - Custom-domain modal copies DNS values
  - Custom-domain modal polls verification
  - PlansSuccess polls until plan is paid
  - Stripe connect button works from dashboard, monetize settings, and store settings
- The same logic is no longer duplicated in 4 different places (grep verification)

**Notes**

- Do NOT change templates. Refactor only the `<script setup>` block of each consumer.
- The new composables must be additive — old call sites should compile without re-importing.

**Claude Code prompt**

```
Phase 1 of the restructure (see RESTRUCTURE_PLAN.md).

Goal: create five composables in src/composables/ and refactor their consumers
to use them. NO template changes. NO design changes.

Composables to create (study the existing duplications first):
  - useSectionTree.ts          — section tree label/icon/nodes (today in 4 files)
  - useSectionInsert.ts        — position math + header/footer pinning (in 5+ files)
  - useClipboardCopy.ts        — copy + copied flag with 2s reset (in 3 files)
  - useStripeConnect.ts        — stripe connect URL + isConnecting flag (in 4 files)
  - usePolling.ts              — interval polling with maxAttempts + dispose

For each composable:
  1. Find every duplicated implementation with grep before writing.
  2. Write the composable to subsume all callers' behavior (union of features).
  3. Update each caller to import and use the composable.
  4. Delete the now-dead local code in each caller.

After all five are done, run `npm run type-check` — must pass.
Commit as: refactor(composables): extract tier-1 composables (Phase 1)

Do not touch templates, classes, transitions, or any visible markup.
Do not move files to new folders yet — that is Phase 10.
```

---

## Phase 2 — Discriminated `Section` type

**Goal:** make `Section` a proper discriminated union so TypeScript narrows `section.content` and `section.settings_json` automatically. This unblocks Phase 4 (`useSectionForm` with generics) and removes dozens of `as` casts.

**Scope**

- Rewrite `src/types/section.ts` per the contract in this document.
- Update every consumer of `Section.content` / `Section.settings_json` to use type narrowing (`if (section.type === 'header')`) instead of casts.
- Replace explicit casts like `section.content as HeaderContent` with the narrowed access.

Approximate consumer file list (verify by grep — `grep -rn "as HeaderContent\|as TextContent\|as MediaContent\|as ContentMediaContent\|as CampaignContent\|as FooterContent\|as CollectionSettings\|as HeaderSettings"`):

- All 11 settings panels under `src/components/editor/settings/`
- All section variants under `src/components/sections/*/`
- `src/composables/useSectionLifecycle.ts`
- `src/composables/useListActions.ts`, `useCollectionActions.ts`, `useStoreActions.ts`
- `src/components/editor/SectionSettings.vue`
- `src/components/editor/EditorSidebar.vue`, `MobileEditorBar.vue`
- `src/components/ui/BaseLinkPicker.vue`
- `src/components/dashboard/LandsDashboard.vue` (the `stores?.[0]?.items` accessors)
- `src/components/editor/EditorPreview.vue`
- `src/views/onboarding/OnboardingView.vue` and `src/components/modals/CreateProjectModal.vue` (the `buildSections` function)
- `src/services/storage.service.ts` (`extractSectionUrls`)
- `src/services/land.service.ts` (`normalizeLand`)

**Files affected**

- Rewrite: `src/types/section.ts`
- Edit: ~20–25 files
- Delete: none

**Acceptance**

- `npm run type-check` passes with zero new errors.
- `grep -rn "as HeaderContent\|as TextContent\|as ContentMediaContent\|as CampaignContent\|as FooterContent" src/` returns nothing (except possibly in `buildSections` where the seeded content shape requires it — note any remaining ones in the commit message).
- Dev server runs, full editor flow works: add header, edit content, change variant, change theme, publish.

**Notes**

- The TipTap node-view type errors in `src/components/editor/content/` are pre-existing and known. Do not try to fix them in this phase.
- Some content types share fields (e.g. all have `title`); narrowing by `section.type` is still required because TypeScript doesn't allow common-field access on unions without narrowing or a base interface. Use a base interface for fields truly common to ALL types (probably none in practice; use narrowing).
- The `Section.content: ... | null` allowance probably becomes per-section: only sections that actually allow null content keep that in their type.
- Watch out for `JSON.parse(JSON.stringify(section))` deep clones — they currently return `any`. After narrowing, you may need `structuredClone(section)` (already used in `useSectionLifecycle`) or an explicit cast on the result.

**Claude Code prompt**

```
Phase 2 of the restructure (see RESTRUCTURE_PLAN.md).

Goal: convert `Section` from a non-discriminated union to a discriminated union
keyed on `type`. Then fix every consumer.

Step 1: Rewrite src/types/section.ts per the "Section type discrimination contract"
section of RESTRUCTURE_PLAN.md. Use a generic BaseSection<TType, TContent, TSettings>
and produce HeaderSection, ContentMediaSection, ListSection, CollectionSection,
StoreSection, MonetizeSection, CampaignSection, FooterSection. Export `Section`
as the union.

Step 2: Run `npm run type-check`. List every error.

Step 3: Fix every error by replacing `section.content as XxxContent` casts with
proper type narrowing on `section.type`. Same for settings_json.

Step 4: Re-run type-check. Iterate until clean.

Acceptance:
  - npm run type-check: 0 errors
  - grep -rn "as HeaderContent\|as TextContent\|as ContentMediaContent\|as CampaignContent\|as FooterContent" src/ returns nothing
  - Dev server: editor flow (add section, edit, change variant, publish) works

Do not touch templates. Do not modify behavior. Do not fix the pre-existing
TipTap node-view type errors in src/components/editor/content/.

Commit as: refactor(types): discriminate Section union (Phase 2)
```

---

## Phase 3 — Section registry

**Goal:** consolidate the parallel "what is a section type" mechanisms into one `SECTION_REGISTRY`. Replace `SectionXxx.vue` dispatchers with a single `SectionRenderer.vue`. Replace the `v-if` chain in `SectionSettings.vue` with registry lookup.

**Scope**

Create:

- `src/features/sections/registry.ts` (new folder — first usage of `features/`, but only this one folder for now)

The registry imports the existing variant components from their current locations (don't move them yet) and the existing settings panels.

Replace:

- All `SectionXxx.vue` dispatcher components (Header, ContentMedia, List, Collection, Store, Monetize, Campaign, Footer) → single `src/components/editor/sections/SectionRenderer.vue` that reads `SECTION_REGISTRY[section.type].variants[themePreset]`.
- `SectionSettings.vue`'s `v-if/v-else-if` chain → reads `SECTION_REGISTRY[section.type].settingsPanel`.
- `componentMap` in `EditorPreview.vue` → uses `SectionRenderer`.
- `sectionPrimitives` in `src/sections/index.ts` → registry-derived, but keep the export working as a thin wrapper to avoid editing every consumer in this phase.

Delete:

- `src/components/sections/SectionHeader.vue`, `SectionContentMedia.vue`, `SectionList.vue`, `SectionCollection.vue`, `SectionStore.vue`, `SectionMonetize.vue`, `SectionCampaign.vue`, `SectionFooter.vue`, `SectionMedia.vue`, `SectionText.vue` (last two are dead — confirm with grep before deleting).
- `src/lib/primitives/sectionSettingsConfig.ts` (its job is the registry now). Keep `sectionDefaults.ts` and `styleVariants.ts` and `purposeDefaults.ts` — but the registry should `import` from them rather than duplicate.

**Files affected**

- New: 2 files (`registry.ts`, `SectionRenderer.vue`)
- Edit: `EditorPreview.vue`, `SectionSettings.vue`, `src/sections/index.ts`, plus anything that imported a `SectionXxx.vue` dispatcher
- Delete: 8–10 dispatcher files + 1 config file

**Acceptance**

- `npm run type-check` passes.
- Dev server: every section type renders correctly under every theme preset (minimal / baseline / structure). Switch themes and verify each section type re-renders to the right variant.
- Settings panels open correctly for every section type when clicking the section in edit mode.
- Adding a new section from `SectionsModal` still works for every type.
- `grep -rn "componentMap\|SectionHeader.vue\|SectionContentMedia.vue" src/` returns nothing.

**Notes**

- The discriminated `Section` type from Phase 2 makes `SectionDefinition<S>` properly generic. Use it.
- Verify the theme preset values in `themePresets.ts` (might be `minimal`/`baseline`/`structure` per the section components or different per the older docs — go by the code).
- The `text` and `media` section type folders in `src/components/sections/` look orphaned (no entry in `SECTION_TYPES`). Confirm via grep, then either delete them or document them as deferred future types. Don't include them in the registry unless they're actually used.

**Claude Code prompt**

```
Phase 3 of the restructure (see RESTRUCTURE_PLAN.md).

Goal: replace the three parallel "section type → component" mechanisms with one
SECTION_REGISTRY.

Step 1: Verify `text` and `media` section folders in src/components/sections/
are dead code (grep `'media'\|'text'` against types/section.ts SECTION_TYPES).
Report findings before deleting them.

Step 2: Create src/features/sections/registry.ts per the "Section registry
contract" in RESTRUCTURE_PLAN.md. Import variant components from their existing
paths (do not move them this phase). Import settings panels from existing paths.

Step 3: Create src/components/editor/sections/SectionRenderer.vue that takes
{ section } and renders the right variant for the active theme preset by reading
the registry.

Step 4: Replace componentMap in EditorPreview.vue — use SectionRenderer.

Step 5: Replace the v-if chain in SectionSettings.vue with
`<component :is="SECTION_REGISTRY[section.type].settingsPanel" :section="section" />`

Step 6: Make src/sections/index.ts export sectionPrimitives by deriving from
SECTION_REGISTRY, preserving the SectionPrimitive interface so consumers don't break.

Step 7: Delete the SectionXxx.vue dispatchers (Header, ContentMedia, List, Collection,
Store, Monetize, Campaign, Footer) and src/lib/primitives/sectionSettingsConfig.ts.

Acceptance:
  - npm run type-check: clean
  - All section types render correctly under all theme presets (eyeball test)
  - Settings panels open correctly per type
  - Adding/duplicating/deleting sections works

Commit as: refactor(sections): consolidate dispatchers into SECTION_REGISTRY (Phase 3)
```

---

## Phase 4 — `useSectionForm` + collapse settings panels

**Goal:** kill the `sync()` + watch + refs + save() boilerplate from all 11+ settings panels. Consolidate List/Collection/Store nested-item logic.

**Scope**

Create:

- `src/composables/useSectionForm.ts` — generic over the discriminated section type. Given a section and a list of content/settings keys, returns a record of refs that two-way bind to the section content via `useEditorMutations`.
- `src/composables/useSectionSnapshot.ts` — `{ snapshot, capture(), restore() }`. Replaces the inline snapshot logic in `SectionSettings.vue` and the parallel one in `ListSettings.vue` for sub-item editing.
- `src/composables/useNestedItems.ts` — generic for "items inside a section content array" (list items, collection items, store items). Replaces the three near-identical composables.

Refactor:

- Every settings panel under `src/components/editor/settings/` uses `useSectionForm`. Each should drop from ~100–250 lines to ~30–80 lines of `<script>` + unchanged template (templates may need `v-model="form.title"` instead of `:model-value="title" @update:modelValue="save"` — that's the minimum template change permitted in this phase).
- `useListActions.ts`, `useCollectionActions.ts`, `useStoreActions.ts` → consolidated into `useNestedItems` plus thin wrappers if needed (or callers update directly).
- `useEditorActions.ts` → renamed to `useEditorMutations.ts`. Drop the re-export + spread pattern. Consumers import each focused composable directly.

**Files affected**

- New: 3 composables
- Edit: ~13 settings panels, several consumers of `useEditorActions`
- Delete: `useListActions.ts`, `useCollectionActions.ts`, `useStoreActions.ts` (if fully replaced), `useEditorActions.ts`

**Acceptance**

- `npm run type-check` passes
- Every settings panel still edits its section content and saves correctly
- Sub-item editing (list items, collection items, store items) works: open, edit, save, cancel-with-restore
- Section settings cancel button still restores via snapshot
- Each refactored settings panel is < 100 lines of `<script setup>`
- `grep -rn "function sync()" src/` returns nothing (or only well-documented exceptions)

**Notes**

- `v-model` template change is allowed *only* on form inputs where the previous code did `:model-value="x" @update:modelValue="save"`. Visual behavior must be identical.
- Debouncing is **out of scope** unless something visibly breaks without it.
- The `restoreSectionSnapshot` mutation in `useEditorMutations` stays.

**Claude Code prompt**

```
Phase 4 of the restructure (see RESTRUCTURE_PLAN.md).

Goal: kill the `sync()` boilerplate in every settings panel and consolidate
nested-item composables.

Step 1: Create src/composables/useSectionForm.ts. It is generic over the
discriminated Section type from Phase 2. Given a section ref and lists of
content/settings keys to bind, it returns a record of refs that two-way bind
through useEditorActions (soon to be useEditorMutations).

Step 2: Create src/composables/useSectionSnapshot.ts: { snapshot, capture(),
restore() } using structuredClone.

Step 3: Create src/composables/useNestedItems.ts as a generic for items inside
a section content array. Replace useListActions, useCollectionActions,
useStoreActions with thin wrappers around it OR direct callers — your call,
optimize for clarity.

Step 4: Refactor every settings panel under src/components/editor/settings/
to use useSectionForm. Template changes permitted: `:model-value="x"
@update:modelValue="save"` → `v-model="form.x"`. Nothing else.

Step 5: Rename useEditorActions → useEditorMutations. Drop the re-export+spread
pattern. Update every caller to import focused composables directly.

Acceptance:
  - npm run type-check clean
  - Every settings panel still works (add/edit/delete fields, save, cancel-restore)
  - Sub-item editing in List/Collection/Store still works
  - No function sync() boilerplate left

Commit as: refactor(editor): introduce useSectionForm; collapse settings panels (Phase 4)
```

---

## Phase 5 — `usePublishFlow` + thin `AppHeader`

**Goal:** extract the save/publish/discard/leave-guard state machine from `AppHeader.vue` (currently ~180 lines of script).

**Scope**

Create:

- `src/composables/usePublishFlow.ts` — owns: `isSaving`, `isPublishing`, `publishStatus`, `hasPublishedClean`, `showUpToDate`, `pendingPath`, `leaveContext`, `save()`, `publish()`, `discardChanges()`, `enterEditor()`, `exitEditor()`, `handleClose()`, `confirmLeave()`, `cancelLeave()`, `confirmPublished()`, and the `router.beforeEach` dirty guard registration.

Refactor:

- `AppHeader.vue` becomes pure template + a one-line composable call.
- `ConfirmLeaveModal.vue` and `ConfirmPublishedModal.vue` can consume the same composable's state if they currently take props for it.
- `ProjectView.vue`'s "unpublished changes" toast logic uses the composable.

**Files affected**

- New: 1 composable
- Edit: `AppHeader.vue`, `ConfirmLeaveModal.vue`, `ConfirmPublishedModal.vue`, `ProjectView.vue`

**Acceptance**

- `npm run type-check` passes
- Save button works; "Already up to date" hint appears at the right moment
- Publish opens the modal, runs through loading → done states, closes correctly
- Closing the editor with unsaved changes shows the confirm-leave modal
- Navigating away with unsaved changes shows the same modal and respects cancel
- AppHeader's `<script setup>` is < 50 lines

**Claude Code prompt**

```
Phase 5 of the restructure (see RESTRUCTURE_PLAN.md).

Goal: extract the save/publish/leave-guard state machine from AppHeader into
usePublishFlow.

Create src/composables/usePublishFlow.ts that owns:
  - isSaving, isPublishing, publishStatus, hasPublishedClean, showUpToDate
  - pendingPath, leaveContext
  - canPublish (computed)
  - save(), publish(), discardChanges(), enterEditor(), exitEditor()
  - handleClose(), confirmLeave(), cancelLeave(), confirmPublished()
  - router.beforeEach dirty guard (registered onScopeDispose)
  - watch on appModals.publishTrigger

Refactor AppHeader.vue to a thin consumer. Move the router guard registration
out of AppHeader.

Refactor ProjectView.vue's "unpublished changes" toast sync to use the composable's
state directly.

Acceptance:
  - All save/publish/leave/discard flows work
  - AppHeader script under 50 lines
  - npm run type-check clean

Commit as: refactor(editor): extract usePublishFlow (Phase 5)
```

---

## Phase 6 — `useLandCreator` + split onboarding/create-project

**Goal:** collapse the duplicated wizard between `OnboardingView` (613 lines) and `CreateProjectModal` (353 lines).

**Scope**

Create:

- `src/composables/useLandCreator.ts` — owns the wizard state (title, handle, purpose, theme preset, colors, fonts), the slug-from-title watcher with `handleEdited` flag, `buildSections()` (moved here), and `create()` that runs `landService.createLand` → `landService.save` → `landStore.addLand`.
- `src/composables/useSlugFromTitle.ts` — small helper, used by `useLandCreator` and possibly elsewhere.
- `src/composables/useGoogleFont.ts` — watch a font ref and load the matching Google font when it changes.

Split:

- `OnboardingView.vue` (613 → ~150 lines) becomes a thin shell calling `useLandCreator()` and rendering step components.
- New step components in `src/views/onboarding/steps/`:
  - `StepName.vue` (title, handle, purpose)
  - `StepTheme.vue` (theme preset picker)
  - `StepStyle.vue` (colors + fonts)
  - `LivePreview.vue` (the right-panel mockup used in Steps 2 & 3)
- `CreateProjectModal.vue` reuses the same step components, just inside a modal shell.

**Files affected**

- New: 3 composables, 4 step components
- Edit: `OnboardingView.vue`, `CreateProjectModal.vue`
- Delete: the duplicated `buildSections` in both files

**Acceptance**

- `npm run type-check` passes
- Onboarding flow: create a new account → goes through Steps 1/2/3 → creates a land with sections per purpose → lands on `/dashboard`
- Create Project Modal: opens, walks through steps, creates a second land, switches to it
- Both produce identical Lands given the same inputs
- `OnboardingView.vue` and `CreateProjectModal.vue` each < 200 lines

**Notes**

- `OnboardingView` has 4 steps in the existing code but it's actually 3 numbered (purpose+name combined). `CreateProjectModal` has 4. Decide on one structure and use the same in both — pick the one with better UX (verify with the user if unclear).

**Claude Code prompt**

```
Phase 6 of the restructure (see RESTRUCTURE_PLAN.md).

Goal: collapse the wizard duplication between OnboardingView and CreateProjectModal.

Step 1: Create src/composables/useSlugFromTitle.ts (title → handle with manual override).
Step 2: Create src/composables/useGoogleFont.ts (watch font ref → load on change).
Step 3: Create src/composables/useLandCreator.ts owning all wizard state + buildSections
        + create() flow. Reads the discriminated Section type from Phase 2.
Step 4: Create step components in src/views/onboarding/steps/:
        StepName.vue, StepTheme.vue, StepStyle.vue, LivePreview.vue
Step 5: Refactor OnboardingView.vue to a thin shell using useLandCreator + steps.
Step 6: Refactor CreateProjectModal.vue to reuse the same step components inside
        a modal shell.

If OnboardingView and CreateProjectModal have differing step counts, pick the
better UX and use it in both. Report which you picked and why.

Acceptance:
  - Onboarding flow works end-to-end
  - Create Project Modal flow works end-to-end
  - Both files under 200 lines
  - npm run type-check clean

Commit as: refactor(onboarding): extract useLandCreator; split wizard into steps (Phase 6)
```

---

## Phase 7 — `useEditorPanel` + collapse `EditorSidebar` / `MobileEditorBar`

**Goal:** these two files (514 + 314 lines) are 80% the same content. Merge their shared logic.

**Scope**

Create:

- `src/composables/useEditorPanel.ts` — tab state (`content` / `design`), design sub-panel state (`theme` / `colors` / `typography` / null), direction refs, setTab/backFromDesign, plus watchers that reset on `editorStore.isEditMode` and `editorStore.showSectionSettings`.

Split:

- `src/components/editor/panel/EditorPanel.vue` — the actual content: tabs, section tree, design sub-panels, section settings host. ~250 lines.
- `src/components/editor/panel/ContentTab.vue` — the content tab body.
- `src/components/editor/panel/DesignTab.vue` — the design tab body.
- `src/components/editor/panel/PublishSettingsCard.vue` — the publish-settings card (title, handle, published toggle, private toggle, password input + autosave + confirm-unpublish modal trigger).
- `src/components/editor/panel/DangerZoneCard.vue` — the delete-project card + modal trigger.

Refactor:

- `EditorSidebar.vue` → thin desktop shell mounting `EditorPanel`. ~80 lines.
- `MobileEditorBar.vue` → thin mobile sheet mounting `EditorPanel` (with the mobile-specific tab bar at the bottom). ~120 lines.

**Files affected**

- New: 1 composable, 5 components
- Edit: `EditorSidebar.vue`, `MobileEditorBar.vue`, `ProjectView.vue` (if needed)
- Delete: none

**Acceptance**

- `npm run type-check` passes
- Desktop editor sidebar: content tab, design tab, section settings, publish settings card, custom-domain modal, delete-project modal — all work
- Mobile editor bar: same flows work on a narrow viewport
- `EditorSidebar.vue` and `MobileEditorBar.vue` each < 150 lines

**Claude Code prompt**

```
Phase 7 of the restructure (see RESTRUCTURE_PLAN.md).

Goal: collapse the EditorSidebar/MobileEditorBar duplication.

Step 1: Create src/composables/useEditorPanel.ts owning tab state, design
sub-panel state, directions, setTab/backFromDesign, and the reset-on-mode-change
watchers.

Step 2: Create EditorPanel.vue + the four card components listed in
RESTRUCTURE_PLAN.md Phase 7 scope.

Step 3: Refactor EditorSidebar.vue and MobileEditorBar.vue into thin shells
that mount EditorPanel.

All design and transitions stay identical. Both shells render the same panel
content but in different chrome (fixed sidebar vs bottom sheet).

Acceptance:
  - Desktop editor sidebar flows work
  - Mobile editor bar flows work
  - EditorSidebar and MobileEditorBar each < 150 lines
  - npm run type-check clean

Commit as: refactor(editor): unify sidebar and mobile bar via EditorPanel (Phase 7)
```

---

## Phase 8 — `LandsDashboard` split

**Goal:** the dashboard sidebar (465 lines) is mixing routing, count-up animations, Stripe-connect, and three card layouts.

**Scope**

Create:

- `src/composables/useDashboardDetail.ts` — owns `activeDetail` and `direction`, plus watchers on `appModals.dashboardDetail`. Resolves the `dashboardDetail` / `activeDashboardDetail` duplication in `appModals` (delete the unused one).
- `src/composables/useCountUpStats.ts` — generic count-up trigger.
- `src/components/dashboard/cards/MetricCard.vue` — analytics/orders/monetize/campaign card shell.
- `src/components/dashboard/cards/UpgradeCard.vue`
- `src/components/dashboard/cards/ConnectStripeCard.vue`
- `src/components/dashboard/DashboardDetail.vue` — the detail-panel router (uses `useDashboardDetail`).

Refactor:

- `LandsDashboard.vue` → ~200 lines using the composables and cards.

**Files affected**

- New: 2 composables, 4 components
- Edit: `LandsDashboard.vue`, `src/stores/appModals.ts` (delete one of the dupe refs)

**Acceptance**

- `npm run type-check` passes
- Dashboard renders all five detail panels (analytics, orders, sell, campaign, monetize) and switches between them
- Count-up numbers still animate on land change
- Stripe-connect card works
- `appModals` store no longer has duplicate `dashboardDetail` / `activeDashboardDetail` — one is removed
- `LandsDashboard.vue` < 250 lines

**Claude Code prompt**

```
Phase 8 of the restructure (see RESTRUCTURE_PLAN.md).

Goal: split LandsDashboard.vue into composables + card components.

Step 1: Resolve the `dashboardDetail` / `activeDashboardDetail` duplication in
src/stores/appModals.ts. Pick one, delete the other, migrate consumers.
Document which you kept in the commit.

Step 2: Create useDashboardDetail composable.
Step 3: Create useCountUpStats composable.
Step 4: Create MetricCard, UpgradeCard, ConnectStripeCard.
Step 5: Create DashboardDetail.vue as the detail-panel router.
Step 6: Refactor LandsDashboard.vue to use them. Aim < 250 lines.

Acceptance:
  - All dashboard flows (5 detail panels + count-ups + Stripe connect) work
  - npm run type-check clean
  - appModals store no longer has duplicated detail refs

Commit as: refactor(dashboard): split LandsDashboard into cards + composables (Phase 8)
```

---

## Phase 9 — Auth cleanup

**Goal:** the auth store is mostly form-state-holder. Replace with composables. Decide on session store shape.

**Scope**

Create:

- `src/composables/useAuthForm.ts` — owns `isLoading`, `error`, `signingIn`, `resetEmailSent`, `passwordResetSuccess`, etc. Instance per auth view, not shared across the app.
- `src/composables/useOtpInput.ts` — extract the 8-digit OTP entry from `RegisterView`. Generic over digit count.

Decide:

- Whether to keep `stores/user.ts` as `useUserStore` or rename to `useSessionStore`. Recommend: keep `useUserStore` for now (minimum churn), revisit in Phase 10.

Delete:

- `src/stores/auth.ts` — its responsibilities are now in `useAuthForm`. Migrate every caller.

Refactor:

- `LoginView.vue`, `RegisterView.vue`, `LostPasswordView.vue`, `AcceptInviteView.vue` use `useAuthForm`.
- `RegisterView.vue` uses `useOtpInput`.
- `AuthLayout.vue` reads `signingIn` from a different source (probably moves to a route-level state or a tiny composable; verify what it actually needs).

**Files affected**

- New: 2 composables
- Edit: 5 auth views/layouts
- Delete: `src/stores/auth.ts`

**Acceptance**

- `npm run type-check` passes
- Login, register (+ OTP), password reset, accept-invite all work
- Sign-in animation (`AuthLayout` growing) still triggers correctly
- `grep -rn "useAuthStore\|stores/auth" src/` returns nothing

**Claude Code prompt**

```
Phase 9 of the restructure (see RESTRUCTURE_PLAN.md).

Goal: delete the auth store and replace with composables.

Step 1: Create useAuthForm composable (owns isLoading, error, signingIn,
resetEmailSent, passwordResetSuccess). Instance per consumer.
Step 2: Create useOtpInput composable (digits, code, isComplete, input handlers,
focus management).
Step 3: Refactor LoginView, RegisterView, LostPasswordView, AcceptInviteView
to use useAuthForm. Refactor RegisterView to use useOtpInput.
Step 4: Move the AuthLayout `signingIn` animation trigger to a composable
shared by the layout and the views that set it.
Step 5: Delete src/stores/auth.ts.

Acceptance:
  - All auth flows work (login, register+OTP, reset password, accept invite)
  - npm run type-check clean
  - grep finds no remaining references to the auth store

Commit as: refactor(auth): replace store with composables (Phase 9)
```

---

## Phase 10 — Folder restructure to `features/`

**Goal:** finally adopt the `features/`-based folder layout. Pure moves and import-path updates.

**Scope**

Move every file to its target location per the "Target architecture" section of this document. Update every `import` accordingly. No logic changes.

Highlights:

- `src/components/dashboard/` → `src/features/dashboard/components/`
- `src/components/editor/` → `src/features/editor/components/`
- `src/components/modals/` → split across `src/features/modals/modals/` and feature-specific modals into their feature folder
- `src/components/integrations/` → `src/features/integrations/panels/`
- `src/components/sections/` → `src/features/editor/components/sections/` (variants) — note that the dispatchers are gone after Phase 3
- `src/components/ui/` → `src/shared/ui/`
- `src/composables/` → split: cross-feature → `src/shared/composables/`, the rest → their feature folder
- `src/services/` → split per feature
- `src/stores/` → split per feature
- `src/types/` → split per feature; `section.ts` and `land.ts` move to `src/features/sections/types.ts` and `src/features/lands/types.ts`
- `src/lib/` → `src/shared/lib/` (except `lib/primitives/*` which move to `src/features/sections/` since the registry is the new home)
- `src/router/` → `src/app/router/`
- `src/main.ts`, `src/App.vue` → `src/app/main.ts`, `src/app/App.vue`

Update `vite.config.ts` / `tsconfig.json` path aliases if needed. The `@` → `src` alias should still work; add no new aliases.

Subfolder the moved composables per the convention table in this doc.

**Files affected**

- ~All `.ts` and `.vue` files under `src/`. Mass `git mv` + import rewrites.

**Acceptance**

- `npm run type-check` passes
- `npm run build` succeeds
- Every flow works in dev — full smoke test from auth → onboarding → dashboard → editor → publish
- `tree src/` matches the target architecture in this document

**Notes**

- Do this in a single commit so the history is a clear "big move" rather than dozens of small ones. Use `git mv` for everything.
- After this phase, edit `CLAUDE.md` and `AGENTS.md` to reflect the new layout.

**Claude Code prompt**

```
Phase 10 of the restructure (see RESTRUCTURE_PLAN.md).

Goal: move every file to the target architecture. Pure moves + import rewrites,
no logic changes.

Step 1: Re-read the "Target architecture" section of RESTRUCTURE_PLAN.md.
Step 2: Plan the moves. Output a complete `git mv` list before executing.
Step 3: Execute the moves with `git mv` so history is preserved.
Step 4: Update every import (search and replace, then verify with type-check).
Step 5: Update CLAUDE.md and AGENTS.md to reflect the new layout.

Acceptance:
  - npm run type-check clean
  - npm run build succeeds
  - Every user flow works (manual smoke test)
  - `tree src/ -L 3` matches the target

Commit as: refactor(structure): adopt features/ layout (Phase 10)
```

---

## Phase 11 — Final cleanup

**Goal:** small leftover items. Polish pass.

**Scope**

- Move `src/assets/demo.webm` (2.2 MB) and `src/assets/hero.png` (1.3 MB) to `/public` and update references. They're only referenced from the storefront/marketing surface — confirm and skip if not.
- Consolidate `src/lib/mock/` and `src/lib/primitives/mockSectionContent.ts` into one mock-data location (post-Phase 10, this is probably `src/shared/mock/` or kept under a single dev-only folder).
- Standardize `useToast` import: export `addToast`/`removeToast`/`toasts` directly from the module so callers don't have to remember to call `useToast()`.
- Audit for dead code with grep: unused exports, unused imports, unreferenced components. Delete anything that's confirmed dead.
- Audit `src/components/sections/text/` and `src/components/sections/media/` — if these were deferred during Phase 3, decide now whether to register or delete.
- Update `AUDIT.md` open issues list — mark items now resolved by the restructure (the M9 type-safety one is done; others remain).

**Acceptance**

- `npm run type-check` passes
- `npm run build` succeeds
- `du -sh src/assets/` is back under ~500KB
- Final manual smoke test

**Claude Code prompt**

```
Phase 11 of the restructure (see RESTRUCTURE_PLAN.md). Final cleanup.

Step 1: Confirm src/assets/demo.webm and src/assets/hero.png usage. If only used
by the storefront (out of scope), still move them to public/ to keep them out
of the bundle. Update references.
Step 2: Consolidate src/lib/mock/ and src/lib/primitives/mockSectionContent.ts
into one location.
Step 3: Standardize useToast: export addToast/removeToast/toasts directly.
Update callers.
Step 4: Run grep for unused exports/components and delete dead code.
Step 5: Decide the fate of orphan text/media section folders. Either register
them in SECTION_REGISTRY or delete them.
Step 6: Update AUDIT.md — mark items resolved.

Acceptance:
  - npm run type-check, build clean
  - src/assets/ < 500KB
  - All flows still work

Commit as: chore: post-restructure cleanup (Phase 11)
```

---

## Risk log

Things to watch for during the restructure:

- **Pinia store state hydration.** Renaming or splitting stores risks losing in-progress state. We're explicitly preserving store IDs.
- **Async-loaded components.** `EditorPreview` uses `defineAsyncComponent`. After Phase 3, `SectionRenderer` should still defer-load variant components or the initial bundle bloats.
- **Theme preset name drift.** `CODEBASE.md` says `minimal | bold | editorial`. `CLAUDE.md` matches. But section variant files are `Minimal`, `Baseline`, `Structure`. Verify the actual values in `themePresets.ts` and `theme.ts` before writing the registry — go by the code, not the docs.
- **Section type drift.** `text` and `media` section folders exist but aren't in `SECTION_TYPES`. Either real (and need adding) or dead (and need deleting). Phase 3 must resolve this.
- **The `purpose` field on `Land`.** Used by `buildSectionContent` to seed content; comes from onboarding. Make sure Phase 6 doesn't break its plumbing.
- **TipTap node-view type errors.** Pre-existing. Leave them alone the entire restructure unless a phase explicitly fixes them.
- **Stripe / Supabase / Cloudflare callbacks.** Route paths must not change. Edge function signatures must not change. We only touch frontend.

---

## Quick reference

**After each phase, run:**

```bash
npm run type-check
npm run dev    # smoke test
```

**Definition of done for the whole restructure:**

- The diff is large but no visual change.
- `src/` follows the target architecture.
- `grep -rn "as HeaderContent\|function sync()\|sectionIconMap = Object.fromEntries\|generatePositionBefore\|stripeService.connectUrl" src/` returns near-zero matches (only inside the canonical composables/registry).
- Every settings panel is < 100 lines of `<script setup>`.
- Every "view" is < 250 lines.
- Every store does only persistent/shared state.

When all phases are complete, the codebase is set up for the next year of feature work without accumulating the same kind of duplication again.