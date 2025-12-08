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
  // Content
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'icon'
  | 'divider'
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
}

export interface HeaderStyles extends BaseBlockStyles {
  alignment?: Alignment
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
}

export interface FooterStyles extends BaseBlockStyles {
  alignment?: Alignment
}

// ============================================
// LAYOUT BLOCKS
// ============================================

// Container
export interface ContainerSettings extends SharedBlockSettings {
  maxWidth?: string
  height?: string
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
}

export interface FormStyles extends BaseBlockStyles {
  gap?: string
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
}

// Form Radio
export interface FormRadioSettings extends BaseFormFieldSettings {
  options: FormSelectOption[]
  layout?: 'vertical' | 'horizontal'
}

export interface FormRadioStyles extends BaseBlockStyles {}

// Form Checkbox
export interface FormCheckboxSettings extends BaseFormFieldSettings {
  options: FormSelectOption[]
  layout?: 'vertical' | 'horizontal'
}

export interface FormCheckboxStyles extends BaseBlockStyles {}

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

export interface PageSettings {
  // Background
  backgroundColor?: string
  backgroundImage?: string
  // Typography defaults
  fontFamily?: string
  textColor?: string
  // Layout
  maxWidth?: string
  padding?: SpacingYX
  sectionGap?: string
  // Metadata
  useCase?: UseCaseCategory
  layoutId?: string
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

