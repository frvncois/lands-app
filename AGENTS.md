# Repository Guidelines

## Project Structure & Module Organization
The UI is a Vite-powered Vue 3 SPA. Entry code sits in `src/main.ts`, and shared styling lives in `src/assets` (Tailwind layer + Geist fonts). Keep visual primitives and composite widgets in `src/components`, route-level pages in `src/views`, app-wide state in `src/stores` (Pinia), logic hooks in `src/composables`, and helpers in `src/lib` (including the typed Supabase client). Router definitions sit in `src/router`, and reusable TypeScript models in `src/types`. Static assets flow from `public/`, while production bundles are emitted to `dist/`. Backend touch points reside under `supabase/functions` (Edge Functions) and `supabase/migrations` (SQL and config).

```
src/
  components/
  stores/
  lib/
  views/
supabase/
  functions/
  migrations/
```

## Build, Test, and Development Commands
Run `npm install` once to sync dependencies. `npm run dev` starts Vite with hot module replacement. `npm run type-check` executes `vue-tsc --build` for strict typing without emitting files. `npm run build` runs the type-check plus `vite build` pipeline (via `npm-run-all2`). `npm run preview` serves the generated `dist/` bundle locally for release verification.

## Coding Style & Naming Conventions
Author Vue SFCs with `<script setup lang="ts">`, two-space indentation, and PascalCase component names that mirror their filenames. Pinia stores should export `useXStore` creators from `src/stores`, while composables follow the `useSomething` pattern in `src/composables`. Favor small, typed props and emit interfaces in `src/types`. Tailwind v4 utilities drive layout—extend tokens in `src/assets/main.css` instead of scattering inline colors. For Supabase interactions, always import the singleton from `@/lib/supabase` so the typed `Database` definition remains the source of truth.

## Testing Guidelines
Automated tests are not yet wired up, so treat `npm run type-check` plus manual QA in `npm run preview` as the minimum pre-merge gate. When adding unit tests, colocate `*.spec.ts` files beside the component or store they cover and target Vue Test Utils + Vitest to align with the Vite stack. Exercise auth flows end-to-end against a staging Supabase project before publication.

## Commit & Pull Request Guidelines
Existing history uses short, capitalized summaries with optional context after a hyphen (for example, `Initial commit - Lands landing page builder`). Follow the same style, keep subject lines under 72 characters, and describe the *why* in the body when needed. Every PR should link the related issue, include reproduction steps, screenshots or videos for UI work, and list any Supabase schema or Edge Function updates (both `supabase/migrations` and `supabase/functions`). Confirm you ran `npm run build` (and any new tests) before marking the PR ready.

## Supabase & Configuration Tips
Local development expects `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in your `.env`. The frontend must never touch service-role keys; privileged work belongs in the Edge Functions under `supabase/functions`, which run on Deno. Keep secrets in the Supabase dashboard, and regenerate publishable keys if they leak in logs or screenshots.
