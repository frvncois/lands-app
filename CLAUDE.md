# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check + production build (parallel)
npm run type-check   # Run vue-tsc for TypeScript validation
npm run preview      # Preview production build
```

**Node requirement:** ^20.19.0 || >=22.12.0

## Architecture Overview

This is **lands-app**, a Vue 3 landing page builder with section-based editing. Users create landing pages by adding, configuring, and styling pre-defined section types.

### Core Concepts

**Section-Based Architecture** (not block-by-block):
- `SectionDefinition` = structure + component + schema (in `lib/section-registry.ts`)
- `SectionInstance` = content data + style overrides (stored in editor state)
- Section components receive props and emit `update`/`selectField` events
- Inspector UI is auto-generated from section field schemas

**Theme System:**
- Themes are pure data (`lib/themes/`) defining tokens: colors, fonts, spacing, radius, buttons
- Applied as CSS variables to document root for preview
- Per-section and per-field style overrides layer on top of base theme

### Directory Structure

```
src/
├── components/
│   ├── editor/       # PageEditor, SectionList, StyleInspector, FieldRenderer
│   ├── sections/     # Section components (Hero, Links, Features, etc.)
│   ├── ui/           # 50+ base UI components (Button, Card, Modal, etc.)
│   ├── auth/         # Login/signup
│   ├── common/       # AppHeader, shared layout
│   ├── modal/        # Dialogs (ProjectCreate, ProjectDelete, etc.)
│   └── storefront/   # Published site display
├── stores/           # Pinia state management
│   ├── user.ts       # Auth + profile + preferences
│   ├── projects.ts   # Projects collection + collaborators
│   ├── project.ts    # Current project settings
│   ├── editor.ts     # Sections, theme, undo/redo history
│   └── toast.ts      # Notifications
├── lib/
│   ├── supabase/     # Client setup, caching, connection health
│   ├── themes/       # Theme definitions (minimal, bold, dark)
│   └── section-registry.ts  # Section definitions + factory
├── types/
│   ├── sections.ts   # SectionInstance, FieldSchema, ThemeTokens
│   └── project.ts    # Project, Collaborator, Integration types
├── composables/      # useTheme, useFeatureGate, useProjectCapabilities
├── views/            # Top-level pages (DesignerView, DashboardView, etc.)
└── router/           # Vue Router config + auth guards
```

### Key Patterns

**Editor Layout (PageEditor.vue):**
```
┌────────────────────────────────────────────┐
│              AppHeader + Toolbar            │
├──────────────┬──────────────┬──────────────┤
│ SectionList  │    Canvas    │   Style      │
│   (left)     │   (center)   │  Inspector   │
│              │              │   (right)    │
└──────────────┴──────────────┴──────────────┘
```

**Section Component Contract:**
```typescript
// Props
data: TData              // Content from editor
variant: string          // Layout variant
editable?: boolean       // Edit mode flag
activeField?: string     // Currently selected field
fieldStyles?: FieldStyles
sectionStyles?: SectionStyleProperties

// Emits
emit('update', key, value)    // Update field value
emit('selectField', key)      // Select field for styling
```

**Field Schema Types:** TextField, RichTextField, ImageField, UrlField, BooleanField, SelectField, RepeaterField

### State Management

- `useEditorStore`: Sections array, theme (base + overrides), history (max 50 states), dirty flag
- `useUserStore`: Auth state, profile, preferences (light/dark/system theme)
- `useProjectsStore`: All projects, project contents, integrations, collaborators
- `useProjectStore`: Current project's extended settings (SEO, analytics, domains)

### Supabase Integration

- PKCE auth flow with auto token refresh
- In-memory cache: `cachedFetch(key, fetcher, ttl)`, `invalidateCache(prefix?)`
- Connection health monitoring with recovery on tab visibility change
- Tables: profiles, user_preferences, projects, project_settings, project_contents, project_integrations, collaborators

### Styling

- Tailwind CSS 4 with `@tailwindcss/vite` plugin
- Theme tokens become CSS variables (`--color-primary`, `--font-heading`, `--spacing-section`)
- 11 custom fonts loaded via @font-face in `assets/main.css`
- Dark mode via `useTheme()` composable + `document.documentElement.classList.toggle('dark')`

### Keyboard Shortcuts (in editor)

- `Cmd+Z` / `Cmd+Shift+Z`: Undo/redo
- `Delete`/`Backspace`: Delete selected section
- Arrow keys: Navigate between sections

---

## 🔒 Frozen Architecture (V2)

> ⚠️ HISTORICAL NOTE
> The V2 section system freeze is no longer active.
> This section is kept for reference only.

The Lands V2 section system is **FROZEN**.

Claude must treat the following as **non-negotiable constraints**:

### What Is Frozen
- Section registry
- Approved section list
- Variants per section
- Content schemas
- Style options and their scoping rules
- Inspector separation (Content vs Style)

### Approved Sections (V2)
The ONLY allowed section types are:

- header
- hero
- media-text
- text
- cards
- links
- accordion
- cta
- subscribe
- contact
- gallery
- footer
- logoList
- promo

No other section types may exist in V2.

### Hard Rules (Must Never Be Broken)
- Do NOT add new sections
- Do NOT add new variants
- Do NOT add new style options
- Do NOT add inspector UI without schema backing
- Do NOT introduce layout logic into themes
- Do NOT introduce theme logic into sections
- Do NOT keep "temporary" or commented-out code paths

### Allowed Extensions
The ONLY allowed ways to extend Lands post-freeze are:
- Client-specific custom blocks (namespaced, isolated)
- Client-specific themes
- Future V3 work in a separate branch

Core V2 sections must NEVER be modified for client needs.

### Audit Requirement
Any attempt to change:
- sections
- variants
- schemas
- inspector behavior
- registry contents

REQUIRES a full system self-audit before implementation.

Details are documented in FREEZE.md.

Claude must obey these rules at all times.

---

## 🔓 Active Refactor Mode (V3)

The Lands codebase is now in **Active Refactor Mode**.

Claude is explicitly allowed to:
- Modify section schemas
- Add or remove fields
- Add or remove style options
- Change rendering behavior
- Improve consistency across sections
- Introduce new editor capabilities

### Refactor Rules (Must Be Followed)

Even though the freeze is lifted, the following rules apply:

- Changes must be intentional, not accidental
- Similar sections should converge, not diverge
- Style systems must remain centralized
- Field and section responsibilities must stay clear
- No "temporary" hacks or commented-out logic
- When a change affects multiple sections, it should be applied consistently

### Required Discipline

For every significant change, Claude must:
- Explain WHY the change is needed
- Explain WHAT existing behavior is replaced
- Identify any breaking changes

This is not experimentation — it is controlled evolution.
