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
  | 'form-label'
  | 'form-input'
  | 'form-textarea'
  | 'form-select'
  | 'form-radio'
  | 'form-checkbox'
  | 'form-button'

// Form field block types (subset of SectionBlockType)
export type FormFieldBlockType =
  | 'form-label'
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
// FontSize and LineHeight accept CSS values (e.g., '16px', '1.5', '2rem')
export type FontSize = string
export type LineHeight = string
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

// Gradient style
export interface GradientStop {
  color: string
  position: number  // 0-100
}

export interface GradientStyle {
  type: 'linear' | 'radial'
  angle?: number  // 0-360 for linear
  stops: GradientStop[]
}

// ============================================
// EFFECTS SYSTEM
// ============================================

// Easing options including expressive curves
export type EffectEasing =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  // Quad
  | 'ease-in-quad'
  | 'ease-out-quad'
  | 'ease-in-out-quad'
  // Cubic
  | 'ease-in-cubic'
  | 'ease-out-cubic'
  | 'ease-in-out-cubic'
  // Quart
  | 'ease-in-quart'
  | 'ease-out-quart'
  | 'ease-in-out-quart'
  // Expo
  | 'ease-in-expo'
  | 'ease-out-expo'
  | 'ease-in-out-expo'
  // Back (overshoot)
  | 'ease-in-back'
  | 'ease-out-back'
  | 'ease-in-out-back'
  // Elastic & Bounce
  | 'ease-out-elastic'
  | 'ease-out-bounce'

// Transform origin positions
export type TransformOrigin =
  | 'center'
  | 'top'
  | 'top-right'
  | 'right'
  | 'bottom-right'
  | 'bottom'
  | 'bottom-left'
  | 'left'
  | 'top-left'

// Effect preset names for quick setup
export type EffectPreset =
  // Fade
  | 'fade-in'
  | 'fade-out'
  // Slide
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  // Zoom
  | 'zoom-in'
  | 'zoom-out'
  // Flip (3D)
  | 'flip-x'
  | 'flip-y'
  // Rotate
  | 'rotate-in'
  | 'rotate-out'
  // Bounce
  | 'bounce-in'
  | 'bounce-out'
  // Blur
  | 'blur-in'
  | 'blur-out'
  // Scale
  | 'scale-up'
  | 'scale-down'
  // Combos
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'fade-zoom-in'
  | 'fade-zoom-out'
  // Custom
  | 'custom'

// Base effect state (from/to properties)
export interface EffectState {
  // Opacity (0-100)
  opacity?: number

  // Size
  width?: string
  height?: string

  // Transform - Scale
  scale?: number
  scaleX?: number
  scaleY?: number

  // Transform - Translate
  translateX?: string
  translateY?: string
  translateZ?: string

  // Transform - Rotate (3D)
  rotate?: string    // Z-axis rotation (2D)
  rotateX?: string   // X-axis rotation (3D flip)
  rotateY?: string   // Y-axis rotation (3D flip)

  // Transform - Skew
  skewX?: string
  skewY?: string

  // Filters
  blur?: string
  brightness?: number      // 0-200 (100 = normal)
  contrast?: number        // 0-200 (100 = normal)
  saturate?: number        // 0-200 (100 = normal)
  grayscale?: number       // 0-100
  hueRotate?: number       // 0-360 degrees

  // Backdrop filter (glassmorphism)
  backdropBlur?: string

  // Colors (for color transitions)
  backgroundColor?: string
  color?: string
  borderColor?: string

  // Border
  borderWidth?: string
  borderRadius?: string

  // Spacing
  paddingTop?: string
  paddingRight?: string
  paddingBottom?: string
  paddingLeft?: string
  marginTop?: string
  marginRight?: string
  marginBottom?: string
  marginLeft?: string

  // Box shadow
  shadowX?: string
  shadowY?: string
  shadowBlur?: string
  shadowSpread?: string
  shadowColor?: string
}

// Keyframe for multi-step animations
export interface EffectKeyframe extends EffectState {
  offset: number // 0-100 (percentage through animation)
  easing?: EffectEasing // easing to next keyframe
}

// Stagger configuration for children animations
export interface StaggerConfig {
  enabled?: boolean
  amount?: number      // delay between each child in ms
  from?: 'first' | 'last' | 'center' | 'edges' // stagger direction
  grid?: {             // for grid layouts
    columns?: number
    direction?: 'row' | 'column' | 'diagonal'
  }
}

// Child effect override - allows different effects for specific children
export interface ChildEffectOverride {
  childId: string
  // Override from/to states for this child
  from?: EffectState
  to?: EffectState
  // Override timing for this child
  delay?: number
  duration?: number
  easing?: EffectEasing
  // Preset for this child (overrides from/to)
  preset?: EffectPreset
  // Scroll-specific overrides
  parallax?: {
    enabled?: boolean
    speed?: number
    direction?: 'vertical' | 'horizontal' | 'both'
  }
  horizontal?: {
    enabled?: boolean
    distance?: string
  }
  scrollRange?: {
    start?: number
    end?: number
    relativeTo?: 'page' | 'parent' | 'self'
  }
}

// Base effect configuration
export interface BaseEffect {
  enabled?: boolean

  // Simple from/to animation
  from?: EffectState
  to?: EffectState

  // OR multi-step keyframes (overrides from/to if set)
  keyframes?: EffectKeyframe[]

  // Preset (auto-populates from/to when selected)
  preset?: EffectPreset

  // Timing
  duration?: number // in ms
  delay?: number // in ms
  easing?: EffectEasing

  // Transform settings
  transformOrigin?: TransformOrigin
  perspective?: string // for 3D effects (e.g., "1000px")

  // Children
  applyToChildren?: boolean
  stagger?: StaggerConfig
  // Per-child effect overrides (different effects for specific children)
  childOverrides?: ChildEffectOverride[]

  // Performance hints
  willChange?: boolean // add will-change CSS hint
}

// Hover effect
export interface HoverEffect extends BaseEffect {
  type: 'hover'
}

// Scroll effect with advanced options
export interface ScrollEffect extends BaseEffect {
  type: 'scroll'

  // Trigger point in viewport
  trigger?: 'top' | 'center' | 'bottom'

  // Scrub: link animation directly to scroll position
  scrub?: boolean | number // true or smoothing value in ms

  // Parallax: element moves at different speed than scroll
  parallax?: {
    enabled?: boolean
    speed?: number     // multiplier: 0.5 = half speed, 2 = double speed
    direction?: 'vertical' | 'horizontal' | 'both'
  }

  // Pin: element sticks while scrolling through range
  pin?: {
    enabled?: boolean
    duration?: string  // scroll distance to pin (e.g., "500px", "100vh")
    spacing?: boolean  // add spacing to prevent content jump
  }

  // Horizontal scroll: convert vertical scroll to horizontal movement
  horizontal?: {
    enabled?: boolean
    distance?: string  // how far to move horizontally
  }

  // Scroll range configuration
  scrollRange?: {
    start?: number      // percentage (0-100) when effect starts
    end?: number        // percentage (0-100) when effect ends
    relativeTo?: 'page' | 'parent' | 'self'  // what the percentage is relative to
  }
}

// Appear effect (on page load or when element enters viewport)
export interface AppearEffect extends BaseEffect {
  type: 'appear'

  // Trigger type
  trigger?: 'load' | 'inView'

  // Only animate once (or repeat every time element enters view)
  once?: boolean

  // Threshold: how much of element must be visible (0-1)
  threshold?: number

  // Root margin: trigger earlier/later (e.g., "-100px" triggers 100px before visible)
  rootMargin?: string
}

// Loop effect (continuous animation)
export interface LoopEffect extends BaseEffect {
  type: 'loop'

  // Loop controls
  loop?: boolean          // Enable looping (default true)
  reverse?: boolean       // Reverse animation on each loop (ping-pong)

  // Start trigger
  startTrigger?: 'inView' | 'hover' | 'load'

  // Stop trigger
  stopTrigger?: 'never' | 'outOfView' | 'hover'
}

// Combined effects for a block
export interface BlockEffects {
  hover?: HoverEffect
  scroll?: ScrollEffect
  appear?: AppearEffect
  loop?: LoopEffect
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
  backgroundGradient?: GradientStyle
  // Border
  border?: BorderStyle
  borderRadius?: string
  // Shadow
  shadow?: ShadowStyle
  // Flexbox child properties
  flexGrow?: number | string
  flexShrink?: number | string
  flexBasis?: string
  // Visual effects
  opacity?: number | string
  mixBlendMode?: string
  // Overflow (clips fixed children, respects border-radius via clip-path)
  overflow?: 'visible' | 'hidden'
  // Positioning
  position?: 'relative' | 'absolute' | 'fixed' | 'sticky'
  zIndex?: number | string
  top?: string
  right?: string
  bottom?: string
  left?: string
  // Transform
  rotate?: string
  scale?: string
  translateX?: string
  translateY?: string
  // Filter effects
  blur?: string
}

export interface BaseBlockStyles extends CoreBlockStyles {
  // Animation (not responsive - same across all viewports)
  animation?: AnimationSettings
  // Effects (hover, scroll, appear)
  effects?: BlockEffects
  // Responsive overrides (inherit from desktop → tablet → mobile)
  tablet?: Partial<CoreBlockStyles>
  mobile?: Partial<CoreBlockStyles>
}

// ============================================
// SOCIAL PLATFORM TYPE
// ============================================

export type SocialPlatform = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'tiktok' | 'github' | 'discord' | 'dribbble' | 'behance' | 'medium' | 'threads'

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
  // Background image effects
  backgroundImageOpacity?: number
  backgroundImageBlur?: number
  backgroundImageSaturation?: number
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
  width?: string
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
  // Background image effects
  backgroundImageOpacity?: number
  backgroundImageBlur?: number
  backgroundImageSaturation?: number
}

export interface GridStyles extends BaseBlockStyles {
  horizontalAlign?: Alignment
  verticalAlign?: VerticalAlignment
  // Grid content positioning
  justifyItems?: 'start' | 'center' | 'end' | 'stretch' | 'flex-start' | 'flex-end'
  alignItems?: AlignItems
  // Flexbox properties (shared with other layout blocks)
  flexDirection?: FlexDirection
  justifyContent?: JustifyContent
  flexWrap?: FlexWrap
  gap?: string
  // Size
  width?: string
  height?: string
}

// Stack
export interface StackSettings extends SharedBlockSettings {
  gap: string
  direction?: 'horizontal' | 'vertical'
  align?: 'start' | 'center' | 'end' | 'stretch'
  width?: string
  height?: string
  // Background
  backgroundType?: 'color' | 'image' | 'video'
  backgroundImage?: string
  backgroundVideo?: string
  // Background image effects
  backgroundImageOpacity?: number
  backgroundImageBlur?: number
  backgroundImageSaturation?: number
}

export interface StackStyles extends BaseBlockStyles {
  alignment?: Alignment
  // Flexbox properties
  flexDirection?: FlexDirection
  justifyContent?: JustifyContent
  alignItems?: AlignItems
  flexWrap?: FlexWrap
  gap?: string
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
  color?: string // Alias for textColor (used by inspector)
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
  // Background image effects
  backgroundImageOpacity?: number
  backgroundImageBlur?: number
  backgroundImageSaturation?: number
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

// Form Label (standalone text label)
export interface FormLabelSettings extends SharedBlockSettings {
  content: string
}

export interface FormLabelStyles extends BaseBlockStyles {
  fontSize?: FontSize
  fontWeight?: FontWeight
  color?: string
  textAlign?: Alignment
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
  // Background image effects
  backgroundImageOpacity?: number
  backgroundImageBlur?: number
  backgroundImageSaturation?: number
  // Size
  width?: string
  height?: string
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
  // Background image effects
  backgroundImageOpacity?: number
  backgroundImageBlur?: number
  backgroundImageSaturation?: number
  // Size
  width?: string
  height?: string
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

// Union type for all block styles
export type BlockStyles =
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
  | FormLabelStyles
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

  // Nested blocks (for layout blocks like container, grid, stack, form)
  children?: SectionBlock[]

  // Block-specific settings
  settings:
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
    | FormLabelSettings
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
    | FormLabelStyles
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
  // Smooth scroll (Lenis)
  smoothScroll?: boolean
  // Metadata
  useCase?: UseCaseCategory
  layoutId?: string
  // Custom code (Pro feature)
  customCSS?: string
  customHeaderScript?: string
  customFooterScript?: string
  // Shared styles (style presets for blocks)
  sharedStyles?: SharedStyle[]
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
// COMPONENTS (Reusable block templates)
// ============================================

export interface SavedComponent {
  id: string
  name: string
  // The block template (deep copy of original block with children)
  block: SectionBlock
  // Thumbnail preview (optional, could be generated)
  thumbnail?: string
  // When created
  createdAt: string
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
  components?: SavedComponent[]
}

