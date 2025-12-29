/**
 * SECTION SYSTEM TYPES
 * Clean-slate architecture for Lands sections
 */

import type { Component } from 'vue'

// ============================================
// SECTION TYPES
// ============================================

/**
 * All available section types
 */
export type SectionType =
  | 'header'
  | 'hero'
  | 'cards'
  | 'links'
  | 'accordion'
  | 'cta'
  | 'contact'
  | 'subscribe'
  | 'gallery'
  | 'footer'
  | 'products'
  | 'faq'
  | 'menu'
  | 'events'
  | 'services'
  | 'media-text'
  | 'text'
  | 'logoList'
  | 'promo'

// ============================================
// FIELD SCHEMA TYPES
// ============================================

/**
 * Field category - determines where the field appears in the editor
 * - 'content': Shows in section list sidebar (default)
 * - 'design': Shows in style inspector when section is selected
 * - 'button': Shows when button field is active (button-specific settings)
 */
export type FieldCategory = 'content' | 'design' | 'button'

/**
 * Base field definition
 */
interface BaseField {
  key: string
  label: string
  required?: boolean
  placeholder?: string
  /** Field category - 'content' (default) or 'design' */
  category?: FieldCategory
}

/**
 * Simple text input
 */
export interface TextField extends BaseField {
  type: 'text'
  maxLength?: number
}

/**
 * Rich text / multiline
 */
export interface RichTextField extends BaseField {
  type: 'richText'
}

/**
 * Image field with URL + alt
 */
export interface ImageField extends BaseField {
  type: 'image'
}

/**
 * Media field - image or video with type selector
 */
export interface MediaField extends BaseField {
  type: 'media'
  /** Key for the media type (defaults to 'mediaType') */
  typeKey?: string
}


/**
 * URL / link field
 */
export interface UrlField extends BaseField {
  type: 'url'
}

/**
 * Boolean toggle
 */
export interface BooleanField extends BaseField {
  type: 'boolean'
  defaultValue?: boolean
}

/**
 * Select from options
 */
export interface SelectField extends BaseField {
  type: 'select'
  options: { value: string; label: string }[]
}

/**
 * Repeater for lists of items
 */
export interface RepeaterField extends BaseField {
  type: 'repeater'
  itemSchema: FieldSchema[]
  /** Variant-specific item schemas (overrides itemSchema when variant matches) */
  variantSchemas?: Record<string, FieldSchema[]>
  /** Use-case-specific item schemas (overrides itemSchema when useCase matches) */
  useCaseSchemas?: Record<string, FieldSchema[]>
  /** Key in section data that holds the useCase value */
  useCaseKey?: string
  /** Default item data when adding new items */
  itemDefault?: Record<string, unknown>
  minItems?: number
  maxItems?: number
}

/**
 * Link field - single CTA with label + URL
 */
export interface LinkField extends BaseField {
  type: 'link'
}

/**
 * Union of all field types
 */
export type FieldSchema =
  | TextField
  | RichTextField
  | ImageField
  | MediaField
  | UrlField
  | BooleanField
  | SelectField
  | RepeaterField
  | LinkField

// ============================================
// SECTION VARIANT
// ============================================

/**
 * A variant defines a layout option for a section
 */
export interface SectionVariant {
  id: string
  label: string
}

// ============================================
// LAYOUT OPTIONS
// ============================================

/**
 * A layout option for variant-specific controls
 */
export interface LayoutOption {
  key: string
  label: string
  type: 'select' | 'toggle'
  options?: { value: string; label: string }[]
  default: string | boolean
}

/**
 * Layout options mapped by variant ID
 */
export type LayoutOptionsMap = Record<string, LayoutOption[]>

/**
 * Style option for section-level style controls
 * Shows in StyleInspector when section is selected (no field active)
 */
export interface StyleOption {
  key: string
  label: string
  type: 'select' | 'toggle' | 'range'
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
  default: string | boolean | number
}

/**
 * Style options mapped by variant ID
 * Special key '_global' applies to all variants
 */
export type StyleOptionsMap = Record<string, StyleOption[]>

// ============================================
// SECTION DEFINITION (REGISTRY ENTRY)
// ============================================

/**
 * Section definition in the registry
 * This is the single source of truth for what a section IS
 */
export interface SectionDefinition<TData = Record<string, unknown>> {
  /** Unique type identifier (e.g., 'hero', 'links', 'text') */
  type: string

  /** Display name shown in editor UI */
  displayName: string

  /** Icon for the section (lineicons name) */
  icon: string

  /** Short description of what this section is for */
  description?: string

  /** Use case examples for this section */
  useCase?: string

  /** Preview image path for the section */
  previewImage?: string

  /** Default variant when adding section */
  defaultVariant: string

  /** Available layout variants */
  variants: SectionVariant[]

  /** Variant-specific layout options (e.g., carousel settings) */
  layoutOptions?: LayoutOptionsMap

  /** Variant-specific style options (e.g., hero height, layout mode) */
  styleOptions?: StyleOptionsMap

  /** Variant-specific field order for sidebar display (array of field keys) */
  fieldOrder?: Record<string, string[]>

  /** Field schema for inspector generation */
  schema: FieldSchema[]

  /** Vue component to render this section */
  component: Component

  /** Factory function to create default data */
  createDefaultData: () => TData

  /** If true, section is hidden from the Add Section menu (internal use only) */
  hidden?: boolean
}

// ============================================
// FIELD STYLES (PER-FIELD STYLE OVERRIDES)
// ============================================

/**
 * Style properties that can be applied to individual fields
 */
export interface FieldStyleProperties {
  fontSize?: number         // in px
  lineHeight?: number       // multiplier (e.g., 1.5)
  spacingX?: number         // horizontal padding in px
  spacingY?: number         // vertical padding in px
  color?: string            // text color (hex)
  backgroundColor?: string  // background color (hex)
  borderRadius?: number     // border radius in px
  borderColor?: string      // border color (hex) - for buttons
  borderWidth?: number      // border width in px (0-8) - for buttons
  width?: number            // width in px (for image fields)
  aspectRatio?: string      // aspect ratio for media fields (e.g., '16/9', '4/3', '1/1')
  [key: string]: string | number | undefined // Index signature for dynamic access
}

/**
 * Map of field keys to their style overrides
 */
export type FieldStyles = Record<string, FieldStyleProperties>

// ============================================
// SECTION INSTANCE (PAGE DATA)
// ============================================

/**
 * A section instance on a page
 * This is what gets saved to the database
 */
/**
 * Section-level style properties
 */
type RepeaterStyleSuffix = 'SpaceBetween' | 'BackgroundColor' | 'BorderColor' | 'BorderWidth'
export type RepeaterStyleKey = `${string}${RepeaterStyleSuffix}`

export interface SectionStyleProperties extends Partial<Record<RepeaterStyleKey, string | number | undefined>> {
  backgroundColor?: string  // background color (hex)
  spacingY?: number         // vertical padding in px
  spacingX?: number         // horizontal padding in px
  spaceBetween?: number     // gap between sibling elements in px

  // Hero overlay styles
  overlayHeight?: 'full' | 'half'
  overlayPositionX?: 'left' | 'center' | 'right'
  overlayPositionY?: 'top' | 'middle' | 'bottom'
  overlayColor?: string     // hex color
  overlayOpacity?: number   // 0-100
  overlayBlur?: number      // px

  // Hero stacked styles
  heroStackedLayout?: 'option1' | 'option2' | 'option3'

  // Hero split styles
  heroSplitHeight?: 'full' | 'half'
  heroSplitContentPosition?: 'left' | 'right'

  // Hero presentation styles
  heroPresentationLayout?: 'inline' | 'stacked'

  // Cards button styles
  cardsButtonWidth?: 'auto' | 'full'
  cardsButtonFontSize?: number
  cardsButtonPaddingX?: number
  cardsButtonPaddingY?: number
  cardsButtonRadius?: number
  cardsButtonBackgroundColor?: string
  cardsButtonTextColor?: string

  // Products button styles
  productsButtonWidth?: 'auto' | 'full'
  productsButtonFontSize?: number
  productsButtonPaddingX?: number
  productsButtonPaddingY?: number
  productsButtonRadius?: number
  productsButtonBackgroundColor?: string
  productsButtonTextColor?: string

  // Accordion styles
  accordionSpaceBetween?: number
  accordionFontColor?: string

  // Split layout ordering used by split variants across sections
  splitLayout?:
    | 'content-buttons'
    | 'buttons-content'
    | 'content-form'
    | 'form-content'
    | 'title-content'
    | 'content-title'
    | 'grid'
    | 'row'
    | 'carousel'

  // Gallery spacing
  gallerySpaceBetween?: number

  // Carousel/Slider options (Cards, Products, Gallery)
  slidesPerView?: number | string  // Can be number (Cards: 1-6 with 0.5 step) or string (Products: '1', '2', '3')
  autoplay?: boolean
  showArrows?: boolean

  // Dynamic style options (from section definition styleOptions)
  [key: string]: string | number | boolean | undefined
}

/**
 * Item style properties for repeater items (shared across all items)
 */
export interface ItemStyleProperties {
  fontSize?: number         // in px
  lineHeight?: number       // multiplier
  spacingX?: number         // horizontal padding in px
  spacingY?: number         // vertical padding in px
  color?: string            // text color
  backgroundColor?: string  // background color
  borderRadius?: number     // border radius in px
  // Border styles (for card items)
  borderWidth?: number      // border width in px
  borderColor?: string      // border color (hex)
  // Shadow styles (for card items)
  boxShadow?: string        // CSS box-shadow value
  // Logo-specific styles
  width?: number            // logo width in px
  blackAndWhite?: boolean   // grayscale filter
  opacity?: number          // 0-1 opacity value
}

export interface SectionInstance<TData = Record<string, unknown>> {
  /** Unique instance ID */
  id: string

  /** Section type (must match a registry entry) */
  type: string

  /** Current variant ID */
  variant: string

  /** Section content data (shape defined by schema) */
  data: TData

  /** Per-field style overrides */
  fieldStyles?: FieldStyles

  /** Section-level style overrides */
  styles?: SectionStyleProperties

  /** Shared item styles for repeater fields (applies to all items) */
  itemStyles?: ItemStyleProperties
}

// ============================================
// SECTION PROPS (COMPONENT CONTRACT)
// ============================================

/**
 * Props that every section component MUST accept
 */
export interface SectionProps<TData = Record<string, unknown>> {
  /** Section content data */
  data: TData

  /** Current variant ID */
  variant: string

  /** Theme tokens (injected as CSS vars, but passed for edge cases) */
  theme: ThemeTokens
}

// ============================================
// THEME TOKENS
// ============================================

/**
 * Color tokens
 */
export interface ColorTokens {
  background: string
  foreground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  border: string
}

/**
 * Font tokens
 */
export interface FontTokens {
  heading: string
  body: string
  mono?: string
}

/**
 * Font scale (modular scale values)
 */
export interface FontScaleTokens {
  xs: string
  sm: string
  base: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
  '5xl': string
}

/**
 * Spacing tokens
 */
export interface SpacingTokens {
  section: string // Vertical padding for sections
  container: string // Horizontal container padding
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

/**
 * Border radius tokens
 */
export interface RadiusTokens {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  full: string
}

/**
 * Button style tokens
 */
export interface ButtonTokens {
  borderRadius: string
  paddingX: string
  paddingY: string
  fontWeight: string
}

/**
 * All theme tokens combined
 */
export interface ThemeTokens {
  colors: ColorTokens
  fonts: FontTokens
  fontScale: FontScaleTokens
  spacing: SpacingTokens
  radius: RadiusTokens
  button: ButtonTokens
}

// ============================================
// SECTION PRESET (THEME OVERRIDES)
// ============================================

/**
 * Theme-specific overrides for a section type
 */
export interface SectionPreset {
  /** Override default variant for this theme */
  defaultVariant?: string

  /** Restrict which variants are available */
  allowedVariants?: string[]

  /** Optional layout hints (section-specific) */
  layoutHints?: Record<string, unknown>
}

// ============================================
// THEME
// ============================================

/**
 * Complete theme definition
 * Themes are pure JSON data - no logic, no components
 *
 * A Theme defines HOW a site looks:
 * - Design tokens (colors, fonts, spacing, radius, buttons)
 * - Section style presets (default variants, allowed variants)
 *
 * A Theme MUST NOT:
 * - Define which sections exist
 * - Define section order
 * - Contain content or markup
 */
export interface Theme {
  /** Unique theme identifier */
  id: string

  /** Display name */
  name: string

  /** Theme description */
  description: string

  /** Whether this is a dark theme */
  isDark: boolean

  /** Design tokens */
  tokens: ThemeTokens

  /** Optional section presets (style hints only) */
  sectionPresets?: Record<string, SectionPreset>
}

// ============================================
// TEMPLATE
// ============================================

/**
 * Section data for a template
 * Simplified version of SectionInstance for template definitions
 */
export interface TemplateSectionData {
  /** Section type (must match a registry entry) */
  type: string

  /** Variant ID */
  variant: string

  /** Default content data */
  data: Record<string, unknown>
}

/**
 * Template definition
 * Templates are pure JSON data - applied ONCE at project creation
 *
 * A Template defines HOW a site STARTS:
 * - Initial section list and order
 * - Section variants
 * - Default starter content
 * - Which theme to use initially
 *
 * A Template MUST NOT:
 * - Define colors, fonts, spacing, or any style tokens
 * - Override theme tokens
 * - Introduce new section types
 * - Be referenced after project creation
 */
export interface Template {
  /** Unique template identifier */
  id: string

  /** Display name */
  name: string

  /** Template description */
  description: string

  /** Preview thumbnail URL */
  thumbnail?: string

  /** Category for grouping */
  category: 'blank' | 'portfolio' | 'business' | 'creator' | 'landing' | 'preset'

  /** Theme ID to apply initially */
  themeId: string

  /** Initial sections with starter content */
  sections: TemplateSectionData[]
}

// ============================================
// EDITOR SELECTION
// ============================================

export type ActiveNodeType = 'section' | 'field' | 'item'

export interface ActiveNode {
  id: string
  type: ActiveNodeType
  sectionId: string
  fieldKey?: string
  itemId?: string
}

export type SelectionPayloadType = ActiveNodeType | 'section'

export interface SelectionPayload {
  type: SelectionPayloadType
  fieldKey?: string
  itemId?: string
}

export interface SelectionContextProps {
  activeNodeId?: string | null
  activeNodeType?: ActiveNodeType | null
  activeFieldKey?: string | null
  activeItemId?: string | null
}
