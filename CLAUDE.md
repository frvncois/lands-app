# CLAUDE.md

## Development Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check + production build (parallel)
npm run type-check   # Run vue-tsc for TypeScript validation
npm run preview      # Preview production build
```

**Node requirement:** ^20.19.0 || >=22.12.0

---

## Architecture Overview

**lands-app** is a Vue 3 landing page builder using section-based editing. Users create pages by adding, configuring, and styling pre-defined section types.

### Core Primitives

| Primitive | Description | Rules |
|-----------|-------------|-------|
| **Section** | Top-level layout unit | Cannot nest. Has variant, data, styles. |
| **Group** | Repeater collection inside section | Must live inside Section. Owns spacing. |
| **Child** | Individual item inside Group | Must live inside Group. Content only, NO styles. |
| **Field** | Non-repeater content field | Owns its own styles via `fieldStyles`. |

### Critical Invariants (DO NOT VIOLATE)

1. **No per-child styling** — All children in a Group share styles
2. **No inline styles in section components** — Use resolvers only
3. **No section-specific styling pipelines** — All sections use same resolver system
4. **No direct style key access in components** — Always use resolver functions

---

## Directory Structure

```
src/
├── components/
│   ├── editor/
│   │   ├── PageEditor.vue         # Three-panel layout (list, canvas, inspector)
│   │   ├── SectionList.vue        # Left panel - section tree with drag-drop
│   │   ├── SectionRenderer.vue    # Renders section using registry component
│   │   ├── StyleInspector.vue     # Right panel - style/content editing
│   │   ├── FieldRenderer.vue      # Renders form fields by schema type
│   │   ├── AddSectionMenu.vue     # Section type picker
│   │   └── style-controls/        # Reusable style control components
│   │       ├── StylePopoverGroup.vue
│   │       ├── SliderRow.vue
│   │       ├── ColorRow.vue
│   │       ├── SelectRow.vue
│   │       ├── ToggleRow.vue
│   │       └── types.ts
│   ├── sections/                  # Section components by type
│   │   ├── hero/                  # HeroOverlay, HeroSplit, HeroStacked, HeroPresentation
│   │   ├── cards/                 # CardsGrid, CardsRow, CardsCarousel, CardsSplit
│   │   ├── products/              # ProductsGrid, ProductsRow, ProductsCarousel, ProductsSplit
│   │   ├── contact/               # ContactStacked, ContactSplit
│   │   ├── links/                 # LinksGrid, LinksStacked, LinksSplit
│   │   ├── accordion/             # AccordionList, AccordionSplit
│   │   ├── gallery/               # GalleryGrid, GallerySlider, GalleryMasonry
│   │   ├── EditableText.vue       # Inline text editing wrapper
│   │   └── MediaPlaceholder.vue   # Image/video placeholder with upload
│   └── ui/                        # Base UI components (Button, Input, Modal, etc.)
├── stores/
│   ├── editor.ts                  # Sections, theme, selection, undo/redo
│   ├── user.ts                    # Auth + profile
│   ├── projects.ts                # Projects collection
│   ├── project.ts                 # Current project settings
│   └── toast.ts                   # Notifications
├── lib/
│   ├── section-registry.ts        # Section definitions + factory
│   ├── section-styles.ts          # Style resolver functions
│   ├── section-style-configs.ts   # StylePopoverGroup configurations
│   ├── style-defaults.ts          # Default values for style controls
│   ├── style-options.ts           # Color/font option arrays
│   ├── themes/                    # Theme definitions
│   │   ├── index.ts               # Registry + CSS variable injection
│   │   ├── minimal.ts
│   │   ├── dark.ts
│   │   └── bold.ts
│   └── accordion-labels.ts        # Dynamic labels for accordion variants
├── types/
│   ├── sections.ts                # SectionInstance, FieldSchema, Theme types
│   └── project.ts                 # Project, PageContent types
└── composables/
    └── useTheme.ts                # Theme application
```

---

## Section Registry (`lib/section-registry.ts`)

### SectionDefinition Structure

```typescript
interface SectionDefinition {
  type: string                    // Unique ID: 'hero', 'cards', etc.
  displayName: string             // UI label
  icon: string                    // lineicons name
  defaultVariant: string          // Initial variant ID
  variants: SectionVariant[]      // Available layout variants
  schema: FieldSchema[]           // Content fields
  styleOptions?: StyleOptionsMap  // Variant-specific style controls
  component: Component            // Vue component
  createDefaultData: () => object // Factory for initial data
}
```

### Adding a New Section

1. Create component in `components/sections/{type}/`
2. Add definition to `section-registry.ts`
3. Add to `sectionRegistry` Map
4. Add style configs to `section-style-configs.ts` if needed
5. Add resolvers to `section-styles.ts` if needed

---

## Style System

### Style Storage Model

```typescript
// SectionInstance.styles (section-level)
{
  backgroundColor: '#ffffff',
  spacingX: 32,
  spacingY: 64,
  spaceBetween: 16,
  // Shared child styles (flat, prefixed)
  cardPaddingX: 16,
  cardBorderRadius: 8,
  linkLabelFontSize: 14,
}

// SectionInstance.fieldStyles (per non-repeater field)
{
  headline: { fontSize: 48, color: '#000' },
  buttonText: { backgroundColor: '#007bff' },
}
```

### Style Key Naming Convention

**Pattern:** `{prefix}{PropertyName}`

| Section Type | Prefix | Example Keys |
|--------------|--------|--------------|
| Cards | `card` | `cardPaddingX`, `cardRadius`, `cardBorderColor` |
| Products | `product` | `productPaddingX`, `productRadius` |
| Links | `link` | `linkPaddingX`, `linkLabelFontSize` |
| Accordion | `accordion` | `accordionRadius`, `accordionHeadlineFontSize` |
| Form Fields | `formInput` | `formInputFontSize`, `formInputBorderColor` |

### Resolver Functions (`lib/section-styles.ts`)

| Scope | Resolver | Purpose |
|-------|----------|---------|
| Section | `resolveSectionStyles()` | Background, padding |
| Group | `resolveRepeaterGroupStyles()` | Space between items |
| Field (text) | `getTextStyle()` | Font size, color, line height |
| Field (button) | `getButtonStyle()` | Button-specific styles |
| Field (media) | `getMediaStyle()` | Aspect ratio, border radius |
| Shared Cards | `resolveSharedCardContainerStyles()` | Card container styles |
| Shared Links | `resolveSharedLinkContainerStyles()` | Link container styles |
| Shared Accordion | `resolveSharedAccordionContainerStyles()` | Accordion item styles |

**Rule:** Components MUST use resolvers. Never access style keys directly.

```typescript
// ✅ CORRECT
const containerStyle = resolveSharedCardContainerStyles(props.sectionStyles)

// ❌ WRONG
const padding = props.sectionStyles?.cardPaddingX ?? 16
```

### Style Config Structure (`lib/section-style-configs.ts`)

```typescript
export const cardsStyleConfig = {
  spacing: {
    icon: 'content-spacing',
    title: 'Spacing',
    controls: [
      { type: 'slider', key: 'spaceBetween', label: 'Space between', min: 0, max: 64, unit: 'px' },
      { type: 'slider', key: 'cardPaddingX', label: 'Padding X', min: 0, max: 48, unit: 'px' },
    ] as StyleControl[],
    defaults: { spaceBetween: 16, cardPaddingX: 16 },
  },
  borders: { /* ... */ },
  background: { /* ... */ },
}
```

---

## StyleInspector Selection Contract

| Selection State | Inspector Shows |
|-----------------|-----------------|
| Section (no field active) | Section-level styles (background, spacing) |
| Group (repeater field, no item) | Group styles + Shared child styles |
| Child (item selected) | **Content fields ONLY** — no styles |
| Field (non-repeater) | Field-level styles (font, color, spacing) |

**If a child shows style controls → BUG**

---

## Section Component Contract

### Props

```typescript
defineProps<{
  data: SectionData              // Content data
  sectionStyles?: SectionStyleProperties
  fieldStyles?: FieldStyles
  itemStyles?: ItemStyleProperties
  editable?: boolean             // Editor mode
  activeField?: string | null    // Currently selected field
  activeNodeId?: string | null
  activeNodeType?: ActiveNodeType | null
  activeFieldKey?: string | null
  activeItemId?: string | null
  hiddenFields?: string[]
}>()
```

### Emits

```typescript
defineEmits<{
  selectField: [payload: SelectionPayload | string]
  update: [fieldKey: string, value: unknown]
}>()
```

### Component Structure Pattern

```vue
<script setup lang="ts">
// 1. Imports
import { computed } from 'vue'
import { resolveSectionStyles, getTextStyle, resolveSharedCardContainerStyles } from '@/lib/section-styles'
import EditableText from '../EditableText.vue'

// 2. Props/Emits
const props = defineProps<{ /* ... */ }>()
const emit = defineEmits<{ /* ... */ }>()

// 3. Computed styles (ALWAYS use resolvers)
function getSectionStyle(): Record<string, string> {
  return resolveSectionStyles(props.sectionStyles)
}

function getItemContainerStyle(): Record<string, string> {
  return resolveSharedCardContainerStyles(props.sectionStyles)
}

// 4. Event handlers
function handleSelectField(fieldKey: string) {
  emit('selectField', fieldKey)
}
</script>
```

---

## Adding New Style Options

### 1. Add style config (`lib/section-style-configs.ts`)

```typescript
export const newSectionStyleConfig = {
  spacing: {
    icon: 'content-spacing',
    title: 'Spacing',
    controls: [
      { type: 'slider', key: 'newSectionPaddingX', label: 'Padding X', min: 0, max: 48, unit: 'px' },
    ] as StyleControl[],
    defaults: { newSectionPaddingX: 16 },
  },
}
```

### 2. Add resolver (`lib/section-styles.ts`)

```typescript
export function resolveSharedNewSectionStyles(
  sectionStyles: SectionStyleProperties | undefined
): Record<string, string> {
  const result: Record<string, string> = {}
  if (!sectionStyles) return result
  
  const styles = sectionStyles as Record<string, unknown>
  if (styles.newSectionPaddingX !== undefined) {
    result.paddingLeft = `${styles.newSectionPaddingX}px`
    result.paddingRight = `${styles.newSectionPaddingX}px`
  }
  return result
}
```

### 3. Use in StyleInspector.vue

```vue
<StylePopoverGroup
  :icon="newSectionStyleConfig.spacing.icon"
  :title="newSectionStyleConfig.spacing.title"
  :controls="newSectionStyleConfig.spacing.controls"
  :styles="sectionStyles"
  :defaults="newSectionStyleConfig.spacing.defaults"
  @update="(key, value) => updateSectionStyle(key, value)"
/>
```

### 4. Use resolver in section component

```typescript
const containerStyle = computed(() => resolveSharedNewSectionStyles(props.sectionStyles))
```

---

## Theme System (`lib/themes/`)

### Theme Structure

```typescript
interface Theme {
  id: string
  name: string
  isDark: boolean
  tokens: {
    colors: ColorTokens      // background, foreground, primary, accent, etc.
    fonts: FontTokens        // heading, body, mono
    fontScale: FontScaleTokens
    spacing: SpacingTokens
    radius: RadiusTokens
    button: ButtonTokens
  }
  sectionPresets?: Record<string, SectionPreset>
}
```

### Adding a New Theme

1. Create `lib/themes/{name}.ts`
2. Export `{name}Theme` object
3. Add to registry in `lib/themes/index.ts`

---

## Common Patterns

### Repeater Group Style Merging

```typescript
const groupStyles = computed(() => ({
  spaceBetween: resolveRepeaterGroupStyles(props.sectionStyles, 'items').spaceBetween,
  ...sectionStyles.value,
}))
```

### Conditional Section Detection

```typescript
const isCardsSection = computed(() => selectedSection.value?.type === 'cards')
const isAccordionSection = computed(() => 
  ['faq', 'menu', 'events', 'services'].includes(selectedSection.value?.type ?? '')
)
```

### Hidden Field Check

```typescript
function isFieldHidden(fieldKey: string): boolean {
  return props.hiddenFields?.includes(fieldKey) ?? false
}
```

---

## DO NOT

1. ❌ Add per-child styling
2. ❌ Put inline styles in section components
3. ❌ Access style keys directly without resolvers
4. ❌ Create section-specific style pipelines
5. ❌ Add temporary exceptions without updating EDITOR_SPECS.md
6. ❌ Hardcode style values in templates
7. ❌ Skip validation when adding sections to registry

---

## File Change Checklist

When modifying editor:

- [ ] Does change fit Section → Group → Child model?
- [ ] Are styles resolved via existing resolvers?
- [ ] Does StyleInspector selection behave correctly?
- [ ] Are style keys following naming convention?
- [ ] Is EDITOR_SPECS.md still accurate?

When adding new section:

- [ ] Definition in `section-registry.ts`
- [ ] Component in `components/sections/{type}/`
- [ ] Style configs in `section-style-configs.ts`
- [ ] Resolvers in `section-styles.ts`
- [ ] Detection logic in StyleInspector if needed