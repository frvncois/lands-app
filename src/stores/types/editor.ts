/**
 * Editor Types
 *
 * Complete type definitions for the page builder blocks system.
 */

// ============================================
// SECTION BLOCK TYPES
// ============================================

export type SectionBlockType =
  // Special (fixed)
  | 'header'
  | 'footer'
  // Layout
  | 'container'
  | 'grid'
  | 'stack'
  | 'canvas'
  // Content
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'icon'
  | 'divider'
  // Product-specific
  | 'variants'
  // Form (container that accepts form field children)
  | 'form'
  // Form field types (children of form only)
  | 'form-input'
  | 'form-textarea'
  | 'form-select'
  | 'form-radio'
  | 'form-checkbox'
  | 'form-button'

// Form field block types (subset of SectionBlockType)
// Note: 'stack' is also allowed inside form for grouping fields
export type FormFieldBlockType =
  | 'form-input'
  | 'form-textarea'
  | 'form-select'
  | 'form-radio'
  | 'form-checkbox'
  | 'form-button'
  | 'stack'

// Collection/list identifiers
export type ListCollectionType = 'menu-list'

// Canvas child block types (blocks that can be placed in Canvas)
// Canvas child block types - content blocks only (no layout or form)
export type CanvasChildBlockType =
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'icon'
  | 'divider'

// Block categories for sidebar organization
export type BlockCategory = 'layout' | 'content'

// ============================================
// SHARED TYPES
// ============================================

export type Alignment = 'left' | 'center' | 'right'
export type VerticalAlignment = 'top' | 'center' | 'bottom'

// Flexbox alignment types for layout blocks
export type JustifyContent = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
export type AlignItems = 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse'
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse'
export type BlockHeight = 'auto' | 'full' | 'half'
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold'
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
export type LineHeight = 'tight' | 'normal' | 'relaxed' | 'loose'
export type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | 'auto'
export type ObjectFit = 'cover' | 'contain' | 'fill' | 'none'
export type MaskShape = 'none' | 'circle' | 'rounded' | 'blob-1' | 'blob-2' | 'blob-3' | 'hexagon' | 'diamond' | 'arch'
// Legacy animation type (deprecated - use AnimationSettings instead)
export type AnimationType = 'none' | 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom'

// ============================================
// ANIMATION SYSTEM
// ============================================

// Animation trigger types
export type AnimationTrigger = 'none' | 'page-load' | 'in-view' | 'hover'

// Animation preset types
export type AnimationPreset =
  | 'none'
  | 'fade-in'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'rotate-in'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'

// Animation easing types
export type AnimationEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'

// Animation settings for a block
export interface AnimationSettings {
  // Whether animation is enabled
  enabled: boolean
  // Trigger type
  trigger: AnimationTrigger
  // Preset animation
  preset: AnimationPreset
  // Timing
  duration: number // in milliseconds
  delay: number // in milliseconds
  easing: AnimationEasing
  // Trigger-specific options
  // For hover trigger
  reverseOnHoverOut?: boolean
  // For in-view trigger
  scrollOffset?: number // 0-100 percentage of viewport
  repeatOnScroll?: boolean // repeat animation when re-entering viewport
}
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type DividerStyle = 'line' | 'dashed' | 'dotted' | 'space'
export type IconShape = 'none' | 'circle' | 'square'
export type MediaPosition = 'left' | 'right'

// Spacing helper
export interface Spacing {
  top?: string
  bottom?: string
  left?: string
  right?: string
}

// Simple Y/X spacing (for backwards compatibility)
export interface SpacingYX {
  y: string
  x: string
}

// Border style
export interface BorderStyle {
  width?: string
  color?: string
  radius?: string
  style?: 'solid' | 'dashed' | 'dotted'
  sides?: string // comma-separated: "top,right,bottom,left"
}

// Shadow style
export interface ShadowStyle {
  enabled?: boolean
  x?: string
  y?: string
  blur?: string
  color?: string
}

// ============================================
// SHARED BLOCK SETTINGS
// ============================================

// Settings available on most blocks
export interface SharedBlockSettings {
  // Visibility
  isHidden?: boolean
  hideOnDesktop?: boolean
  hideOnTablet?: boolean
  hideOnMobile?: boolean
  // Animation
  animation?: AnimationType
  animationDelay?: string
  // Custom
  customClass?: string
  anchorId?: string
  // List/Collection: when true, styles won't sync with sibling items
  overwriteStyle?: boolean
  // Grid item placement (when inside a grid)
  gridColumn?: string // e.g., "1", "1 / 3", "span 2"
  gridRow?: string // e.g., "1", "1 / 3", "span 2"
  gridColumnSpan?: number // shorthand for span
  gridRowSpan?: number // shorthand for span
}

// ============================================
// VIEWPORT TYPES
// ============================================

export type ViewportSize = 'desktop' | 'tablet' | 'mobile'

// ============================================
// BASE BLOCK STYLES
// ============================================

// Mix blend mode types
export type MixBlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity'

// Core style properties (can be overridden per viewport)
export interface CoreBlockStyles {
  // Spacing
  padding?: Spacing
  margin?: Spacing
  // Background
  backgroundColor?: string
  backgroundImage?: string
  backgroundPosition?: string
  backgroundSize?: string
  // Border
  border?: BorderStyle
  // Shadow
  shadow?: ShadowStyle
  // Opacity & Blend
  opacity?: string // 0-100
  mixBlendMode?: MixBlendMode
  // Flex child properties (when inside Stack/Container)
  flexGrow?: string // '0', '1', etc.
  flexShrink?: string // '0', '1', etc.
  flexBasis?: string // 'auto', '100px', '50%', etc.
}

export interface BaseBlockStyles extends CoreBlockStyles {
  // Animation (not responsive - same across all viewports)
  animation?: AnimationSettings
  // Responsive overrides (inherit from desktop → tablet → mobile)
  tablet?: Partial<CoreBlockStyles>
  mobile?: Partial<CoreBlockStyles>
}

// ============================================
// HEADER BLOCK
// ============================================

export interface HeaderNavLink {
  id: string
  label: string
  url: string
}

export interface HeaderSettings extends SharedBlockSettings {
  // Legacy settings (kept for backwards compatibility)
  logo?: string
  logoAlt?: string
  navLinks?: HeaderNavLink[]
  ctaButton?: {
    label: string
    url: string
    show: boolean
  }
  isHidden: boolean
  sticky: boolean // Make sticky toggle (default true)
  // Layout settings (same as Stack/Container)
  height?: string // Min height
  gap?: string
  // Background (same as Container/Stack)
  backgroundType?: 'color' | 'image' | 'video'
  backgroundImage?: string
  backgroundVideo?: string
}

export interface HeaderStyles extends BaseBlockStyles {
  alignment?: Alignment
  // Flexbox content positioning (row only)
  justifyContent?: JustifyContent
  alignItems?: AlignItems
  gap?: string
}

// ============================================
// FOOTER BLOCK
// ============================================

export interface FooterLink {
  id: string
  label: string
  url: string
}

export type SocialPlatform = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'tiktok' | 'github' | 'discord' | 'dribbble' | 'behance' | 'medium' | 'threads'

export interface FooterSocialLink {
  id: string
  platform: SocialPlatform
  url: string
}

export interface FooterSettings extends SharedBlockSettings {
  // Legacy settings (kept for backwards compatibility)
  links?: FooterLink[]
  copyrightText?: string
  socialLinks?: FooterSocialLink[]
  isHidden: boolean
  // Layout settings (same as Stack/Container)
  height?: string // Min height
  gap?: string
  // Background (same as Container/Stack)
  backgroundType?: 'color' | 'image' | 'video'
  backgroundImage?: string
  backgroundVideo?: string
}

export interface FooterStyles extends BaseBlockStyles {
  alignment?: Alignment
  // Flexbox content positioning (row only)
  justifyContent?: JustifyContent
  alignItems?: AlignItems
  gap?: string
}

// ============================================
// LAYOUT BLOCKS
// ============================================

// Container
export interface ContainerSettings extends SharedBlockSettings {
  maxWidth?: string
  height?: string
  // Background
  backgroundType?: 'color' | 'image' | 'video'
  backgroundImage?: string
  backgroundVideo?: string
}

export interface ContainerStyles extends BaseBlockStyles {
  alignment?: Alignment
  // Flexbox content positioning
  flexDirection?: FlexDirection
  justifyContent?: JustifyContent
  alignItems?: AlignItems
  flexWrap?: FlexWrap
  gap?: string
}

// Grid
export interface GridSettings extends SharedBlockSettings {
  columns: number // 1-12
  tabletColumns?: number
  mobileColumns?: number
  gap: string
  rowGap?: string
  height?: string
  // Custom column widths as fr values (e.g., [1, 2, 1] for 1fr 2fr 1fr)
  columnWidths?: number[]
  rows?: number // number of rows for explicit grid
  rowHeights?: number[] // custom row heights as fr values
  collectionType?: ListCollectionType
  collectionLevel?: number
  // Background
  backgroundType?: 'color' | 'image' | 'video'
  backgroundImage?: string
  backgroundVideo?: string
  // Slider mode
  isSlider?: boolean
  slidesPerView?: number // 1-4
  autoplay?: boolean
  autoplayInterval?: number // ms (3000-10000)
  showArrows?: boolean
  showDots?: boolean
  loop?: boolean
}

export interface GridStyles extends BaseBlockStyles {
  horizontalAlign?: Alignment
  verticalAlign?: VerticalAlignment
  // Grid content positioning
  justifyItems?: 'start' | 'center' | 'end' | 'stretch'
  alignItems?: AlignItems
}

// Stack
export interface StackSettings extends SharedBlockSettings {
  gap: string
  direction?: 'horizontal' | 'vertical'
  align?: 'start' | 'center' | 'end' | 'stretch'
  height?: string
  // Background
  backgroundType?: 'color' | 'image' | 'video'
  backgroundImage?: string
  backgroundVideo?: string
}

export interface StackStyles extends BaseBlockStyles {
  alignment?: Alignment
  // Flexbox content positioning
  justifyContent?: JustifyContent
  alignItems?: AlignItems
  flexWrap?: FlexWrap
}

// Divider
export interface DividerSettings extends SharedBlockSettings {
  style: DividerStyle
  thickness?: string
  color?: string
  width?: string // percentage
}

export interface DividerStyles extends BaseBlockStyles {
  alignment?: Alignment
}

// ============================================
// CONTENT BLOCKS
// ============================================

// Heading
export interface HeadingSettings extends SharedBlockSettings {
  content: string
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export interface HeadingStyles extends BaseBlockStyles {
  fontSize?: FontSize
  fontWeight?: FontWeight
  fontFamily?: string
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline' | 'line-through'
  color?: string
  lineHeight?: string
  letterSpacing?: string
  alignment?: Alignment
}

// Text
export interface TextSettings extends SharedBlockSettings {
  content: string // Rich text HTML
  maxWidth?: string
}

export interface TextStyles extends BaseBlockStyles {
  fontSize?: FontSize
  fontWeight?: FontWeight
  fontFamily?: string
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline' | 'line-through'
  color?: string
  lineHeight?: string
  letterSpacing?: string
  alignment?: Alignment
}

// Image
export interface ImageSettings extends SharedBlockSettings {
  src: string
  alt: string
  caption?: string
  captionPosition?: 'below' | 'overlay'
  linkUrl?: string
  linkNewTab?: boolean
}

export interface ImageStyles extends BaseBlockStyles {
  width?: string
  height?: string
  objectFit?: ObjectFit
  borderRadius?: string
  mask?: MaskShape
  aspectRatio?: AspectRatio
}

// Video
export interface VideoSettings extends SharedBlockSettings {
  src: string // YouTube, Vimeo, or file URL
  thumbnail?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
}

export interface VideoStyles extends BaseBlockStyles {
  aspectRatio?: AspectRatio
  maxWidth?: string
  borderRadius?: string
  mask?: MaskShape
}

// Button
export interface ButtonSettings extends SharedBlockSettings {
  label: string
  url: string
  newTab?: boolean
  variant: ButtonVariant
  size: ButtonSize
  iconLeft?: string
  iconRight?: string
  fullWidth?: boolean
}

export interface ButtonStyles extends BaseBlockStyles {
  backgroundColor?: string
  textColor?: string
  hoverBackgroundColor?: string
  hoverTextColor?: string
  borderRadius?: string
  fontSize?: FontSize
  lineHeight?: string
  letterSpacing?: string
}

// Icon
export interface IconSettings extends SharedBlockSettings {
  icon: string // Icon name from library
  size: string
  linkUrl?: string
  linkNewTab?: boolean
}

export interface IconStyles extends BaseBlockStyles {
  color?: string
  backgroundColor?: string
  backgroundShape?: IconShape
  backgroundPadding?: string
}

// ============================================
// VARIANTS BLOCK (Shopify-style Product Variants)
// ============================================

// Option type (e.g., "Color", "Size") with its possible values
export interface VariantOptionType {
  id: string
  name: string // e.g., "Color", "Size", "Material"
  displayStyle: 'buttons' | 'swatches' | 'dropdown' // How to display this option
  values: VariantOptionValue[] // The available values for this option
}

// A single value within an option type (e.g., "Red" for Color, "M" for Size)
export interface VariantOptionValue {
  id: string
  value: string // e.g., "Red", "M", "Cotton"
  colorHex?: string // For color swatches
}

// A variant combination (e.g., Red + M = one specific variant)
export interface ProductVariant {
  id: string
  optionValues: Record<string, string> // { "Color": "Red", "Size": "M" }
  price: string // Price for this combination
  image?: string // Image for this combination
  buyLink: string // Purchase URL for this combination
}

// Variants block settings
export interface VariantsSettings extends SharedBlockSettings {
  optionTypes: VariantOptionType[] // The option types (Color, Size, etc.)
  variants: ProductVariant[] // All variant combinations with prices/links
}

// Variants block styles
export interface VariantsStyles extends BaseBlockStyles {
  optionSize?: 'sm' | 'md' | 'lg'
  gap?: string
  alignment?: Alignment
}

// ============================================
// FORM BLOCK & FORM FIELD BLOCKS
// ============================================

// Form input type (for form-input block)
export type FormInputType = 'text' | 'email' | 'phone' | 'number' | 'date' | 'password' | 'url'

// Form container settings (same as Container/Stack/Grid)
export interface FormSettings extends SharedBlockSettings {
  // Form submission
  successMessage: string
  errorMessage?: string
  // Integration binding
  integrationId?: string
  integrationProvider?: string
  // Layout
  gap?: string
  height?: string // Min height: auto, 25vh, 50vh, 75vh, 100vh
  // Background (same as Container/Stack/Grid)
  backgroundType?: 'color' | 'image' | 'video'
  backgroundImage?: string
  backgroundVideo?: string
}

export interface FormStyles extends BaseBlockStyles {
  gap?: string
  // Flexbox content positioning (same as Container/Stack)
  flexDirection?: FlexDirection
  justifyContent?: JustifyContent
  alignItems?: AlignItems
  flexWrap?: FlexWrap
  alignment?: Alignment
}

// ============================================
// FORM FIELD BLOCK SETTINGS
// ============================================

// Base settings shared by all form fields
export interface BaseFormFieldSettings extends SharedBlockSettings {
  label: string
  name: string // Field name for form submission
  required: boolean
  width?: '50' | '100' // Percentage width
}

// Form Input (text, email, phone, number, date, etc.)
export interface FormInputSettings extends BaseFormFieldSettings {
  inputType: FormInputType
  placeholder?: string
  minLength?: number
  maxLength?: number
}

export interface FormInputStyles extends BaseBlockStyles {
  borderRadius?: string
  // Text-like style settings (same as Text block)
  fontSize?: FontSize
  color?: string
  labelColor?: string
  lineHeight?: string
  letterSpacing?: string
}

// Form Textarea
export interface FormTextareaSettings extends BaseFormFieldSettings {
  placeholder?: string
  rows?: number
  minLength?: number
  maxLength?: number
}

export interface FormTextareaStyles extends BaseBlockStyles {
  borderRadius?: string
  // Text-like style settings (same as Text block)
  fontSize?: FontSize
  color?: string
  labelColor?: string
  lineHeight?: string
  letterSpacing?: string
}

// Form Select (Dropdown)
export interface FormSelectOption {
  id: string
  label: string
  value: string
}

export interface FormSelectSettings extends BaseFormFieldSettings {
  placeholder?: string
  options: FormSelectOption[]
}

export interface FormSelectStyles extends BaseBlockStyles {
  borderRadius?: string
  // Text-like style settings (same as Text block)
  fontSize?: FontSize
  color?: string
  labelColor?: string
  lineHeight?: string
  letterSpacing?: string
}

// Form Radio
export interface FormRadioSettings extends BaseFormFieldSettings {
  options: FormSelectOption[]
  layout?: 'vertical' | 'horizontal'
}

export interface FormRadioStyles extends BaseBlockStyles {
  // Text-like style settings (same as Text block)
  fontSize?: FontSize
  color?: string
  labelColor?: string
  lineHeight?: string
  letterSpacing?: string
}

// Form Checkbox
export interface FormCheckboxSettings extends BaseFormFieldSettings {
  options: FormSelectOption[]
  layout?: 'vertical' | 'horizontal'
}

export interface FormCheckboxStyles extends BaseBlockStyles {
  // Text-like style settings (same as Text block)
  fontSize?: FontSize
  color?: string
  labelColor?: string
  lineHeight?: string
  letterSpacing?: string
}

// Form Button (submit) - same style options as Button content block
export interface FormButtonSettings extends SharedBlockSettings {
  label: string
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  alignment?: Alignment
}

export interface FormButtonStyles extends BaseBlockStyles {
  // Same style options as Button content block
  backgroundColor?: string
  textColor?: string
  hoverBackgroundColor?: string
  hoverTextColor?: string
  borderRadius?: string
  fontSize?: FontSize
  lineHeight?: string
  letterSpacing?: string
}

// ============================================
// CANVAS BLOCK
// ============================================

// Canvas child position (absolute positioning data)
export interface CanvasChildPosition {
  x: number // Percentage from left (0-100)
  y: number // Percentage from top (0-100)
  width?: number // Percentage width (optional, defaults to auto)
  height?: number // Percentage height (optional, defaults to auto)
  zIndex?: number // Layer order
}

// Responsive child positions for Canvas (per-viewport)
export interface ResponsiveCanvasChildPositions {
  desktop: Record<string, CanvasChildPosition>
  tablet?: Record<string, CanvasChildPosition>
  mobile?: Record<string, CanvasChildPosition>
}

// Canvas block settings
export interface CanvasSettings extends SharedBlockSettings {
  // Background
  backgroundType?: 'color' | 'image' | 'video'
  backgroundImage?: string
  backgroundVideo?: string
  // Size
  minHeight?: string // e.g., '100vh', '600px'
  aspectRatio?: AspectRatio
  // Child positions (responsive - per viewport)
  childPositions: ResponsiveCanvasChildPositions
}

export interface CanvasStyles extends BaseBlockStyles {
  // Canvas doesn't have many additional styles
  // Children inherit their own styles
}

// ============================================
// SECTION BLOCK (UNIFIED)
// ============================================

export interface SectionBlock {
  id: string
  type: SectionBlockType
  name: string

  // Nested blocks (for layout blocks like container, grid, stack, form)
  children?: SectionBlock[]

  // Block-specific settings
  settings:
    | HeaderSettings
    | FooterSettings
    | ContainerSettings
    | GridSettings
    | StackSettings
    | DividerSettings
    | HeadingSettings
    | TextSettings
    | ImageSettings
    | VideoSettings
    | ButtonSettings
    | IconSettings
    // Variants block settings
    | VariantsSettings
    | FormSettings
    // Form field block settings
    | FormInputSettings
    | FormTextareaSettings
    | FormSelectSettings
    | FormRadioSettings
    | FormCheckboxSettings
    | FormButtonSettings
    // Canvas block settings
    | CanvasSettings

  // Block-specific styles
  styles:
    | HeaderStyles
    | FooterStyles
    | ContainerStyles
    | GridStyles
    | StackStyles
    | DividerStyles
    | HeadingStyles
    | TextStyles
    | ImageStyles
    | VideoStyles
    | ButtonStyles
    | IconStyles
    // Variants block styles
    | VariantsStyles
    | FormStyles
    // Form field block styles
    | FormInputStyles
    | FormTextareaStyles
    | FormSelectStyles
    | FormRadioStyles
    | FormCheckboxStyles
    | FormButtonStyles
    // Canvas block styles
    | CanvasStyles
}

// ============================================
// PAGE SETTINGS
// ============================================

export type UseCaseCategory =
  | 'music'
  | 'restaurant'
  | 'event'
  | 'portfolio'
  | 'business'
  | 'personal'
  | 'ecommerce'
  | 'saas'

export interface CustomFont {
  id: string
  name: string
  url: string // URL to the font file
}

export interface GoogleFont {
  family: string
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace'
  variants: string[]
}

export interface PageSettings {
  // Background
  backgroundColor?: string
  backgroundImage?: string
  // Typography defaults
  fontFamily?: string
  textColor?: string
  baseFontSize?: string // Base font size (default 16px)
  customFonts?: CustomFont[] // User-uploaded custom fonts
  googleFonts?: GoogleFont[] // Selected Google Fonts
  // Layout
  maxWidth?: string
  marginX?: string // Horizontal margin
  marginY?: string // Vertical margin
  padding?: SpacingYX // Kept for backward compatibility
  sectionGap?: string
  // Metadata
  useCase?: UseCaseCategory
  layoutId?: string
  // Custom code (Pro plan only)
  customCSS?: string // Custom CSS styles
  customHeaderScript?: string // Custom script in <head>
  customFooterScript?: string // Custom script before </body>
}

// ============================================
// THEME
// ============================================

export interface Theme {
  id: string
  name: string
  description: string
  preview: string // Color or image for thumbnail
  pageSettings: PageSettings
  blocks: SectionBlock[]
}

// ============================================
// TRANSLATIONS
// ============================================

// Supported language codes (ISO 639-1)
export type LanguageCode =
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'nl' | 'ru'
  | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'pl' | 'sv' | 'da'
  | 'no' | 'fi' | 'tr' | 'cs' | 'el' | 'he' | 'th' | 'vi'
  | 'id' | 'ms' | 'uk' | 'ro' | 'hu' | 'ca'

// Language display info
export interface LanguageInfo {
  code: LanguageCode
  name: string
  nativeName: string
  flag: string // emoji flag
}

// Translatable content fields per block type
// Only content fields are translated, not structural/style settings
export interface BlockTranslation {
  // Heading
  content?: string
  // Image
  alt?: string
  caption?: string
  // Video
  // (no translatable fields besides potential captions)
  // Button
  label?: string
  // Header nav links
  navLinks?: Array<{ id: string; label: string }>
  // Header CTA
  ctaButtonLabel?: string
  // Footer
  copyrightText?: string
  footerLinks?: Array<{ id: string; label: string }>
  // Form
  submitLabel?: string
  successMessage?: string
  errorMessage?: string
  // Email Capture
  placeholder?: string
  buttonLabel?: string
  // Contact Form
  // (uses submitLabel, successMessage)
}

// All translations for a single language
export interface LanguageTranslations {
  // Map of blockId -> translated content
  blocks: Record<string, BlockTranslation>
}

// Project translations structure
export interface ProjectTranslations {
  // Default language code
  defaultLanguage: LanguageCode
  // Map of languageCode -> translations (partial - only contains languages that have been added)
  languages: Partial<Record<LanguageCode, LanguageTranslations>>
}

// ============================================
// EDITOR STATE
// ============================================

export interface EditorState {
  blocks: SectionBlock[]
  pageSettings: PageSettings
  selectedBlockId: string | null
  selectedItemId: string | null // For nested blocks
  translations?: ProjectTranslations
  currentLanguage?: LanguageCode
}
