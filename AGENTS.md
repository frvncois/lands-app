# Repository Guidelines

## Project Structure & Module Organization
`src/main.ts` boots the Vue SPA, mounts `App.vue`, and injects the router plus Pinia stores from `src/stores`. Routes live in `src/views`, use `src/layouts`, and render block variants from `src/components/sections` and `src/sections`. Cross-cutting logic stays in `src/composables`, `src/services`, and `src/lib`, while static assets sit in `public/` and `src/assets`. Backend artifacts—SQL schema, triggers, and Stripe Edge Functions—reside in `supabase/`; keep schema changes mirrored there before deploying.

## Build, Test, and Development Commands
- `npm install` – install dependencies; use Node 20.19+ as enforced by the engines field.
- `npm run dev` – start Vite with Hot Module Reloading for day-to-day feature work.
- `npm run type-check` – run `vue-tsc --build`; treat failures as blockers because no separate lint step exists.
- `npm run build` – runs `type-check` and `vite build` in parallel via `run-p` to emit optimized assets in `dist/`.
- `npm run preview` – serve the production build for smoke testing redirects, Supabase callbacks, and env wiring.

## Coding Style & Naming Conventions
Use TypeScript everywhere, `script setup` syntax in Vue SFCs, and two-space indentation. Components keep `PascalCase` filenames (`SectionMedia.vue`), reusable UI primitives begin with `Base*`, Pinia stores follow `useXStore`, services are kebab-cased (`land.service.ts`), and composables use the `useSomething` prefix. Follow Tailwind utility classes in templates, keep global styles in `src/assets/main.css`, and lean on `src/types` unions instead of raw strings.

## Testing Guidelines
There is no Vitest suite yet, so lean on `npm run type-check`, manual flows from `FLOW.md`, and smoke tests in auth, editor, and checkout routes. When logic can be isolated, add Vue Test Utils + Vitest specs and block merges on those checks. Exercise Supabase functions via the Supabase CLI or staging before toggling feature flags.

## Commit & Pull Request Guidelines
Existing history is sparse, so adopt concise, imperative commit messages (e.g., `fix: guard theme hydration`) and push logically scoped changes. Each PR should describe the motivation, list commands run (dev, build, preview), link Supabase issue/Linear IDs when available, and attach screenshots or Loom links for UI updates. Call out new env vars (VITE_SUPABASE_URL, VITE_SUPABASE_KEY, VITE_STRIPE_CLIENT_ID) and note Supabase SQL/function changes for reviewers.

## Security & Configuration Tips
Never commit `.env` files; rely on Vite's `VITE_*` variables for browser-safe values and keep secrets inside Supabase Edge Functions. Keep `supabase/schema.sql` and `/functions/stripe-*` synchronized with production, rotate keys for public previews, and clear local Supabase sessions instead of hardcoding tokens.
