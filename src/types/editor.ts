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
  | 'freeform'
  | 'canvas'
  // Content
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'icon'
  | 'divider'
  // E-commerce
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
export type FormFieldBlockType =
  | 'form-input'
  | 'form-textarea'
  | 'form-select'
  | 'form-radio'
  | 'form-checkbox'
  | 'form-button'

// Freeform child block types (blocks that can be placed in Freeform)
export type FreeformChildBlockType =
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'button'

// Canvas child block types (blocks that can be placed in Canvas)
export type CanvasChildBlockType =
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'icon'
  | 'divider'

// Mask shapes for canvas/image blocks
export type MaskShape = 'none' | 'circle' | 'rounded' | 'blob-1' | 'blob-2' | 'blob-3' | 'hexagon' | 'diamond' | 'arch'

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
  // Flexbox child properties
  flexGrow?: number | string
  flexShrink?: number | string
  flexBasis?: string
  // Visual effects
  opacity?: number | string
  mixBlendMode?: string
  // Positioning
  position?: 'relative' | 'absolute' | 'fixed' | 'sticky'
  zIndex?: number | string
  top?: string
  right?: string
  bottom?: string
  left?: string
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
  logo: string
  logoAlt: string
  navLinks: HeaderNavLink[]
  ctaButton: {
    label: string
    url: string
    show: boolean
  }
  isHidden: boolean
  sticky?: boolean
  gap?: string
  height?: string
  backgroundType?: 'color' | 'image' | 'video'
  backgroundImage?: string
  backgroundVideo?: string
}

export interface HeaderStyles extends BaseBlockStyles {
  alignment?: Alignment
  justifyContent?: JustifyContent
  alignItems?: AlignItems
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
  links: FooterLink[]
  copyrightText: string
  socialLinks: FooterSocialLink[]
  isHidden: boolean
  gap?: string
  height?: string
  backgroundType?: 'color' | 'image' | 'video'
  backgroundImage?: string
  backgroundVideo?: string
}

export interface FooterStyles extends BaseBlockStyles {
  alignment?: Alignment
  justifyContent?: JustifyContent
  alignItems?: AlignItems
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

// Grid collection type (for preset grids)
export type GridCollectionType = 'cards' | 'features' | 'logos' | 'testimonials' | 'gallery' | 'pricing' | 'team' | 'faq' | 'menu-list' | 'none'

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
  // Collection metadata (for preset grids)
  collectionType?: GridCollectionType
  collectionLevel?: number // nesting depth for styling sync
  isSlider?: boolean // render as horizontal slider instead of grid
  // Slider settings (when isSlider is true)
  slidesPerView?: number
  loop?: boolean
  autoplay?: boolean
  autoplayInterval?: number
  showArrows?: boolean
  showDots?: boolean
  // Background
  backgroundType?: 'color' | 'image' | 'video'
  backgroundImage?: string
  backgroundVideo?: string
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
  spans?: Record<string, InlineSpan> // Styled spans within the heading
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

// Inline Span (for styled text spans within text/heading blocks)
export interface SpanStyles {
  color?: string
  backgroundColor?: string
  fontWeight?: FontWeight
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline' | 'line-through'
  fontSize?: FontSize
  fontFamily?: string
  letterSpacing?: string
  // Border/background effects
  padding?: string
  borderRadius?: string
  border?: BorderStyle
  // Opacity
  opacity?: string
  mixBlendMode?: string
}

export interface InlineSpan {
  id: string
  name: string
  styles: SpanStyles
  interactionIds?: string[] // References to interactions where this span is a trigger/target
}

// Text
export interface TextSettings extends SharedBlockSettings {
  content: string // Rich text HTML
  maxWidth?: string
  spans?: Record<string, InlineSpan> // Styled spans within the text
}

export interface TextStyles extends BaseBlockStyles {
  fontSize?: FontSize
  fontFamily?: string
  fontWeight?: FontWeight
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
  aspectRatio?: AspectRatio | '3:2' | '2:3'
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
  color?: string // Alias for textColor (used by inspector)
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
// FORM BLOCK & FORM FIELD BLOCKS
// ============================================

// Form input type (for form-input block)
export type FormInputType = 'text' | 'email' | 'phone' | 'number' | 'date' | 'password' | 'url'

// Form container settings
export interface FormSettings extends SharedBlockSettings {
  // Form submission
  successMessage: string
  errorMessage?: string
  // Integration binding
  integrationId?: string
  integrationProvider?: string
  // Layout
  gap?: string
  height?: string
  // Background
  backgroundType?: 'color' | 'image' | 'video'
  backgroundImage?: string
  backgroundVideo?: string
}

export interface FormStyles extends BaseBlockStyles {
  gap?: string
  flexDirection?: FlexDirection
  justifyContent?: JustifyContent
  alignItems?: AlignItems
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
  fontSize?: FontSize
  color?: string
  labelColor?: string
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
  fontSize?: FontSize
  color?: string
  labelColor?: string
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
  fontSize?: FontSize
  color?: string
  labelColor?: string
}

// Form Radio
export interface FormRadioSettings extends BaseFormFieldSettings {
  options: FormSelectOption[]
  layout?: 'vertical' | 'horizontal'
}

export interface FormRadioStyles extends BaseBlockStyles {
  fontSize?: FontSize
  color?: string
  labelColor?: string
}

// Form Checkbox
export interface FormCheckboxSettings extends BaseFormFieldSettings {
  options: FormSelectOption[]
  layout?: 'vertical' | 'horizontal'
}

export interface FormCheckboxStyles extends BaseBlockStyles {
  fontSize?: FontSize
  color?: string
  labelColor?: string
}

// Form Button (submit)
export interface FormButtonSettings extends SharedBlockSettings {
  label: string
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  alignment?: Alignment
}

export interface FormButtonStyles extends BaseBlockStyles {
  borderRadius?: string
  textColor?: string
  fontSize?: FontSize
  letterSpacing?: string
}

// ============================================
// FREEFORM BLOCK
// ============================================

// Freeform child position (absolute positioning data)
export interface FreeformChildPosition {
  x: number // Percentage from left (0-100)
  y: number // Percentage from top (0-100)
  width?: number // Percentage width (optional, defaults to auto)
  height?: number // Percentage height (optional, defaults to auto)
  zIndex?: number // Layer order
}

// Responsive child positions for Freeform (per-viewport)
export interface ResponsiveFreeformChildPositions {
  desktop: Record<string, FreeformChildPosition>
  tablet?: Record<string, FreeformChildPosition>
  mobile?: Record<string, FreeformChildPosition>
}

// Freeform block settings
export interface FreeformSettings extends SharedBlockSettings {
  // Background
  backgroundType?: 'color' | 'image' | 'video'
  backgroundImage?: string
  backgroundVideo?: string
  // Size
  minHeight?: string // e.g., '100vh', '600px'
  aspectRatio?: AspectRatio
  // Child positions (responsive - per viewport)
  childPositions: ResponsiveFreeformChildPositions
}

export interface FreeformStyles extends BaseBlockStyles {
  // Freeform doesn't have many additional styles
  // Children inherit their own styles
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
  // Canvas styles
}

// ============================================
// VARIANTS BLOCK (E-COMMERCE)
// ============================================

// Variant option display style
export type VariantDisplayStyle = 'buttons' | 'swatches' | 'dropdown'

// Single option value
export interface VariantOptionValue {
  id: string
  value: string
  colorHex?: string // For color swatches
}

// Option type (e.g., Color, Size)
export interface VariantOptionType {
  id: string
  name: string
  displayStyle: VariantDisplayStyle
  values: VariantOptionValue[]
}

// Product variant
export interface ProductVariant {
  id: string
  optionValues: Record<string, string> // { "Color": "Red", "Size": "M" }
  price: string
  buyLink: string
  image?: string
}

// Variants block settings
export interface VariantsSettings extends SharedBlockSettings {
  optionTypes: VariantOptionType[]
  variants: ProductVariant[]
  // Index signature for compatibility with updateBlockSettings
  [key: string]: unknown
}

export interface VariantsStyles extends BaseBlockStyles {
  // Variants styles
  optionSize?: 'sm' | 'md' | 'lg'
  gap?: string
}

// ============================================
// GOOGLE FONTS
// ============================================

export interface GoogleFont {
  family: string
  category: string
  variants: string[]
}

// Custom font (user uploaded)
export interface CustomFont {
  id: string
  name: string
  url: string
}

// ============================================
// SHARED STYLES
// ============================================

export interface SharedStyle {
  id: string
  name: string
  blockType: SectionBlockType
  // Styles and settings to apply (excludes content fields)
  styles: BlockStyles
  settings: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// ============================================
// INTERACTIONS
// ============================================

// Trigger types for interactions
export type InteractionTrigger = 'hover' | 'click' | 'load' | 'appear'

// Effect types for interactions
export type InteractionEffect = 'transition' | 'animation'

// Easing options for interactions
export type InteractionEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring'

// Style properties that can be animated in interactions
export interface InteractionStyles {
  // Background
  backgroundColor?: string
  // Border
  border?: BorderStyle
  // Visual effects
  opacity?: number | string
  shadow?: ShadowStyle
  // Transform
  transform?: string
  scale?: string
  rotate?: string
  translateX?: string
  translateY?: string
  // Spacing
  padding?: Spacing
  margin?: Spacing
  // Typography (for text blocks)
  color?: string
  fontSize?: string
  // Dimensions
  width?: string
  height?: string
}

// Single interaction definition
export interface Interaction {
  id: string
  name: string

  // Trigger configuration
  trigger: InteractionTrigger
  triggerBlockId: string      // Block that triggers the interaction

  // Target configuration
  targetBlockId: string       // Block that receives style changes (can be same or different)

  // Effect configuration
  effectType: InteractionEffect
  duration: string            // e.g., '300ms', '0.5s'
  easing: InteractionEasing
  delay?: string              // e.g., '100ms'

  // Style changes to apply when triggered
  styles: InteractionStyles

  // Metadata
  createdAt: string
  updatedAt: string
}

// Union type for all block styles
export type BlockStyles =
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
  | FormStyles
  | FormInputStyles
  | FormTextareaStyles
  | FormSelectStyles
  | FormRadioStyles
  | FormCheckboxStyles
  | FormButtonStyles
  | FreeformStyles
  | CanvasStyles
  | VariantsStyles

// ============================================
// SECTION BLOCK (UNIFIED)
// ============================================

export interface SectionBlock {
  id: string
  type: SectionBlockType
  name: string

  // Shared style reference (for style syncing)
  sharedStyleId?: string

  // Interaction references (for blocks that trigger interactions)
  interactionIds?: string[]

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
    | FormSettings
    // Form field block settings
    | FormInputSettings
    | FormTextareaSettings
    | FormSelectSettings
    | FormRadioSettings
    | FormCheckboxSettings
    | FormButtonSettings
    // Freeform block settings
    | FreeformSettings
    // Canvas block settings
    | CanvasSettings
    // Variants block settings
    | VariantsSettings

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
    | FormStyles
    // Form field block styles
    | FormInputStyles
    | FormTextareaStyles
    | FormSelectStyles
    | FormRadioStyles
    | FormCheckboxStyles
    | FormButtonStyles
    // Freeform block styles
    | FreeformStyles
    // Canvas block styles
    | CanvasStyles
    // Variants block styles
    | VariantsStyles
}

// ============================================
// PAGE SETTINGS
// ============================================

export type UseCaseCategory =
  | 'personal'      // Personal & Bio
  | 'links'         // Links & Social
  | 'portfolio'     // Portfolio & Work
  | 'services'      // Services & Freelance
  | 'startup'       // Startup & Business
  | 'product'       // Product & Launch
  | 'event'         // Event & Conference
  | 'restaurant'    // Restaurant & Menu
  | 'creator'       // Creator & Artist
  | 'newsletter'    // Newsletter & Signup
  | 'wedding'       // Wedding & Celebration
  | 'nonprofit'     // Nonprofit & Cause

export interface PageSettings {
  // Background
  backgroundColor?: string
  backgroundImage?: string
  // Typography defaults
  fontFamily?: string
  headingFontFamily?: string
  textColor?: string
  baseFontSize?: FontSize | string // Can be FontSize type or pixel value string
  // Fonts
  customFonts?: CustomFont[]
  googleFonts?: GoogleFont[]
  // Color palette
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  // Layout
  maxWidth?: string
  padding?: SpacingYX
  sectionGap?: string
  // Style settings (from wizard)
  layoutStyleId?: string
  stylePresetId?: string
  // Metadata
  useCase?: UseCaseCategory
  layoutId?: string
  // Custom code (Pro feature)
  customCSS?: string
  customHeaderScript?: string
  customFooterScript?: string
  // Shared styles (style presets for blocks)
  sharedStyles?: SharedStyle[]
  // Interactions (hover/click/load/appear effects)
  interactions?: Interaction[]
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
  // Heading/Text
  content?: string
  // Image/Video source (URL)
  source?: string
  // Image
  alt?: string
  caption?: string
  attribution?: string
  // Video
  // (no translatable fields besides potential captions)
  // Button
  label?: string
  // Header nav links
  navLinks?: Array<{ id: string; label?: string }>
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

