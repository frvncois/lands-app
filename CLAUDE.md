# Lands - Landing Page Builder

## Project Overview

**Lands** is a visual landing page builder SaaS application. Users create, customize, and publish landing pages through a drag-and-drop WYSIWYG editor. Similar to Webflow, Carrd, or Linktree but focused on landing pages.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3.5 (Composition API with `<script setup>`) |
| Language | TypeScript 5.9 (strict mode) |
| Build | Vite 7.2 |
| State | Pinia 3.0 |
| Routing | Vue Router 4.6 |
| Styling | Tailwind CSS 4.1 (Vite plugin) |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions + Storage) |
| Icons | Lineicons |
| Fonts | Geist Sans & Geist Mono |

---

## Directory Structure

```
src/
├── assets/                 # Static assets
│   ├── main.css           # Global styles, Tailwind theme, CSS variables
│   └── LandsLogo.vue      # Logo component
│
├── components/            # Vue components organized by feature
│   ├── auth/              # Authentication forms
│   │   ├── LoginForm.vue
│   │   └── SignupForm.vue
│   │
│   ├── builder/           # Main editor components
│   │   ├── EditorSidebar.vue      # Block palette + structure tree
│   │   ├── EditorPreview.vue      # Live canvas/viewport
│   │   └── EditorInspector.vue    # Properties panel (settings + styles)
│   │
│   ├── common/            # App shell components
│   │   ├── AppHeader.vue          # Top navigation bar
│   │   └── AppSidebar.vue         # Left sidebar with projects list
│   │
│   ├── inspector/         # Property input components
│   │   ├── BorderInput.vue        # Border width/color/radius
│   │   ├── ColorInput.vue         # Color picker
│   │   ├── ImageInput.vue         # Image upload/URL
│   │   ├── SpacingInput.vue       # Padding/margin editor
│   │   ├── TextInput.vue          # Text input
│   │   ├── SelectInput.vue        # Dropdown select
│   │   ├── ToggleInput.vue        # Boolean toggle
│   │   ├── InspectorField.vue     # Label + input wrapper
│   │   └── InspectorSection.vue   # Collapsible section
│   │
│   ├── modal/             # Dialog modals
│   │   ├── ProjectCreate.vue      # New project wizard
│   │   ├── ProjectDelete.vue      # Delete confirmation
│   │   ├── ProjectUnpublish.vue   # Unpublish confirmation
│   │   ├── ProjectUpload.vue      # Import project
│   │   ├── InviteCollaborator.vue # Team invitation
│   │   └── PlanUpgrade.vue        # Upgrade to Pro modal
│   │
│   ├── preview/           # Block rendering
│   │   ├── PreviewSection.vue     # Recursive block renderer
│   │   └── PreviewFormField.vue   # Form field rendering
│   │
│   ├── settings/          # Settings page components
│   │   └── CollaboratorsSection.vue
│   │
│   └── ui/                # Design system components
│       ├── Alert.vue, Avatar.vue, Badge.vue
│       ├── Button.vue, Card.vue, CardHeader.vue
│       ├── FormField.vue, Input.vue, Textarea.vue
│       ├── Select.vue, Toggle.vue
│       ├── Modal.vue, Spinner.vue, Skeleton.vue
│       ├── Toast.vue, ToastContainer.vue
│       ├── PasswordRequirements.vue
│       └── index.ts               # Barrel export
│
├── composables/           # Vue composables (reusable logic)
│   ├── useTheme.ts               # Dark/light mode management
│   └── useIntegrations.ts        # Integration connection management
│
├── layouts/               # Page layout templates
│   ├── AuthLayout.vue            # Login/signup pages
│   └── AppLayout.vue             # Main app with sidebar
│
├── lib/                   # Utility libraries
│   ├── editor-utils.ts           # Block factories, defaults, helpers (32KB)
│   ├── style-utils.ts            # CSS class builders
│   ├── layouts.ts                # Pre-built layout templates
│   ├── themes.ts                 # Theme definitions
│   ├── integrations/             # Integration system
│   │   ├── types.ts              # Integration type definitions
│   │   ├── registry.ts           # All available integrations
│   │   └── index.ts              # Exports
│   └── supabase/                 # Database layer
│       ├── client.ts             # Supabase client instance
│       ├── types.ts              # Database types
│       └── index.ts              # Exports
│
├── router/                # Vue Router
│   └── index.ts                  # Routes, guards, middleware
│
├── stores/                # Pinia state management
│   ├── user.ts                   # Auth, profile, preferences
│   ├── editor.ts                 # Blocks, selection, undo/redo, auto-save
│   ├── projects.ts               # Project list, content, collaborators
│   ├── project.ts                # Single project settings
│   └── toast.ts                  # Toast notifications
│
├── types/                 # TypeScript definitions
│   ├── editor.ts                 # Block types, settings, styles (900+ lines)
│   ├── project.ts                # Project, plans, integrations, collaborators
│   └── user.ts                   # User profile, preferences
│
├── views/                 # Page components
│   ├── AuthView.vue              # Login/signup page
│   ├── DashboardView.vue         # Projects list
│   ├── EditorView.vue            # Main editor
│   ├── SettingsView.vue          # Project settings
│   ├── AnalyticsView.vue         # Analytics dashboard
│   ├── IntegrationView.vue       # Integration management
│   ├── AccountView.vue           # User account settings
│   ├── InviteView.vue            # Accept collaboration invite
│   └── OAuthCallbackView.vue     # OAuth redirect handler
│
├── main.ts                # App entry point
└── App.vue                # Root component

supabase/
├── migrations/            # Database schema (8 migrations)
│   ├── 001_initial_schema.sql
│   ├── 002-007_*.sql             # RLS fixes, features
│   └── 008_integration_connections.sql
│
└── functions/             # Edge functions (Deno)
    ├── integration-oauth/        # OAuth flow handler
    ├── integration-connect/      # API key connections
    ├── send-invite-email/        # Email invitations
    ├── publish-project/          # CDN deployment
    └── setup-umami-site/         # Analytics setup
```

---

## Pinia Stores

### `user.ts` - Authentication & Profile
```typescript
State:
  - authUser: User | null
  - settings: UserSettings { profile, preferences }
  - isAuthenticated: boolean
  - isLoading: boolean

Actions:
  - initAuth()                    // Initialize from session
  - fetchUserProfile(userId)
  - updateProfile(profile)
  - updatePreferences(preferences)
  - signIn(email, password)
  - signUp(email, password, name)
  - signOut()
  - signInWithOAuth(provider)     // Google, GitHub
  - resetPassword(email)
  - changePassword(current, new)
```

### `editor.ts` - Editor State (Main Store)
```typescript
State:
  - currentProjectId: string | null
  - blocks: SectionBlock[]
  - pageSettings: PageSettings
  - selectedBlockId: string | null
  - selectedItemId: string | null     // For nested items (links, cards)
  - viewport: 'desktop' | 'tablet' | 'mobile'
  - hasUnsavedChanges: boolean
  - isSaving: boolean
  - lastSavedAt: string | null
  - autoSaveEnabled: boolean
  - blockIndex: Map<string, SectionBlock>  // O(1) lookups
  - history: HistorySnapshot[]             // Undo/redo (max 10)

Key Actions:
  - loadProject(projectId)
  - saveProject()
  - selectBlock(blockId)
  - updateBlockSettings(blockId, settings)
  - updateBlockStyles(blockId, styles)
  - deleteBlock(blockId)
  - duplicateBlock(blockId)
  - reorderBlocks(fromIndex, toIndex)
  - addBlock(type, parentId?)
  - rebuildBlockIndex()
  - undo() / redo()
```

### `projects.ts` - Project Management
```typescript
State:
  - projects: Project[]
  - projectContents: Map<string, ProjectContent>
  - integrations: ProjectIntegration[]
  - collaborators: Collaborator[]
  - collaboratorInvites: CollaboratorInvite[]

Getters:
  - projectCount, publishedProjects, draftProjects
  - getProjectById(id)
  - getProjectIntegrations(projectId)
  - getProjectCollaborators(projectId)

Actions:
  - fetchProjects()
  - createProject(title, description)
  - updateProject(id, data)
  - deleteProject(id)
  - duplicateProject(id)
  - publishProject(id) / unpublishProject(id)
  - inviteCollaborator(projectId, email, role)
  - removeCollaborator(projectId, collaboratorId)
  - respondToInvite(token, accept)
```

### `project.ts` - Single Project Settings
```typescript
State:
  - settings: ProjectSettings { seo, analytics, publish, domain, plan }
  - currentProjectId: string | null

Actions:
  - loadProject(projectId)
  - updateSEO(settings)
  - updateAnalytics(settings)
  - updatePublish(settings)
  - updateDomain(settings)
  - saveToDatabase()              // Debounced
```

### `toast.ts` - Notifications
```typescript
Actions:
  - success(title, description?)
  - error(title, description?)
  - warning(title, description?)
  - info(title, description?)
  - removeToast(id)
```

---

## Block System

### Block Categories & Types

| Category | Block Types |
|----------|-------------|
| **Layout** | `container`, `grid`, `columns`, `stack`, `divider` |
| **Content** | `heading`, `text`, `image`, `video`, `button`, `icon`, `quote` |
| **Media** | `hero`, `cta`, `gallery`, `image-text`, `video-text`, `background-media` |
| **Lists** | `link-list`, `card-list`, `feature-list`, `logo-list`, `social-links`, `testimonials`, `pricing-table`, `faq` |
| **Forms** | `form`, `email-capture`, `contact-form` |
| **Special** | `header`, `footer` |

### Block Structure
```typescript
interface SectionBlock {
  id: string
  type: SectionBlockType
  name: string
  children?: SectionBlock[]      // For layout blocks
  settings: BlockSettings        // Content configuration
  styles: BlockStyles            // Visual styling
}
```

### Key Block Utilities (`lib/editor-utils.ts`)
```typescript
// Block creation
createSectionBlock(type, settings?, styles?)
createFormField(type, label, required)
duplicateSectionBlock(block)
generateId()

// Block info
sectionBlockLabels          // Display names
sectionBlockIcons           // Lineicons names
blocksByCategory            // Grouped types
canHaveChildren(type)       // Layout check

// Default factories
getDefaultHeaderSettings()
getDefaultContainerStyles()
// ... for every block type
```

---

## Routing

| Path | View | Auth | Description |
|------|------|------|-------------|
| `/auth` | AuthView | Guest only | Login/signup |
| `/` | DashboardView | Required | Projects list |
| `/project/:id` | EditorView | Required | Page editor |
| `/project/:id/settings` | SettingsView | Required | Project settings |
| `/project/:id/analytics` | AnalyticsView | Required | Traffic stats |
| `/project/:id/integration` | IntegrationView | Required | Integrations |
| `/account` | AccountView | Required | User settings |
| `/invite/:token` | InviteView | Optional | Accept invite |
| `/oauth/callback` | OAuthCallbackView | Required | OAuth handler |

### Route Guards
- `requiresAuth` - Redirects to `/auth` if not authenticated
- `requiresGuest` - Redirects to `/` if authenticated
- `requiresProject` - Validates projectId param

---

## Type Definitions

### Core Types (`types/editor.ts`)

```typescript
// Shared types
type Alignment = 'left' | 'center' | 'right'
type VerticalAlignment = 'top' | 'center' | 'bottom'
type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold'
type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | 'auto'

// Base structures
interface Spacing { top?: string; bottom?: string; left?: string; right?: string }
interface BorderStyle { width?: string; color?: string; radius?: string; style?: string }
interface ShadowStyle { enabled?: boolean; x?: string; y?: string; blur?: string; color?: string }

// Base block styles (inherited by all blocks)
interface BaseBlockStyles {
  padding?: Spacing
  margin?: Spacing
  backgroundColor?: string
  border?: BorderStyle
  shadow?: ShadowStyle
}
```

### Project Types (`types/project.ts`)

```typescript
interface Project {
  id: string
  userId: string
  title: string
  slug: string
  description?: string
  thumbnail?: string
  isPublished: boolean
  publishedUrl?: string
  customDomain?: string
  plan: ProjectPlan
  createdAt: string
  updatedAt: string
}

type ProjectPlan = 'free' | 'pro'
type CollaboratorRole = 'admin' | 'editor'

interface Collaborator {
  id: string
  projectId: string
  userId: string
  email: string
  name?: string
  avatar?: string
  role: CollaboratorRole
  joinedAt: string
}
```

---

## Integrations

### Supported Providers

| Category | Providers |
|----------|-----------|
| **Email Marketing** | Mailchimp, ConvertKit, Buttondown, Beehiiv |
| **Payments** | Stripe, Lemon Squeezy, Gumroad |
| **Automation** | Zapier, Make, Custom Webhook |
| **Analytics** | Google Analytics, Plausible |

### Auth Methods
- **OAuth**: Mailchimp, Stripe, Gumroad
- **API Key**: ConvertKit, Buttondown, Beehiiv, Lemon Squeezy
- **Webhook**: Zapier, Make, Custom

### Integration Flow
1. User clicks "Connect" on integration card
2. OAuth → redirect to provider → callback with code
3. Edge function exchanges code for tokens
4. Tokens encrypted and stored in `integration_connections`
5. Settings configured (list ID, webhook URL, etc.)

---

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (extends auth.users) |
| `user_preferences` | Theme, notification settings |
| `projects` | Project metadata + plan |
| `project_content` | Blocks & page settings (JSONB) |
| `project_settings` | SEO, analytics, domain, visibility |
| `collaborators` | Project team members |
| `collaborator_invites` | Pending invitations with tokens |
| `integration_connections` | OAuth/API connections (encrypted) |
| `oauth_states` | Temporary OAuth state storage |

### Row-Level Security (RLS)
- Users access only their own resources
- Collaborators access shared projects via join
- Admin collaborators can modify projects
- Edge functions use `service_role` to bypass RLS

---

## Styling System

### Tailwind CSS v4
- Utility-first with arbitrary values
- Responsive: `sm`, `md`, `lg`, `xl`, `2xl`
- Dark mode via `.dark` class on `<html>`

### CSS Variables (`main.css`)

```css
/* Light theme */
--background: oklch(1 0 0)              /* white */
--foreground: oklch(0.145 0 0)          /* dark text */
--primary: oklch(0.205 0 0)             /* dark buttons */
--secondary: oklch(0.97 0 0)            /* light gray */
--destructive: oklch(0.577 0.245 27.325) /* red */

/* Dark theme (.dark) */
--background: oklch(14.958% 0.00002 271.152)  /* very dark */
--foreground: oklch(0.985 0 0)                /* white text */
--primary: oklch(0.985 0 0)                   /* white buttons */

/* Fonts */
--font-sans: 'Geist Sans'
--font-mono: 'Geist Mono'

/* Radius */
--radius: 0.5rem
```

---

## Project Plans

| Feature | Free | Pro ($6/mo) |
|---------|------|-------------|
| Lands subdomain | ✓ | ✓ |
| Custom domain | ✗ | ✓ |
| Remove watermark | ✗ | ✓ |
| Analytics | ✗ | ✓ |
| Integrations | ✗ | ✓ |

---

## Key Patterns

### Component Conventions
- All components use `<script setup lang="ts">`
- Props defined with `defineProps<T>()`
- Emits defined with `defineEmits<T>()`
- Composables for shared logic

### State Management
- Pinia stores with Composition API
- Computed properties for derived state
- `storeToRefs()` for reactive destructuring

### Editor Patterns
- Block index Map for O(1) lookups
- Debounced auto-save (2 seconds)
- History snapshots for undo/redo (max 10)
- Optimistic UI updates

### Error Handling
- Try/catch in async functions
- Toast notifications for user feedback
- Console logging for debugging
- Graceful degradation

---

## Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check + production build
npm run preview      # Preview production build
npm run type-check   # Vue TSC type checking
```

---

## File Naming Conventions

- **Components**: PascalCase (`EditorSidebar.vue`)
- **Composables**: camelCase with `use` prefix (`useTheme.ts`)
- **Stores**: camelCase (`editor.ts`)
- **Types**: camelCase (`editor.ts`)
- **Utilities**: kebab-case (`editor-utils.ts`)

---

## Important Implementation Notes

1. **Block Index**: The editor maintains a `Map<string, SectionBlock>` for O(1) block lookups. Always call `rebuildBlockIndex()` after structural changes.

2. **Auto-save**: Enabled by default with 2-second debounce. Check `hasUnsavedChanges` before navigation.

3. **Inline Editing**: Double-click on heading/text/button blocks to edit directly on canvas.

4. **Nested Blocks**: Layout blocks (`container`, `grid`, `columns`, `stack`) can have children. Use `canHaveChildren(type)` to check.

5. **RLS Policies**: All database operations respect row-level security. Edge functions use `service_role` for admin operations.

6. **OAuth State**: Temporary OAuth states stored in `oauth_states` table with 10-minute expiration.

7. **Collaborator Invites**: Tokens expire after 7 days. Check `expiresAt` before accepting.
