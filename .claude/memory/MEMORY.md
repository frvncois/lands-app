# Project Memory

## Stack
- Vue 3 + TypeScript, Vite, Pinia, Vue Router, Tailwind CSS v4
- Supabase for auth + database (client: `src/lib/supabase.ts`)
- No test runner configured

## Database — 5 tables only
`profiles`, `lands`, `land_themes`, `sections`, `collaborators`

**All section content lives in `sections.content` JSONB** — no separate tables for list items, media items, collections, store items. This is a microsite builder; each land is self-contained, cross-land queries are not needed.

`land_themes` is 1-to-1 with `lands`, auto-created via trigger on land insert.
`profiles` is auto-created via trigger on auth.users insert (`handle_new_user` function).

Schema file: `supabase/schema.sql` (idempotent — safe to re-run).

## Auth flow
- Supabase auth (`signInWithPassword`, `signUp`, `resetPasswordForEmail`)
- Route guard in `router/index.ts`: `requiresAuth` → `/auth`, `requiresGuest` → `/dashboard`
- `App.vue` listens to `onAuthStateChange` to load/clear user + lands
- After register → redirect to `/onboarding`
- After login → redirect to `/dashboard`

## Routing
- `/` → `HomeView` (storefront, public)
- `/auth` → `LoginView`, `/auth/register` → `RegisterView`, `/auth/reset` → `LostPasswordView`
- `/dashboard` → `ProjectView` (editor), `/dashboard/account` → `AccountView`
- `/onboarding` → `OnboardingView`

## Key conventions
- All reusable UI components in `src/components/ui/` prefixed with `Base`
- Stores: `useUserStore`, `useLandStore`, `useThemeStore`, `useEditorStore`, `useAuthStore` (UI loading/error only), `useProjectStore`
- `useLandStore.activeLand` is the currently edited land
- Theme written to CSS vars via `useThemeVars` composable (called once in `App.vue`)
- Section rendering: `EditorPreview` → `SectionXxx` → style-variant sub-component (`/components/sections/{type}/{Style}.vue`)
