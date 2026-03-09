Perfect! Now I have enough information. Let me create comprehensive ASCII diagrams showing all the flows and relationships.

## Comprehensive Lands App Architecture & Data Flow Documentation

Based on my thorough exploration of the codebase, here is a complete visual representation:

---

### 1. DATA STRUCTURES & TYPE HIERARCHY

```
LANDS-APP DATA MODEL
=====================

┌─────────────────────────────────────────────────────────────┐
│                        USER (Auth)                          │
├─────────────────────────────────────────────────────────────┤
│ • id: string                                                │
│ • first_name, last_name: string                            │
│ • email: string                                            │
│ • avatar_image: string (URL)                               │
│ • created_at: ISO timestamp                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ owns many
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     LAND (Site/Page)                        │
├─────────────────────────────────────────────────────────────┤
│ • id, user_id, handle (URL slug)                           │
│ • title, description                                       │
│ • avatar_image, cover_image: URLs                          │
│ • theme: LandTheme                                         │
│ • plan: 'free' | 'paid'                                    │
│ • sections: Section[]                                      │
│ • collaborators: Collaborator[]                            │
│ • created_at, updated_at: ISO timestamps                   │
└─────────────────────────────────────────────────────────────┘
        │         │              │
        │         │              └─► Collaborator
        │         │                   • id, land_id
        │         │                   • email, role, status
        │         │                   • invited_at, joined_at
        │         │
        │         └─► LandTheme
        │             • theme_preset: 'minimal'|'bold'|'editorial'
        │             • color_main, color_accent, color_surface
        │             • typography_style: 'sans'|'serif'|'mono'
        │
        └─► Section[] (8 types)
            
SECTION TYPES & CONTENT:
┌────────────────────────────────────────────────────────────────┐
│ TYPE: header                                                   │
│ Settings: { cover_media_type, cover_media_value,              │
│             profile_position }                                 │
│ Content: { title, subtitle }                                   │
├────────────────────────────────────────────────────────────────┤
│ TYPE: text (markdown)                                          │
│ Settings: { style: 'default'|'centered'|'wide' }              │
│ Content: { body: markdown string }                             │
├────────────────────────────────────────────────────────────────┤
│ TYPE: media                                                    │
│ Settings: { style: 'default'|'fullwidth'|'compact' }          │
│ Content: { items: MediaItem[] }                                │
│         • MediaItem { id, media_type, url, caption, position } │
├────────────────────────────────────────────────────────────────┤
│ TYPE: list (links)                                             │
│ Settings: { style: 'default'|'compact' }                       │
│ Content: null (items stored in mockState.listItems)            │
│ Linked: ListItem[] { id, section_id, title, url, icon,        │
│                      description, position }                   │
├────────────────────────────────────────────────────────────────┤
│ TYPE: collection (showcase)                                    │
│ Settings: { style: 'grid'|'list'|'cards' }                    │
│ Content: null (items stored in mockState.collections)          │
│ Linked: Collection[] {                                         │
│          id, section_id, title, description, position,         │
│          items: CollectionItem[] {                             │
│            id, title, description, media_url,                  │
│            content, external_url, position, created_at         │
│          }                                                      │
│        }                                                        │
├────────────────────────────────────────────────────────────────┤
│ TYPE: store (e-commerce)                                       │
│ Settings: { style: 'grid'|'list'|'cards' }                    │
│ Content: null (items stored in mockState.stores)               │
│ Linked: Store[] {                                              │
│          id, section_id, title, position,                      │
│          items: StoreItem[] {                                  │
│            id, store_id, title, description, image,            │
│            price, product_type, variants, inventory,           │
│            file_url, position, created_at                      │
│          }                                                      │
│        }                                                        │
│        where StoreItem.variants: StoreVariant[] {              │
│          id, name, options: StoreVariantOption[] {             │
│            value, inventory                                     │
│          }                                                      │
│        }                                                        │
├────────────────────────────────────────────────────────────────┤
│ TYPE: campaign (newsletter signup)                             │
│ Settings: { show_name_field: boolean }                         │
│ Content: { title, description, button_label, placeholder }     │
│ Connection: CampaignConnection {                               │
│   provider: 'mailchimp'|'flodesk'|'convertkit'|                │
│            'custom_api'|'custom_script',                       │
│   api_key, audience_id, script                                 │
│ }                                                              │
├────────────────────────────────────────────────────────────────┤
│ TYPE: footer                                                   │
│ Settings: { cover_media_value: URL }                           │
│ Content: { title, subtitle }                                   │
└────────────────────────────────────────────────────────────────┘

Common to ALL Sections:
┌────────────────────────────────────────────────────────────────┐
│ • id: UUID                                                     │
│ • land_id: UUID                                                │
│ • type: SectionType (enum above)                               │
│ • position: string (fractional index)                          │
│ • style_variant: string (theme-specific display variant)       │
│ • settings_json: SectionSettings (type-specific)               │
│ • content: type-specific content or null                       │
│ • created_at: ISO timestamp                                    │
└────────────────────────────────────────────────────────────────┘
```

---

### 2. PINIA STORES ARCHITECTURE

```
PINIA STORES STATE & ACTIONS
=============================

┌─────────────────────────────────────────────────────────────────┐
│                       AUTH STORE                                │
│                  (useAuthStore)                                 │
├─────────────────────────────────────────────────────────────────┤
│ STATE:                          │ ACTIONS:                       │
│ • isLoading: boolean            │ • setLoading(bool)             │
│ • error: string | null          │ • setError(message)            │
│ • resetEmailSent: boolean       │ • clearError()                 │
│ • passwordResetSuccess: boolean │ • $reset()                     │
│ • needsOnboarding: boolean      │                                │
└─────────────────────────────────────────────────────────────────┘
        │
        └─ Used by: Login/Register/Reset flows


┌─────────────────────────────────────────────────────────────────┐
│                       USER STORE                                │
│                  (useUserStore)                                 │
├─────────────────────────────────────────────────────────────────┤
│ STATE:                          │ COMPUTED:                      │
│ • user: User | null             │ • fullName: computed string    │
│ • isAuthenticated: boolean      │ • initials: computed string    │
│ • isLoading: boolean            │                                │
│                                 │ ACTIONS:                       │
│                                 │ • setUser(userData)            │
│                                 │ • clearUser()                  │
└─────────────────────────────────────────────────────────────────┘
        │
        └─ Initialized in App.vue via initMockData()


┌─────────────────────────────────────────────────────────────────┐
│                       LAND STORE                                │
│                  (useLandStore)                                 │
├─────────────────────────────────────────────────────────────────┤
│ STATE:                          │ COMPUTED:                      │
│ • lands: Land[]                 │ • activeLand: Land | null      │
│ • activeLandId: string | null   │ • landCount: number            │
│ • isLoading: boolean            │ • canCreateLand: boolean       │
│ • error: string | null          │                                │
│                                 │ ACTIONS:                       │
│                                 │ • setLands(data)               │
│                                 │ • setActiveLand(id)            │
│                                 │ • addLand(land)                │
│                                 │ • updateLand(id, partial)      │
│                                 │ • removeLand(id)               │
│                                 │ • clearLands()                 │
└─────────────────────────────────────────────────────────────────┘
        │
        ├─ Updated by useEditorActions() composable
        └─ Core state for all section/content edits


┌─────────────────────────────────────────────────────────────────┐
│                      EDITOR STORE                               │
│                (useEditorStore)                                 │
├─────────────────────────────────────────────────────────────────┤
│ STATE:                          │ ACTIONS:                       │
│ • isEditMode: boolean           │ • enterEditMode()              │
│ • activeSection: Section | null │ • exitEditMode()               │
│ • showSectionSettings: boolean  │ • setActiveSection(sec, open?) │
│ • isDirty: boolean              │ • setLeftPanelTab(tab)         │
│ • isDragging: boolean           │ • markDirty()                  │
│ • leftPanelTab: 'sections'|     │ • markClean()                  │
│             'theme'|'settings'  │ • setDragging(bool)            │
│ • panelPos: {x, y}              │ • setPanelPos({x, y})          │
└─────────────────────────────────────────────────────────────────┘
        │
        └─ Tracks UI state: edit mode, selected section, panel tabs


┌─────────────────────────────────────────────────────────────────┐
│                      THEME STORE                                │
│                (useThemeStore)                                  │
├─────────────────────────────────────────────────────────────────┤
│ STATE:                          │ ACTIONS:                       │
│ • theme: LandTheme | null       │ • setTheme(themeData)          │
│                                 │ • updateThemeField(key, value) │
│                                 │                                │
│ Synced with: activeLand.theme   │ Updated by: updateTheme()      │
│              (useLandStore)      │              in editor actions │
└─────────────────────────────────────────────────────────────────┘
        │
        └─ Theme variant selection determines which component
           to render (SectionHeader -> HeaderMinimal/Bold/Editorial)


┌─────────────────────────────────────────────────────────────────┐
│                     PROJECT STORE                               │
│                (useProjectStore)                                │
├─────────────────────────────────────────────────────────────────┤
│ STATE:                          │ ACTIONS:                       │
│ • mode: 'preview' | 'editor'    │ • setMode(newMode)             │
│                                 │                                │
│ Controls visibility of          │                                │
│ editing UI panels               │                                │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3. MOCK DATA STATE STRUCTURE

```
MOCK DATA PROVIDER & INITIALIZATION
===================================

┌──────────────────────────────────────────────────────────────────────┐
│ mockState (reactive, in /lib/mock/provider.ts)                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Interface MockState {                                                │
│   user: User                                                         │
│   lands: Land[]                                                      │
│   listItems: Record<sectionId, ListItem[]>                          │
│   collections: Record<sectionId, Collection[]>                      │
│   stores: Record<sectionId, Store[]>                                │
│ }                                                                    │
│                                                                      │
│ The key insight: Land.sections is in landStore, but                │
│ items FOR sections live in mockState keyed by section ID            │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
             │
             ├─► createMockState()
             │   ├─► createMockUser('Jane Doe', 'jane@lands.app')
             │   ├─► buildMockLand(user_id, 'janedoe', 'Jane Doe')
             │   │   └─ Full featured example with all section types
             │   └─► buildMinimalMockLand(user_id, 'side-project')
             │       └─ Just header + text for new projects
             │
             ├─► resetMockState()
             │   └─ Recreates fresh state (for testing)
             │
             └─► Helper getters:
                 • getMockListItems(sectionId)
                 • getMockCollections(sectionId)
                 • getMockStores(sectionId)
                 • getMockLandByHandle(handle)


INITIALIZATION FLOW (App.vue -> initMockData):
═════════════════════════════════════════════════════════════════════════

  App.vue (onMounted)
        │
        └─► initMockData()
                │
                ├─► useUserStore().setUser(mockState.user)
                │   └─ Sets current user in store
                │
                ├─► useLandStore().setLands(mockState.lands)
                │   ├─ Sets lands array
                │   └─ Auto-selects first land as activeLand
                │
                └─► useThemeStore().setTheme(activeLand.theme)
                    └─ Sets current theme from active land


MOCK BUILDER FUNCTIONS (generators.ts):
═════════════════════════════════════════════════════════════════════════

buildMockLand(overrides?) → MockLandData {
  Creates a FULL-FEATURED example land with:
  • Header section
  • Text section
  • Media section (with MediaItems)
  • List section (with ListItems in mockState)
  • Collection section (with Collections → CollectionItems in mockState)
  • Store section (with Stores → StoreItems in mockState)
  • 0-3 random Collaborators
  • Theme preset: 'minimal'
}

buildMinimalMockLand(overrides?) → MockLandData {
  Creates a MINIMAL starting land with:
  • Header section
  • Text section
  • Empty collections/stores
  • Theme preset: 'minimal'
}

createMockListItems(sectionId, count) → ListItem[] {
  • Generates 5 items by default
  • Popular sites: GitHub, Twitter, LinkedIn, Dribbble, etc.
}

createMockCollectionSection(...) → {section, collections} {
  • 1-2 collections per section
  • 3-6 items per collection
}

createMockStoreSection(...) → {section, stores} {
  • 1 store per section
  • 2-6 store items
  • Products with price, variants, inventory
}
```

---

### 4. COMPOSABLES & THEIR RESPONSIBILITIES

```
COMPOSABLES DEPENDENCY GRAPH
=============================

useEditorActions()
├─ Dependencies:
│  ├─ useLandStore()
│  ├─ useEditorStore()
│  ├─ useThemeStore()
│  ├─ useToast()
│  └─ mockState (from provider)
│
├─ SECTION CRUD:
│  ├─ addSection(type, position)
│  │  └─ Creates new Section, initializes mock data for list/collection/store
│  │
│  ├─ deleteSection(sectionId)
│  │  └─ Removes from land.sections + cleans up mockState entries
│  │
│  └─ updateSectionContent(sectionId, content)
│
├─ SECTION STYLING:
│  ├─ updateSectionSettings(sectionId, settings)
│  ├─ updateSectionStyleVariant(sectionId, variant)
│  └─ reorderSection(sectionId, newPosition)
│
├─ MEDIA MANAGEMENT:
│  ├─ addMediaItem(sectionId, {media_type, url, caption})
│  ├─ updateMediaItem(sectionId, itemId, data)
│  └─ deleteMediaItem(sectionId, itemId)
│
├─ LIST MANAGEMENT (mockState):
│  ├─ addListItem(sectionId, {title, url, description, icon})
│  ├─ updateListItem(sectionId, itemId, data)
│  ├─ deleteListItem(sectionId, itemId)
│  └─ reorderListItem(sectionId, itemId, newPosition)
│
├─ COLLECTION MANAGEMENT (mockState):
│  ├─ addCollection(sectionId)
│  ├─ updateCollection(sectionId, collectionId, data)
│  ├─ deleteCollection(sectionId, collectionId)
│  ├─ reorderCollection(sectionId, collectionId, newPosition)
│  ├─ addCollectionItem(sectionId, collectionId, data)
│  ├─ updateCollectionItem(sectionId, collectionId, itemId, data)
│  ├─ deleteCollectionItem(sectionId, collectionId, itemId)
│  └─ reorderCollectionItem(sectionId, collectionId, itemId, newPosition)
│
├─ STORE MANAGEMENT (mockState):
│  ├─ addStoreItem(sectionId, storeId, data)
│  ├─ updateStoreItem(sectionId, storeId, itemId, data)
│  └─ deleteStoreItem(sectionId, storeId, itemId)
│
├─ LAND MANAGEMENT:
│  ├─ updateLandImages({cover_image?, avatar_image?})
│  ├─ updateLandSettings({handle?, title?, description?})
│  ├─ deleteLand()
│  └─ updateTheme(themeData)
│
└─ SNAPSHOT RESTORATION:
   └─ restoreSectionSnapshot(sectionId, {content, settings_json, style_variant})
      └─ For undo/redo functionality


useDragSort<T extends Positionable>(getItems, onReorder)
├─ Dependencies: None (vue composable)
│
├─ Used for: Reordering any collection of positionable items
│
├─ Returns:
│  ├─ isDragging: ref<boolean>
│  ├─ onDragStart()
│  └─ onDragEnd(event: {oldIndex, newIndex})
│     └─ Calculates new fractional index position
│
└─ Uses: generatePositionBefore/After/Between() from position.ts


useTheme(themeComputedRef)
├─ Dependencies: None (vue composable)
│
├─ Purpose: Theme context provider for descendants
│
├─ Provides:
│  ├─ 'isThemedContext' → true
│  ├─ 'landTheme' → LandTheme
│  └─ returns wrapperStyle with CSS variables
│
├─ CSS Variables Set:
│  ├─ --land-color-main, --land-color-accent, --land-color-surface
│  ├─ --land-bg, --land-text, --land-text-muted, --land-text-subtle
│  ├─ --land-border, --land-surface, --land-hover
│  └─ Font family based on typography_style
│
└─ Called by: Display components (preview area)


useLandTheme()
├─ Dependencies: vue inject/computed
│
├─ Purpose: Consume theme context in display components
│
├─ Returns: Computed refs for all CSS colors
│  ├─ textColor
│  ├─ textMutedColor
│  ├─ textSubtleColor
│  ├─ borderColor
│  ├─ surfaceColor
│  ├─ hoverColor
│  ├─ colorMain, colorAccent, colorSurface
│  └─ isThemedContext: boolean
│
└─ Used by: Section variant components (HeaderMinimal, TextBold, etc.)


useToast()
├─ Dependencies: None (singleton module-level state)
│
├─ Module-level state: toasts = ref<Toast[]>([])
│
├─ Returns:
│  ├─ toasts: ref<Toast[]> (for display in UI)
│  ├─ addToast(message, type='success', duration=3000)
│  └─ removeToast(id)
│
└─ Usage: All editor actions call addToast() for feedback


useCollaboratorActions()
├─ Dependencies: useLandStore()
│
├─ Returns:
│  ├─ getCollaborators() → Collaborator[]
│  ├─ invite(email, role) → Collaborator | null
│  ├─ updateRole(collaboratorId, role)
│  ├─ remove(collaboratorId)
│  └─ resendInvite(collaboratorId)
│
└─ Direct mutation of activeLand.collaborators


useKeyboardShortcuts()
├─ Dependencies: useEditorStore()
│
├─ Keyboard Handlers:
│  ├─ Escape: deselect section or exit edit mode
│  └─ Cmd/Ctrl+E: toggle edit mode
│
└─ Used by: Root component for global shortcuts


useThemeVars()
├─ Dependencies: useThemeStore()
│
└─ Purpose: Initialize theme CSS variables on page
   (called in App.vue)


usePageMeta()
└─ Purpose: Meta tags management (SEO)
```

---

### 5. COMPONENT HIERARCHY & RENDERING

```
COMPONENT RENDERING TREE
=========================

App.vue
  │
  ├─ uses: useThemeVars() composable
  ├─ onMounted: initMockData() (loads mockState → stores)
  │
  └─► <RouterView /> → route-based layout


PROJECT LAYOUT ROUTES:
═════════════════════════════════════════════════════════════════

/dashboard (AppLayout)
  │
  ├─ <AppHeader /> (contains navigation, user menu)
  │
  └─► ProjectView
        │
        └─► EditorPreview
              │
              ├─ reads: useLandStore().activeLand
              ├─ reads: useEditorStore().isEditMode
              ├─ reads: useEditorStore().activeSection
              │
              ├─ Iterate over sections (sorted by position)
              │
              └─► <component :is="componentMap[section.type]">
                    Each section gets rendered by a SECTION WRAPPER


SECTION WRAPPER COMPONENTS (theme-agnostic dispatchers):
═════════════════════════════════════════════════════════════════

SectionHeader.vue
  │
  ├─ Receives: props { section: Section }
  ├─ Reads: useThemeStore().theme?.theme_preset
  │
  └─► conditionally renders:
      ├─ HeaderMinimal.vue (default)
      ├─ HeaderBold.vue
      └─ HeaderEditorial.vue


SectionText.vue → TextMinimal.vue | TextBold.vue | TextEditorial.vue
SectionList.vue → ListMinimal.vue | ListBold.vue | ListEditorial.vue
SectionMedia.vue → displays MediaItems from section.content
SectionCollection.vue → CollectionMinimal/Bold/Editorial
SectionStore.vue → displays StoreItems
SectionCampaign.vue → CampaignMinimal/Bold/Editorial
SectionFooter.vue → FooterMinimal/Bold


SECTION VARIANT COMPONENTS (actual rendering):
═════════════════════════════════════════════════════════════════

Example: HeaderMinimal.vue

  <script>
  const props = defineProps<{ section: Section }>()
  const content = computed(() => props.section.content as HeaderContent)
  const settings = computed(() => props.section.settings_json as HeaderSettings)
  </script>

  <template>
  <div>
    <!-- Cover media -->
    <div :style="{ background: 'var(--theme-accent)' }">
      <img v-if="settings.cover_media_value" :src="settings.cover_media_value" />
    </div>
    <!-- Title + subtitle -->
    <h1 :style="{ color: 'var(--theme-main)' }">{{ content?.title }}</h1>
    <h2 :style="{ color: 'var(--theme-main)' }">{{ content?.subtitle }}</h2>
  </div>
  </template>

  ✓ Uses CSS variables from useTheme() context
  ✓ Reads content directly from section.content
  ✓ No state manipulation


EDITOR PREVIEW INTERACTIVITY:
═════════════════════════════════════════════════════════════════

EditorPreview.vue:

  When isEditMode:
  ├─ Add click handlers to sections
  ├─ Show blue border around activeSection
  ├─ Highlight border on hover
  │
  └─► selectSection(section)
      └─ editorStore.setActiveSection(section, openSettings=true)


UI BASE COMPONENTS (reusable):
═════════════════════════════════════════════════════════════════

• BaseButton.vue
• BaseInput.vue
• BaseSelect.vue
• BaseUpload.vue
• BaseColorPicker.vue
• RichTextEditor.vue
• BaseToggle.vue
• BaseDropdown.vue
• Accordion.vue
• BaseTree.vue
• BaseChart.vue
• BaseBadge.vue
• BaseAvatar.vue
• etc.

(Used throughout editor panels and settings)
```

---

### 6. EDIT FLOW - DETAILED STEP-BY-STEP

```
COMPLETE EDIT FLOW FROM CLICK TO SAVE
======================================


STEP 1: USER ENTERS EDIT MODE
═══════════════════════════════════════════════════════════════

  User clicks "Edit" button in UI
    │
    └─► editorStore.enterEditMode()
        ├─ isEditMode = true
        ├─ activeSection = null
        ├─ showSectionSettings = false
        └─ leftPanelTab = 'sections'

  EditorPreview detects isEditMode change:
  └─► Adds click handlers to all sections
  └─► Shows border highlights on hover/select


STEP 2: USER SELECTS A SECTION
═══════════════════════════════════════════════════════════════

  User clicks on a section in preview area
    │
    └─► EditorPreview.selectSection(section)
        └─ editorStore.setActiveSection(section, openSettings=true)
           ├─ activeSection = section
           └─ showSectionSettings = true


STEP 3: SECTION SETTINGS PANEL OPENS
═══════════════════════════════════════════════════════════════

  UI reacts to showSectionSettings:
  └─► Renders appropriate editor component for section type
      ├─ HeaderEditor (for header section)
      ├─ TextEditor (for text section)
      ├─ MediaEditor (for media section)
      ├─ ListEditor (for list section)
      ├─ CollectionEditor (for collection section)
      ├─ StoreEditor (for store section)
      ├─ CampaignEditor (for campaign section)
      └─ FooterEditor (for footer section)


STEP 4: USER EDITS CONTENT
═══════════════════════════════════════════════════════════════

Example: Editing a Text Section

  TextEditor component shows:
  ├─ RichTextEditor for markdown content
  ├─ Style selector (default/centered/wide)
  └─ Save button

  User edits and clicks Save:
    │
    └─► Editor calls: useEditorActions().updateSectionContent(
          sectionId,
          { body: newMarkdown }
        )

  updateSectionContent():
  ├─ patchSection(sectionId, updater)
  │  └─ Updates activeLand.sections[i].content
  │
  ├─ landStore.updateLand(activeLand.id, {sections: updated})
  │  └─ Triggers Land re-render with new content
  │
  ├─ Update editor's activeSection if it matches
  │  └─ editorStore.setActiveSection(updated_section)
  │
  └─ editorStore.markDirty()


STEP 5: UNSAVED CHANGES TRACKING
═══════════════════════════════════════════════════════════════

  editorStore.isDirty = true
    │
    ├─ UI shows "Unsaved changes" indicator
    │
    └─ When user clicks Save/Submit:
       └─ editorStore.markClean() (isDirty = false)


STEP 6: COMPLEX EXAMPLE - ADDING LIST ITEM
═══════════════════════════════════════════════════════════════

  User clicks "+ Add Link" in ListEditor:
    │
    └─► useEditorActions().addListItem(
          sectionId,
          { title, url, description, icon }
        )

  addListItem():
  ├─ Read existing items: mockState.listItems[sectionId]
  ├─ Generate new position: generatePositionAfter(lastItem?.position)
  ├─ Create ListItem with UUID + position
  ├─ Update mockState: mockState.listItems[sectionId] = [...existing, newItem]
  │  └─ This is NOT in landStore.activeLand!
  │  └─ This is in mockState (separate from Land.sections)
  │
  ├─ editorStore.markDirty()
  ├─ addToast('Link added')
  └─ return newItem (for optimistic UI update)

  When page is saved:
  └─ Send mockState.listItems[sectionId] to backend
     └─ Backend saves as CollectionItem[] in database


STEP 7: SECTION STYLING & PREVIEW UPDATE
═══════════════════════════════════════════════════════════════

  User changes theme preset from 'minimal' to 'bold':
    │
    └─► useEditorActions().updateTheme({ theme_preset: 'bold' })
        ├─ Create updatedTheme = {...activeLand.theme, theme_preset}
        ├─ themeStore.setTheme(updatedTheme)
        ├─ landStore.updateLand(id, {theme: updatedTheme})
        └─ editorStore.markDirty()

  EditorPreview detects theme change:
  └─► Re-renders all sections with new theme
      └─ SectionHeader now uses HeaderBold instead of HeaderMinimal
         (because themeStore.theme?.theme_preset changed)


STEP 8: REORDERING SECTIONS
═══════════════════════════════════════════════════════════════

  User drags section in list UI:
    │
    └─► useDragSort composable handles reorder:
        ├─ onDragEnd({oldIndex, newIndex})
        ├─ Calculate fractional index position
        │  ├─ If newIndex = 0: generatePositionBefore(next)
        │  ├─ If newIndex = last: generatePositionAfter(prev)
        │  └─ Otherwise: generatePositionBetween(prev, next)
        │
        └─► onReorder(itemId, newPosition)
            └─ useEditorActions().reorderSection(sectionId, newPosition)
               ├─ Update activeLand.sections[i].position = newPosition
               ├─ landStore.updateLand()
               └─ editorStore.markDirty()


STEP 9: DELETION
═══════════════════════════════════════════════════════════════

  User clicks "Delete Section":
    │
    └─► useEditorActions().deleteSection(sectionId)
        ├─ Filter out section from activeLand.sections
        ├─ landStore.updateLand(id, {sections: filtered})
        ├─ Clean up mockState entries:
        │  ├─ delete mockState.listItems[sectionId]
        │  ├─ delete mockState.collections[sectionId]
        │  └─ delete mockState.stores[sectionId]
        ├─ Clear activeSection if it was the deleted one
        ├─ editorStore.markDirty()
        └─ addToast('Section deleted')

  EditorPreview updates:
  └─► sections computed re-evaluates
      └─► Section no longer in list, DOM removed


STEP 10: EXITING EDIT MODE
═══════════════════════════════════════════════════════════════

  User clicks "Done" or presses Escape:
    │
    └─► editorStore.exitEditMode()
        ├─ isEditMode = false
        ├─ activeSection = null
        ├─ showSectionSettings = false
        ├─ leftPanelTab = 'sections'
        │
        └─ EditorPreview removes:
           ├─ Click handlers
           ├─ Border highlights
           └─ Selection UI


DIRTY STATE PERSISTENCE:
═══════════════════════════════════════════════════════════════

  isDirty is tracked but currently used for UI indication.
  In production, would trigger:
  ├─ Auto-save to backend
  ├─ "Unsaved changes" warning on page leave
  └─ Save button state management
```

---

### 7. SECTION LIFECYCLE

```
SECTION LIFECYCLE: BIRTH TO RENDER
==================================


┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: CREATION                                           │
└─────────────────────────────────────────────────────────────┘

  useEditorActions().addSection(type, position)
  │
  ├─ Get defaults from SECTION_DEFAULTS[type]
  │  └─ /lib/primitives/sectionDefaults.ts
  │
  ├─ Create new Section object:
  │  {
  │    id: UUID,
  │    land_id: activeLand.id,
  │    type: 'header' | 'text' | 'media' | etc.,
  │    position: fractional_index_string,
  │    style_variant: default_variant,
  │    settings_json: default_settings,
  │    content: default_content or null,
  │    created_at: ISO timestamp
  │  }
  │
  ├─ Add to activeLand.sections array
  │  └─ landStore.updateLand(id, {sections: [...sections, newSection]})
  │
  ├─ Initialize type-specific mock data if needed:
  │  ├─ if type='list':     mockState.listItems[id] = []
  │  ├─ if type='collection':
  │  │   ├─ Create default Collection
  │  │   └─ mockState.collections[id] = [defaultCollection]
  │  └─ if type='store':
  │      ├─ Create default Store
  │      └─ mockState.stores[id] = [defaultStore]
  │
  ├─ Set as active section in UI
  │  └─ editorStore.setActiveSection(newSection)
  │
  └─ Notify user
     └─ addToast('Header section added')


┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: EDITING                                            │
└─────────────────────────────────────────────────────────────┘

  User can edit:

  A) CONTENT (what's displayed)
     └─ updateSectionContent(sectionId, newContent)
        └─ Updates section.content
           └─ For media: section.content.items
           └─ For text: section.content.body
           └─ For header/footer: section.content {title, subtitle}

  B) SETTINGS (display options)
     └─ updateSectionSettings(sectionId, newSettings)
        └─ Updates section.settings_json
           └─ For all types: {style: variant}
           └─ For header: {cover_media_type, cover_media_value, profile_position}
           └─ For collection: {style, monetized?, price?, payment_type?}

  C) STYLE VARIANT
     └─ updateSectionStyleVariant(sectionId, variant)
        └─ Updates section.style_variant
           └─ Also syncs to section.settings_json.style

  D) NESTED ITEMS (for collection/store/list)
     └─ For List Items:
        ├─ addListItem(sectionId, itemData)
        ├─ updateListItem(sectionId, itemId, itemData)
        ├─ deleteListItem(sectionId, itemId)
        └─ reorderListItem(sectionId, itemId, newPosition)
        
     └─ For Collection Items:
        ├─ addCollection(sectionId)
        ├─ updateCollection(sectionId, collectionId, data)
        ├─ addCollectionItem(sectionId, collectionId, itemData)
        ├─ updateCollectionItem(sectionId, collectionId, itemId, data)
        └─ deleteCollectionItem(sectionId, collectionId, itemId)
        
     └─ For Store Items:
        ├─ addStoreItem(sectionId, storeId, itemData)
        ├─ updateStoreItem(sectionId, storeId, itemId, data)
        └─ deleteStoreItem(sectionId, storeId, itemId)

  All edits:
  ├─ Update state (landStore or mockState)
  ├─ Mark dirty: editorStore.markDirty()
  └─ Show toast notification


┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: RENDERING                                          │
└─────────────────────────────────────────────────────────────┘

  EditorPreview renders sections:

  1. Read from store:
     └─ const sections = sortByPosition(activeLand.sections)

  2. For each section:
     ├─ const component = componentMap[section.type]
     │  └─ {
     │      header: SectionHeader,
     │      text: SectionText,
     │      media: SectionMedia,
     │      list: SectionList,
     │      collection: SectionCollection,
     │      campaign: SectionCampaign,
     │      store: SectionStore,
     │      footer: SectionFooter
     │    }
     │
     └─ <component :is="component" :section="section" />

  3. Section wrapper (e.g., SectionHeader) reads theme:
     ├─ const themePreset = useThemeStore().theme?.theme_preset
     │
     └─► Switch to variant component:
         ├─ if preset='bold':      HeaderBold
         ├─ if preset='editorial': HeaderEditorial
         └─ else:                   HeaderMinimal

  4. Variant component (e.g., HeaderMinimal) renders:
     ├─ Reads: props.section.content (HeaderContent)
     ├─ Reads: props.section.settings_json (HeaderSettings)
     ├─ Accesses: CSS variables from useTheme() context
     │  ├─ color: var(--land-color-main)
     │  ├─ background: var(--land-color-accent)
     │  └─ etc.
     │
     └─► <div>
           <img v-if="settings.cover_media_value" :src="..." />
           <h1 :style="{ color: 'var(--land-color-main)' }">{{ content.title }}</h1>
           <h2>{{ content.subtitle }}</h2>
         </div>

  5. For nested items (list/collection/store):
     ├─ Read from mockState[type][sectionId]
     │  ├─ mockState.listItems[sectionId]: ListItem[]
     │  ├─ mockState.collections[sectionId]: Collection[]
     │  └─ mockState.stores[sectionId]: Store[]
     │
     └─ Loop through and render each item component

  ✓ Result: Full page preview with all sections & styling


┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: DELETION                                           │
└─────────────────────────────────────────────────────────────┘

  useEditorActions().deleteSection(sectionId)
  │
  ├─ Filter out section from activeLand.sections
  ├─ landStore.updateLand(id, {sections: filtered})
  │
  ├─ Cleanup mockState:
  │  ├─ delete mockState.listItems[sectionId]
  │  ├─ delete mockState.collections[sectionId]
  │  └─ delete mockState.stores[sectionId]
  │
  ├─ Clear selection:
  │  └─ editorStore.setActiveSection(null)
  │
  ├─ Mark dirty:
  │  └─ editorStore.markDirty()
  │
  └─ EditorPreview updates:
     └─ sections computed re-runs
        └─ <component :is="..."> loops over new array
           └─ Deleted section no longer rendered


SNAPSHOT & RESTORATION (undo/redo):
═════════════════════════════════════════════════════════════════

  Before editing, save snapshot:
  ├─ {
  │    content: section.content,
  │    settings_json: section.settings_json,
  │    style_variant: section.style_variant
  │  }

  To restore:
  └─ restoreSectionSnapshot(sectionId, snapshot)
     └─ patchSection to replace with snapshot values
```

---

### 8. ROUTER & NAVIGATION

```
VUE ROUTER STRUCTURE
====================

Base Router (createRouter):
├─ history: createWebHistory(import.meta.env.BASE_URL)
│
└─ routes: [


Route 1: /dashboard (AppLayout with nested routes)
  │
  ├─ Component: AppLayout.vue
  │  └─ Renders: <AppHeader /> + <RouterView />
  │
  ├─ Children:
  │  │
  │  ├─ /dashboard (empty path)
  │  │  └─ ProjectView.vue
  │  │     └─ EditorPreview component
  │  │
  │  └─ /dashboard/account
  │     └─ AccountView.vue (user settings/profile)
  │


Route 2: /auth (AuthLayout with nested routes)
  │
  ├─ Component: AuthLayout.vue
  │
  ├─ Children:
  │  │
  │  ├─ /auth (empty path)
  │  │  └─ LoginView.vue
  │  │
  │  ├─ /auth/register
  │  │  └─ RegisterView.vue
  │  │
  │  └─ /auth/reset
  │     └─ LostPasswordView.vue (password recovery)
  │


Route 3: /onboarding (OnboardingLayout with nested routes)
  │
  ├─ Component: OnboardingLayout.vue
  │
  └─ Children:
     │
     └─ /onboarding (empty path)
        └─ OnboardingView.vue (first-time user flow)


ROUTE GUARDS & REDIRECTS:
═════════════════════════════════════════════════════════════════

Currently not visible in router/index.ts, but would typically guard:

├─ /auth/* → redirect to /dashboard if authenticated
├─ /dashboard/* → redirect to /auth if not authenticated
└─ /onboarding → only for new users (useAuthStore.needsOnboarding)
```

---

### 9. STATE MUTATION & UPDATE PATTERNS

```
HOW DATA FLOWS THROUGH STORES
==============================

PATTERN 1: Direct Section Content Update
═════════════════════════════════════════

  Editor UI Input
    │
    └─► useEditorActions().updateSectionContent(sectionId, content)
        │
        ├─ patchSection(sectionId, updater)
        │  └─ activeLand.sections[i].content = {...s.content, ...content}
        │
        ├─ useLandStore().updateLand(id, {sections: updated})
        │  └─ lands[i] = {...lands[i], sections: updated}
        │
        ├─ editorStore.setActiveSection(updated_section)
        │  └─ activeSection = updated_section (for UI focus)
        │
        └─ editorStore.markDirty()
           └─ isDirty = true (for unsaved indicator)

  Vue Reactivity:
  └─ activeLand computed in EditorPreview re-evaluates
     └─ Sections array is reactive
        └─ Component re-renders with new content


PATTERN 2: Nested Items in mockState
═════════════════════════════════════════

  Editor UI Input (e.g., add list item)
    │
    └─► useEditorActions().addListItem(sectionId, itemData)
        │
        ├─ Read: mockState.listItems[sectionId]
        ├─ Generate position
        ├─ Create new ListItem
        │
        └─ Update: mockState.listItems[sectionId] = [...existing, newItem]
           │
           └─ mockState is reactive (created with reactive())
              └─ Components reading mockState.listItems[sectionId] re-render


PATTERN 3: Theme Update (cross-store sync)
═════════════════════════════════════════════════════════════════

  Editor UI Input
    │
    └─► useEditorActions().updateTheme(data)
        │
        ├─ Create updated theme object
        │
        ├─ useThemeStore().setTheme(updatedTheme)
        │  └─ theme = updatedTheme
        │
        ├─ useLandStore().updateLand(id, {theme: updatedTheme})
        │  └─ activeLand.theme = updatedTheme
        │
        └─ editorStore.markDirty()

  Render consequence:
  ├─ SectionHeader reads themeStore.theme?.theme_preset
  ├─ Conditional renders HeaderMinimal/Bold/Editorial
  └─ HeaderMinimal uses CSS variables from useTheme()
     └─ --land-color-main, --land-color-accent, etc. update
        └─ All sections re-render with new colors


PATTERN 4: Multi-level Nested Updates (Collection Items)
═════════════════════════════════════════════════════════════════

  Editor UI Input (update collection item title)
    │
    └─► useEditorActions().updateCollectionItem(
          sectionId, collectionId, itemId, data
        )
        │
        ├─ Read: mockState.collections[sectionId]
        │
        ├─ Map through collections:
        │  └─ Find collection with matching collectionId
        │     └─ Map through items:
        │        └─ Find item with matching itemId
        │           └─ {...item, ...data}
        │
        └─ Update: mockState.collections[sectionId] = updated_array
           │
           └─ Vue reactivity propagates deeply
              └─ Components showing this item re-render


REACTIVE DEPENDENCIES CHAIN:
═════════════════════════════════════════════════════════════════

Landing Page (EditorPreview)
  │
  ├─ depends on: useLandStore().activeLand
  │  └─ computed from landStore.lands & landStore.activeLandId
  │
  ├─ depends on: useEditorStore().activeSection
  │  └─ for border highlighting
  │
  ├─ depends on: useThemeStore().theme
  │  └─ for determining which variant to render
  │
  ├─ reads: mockState.listItems[sectionId]
  │  └─ via getMockListItems() or direct access
  │
  ├─ reads: mockState.collections[sectionId]
  │  └─ via getMockCollections() or direct access
  │
  └─ reads: mockState.stores[sectionId]
     └─ via getMockStores() or direct access

  Any of these changing → EditorPreview re-renders


PINIA REACTIVITY MECHANISM:
═════════════════════════════════════════════════════════════════

All stores use Vue's ref() for state:

  const myRef = ref(initialValue)
  
  Whenever you:
  ├─ myRef.value = newValue
  ├─ myRef.value.property = newValue
  ├─ myRef.value.array.push(item)
  │
  → All computed properties and watchers that depend on myRef
    are automatically notified
    → Components that reference myRef in templates re-render

This applies to:
  ├─ landStore: lands[], activeLandId, activeLand (computed)
  ├─ editorStore: all ref values
  ├─ themeStore: theme ref
  ├─ userStore: user, isAuthenticated refs
  ├─ authStore: isLoading, error, etc.
  └─ mockState: all Record<string, array> values
```

---

### 10. COMPLETE REQUEST-RESPONSE CYCLE DIAGRAM

```
USER ACTION → STORE UPDATE → RENDER CYCLE
==========================================

Example: User changes header title in editor

STEP 1: USER INTERACTION
════════════════════════════════════════════════════════════════

  User types in <RichTextEditor v-model="titleText" />
    │
    └─ titleText changes (reactive)


STEP 2: USER SUBMITS (clicks Save)
════════════════════════════════════════════════════════════════

  @click="onSave()"
    │
    └─► useEditorActions().updateSectionContent(sectionId, {title: titleText})


STEP 3: STORE MUTATIONS
════════════════════════════════════════════════════════════════

  updateSectionContent calls:
  └─► patchSection(sectionId, updater)
      │
      ├─ const updater = (s) => ({
      │    ...s,
      │    content: {...s.content, title: titleText}
      │  })
      │
      ├─ activeLand.sections = sections.map(s =>
      │    s.id === sectionId ? updater(s) : s
      │  )
      │ (Immutable update pattern)
      │
      └─ landStore.updateLand(activeLand.id, {
           sections: updatedSections
         })
         │
         └─ lands[i] = {...lands[i], sections: updatedSections}
            └─ lands is ref, change triggers reactivity


STEP 4: DERIVED STATE UPDATES
════════════════════════════════════════════════════════════════

  landStore.activeLand computed re-evaluates:
  ├─ Finds land with id === activeLandId
  ├─ Returns the newly updated land object
  └─ Subscribers of activeLand are notified


STEP 5: COMPONENT RE-RENDER
════════════════════════════════════════════════════════════════

  EditorPreview component:
  ├─ Template watches: landStore.activeLand (via computed)
  ├─ Detects change
  │
  └─► Sections loop re-renders:
      ├─ const sections = sortByPosition(activeLand.sections)
      │
      ├─► :key="section.id" ensures Vue identifies same section
      │
      └─► <component :is="componentMap[section.type]"
                      :section="section" />
          │
          └─ SectionHeader receives NEW section prop
             │
             └─► HeaderMinimal renders:
                 ├─ const content = section.content
                 └─ <h1>{{ content.title }}</h1>
                    └─ Now displays new title


STEP 6: UI FEEDBACK
════════════════════════════════════════════════════════════════

  useEditorActions also calls:
  ├─ editorStore.markDirty()
  │  └─ isDirty = true
  │     └─ UI shows "Unsaved changes" indicator
  │
  └─ addToast('Content updated')
     └─ toasts.value.push({id, message, type})
        └─ Toast component watches toasts
           └─ Displays notification


COMPLETE CHAIN:
════════════════════════════════════════════════════════════════

  titleText input → updateSectionContent() → landStore mutation
                                                    │
                                                    ▼
                                          activeLand computed updates
                                                    │
                                                    ▼
                                          EditorPreview detects change
                                                    │
                                                    ▼
                                          Template re-evaluates sections
                                                    │
                                                    ▼
                                          SectionHeader updates
                                                    │
                                                    ▼
                                          HeaderMinimal re-renders
                                                    │
                                                    ▼
                                          DOM updates with new title
                                                    │
                                                    ▼
                                          User sees change immediately
```

---

### 11. KEY UTILITIES & HELPERS

```
UTILITY FUNCTIONS & MODULES
============================

POSITION MANAGEMENT (fractional-indexing library):
═════════════════════════════════════════════════════════════════

  generatePositionAfter(lastPosition: string | null) → string
  └─ Appends to end of list

  generatePositionBefore(firstPosition: string | null) → string
  └─ Inserts at beginning of list

  generatePositionBetween(before: string | null, after: string | null) → string
  └─ Inserts between two items

  generatePositions(count: number, before?, after?) → string[]
  └─ Generates N evenly-spaced positions
     └─ Used for initializing lists in mock data

  sortByPosition<T extends {position: string}>(items: T[]) → T[]
  └─ Lexicographic sort by position strings
     └─ Used: sortByPosition(land.sections)
     └─ Returns sorted sections in display order


VALIDATORS:
═════════════════════════════════════════════════════════════════

  /lib/validators/section.validator.ts
  └─ Validate Section objects

  /lib/validators/land.validator.ts
  └─ Validate Land objects


STYLE MANAGEMENT:
═════════════════════════════════════════════════════════════════

  /lib/primitives/styleVariants.ts
  └─ Map of section type → allowed style_variant values

  /lib/primitives/themePresets.ts
  └─ Theme preset definitions

  /lib/primitives/sectionDefaults.ts
  └─ Default content, settings, variant for each section type
     └─ Used in addSection() to initialize new sections


MARKDOWN UTILITIES:
═════════════════════════════════════════════════════════════════

  /lib/utils/markdown.ts
  └─ Parse/render markdown content

  /lib/utils/formatting.ts
  └─ Format strings (slugs, labels, etc.)

  /lib/utils/slug.ts
  └─ Generate URL slugs from titles


MEDIA UTILITIES:
═════════════════════════════════════════════════════════════════

  /lib/utils/videoEmbed.ts
  └─ Extract embed URLs from YouTube/Vimeo links

  /lib/utils/imageFallback.ts
  └─ Fallback image handling

  /lib/utils/favicon.ts
  └─ Extract favicon from URL


MOCK DATA GENERATION:
═════════════════════════════════════════════════════════════════

  Using @faker-js/faker:
  ├─ createMockUser()
  ├─ createMockTheme()
  ├─ createMockHeaderSection()
  ├─ createMockTextSection()
  ├─ createMockMediaSection()
  ├─ createMockListSection()
  ├─ createMockCollectionSection()
  ├─ createMockStoreSection()
  ├─ createMockFooterSection()
  ├─ createMockCollaborator()
  │
  └─ buildMockLand() [full example]
  └─ buildMinimalMockLand() [starter template]
```

---

## SUMMARY TABLE: Core Concepts

| **Concept** | **Location** | **Purpose** | **Scope** |
|---|---|---|---|
| **Land** | Land.ts type | Represents a single site/page | One per project |
| **Section** | Section.ts type | Content area within a Land | Multiple per Land |
| **Section Types** | 8 types (header, text, media, list, collection, store, campaign, footer) | Different content layouts | Type-specific rendering |
| **Theme** | LandTheme type + themeStore | Controls colors & typography | Global to Land |
| **ListItems** | mockState.listItems[sectionId] | Links/navigation items | Per list section |
| **Collections** | mockState.collections[sectionId] | Showcase/portfolio items | Per collection section |
| **Stores** | mockState.stores[sectionId] | E-commerce products | Per store section |
| **useLandStore** | Pinia store | Manages lands array & active land | Global |
| **useEditorStore** | Pinia store | Tracks edit mode & UI state | Global |
| **useThemeStore** | Pinia store | Current theme | Global per Land |
| **useEditorActions** | Composable | All CRUD operations for sections & items | Accessed locally |
| **useDragSort** | Composable | Drag-and-drop reordering | Local to component |
| **useTheme** | Composable | Theme provider for descendants | Local to preview area |
| **useLandTheme** | Composable | Theme consumer in variants | Local to section variant |
| **EditorPreview** | Component | Main preview & clickable area | Renders all sections |
| **SectionWrapper** | Components | Theme-aware dispatchers | Per section |
| **Section Variants** | Components | Actual rendering (minimal/bold/editorial) | Per section theme |
| **mockState** | Reactive object | Storage for non-Land nested items | Global across app |
| **Router** | /router/index.ts | Navigation structure | Client-side routing |

---