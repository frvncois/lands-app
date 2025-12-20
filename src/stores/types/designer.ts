/**
 * Editor Types
 *
 * Complete type definitions for the page builder blocks system.
 */

// ============================================
// SECTION BLOCK TYPES
// ============================================

export type SectionBlockType =
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
  // Product-specific
  | 'variants'


// Canvas child block types (blocks that can be placed in Canvas)
export type CanvasChildBlockType =
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'icon'

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
  // Size
  width?: string
  height?: string
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

// Button (rendered as <a> wrapper with container-like options)
export interface ButtonSettings extends SharedBlockSettings {
  label: string
  url: string
  newTab?: boolean
  iconLeft?: string
  iconRight?: string
}

export interface ButtonStyles extends BaseBlockStyles {
  backgroundColor?: string
  textColor?: string
  color?: string
  hoverBackgroundColor?: string
  hoverTextColor?: string
  fontSize?: FontSize
  fontWeight?: FontWeight
  lineHeight?: string
  letterSpacing?: string
  textAlign?: Alignment
  // Flexbox properties (like container)
  flexDirection?: FlexDirection
  justifyContent?: JustifyContent
  alignItems?: AlignItems
  gap?: string
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
  width?: string
  height?: string
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

  // Nested blocks (for layout blocks like container, grid, stack)
  children?: SectionBlock[]

  // Block-specific settings
  settings:
    | HeaderSettings
    | FooterSettings
    | ContainerSettings
    | GridSettings
    | StackSettings
    | HeadingSettings
    | TextSettings
    | ImageSettings
    | VideoSettings
    | ButtonSettings
    | IconSettings
    | VariantsSettings
    | CanvasSettings

  // Block-specific styles
  styles:
    | HeaderStyles
    | FooterStyles
    | ContainerStyles
    | GridStyles
    | StackStyles
    | HeadingStyles
    | TextStyles
    | ImageStyles
    | VideoStyles
    | ButtonStyles
    | IconStyles
    | VariantsStyles
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

export interface DesignerState {
  blocks: SectionBlock[]
  pageSettings: PageSettings
  selectedBlockId: string | null
  selectedItemId: string | null // For nested blocks
  translations?: ProjectTranslations
  currentLanguage?: LanguageCode
}
