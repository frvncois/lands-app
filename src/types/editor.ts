// Block Item Types (removed 'post' as individual item - now handled by PostSection)
export type BlockItemType =
  | 'heading'
  | 'subheading'
  | 'text'
  | 'button'
  | 'image'
  | 'video'
  | 'accordion'

// Section Block Types
export type SectionBlockType =
  | 'header'
  | 'footer'
  | 'hero'
  | 'text'
  | 'text-image'
  | 'text-video'
  | 'video'
  | 'image'
  | 'link'
  | 'post' // Post section displays multiple posts
  | 'product' // Product section displays multiple products
  | 'form' // Form section with integration binding

// Shared Style Types
export type Alignment = 'left' | 'center' | 'right'
export type Orientation = 'vertical' | 'horizontal'
export type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | 'auto'
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold'
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
export type LineHeight = 'tight' | 'normal' | 'relaxed' | 'loose'
export type EffectType = 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'scale-in'
export type PostLayout = 'grid' | 'list' | 'carousel'
export type LinkLayout = 'grid' | 'list'
export type ProductLayout = 'grid' | 'list'

// Spacing (T+B / L+R)
export interface Spacing {
  y: string // top + bottom
  x: string // left + right
}

// Border Style
export interface BorderStyle {
  size: string
  color: string
  radius?: string
}

// Block Item Styles
export interface BlockItemStyles {
  // Position
  align?: Alignment
  margin?: Spacing
  padding?: Spacing

  // Size
  orientation?: Orientation
  aspectRatio?: AspectRatio

  // Text
  fontFamily?: string
  fontWeight?: FontWeight
  textColor?: string
  fontSize?: FontSize
  lineHeight?: LineHeight
  textAlign?: Alignment

  // Border
  border?: BorderStyle

  // Background
  backgroundColor?: string

  // Effect
  effect?: EffectType
}

// Section Block Styles
export interface SectionBlockStyles {
  // Position
  align?: Alignment
  margin?: Spacing
  padding?: Spacing

  // Border
  border?: BorderStyle

  // Background
  backgroundColor?: string

  // Effect
  effect?: EffectType
}

// Post Section Styles (extends SectionBlockStyles with post-specific options)
export interface PostSectionStyles extends SectionBlockStyles {
  layout?: PostLayout
  columns?: number // for grid layout
  gap?: string
}

// Link Section Styles (extends SectionBlockStyles with link-specific options)
export interface LinkSectionStyles extends SectionBlockStyles {
  layout?: LinkLayout
  columns?: number // for grid layout
  gap?: string
}

// Product Section Styles (extends SectionBlockStyles with product-specific options)
export interface ProductSectionStyles extends SectionBlockStyles {
  layout?: ProductLayout
  columns?: number // for grid layout
  gap?: string
}

// Block Item Content Settings
export interface HeadingSettings {
  content: string
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export interface SubheadingSettings {
  content: string
}

export interface TextSettings {
  content: string
}

export interface ButtonSettings {
  title: string
  link: string
  variant: 'primary' | 'secondary' | 'outline'
}

export interface ImageSettings {
  src: string
  alt: string
}

export interface VideoSettings {
  src: string
  poster?: string
  autoplay: boolean
  loop: boolean
  muted: boolean
}

export interface AccordionSettings {
  items: Array<{
    id: string
    title: string
    content: string
  }>
}

export type BlockItemSettings =
  | HeadingSettings
  | SubheadingSettings
  | TextSettings
  | ButtonSettings
  | ImageSettings
  | VideoSettings
  | AccordionSettings

// Block Item
export interface BlockItem {
  id: string
  type: BlockItemType
  settings: BlockItemSettings
  styles: BlockItemStyles
}

// Post Item (individual post within a Post section)
export interface PostItem {
  id: string
  image: string
  heading: string
  text: string
  buttonTitle: string
  buttonLink: string
}

// Post Section Settings
export interface PostSectionSettings {
  posts: PostItem[]
  showImage: boolean
  showHeading: boolean
  showText: boolean
  showButton: boolean
}

// Link Item (individual link within a Link section)
export interface LinkItem {
  id: string
  image: string
  heading: string
  url: string
}

// Link Section Settings
export interface LinkSectionSettings {
  links: LinkItem[]
  showImage: boolean
  showHeading: boolean
}

// Product Item (individual product within a Product section)
export interface ProductItem {
  id: string
  image: string
  heading: string
  subtitle: string
  text: string
  price: string
  buttonTitle: string
  buttonLink: string
}

// Product Section Settings
export interface ProductSectionSettings {
  products: ProductItem[]
  showImage: boolean
  showHeading: boolean
  showSubtitle: boolean
  showText: boolean
  showPrice: boolean
  showButton: boolean
}

// Form field types
export type FormFieldType =
  | 'text'
  | 'email'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'phone'
  | 'number'
  | 'file'

// Individual form field
export interface FormField {
  id: string
  type: FormFieldType
  label: string
  placeholder: string
  required: boolean
  options?: string[] // For select, radio, checkbox
}

// Form Section Settings
export interface FormSectionSettings {
  fields: FormField[]
  submitButtonText: string
  successMessage: string
  integrationId?: string // Link to connected integration
  integrationProvider?: string // e.g., 'mailchimp', 'convertkit'
}

// Header nav link
export interface HeaderNavLink {
  id: string
  label: string
  url: string
}

// Header Section Settings
export interface HeaderSectionSettings {
  logo: string
  logoAlt: string
  navLinks: HeaderNavLink[]
  ctaButton: { label: string; url: string; show: boolean }
  isHidden: boolean // For visibility toggle in inspector
}

// Footer link
export interface FooterLink {
  id: string
  label: string
  url: string
}

// Footer social link
export interface FooterSocialLink {
  id: string
  platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'tiktok' | 'github' | 'discord'
  url: string
}

// Footer Section Settings
export interface FooterSectionSettings {
  links: FooterLink[]
  copyrightText: string
  socialLinks: FooterSocialLink[]
  isHidden: boolean // For visibility toggle in inspector
}

// Section Block
export interface SectionBlock {
  id: string
  type: SectionBlockType
  name: string
  children: BlockItem[]
  styles: SectionBlockStyles | PostSectionStyles | LinkSectionStyles | ProductSectionStyles
  // Post section specific settings
  postSettings?: PostSectionSettings
  // Link section specific settings
  linkSettings?: LinkSectionSettings
  // Product section specific settings
  productSettings?: ProductSectionSettings
  // Form section specific settings
  formSettings?: FormSectionSettings
  // Header section specific settings
  headerSettings?: HeaderSectionSettings
  // Footer section specific settings
  footerSettings?: FooterSectionSettings
}

// Page/Body Settings
export interface PageSettings {
  // Background
  backgroundColor?: string
  backgroundImage?: string

  // Typography defaults
  fontFamily?: string
  textColor?: string

  // Layout
  maxWidth?: string
  padding?: Spacing
}

// Theme definition
export interface Theme {
  id: string
  name: string
  description: string
  preview?: string // Optional preview image/color
  pageSettings: PageSettings
  blocks: SectionBlock[]
}

// Editor State
export interface EditorState {
  blocks: SectionBlock[]
  pageSettings: PageSettings
  selectedBlockId: string | null
  selectedItemId: string | null
}
