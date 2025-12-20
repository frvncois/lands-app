# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lands** is a visual landing page builder SaaS. Users create and publish landing pages through a drag-and-drop WYSIWYG editor. Built with Vue 3, TypeScript, Pinia, and Supabase.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check + production build
npm run type-check   # Vue TSC type checking only
npm run preview      # Preview production build
```

## Architecture

### Tech Stack
- **Frontend**: Vue 3.5 (Composition API, `<script setup>`)
- **Language**: TypeScript 5.9 (strict mode)
- **Build**: Vite 7.2
- **State**: Pinia 3.0
- **Styling**: Tailwind CSS 4.1
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Icons**: Lineicons + Lucide
- **Fonts**: Geist Sans & Geist Mono

### Directory Structure

```
src/
├── components/
│   ├── builder/       # Designer UI (Sidebar, Preview, Inspector)
│   ├── inspector/     # Property inputs and sections
│   ├── preview/       # Block rendering components
│   ├── modal/         # Dialog modals
│   ├── ui/            # Design system components
│   └── common/        # App shell (Header, Sidebar)
├── stores/            # Pinia stores
│   ├── designer.ts    # Main designer state + block operations
│   ├── designer/      # Designer composables (history, clipboard, etc.)
│   ├── projects.ts    # Project CRUD + collaborators
│   ├── project.ts     # Single project settings
│   └── user.ts        # Authentication + profile
├── types/
│   └── designer.ts    # Block types, settings, styles (~1200 lines)
├── lib/
│   ├── designer-utils.ts  # Block factories, defaults, helpers
│   ├── supabase/          # Database client + types
│   └── designer/          # Save queue, offline store, diff
├── views/             # Page components
├── pages/             # Feature pages (analytics, integrations)
├── features/          # Feature-specific composables
└── router/            # Vue Router config

supabase/
├── migrations/        # Database schema
└── functions/         # Edge functions (Deno)
```

### Key Stores

**`designer.ts`** - Central designer state:
- `blocks: SectionBlock[]` - Page content tree
- `pageSettings: PageSettings` - Global page config
- `selectedBlockId` - Currently selected block
- `blockIndex: Map<string, SectionBlock>` - O(1) lookups
- Block CRUD: `addBlock()`, `deleteBlock()`, `duplicateBlock()`
- History: `undo()`, `redo()` (max 10 snapshots)
- Auto-save via queue-based system with diffs

**`projects.ts`** - Project management:
- CRUD operations with optimistic updates
- Collaborator invites and management
- Project publishing via Edge Functions

### Block System

Blocks are the core content units. Each block has:
- `id`, `type`, `name`
- `settings` - Content configuration (text, URLs, etc.)
- `styles` - Visual styling (padding, colors, etc.)
- `children` - Nested blocks (for layout types)

**Layout blocks** (can have children): `container`, `grid`, `stack`, `canvas`, `slider`, `form`
**Content blocks**: `heading`, `text`, `image`, `video`, `button`, `icon`, `divider`
**Form blocks** (only valid inside `form`): `form-input`, `form-textarea`, `form-checkbox`, `form-radio`, `form-button`, `form-label`

Block operations always call `rebuildBlockIndex()` after structural changes. Use `canHaveChildren()` and `isFormChildBlock()` from `designer-utils.ts` to validate nesting.

### Responsive Styles

Styles support viewport overrides:
```typescript
interface BaseBlockStyles extends CoreBlockStyles {
  tablet?: Partial<CoreBlockStyles>
  mobile?: Partial<CoreBlockStyles>
}
```
Desktop styles are base, tablet/mobile inherit and override.

### File Conventions

- **Components**: PascalCase (`DesignerSidebar.vue`)
- **Composables**: camelCase with `use` prefix (`useTheme.ts`)
- **Stores**: camelCase (`designer.ts`)
- **Utilities**: kebab-case (`designer-utils.ts`)

### Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.app.json`)

## Key Patterns

1. **Block Index**: The designer store maintains `blockIndex: Map<string, SectionBlock>` for O(1) lookups. Always call `rebuildBlockIndex()` after structural changes.

2. **Change Tracking**: Call `markAsChangedWithHistory()` before mutations to enable undo/redo and queue saves.

3. **Optimistic Updates**: Stores perform optimistic updates with rollback on failure.

4. **Composable Architecture**: Designer features are split into composables in `stores/designer/`:
   - `useHistory` - Undo/redo
   - `useClipboard` - Copy/paste
   - `useSharedStyles` - Style presets
   - `useTranslations` - i18n

5. **Inspector Pattern**: Block inspectors are in `components/inspector/blocks/`. Use `useBlockInspector()` composable for common functionality.

6. **Block Creation**: Use factory functions from `designer-utils.ts` (`createSectionBlock()`, `duplicateSectionBlock()`) instead of manually constructing block objects. These ensure proper defaults and ID generation.

7. **Style Utilities**: Use `getResponsiveStyles()` from `lib/style-utils.ts` to compute merged styles across viewports. Animation effects are in `lib/effect-utils.ts`.

## Environment

Requires `.env` with:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon/public key

Never use service-role keys in frontend code; privileged operations belong in Edge Functions.

## Database

Uses Supabase with Row-Level Security:
- `projects` - Project metadata
- `project_content` - Blocks & page settings (JSONB)
- `collaborators` / `collaborator_invites` - Team access
- Edge functions use `service_role` for admin operations

## Supabase Edge Functions

Located in `supabase/functions/`:
- `publish-project` - Deploy to CDN
- `send-invite-email` - Collaboration invites
- `integration-oauth` - OAuth flows
- `google-fonts`, `unsplash-search` - External APIs
- `ai-assistant` - AI-powered content generation
