# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Type-check + build for production
npm run type-check   # Run vue-tsc type checking only
npm run build-only   # Build without type-check
npm run preview      # Preview production build
```

No test runner is configured.

## Architecture Overview

**Lands** is a Vue 3 + TypeScript SPA for building personal landing pages ("lands"). It uses Vite, Pinia, Vue Router, and Tailwind CSS v4.

### Routing & Layouts

Three layout shells, each wrapping a `<RouterView>`:

| Layout | Path | Purpose |
|---|---|---|
| `AuthLayout` | `/auth` | Login, register, password reset — two-column with logo |
| `OnboardingLayout` | `/onboarding` | New user setup |
| `AppLayout` | `/dashboard` | Main app — `AppHeader` + scrollable content area |

The dashboard has two child routes: `/dashboard` (ProjectView → EditorPreview) and `/dashboard/account` (AccountView).

### Core Data Model

A **Land** is the central entity — a user's public page identified by `handle` (subdomain slug). Each land has:
- `sections: Section[]` — ordered by fractional index (`position` field via `fractional-indexing`)
- `theme: LandTheme` — preset (`minimal` | `bold` | `editorial`) + color/typography overrides
- `plan`, `collaborators`

**Section** is polymorphic via `type: SectionType` (`header | text | media | list | collection | store | campaign | footer`). Each section has:
- `style_variant` — per-type style string (e.g. `default | centered | wide` for text)
- `settings_json: SectionSettings` — typed settings per section type
- `content` — typed content payload per section type

### Section Rendering

`EditorPreview.vue` maps section types to components via `componentMap`. Each `SectionXxx.vue` (e.g. `SectionText.vue`) delegates to a style-variant sub-component (e.g. `TextMinimal`, `TextBold`, `TextEditorial`) found in `src/components/sections/{type}/`.

Theme presets drive which style variant renders — see `src/lib/primitives/themePresets.ts`.

### State (Pinia Stores)

- `useLandStore` — list of lands, `activeLand`, section CRUD
- `useEditorStore` — editor mode (`isEditMode`), `activeSection` selection
- `useProjectStore` — project mode (`preview | editor`)
- `useThemeStore` — active land theme, synced to CSS variables via `useThemeVars` composable
- `useUserStore` — current user
- `useAuthStore` — auth loading/error state

### Theme System

`useThemeVars` (called in `App.vue`) writes CSS custom properties (`--theme-font`, `--theme-color-main`, etc.) to `:root`. Components consume these vars directly in styles. Theme configuration lives in `src/lib/primitives/themePresets.ts`.

### Mock Data

The app runs entirely on mock data — no real API calls during development. `initMockData()` is called in `App.vue`'s `onMounted` and seeds all stores via `src/lib/mock/`. Services in `src/services/` exist as API layer stubs.

### UI Components

All reusable primitives are in `src/components/ui/` prefixed with `Base` (e.g. `BaseButton`, `BaseInput`, `BaseDropdown`). Do not create one-off replacements — extend or use existing Base components.
