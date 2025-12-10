import type {
  SectionBlock,
  SectionBlockType,
  BlockCategory,
  PageSettings,
  SpacingYX,
  CanvasChildBlockType,
  MaskShape,
  // Shared types
  SocialPlatform,
  // Settings types
  HeaderSettings,
  HeaderNavLink,
  FooterSettings,
  FooterLink,
  FooterSocialLink,
  ContainerSettings,
  GridSettings,
  StackSettings,
  DividerSettings,
  HeadingSettings,
  TextSettings,
  ImageSettings,
  VideoSettings,
  ButtonSettings,
  IconSettings,
  VariantsSettings,
  FormSettings,
  FormInputSettings,
  FormTextareaSettings,
  FormSelectSettings,
  FormRadioSettings,
  FormCheckboxSettings,
  FormButtonSettings,
  CanvasSettings,
  FreeformSettings,
  // Style types
  HeaderStyles,
  FooterStyles,
  ContainerStyles,
  GridStyles,
  StackStyles,
  DividerStyles,
  HeadingStyles,
  TextStyles,
  ImageStyles,
  VideoStyles,
  ButtonStyles,
  IconStyles,
  VariantsStyles,
  FormStyles,
  FormInputStyles,
  FormTextareaStyles,
  FormSelectStyles,
  FormRadioStyles,
  FormCheckboxStyles,
  FormButtonStyles,
  CanvasStyles,
  FreeformStyles,
} from '@/types/editor'

// ============================================
// ID GENERATION
// ============================================

export function generateId(): string {
  return crypto.randomUUID()
}

// ============================================
// BLOCK LABELS & ICONS
// ============================================

export const sectionBlockLabels: Record<SectionBlockType, string> = {
  // Special
  header: 'Header',
  footer: 'Footer',
  // Layout
  container: 'Container',
  grid: 'Grid',
  stack: 'Stack',
  canvas: 'Canvas',
  freeform: 'Freeform',
  // Content
  heading: 'Heading',
  text: 'Text',
  image: 'Image',
  video: 'Video',
  button: 'Button',
  icon: 'Icon',
  divider: 'Divider',
  // Product-specific
  variants: 'Variants',
  form: 'Form',
  // Form field blocks (children of form)
  'form-input': 'Input',
  'form-textarea': 'Textarea',
  'form-select': 'Dropdown',
  'form-radio': 'Radio Select',
  'form-checkbox': 'Checkbox',
  'form-button': 'Submit Button',
}

export const sectionBlockIcons: Record<SectionBlockType, string> = {
  // Special
  header: 'chevron-top',
  footer: 'chevron-bottom',
  // Layout
  container: 'layout-container',
  grid: 'layout-grid',
  stack: 'layout-stack',
  canvas: 'layout-canvas',
  freeform: 'layout-canvas',
  // Content
  heading: 'content-heading',
  text: 'content-text',
  image: 'content-image',
  video: 'content-video',
  button: 'content-button',
  icon: 'content-icon',
  divider: 'content-divider',
  // Product-specific
  variants: 'layout-container',
  form: 'content-form',
  // Form field blocks
  'form-input': 'content-form',
  'form-textarea': 'content-text',
  'form-select': 'chevron-down',
  'form-radio': 'content-form',
  'form-checkbox': 'content-form',
  'form-button': 'content-button',
}

// Block categories for sidebar organization
export const blocksByCategory: Record<BlockCategory, SectionBlockType[]> = {
  layout: ['container', 'grid', 'stack', 'canvas'],
  content: ['heading', 'text', 'image', 'video', 'button', 'icon', 'divider', 'form'],
}

export const categoryLabels: Record<BlockCategory, string> = {
  layout: 'Layout',
  content: 'Content',
}

// Form field block types (for adding to form)
// Note: 'stack' is also allowed inside form for grouping fields
export const formFieldBlockTypes: SectionBlockType[] = [
  'stack',
  'form-input',
  'form-textarea',
  'form-select',
  'form-radio',
  'form-checkbox',
  'form-button',
]

// Labels for form field blocks in the add menu
export const formFieldBlockLabels: Record<string, string> = {
  'stack': 'Stack (Group)',
  'form-input': 'Input Field',
  'form-textarea': 'Textarea',
  'form-select': 'Dropdown Select',
  'form-radio': 'Radio Select',
  'form-checkbox': 'Checkbox',
  'form-button': 'Submit Button',
}

// Canvas child block types (blocks that can be placed in Canvas)
// Canvas accepts content blocks only (no layout or form)
export const canvasChildBlockTypes: CanvasChildBlockType[] = [
  'heading',
  'text',
  'image',
  'video',
  'button',
  'icon',
  'divider',
]

// Labels for canvas child blocks in the add menu
export const canvasChildBlockLabels: Record<CanvasChildBlockType, string> = {
  'heading': 'Heading',
  'text': 'Text',
  'image': 'Image',
  'video': 'Video',
  'button': 'Button',
  'icon': 'Icon',
  'divider': 'Divider',
}

// Header/Footer stack child block types (heading, text, button, image only)
export type HeaderFooterStackChildBlockType = 'heading' | 'text' | 'button' | 'image'
export const headerFooterStackChildBlockTypes: HeaderFooterStackChildBlockType[] = [
  'heading',
  'text',
  'button',
  'image',
]

// Labels for header/footer stack child blocks
export const headerFooterStackChildBlockLabels: Record<HeaderFooterStackChildBlockType, string> = {
  'heading': 'Heading',
  'text': 'Text',
  'button': 'Button',
  'image': 'Image',
}

// Check if a block is a header/footer stack child type
export function isHeaderFooterStackChildBlock(type: SectionBlockType): boolean {
  return (headerFooterStackChildBlockTypes as SectionBlockType[]).includes(type)
}

// ============================================
// MASK SHAPES (for Image and Video blocks)
// ============================================

export const maskShapes: MaskShape[] = [
  'none',
  'circle',
  'rounded',
  'blob-1',
  'blob-2',
  'blob-3',
  'hexagon',
  'diamond',
  'arch',
]

export const maskShapeLabels: Record<MaskShape, string> = {
  'none': 'None',
  'circle': 'Circle',
  'rounded': 'Rounded',
  'blob-1': 'Blob 1',
  'blob-2': 'Blob 2',
  'blob-3': 'Blob 3',
  'hexagon': 'Hexagon',
  'diamond': 'Diamond',
  'arch': 'Arch',
}

// CSS clip-path values for each mask shape
export const maskShapeClipPaths: Record<MaskShape, string> = {
  'none': 'none',
  'circle': 'circle(50% at 50% 50%)',
  'rounded': 'inset(0 round 24px)',
  'blob-1': 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  'blob-2': 'polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)',
  'blob-3': 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  'hexagon': 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  'diamond': 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  'arch': 'polygon(0% 100%, 0% 50%, 5% 35%, 15% 20%, 25% 10%, 40% 3%, 50% 0%, 60% 3%, 75% 10%, 85% 20%, 95% 35%, 100% 50%, 100% 100%)',
}

// ============================================
// PRESET TEMPLATES (Pre-built block compositions)
// ============================================

export type PresetType =
  | 'preset-link-list'
  | 'preset-product-list'
  | 'preset-card-list'
  | 'preset-feature-list'
  | 'preset-social-list'
  | 'preset-testimonials'
  | 'preset-menu-list'
  | 'preset-faq-list'
  | 'preset-gallery'
  | 'preset-slider'

export const presetLabels: Record<PresetType, string> = {
  'preset-link-list': 'Link List',
  'preset-product-list': 'Product List',
  'preset-card-list': 'Card List',
  'preset-feature-list': 'Feature List',
  'preset-social-list': 'Social List',
  'preset-testimonials': 'Testimonials',
  'preset-menu-list': 'Menus List',
  'preset-faq-list': 'FAQ List',
  'preset-gallery': 'Gallery',
  'preset-slider': 'Slider',
}

export const presetIcons: Record<PresetType, string> = {
  'preset-link-list': 'list-link',
  'preset-product-list': 'list-product',
  'preset-card-list': 'list-product',
  'preset-feature-list': 'list-features',
  'preset-social-list': 'list-social',
  'preset-testimonials': 'list-testimonial',
  'preset-menu-list': 'list-menu',
  'preset-faq-list': 'list-faq',
  'preset-gallery': 'list-gallery',
  'preset-slider': 'list-slider',
}

export const presetTypes: PresetType[] = [
  'preset-link-list',
  'preset-product-list',
  'preset-card-list',
  'preset-feature-list',
  'preset-social-list',
  'preset-testimonials',
  'preset-menu-list',
  'preset-faq-list',
  'preset-gallery',
  'preset-slider',
]

// Which blocks can contain children
export const layoutBlockTypes: SectionBlockType[] = ['container', 'grid', 'stack']

// Blocks that can have children (layout blocks + form + canvas + header + footer)
export function canHaveChildren(type: SectionBlockType): boolean {
  return layoutBlockTypes.includes(type) || type === 'form' || type === 'canvas' || type === 'header' || type === 'footer'
}

// Check if a block type is a form field (can only be child of form)
export function isFormFieldBlock(type: SectionBlockType): boolean {
  return formFieldBlockTypes.includes(type)
}

// Check if a block type is a canvas child (can only be child of canvas)
export function isCanvasChildBlock(type: SectionBlockType): boolean {
  return (canvasChildBlockTypes as SectionBlockType[]).includes(type)
}

// ============================================
// SHARED STYLES - CONTENT FIELD EXCLUSION
// ============================================

// Content fields that should NOT be synced with shared styles (per block type)
// These are "content" fields - things like text, URLs, images, etc.
// Everything else (styling, layout, sizing) WILL be synced
export const contentFieldsByBlockType: Record<SectionBlockType, string[]> = {
  // Special blocks
  header: ['logo', 'logoUrl', 'ctaLabel', 'ctaUrl', 'navLinks'],
  footer: ['logo', 'logoUrl', 'copyright', 'links', 'socialLinks'],
  // Layout blocks - no content fields, all settings are structural
  container: [],
  grid: [],
  stack: [],
  freeform: [],
  canvas: [],
  // Content blocks
  heading: ['content'],
  text: ['content'],
  image: ['src', 'alt', 'url'],
  video: ['src', 'posterSrc'],
  button: ['label', 'url'],
  icon: ['name'],
  divider: [],
  // E-commerce
  variants: ['productId', 'variants'],
  // Form blocks
  form: ['action', 'successMessage', 'errorMessage'],
  'form-input': ['name', 'label', 'placeholder', 'defaultValue'],
  'form-textarea': ['name', 'label', 'placeholder', 'defaultValue'],
  'form-select': ['name', 'label', 'placeholder', 'options'],
  'form-radio': ['name', 'label', 'options'],
  'form-checkbox': ['name', 'label'],
  'form-button': ['label'],
}

// Extract non-content settings from a block (for creating/updating shared styles)
export function extractStyleSettings(
  blockType: SectionBlockType,
  settings: Record<string, unknown>
): Record<string, unknown> {
  const contentFields = contentFieldsByBlockType[blockType] || []
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(settings)) {
    if (!contentFields.includes(key)) {
      result[key] = value
    }
  }

  return result
}

// Apply shared style settings to a block (preserving content fields)
export function applyStyleSettings(
  blockType: SectionBlockType,
  currentSettings: Record<string, unknown>,
  sharedSettings: Record<string, unknown>
): Record<string, unknown> {
  const contentFields = contentFieldsByBlockType[blockType] || []
  const result: Record<string, unknown> = { ...sharedSettings }

  // Preserve content fields from current settings
  for (const field of contentFields) {
    if (field in currentSettings) {
      result[field] = currentSettings[field]
    }
  }

  return result
}

// Check if a block's settings/styles differ from its shared style
export function hasSharedStyleOverrides(
  blockType: SectionBlockType,
  blockSettings: Record<string, unknown>,
  blockStyles: Record<string, unknown>,
  sharedSettings: Record<string, unknown>,
  sharedStyles: Record<string, unknown>
): boolean {
  const contentFields = contentFieldsByBlockType[blockType] || []

  // Compare settings (excluding content fields)
  for (const [key, value] of Object.entries(sharedSettings)) {
    if (!contentFields.includes(key) && JSON.stringify(blockSettings[key]) !== JSON.stringify(value)) {
      return true
    }
  }

  // Compare styles
  for (const [key, value] of Object.entries(sharedStyles)) {
    if (JSON.stringify(blockStyles[key]) !== JSON.stringify(value)) {
      return true
    }
  }

  return false
}

// ============================================
// FORM INPUT TYPE OPTIONS
// ============================================

export const formInputTypeOptions = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'password', label: 'Password' },
  { value: 'url', label: 'URL' },
]


// ============================================
// SOCIAL PLATFORM UTILITIES
// ============================================

export const socialPlatformLabels: Record<SocialPlatform, string> = {
  twitter: 'Twitter / X',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  github: 'GitHub',
  discord: 'Discord',
  dribbble: 'Dribbble',
  behance: 'Behance',
  medium: 'Medium',
  threads: 'Threads',
}

export const socialPlatformIcons: Record<SocialPlatform, string> = {
  twitter: 'list-social',
  instagram: 'list-social',
  facebook: 'list-social',
  linkedin: 'list-social',
  youtube: 'list-social',
  tiktok: 'list-social',
  github: 'list-social',
  discord: 'list-social',
  dribbble: 'list-social',
  behance: 'list-social',
  medium: 'list-social',
  threads: 'list-social', // Threads uses X icon as fallback
}

// ============================================
// DEFAULT SETTINGS
// ============================================

export function getDefaultHeaderSettings(): HeaderSettings {
  return {
    logo: '',
    logoAlt: 'Logo',
    navLinks: [],
    ctaButton: {
      label: 'Get Started',
      url: '#',
      show: false,
    },
    isHidden: true,
    sticky: true, // Sticky by default
    gap: '0',
    backgroundType: 'color',
  }
}

export function getDefaultFooterSettings(): FooterSettings {
  return {
    links: [],
    copyrightText: '© 2024 Company. All rights reserved.',
    socialLinks: [],
    isHidden: true,
    gap: '0',
    backgroundType: 'color',
  }
}

export function getDefaultContainerSettings(): ContainerSettings {
  return {}
}

export function getDefaultGridSettings(): GridSettings {
  return {
    columns: 3,
    gap: '0',
  }
}

export function getDefaultStackSettings(): StackSettings {
  return {
    gap: '0',
  }
}

export function getDefaultDividerSettings(): DividerSettings {
  return {
    style: 'line',
    thickness: '1',
    width: '100',
  }
}

export function getDefaultHeadingSettings(): HeadingSettings {
  return {
    content: 'Heading',
    level: 'h2',
  }
}

export function getDefaultTextSettings(): TextSettings {
  return {
    content: 'Enter your text here...',
  }
}

export function getDefaultImageSettings(): ImageSettings {
  return {
    src: '',
    alt: '',
  }
}

export function getDefaultVideoSettings(): VideoSettings {
  return {
    src: '',
    autoplay: false,
    loop: false,
    muted: true,
    controls: true,
  }
}

export function getDefaultButtonSettings(): ButtonSettings {
  return {
    label: 'Click me',
    url: '#',
    variant: 'primary',
    size: 'md',
  }
}

export function getDefaultIconSettings(): IconSettings {
  return {
    icon: 'content-icon',
    size: '24',
  }
}

export function getDefaultVariantsSettings(): VariantsSettings {
  const colorBlack = generateId()
  const colorWhite = generateId()
  const sizeS = generateId()
  const sizeM = generateId()
  const sizeL = generateId()

  return {
    optionTypes: [
      {
        id: generateId(),
        name: 'Color',
        displayStyle: 'swatches',
        values: [
          { id: colorBlack, value: 'Black', colorHex: '#000000' },
          { id: colorWhite, value: 'White', colorHex: '#ffffff' },
        ],
      },
      {
        id: generateId(),
        name: 'Size',
        displayStyle: 'buttons',
        values: [
          { id: sizeS, value: 'S' },
          { id: sizeM, value: 'M' },
          { id: sizeL, value: 'L' },
        ],
      },
    ],
    variants: [
      { id: generateId(), optionValues: { Color: 'Black', Size: 'S' }, price: '$99.00', buyLink: '#' },
      { id: generateId(), optionValues: { Color: 'Black', Size: 'M' }, price: '$99.00', buyLink: '#' },
      { id: generateId(), optionValues: { Color: 'Black', Size: 'L' }, price: '$99.00', buyLink: '#' },
      { id: generateId(), optionValues: { Color: 'White', Size: 'S' }, price: '$99.00', buyLink: '#' },
      { id: generateId(), optionValues: { Color: 'White', Size: 'M' }, price: '$99.00', buyLink: '#' },
      { id: generateId(), optionValues: { Color: 'White', Size: 'L' }, price: '$99.00', buyLink: '#' },
    ],
  }
}

export function getDefaultFormSettings(): FormSettings {
  return {
    successMessage: 'Thank you! Your submission has been received.',
    errorMessage: 'Something went wrong. Please try again.',
    gap: '16',
  }
}

// ============================================
// CANVAS BLOCK DEFAULT SETTINGS
// ============================================

export function getDefaultCanvasSettings(): CanvasSettings {
  return {
    backgroundType: 'color',
    minHeight: '600px',
    childPositions: {
      desktop: {},
    },
  }
}

// ============================================
// FORM FIELD BLOCK DEFAULT SETTINGS
// ============================================

export function getDefaultFormInputSettings(): FormInputSettings {
  return {
    label: 'Label',
    name: 'field_' + generateId().slice(0, 6),
    inputType: 'text',
    placeholder: 'Enter text...',
    required: false,
    width: '100',
  }
}

export function getDefaultFormTextareaSettings(): FormTextareaSettings {
  return {
    label: 'Message',
    name: 'message_' + generateId().slice(0, 6),
    placeholder: 'Enter your message...',
    required: false,
    rows: 4,
    width: '100',
  }
}

export function getDefaultFormSelectSettings(): FormSelectSettings {
  return {
    label: 'Select',
    name: 'select_' + generateId().slice(0, 6),
    placeholder: 'Choose an option...',
    required: false,
    options: [
      { id: generateId(), label: 'Option 1', value: 'option_1' },
      { id: generateId(), label: 'Option 2', value: 'option_2' },
      { id: generateId(), label: 'Option 3', value: 'option_3' },
    ],
    width: '100',
  }
}

export function getDefaultFormRadioSettings(): FormRadioSettings {
  return {
    label: 'Select one',
    name: 'radio_' + generateId().slice(0, 6),
    required: false,
    options: [
      { id: generateId(), label: 'Option 1', value: 'option_1' },
      { id: generateId(), label: 'Option 2', value: 'option_2' },
    ],
    layout: 'vertical',
    width: '100',
  }
}

export function getDefaultFormCheckboxSettings(): FormCheckboxSettings {
  return {
    label: 'Select all that apply',
    name: 'checkbox_' + generateId().slice(0, 6),
    required: false,
    options: [
      { id: generateId(), label: 'Option 1', value: 'option_1' },
      { id: generateId(), label: 'Option 2', value: 'option_2' },
    ],
    layout: 'vertical',
    width: '100',
  }
}

export function getDefaultFormButtonSettings(): FormButtonSettings {
  return {
    label: 'Submit',
    variant: 'primary',
    size: 'md',
    fullWidth: false,
    alignment: 'left',
  }
}

// ============================================
// DEFAULT STYLES
// ============================================

export function getDefaultHeaderStyles(): HeaderStyles {
  return {
    padding: { top: '0', bottom: '0', left: '0', right: '0' },
    alignment: 'center',
    justifyContent: 'space-between',
  }
}

export function getDefaultFooterStyles(): FooterStyles {
  return {
    padding: { top: '0', bottom: '0', left: '0', right: '0' },
    alignment: 'center',
    justifyContent: 'space-between',
  }
}

export function getDefaultContainerStyles(): ContainerStyles {
  return {
    padding: { top: '0', bottom: '0', left: '0', right: '0' },
    alignment: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flexWrap: 'nowrap',
    gap: '0',
  }
}

export function getDefaultGridStyles(): GridStyles {
  return {
    padding: { top: '0', bottom: '0', left: '0', right: '0' },
    horizontalAlign: 'left',
    verticalAlign: 'top',
    justifyItems: 'stretch',
    alignItems: 'stretch',
  }
}

export function getDefaultStackStyles(): StackStyles {
  return {
    padding: { top: '0', bottom: '0', left: '0', right: '0' },
    alignment: 'center',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flexWrap: 'nowrap',
  }
}

export function getDefaultDividerStyles(): DividerStyles {
  return {
    margin: { top: '0', bottom: '0' },
    alignment: 'center',
  }
}

export function getDefaultHeadingStyles(): HeadingStyles {
  return {
    padding: { top: '0', bottom: '0', left: '0', right: '0' },
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    fontSize: '4xl',
    fontWeight: 'bold',
    lineHeight: 'tight',
    alignment: 'left',
  }
}

export function getDefaultTextStyles(): TextStyles {
  return {
    padding: { top: '0', bottom: '0', left: '0', right: '0' },
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    fontSize: 'base',
    lineHeight: 'relaxed',
    alignment: 'left',
  }
}

export function getDefaultImageStyles(): ImageStyles {
  return {
    objectFit: 'cover',
  }
}

export function getDefaultVideoStyles(): VideoStyles {
  return {
    aspectRatio: '16:9',
  }
}

export function getDefaultButtonStyles(): ButtonStyles {
  return {}
}

export function getDefaultIconStyles(): IconStyles {
  return {}
}

export function getDefaultVariantsStyles(): VariantsStyles {
  return {
    optionSize: 'md',
    gap: '0',
  }
}

export function getDefaultFormStyles(): FormStyles {
  return {
    padding: { top: '0', bottom: '0', left: '0', right: '0' },
    gap: '0',
  }
}

// ============================================
// CANVAS BLOCK DEFAULT STYLES
// ============================================

export function getDefaultCanvasStyles(): CanvasStyles {
  return {
    padding: { top: '0', bottom: '0', left: '0', right: '0' },
  }
}

export function getDefaultFreeformSettings(): FreeformSettings {
  return {
    childPositions: {
      desktop: {},
    },
  }
}

export function getDefaultFreeformStyles(): FreeformStyles {
  return {
    padding: { top: '0', bottom: '0', left: '0', right: '0' },
  }
}

// ============================================
// FORM FIELD BLOCK DEFAULT STYLES
// ============================================

export function getDefaultFormInputStyles(): FormInputStyles {
  return {}
}

export function getDefaultFormTextareaStyles(): FormTextareaStyles {
  return {}
}

export function getDefaultFormSelectStyles(): FormSelectStyles {
  return {}
}

export function getDefaultFormRadioStyles(): FormRadioStyles {
  return {}
}

export function getDefaultFormCheckboxStyles(): FormCheckboxStyles {
  return {}
}

export function getDefaultFormButtonStyles(): FormButtonStyles {
  return {}
}

// ============================================
// BLOCK CREATION
// ============================================

// Lookup map for default settings - O(1) access instead of switch statement
const defaultSettingsMap: Record<SectionBlockType, () => SectionBlock['settings']> = {
  'header': getDefaultHeaderSettings,
  'footer': getDefaultFooterSettings,
  'container': getDefaultContainerSettings,
  'grid': getDefaultGridSettings,
  'stack': getDefaultStackSettings,
  'divider': getDefaultDividerSettings,
  'heading': getDefaultHeadingSettings,
  'text': getDefaultTextSettings,
  'image': getDefaultImageSettings,
  'video': getDefaultVideoSettings,
  'button': getDefaultButtonSettings,
  'icon': getDefaultIconSettings,
  'variants': getDefaultVariantsSettings,
  'form': getDefaultFormSettings,
  // Canvas block
  'canvas': getDefaultCanvasSettings,
  // Freeform block
  'freeform': getDefaultFreeformSettings,
  // Form field blocks
  'form-input': getDefaultFormInputSettings,
  'form-textarea': getDefaultFormTextareaSettings,
  'form-select': getDefaultFormSelectSettings,
  'form-radio': getDefaultFormRadioSettings,
  'form-checkbox': getDefaultFormCheckboxSettings,
  'form-button': getDefaultFormButtonSettings,
}

// Lookup map for default styles - O(1) access instead of switch statement
const defaultStylesMap: Record<SectionBlockType, () => SectionBlock['styles']> = {
  'header': getDefaultHeaderStyles,
  'footer': getDefaultFooterStyles,
  'container': getDefaultContainerStyles,
  'grid': getDefaultGridStyles,
  'stack': getDefaultStackStyles,
  'divider': getDefaultDividerStyles,
  'heading': getDefaultHeadingStyles,
  'text': getDefaultTextStyles,
  'image': getDefaultImageStyles,
  'video': getDefaultVideoStyles,
  'button': getDefaultButtonStyles,
  'icon': getDefaultIconStyles,
  'variants': getDefaultVariantsStyles,
  'form': getDefaultFormStyles,
  // Canvas block
  'canvas': getDefaultCanvasStyles,
  // Freeform block
  'freeform': getDefaultFreeformStyles,
  // Form field blocks
  'form-input': getDefaultFormInputStyles,
  'form-textarea': getDefaultFormTextareaStyles,
  'form-select': getDefaultFormSelectStyles,
  'form-radio': getDefaultFormRadioStyles,
  'form-checkbox': getDefaultFormCheckboxStyles,
  'form-button': getDefaultFormButtonStyles,
}

function getDefaultSettings(type: SectionBlockType): SectionBlock['settings'] {
  const factory = defaultSettingsMap[type]
  if (!factory) throw new Error(`No default settings for type: ${type}`)
  return factory()
}

function getDefaultStyles(type: SectionBlockType): SectionBlock['styles'] {
  const factory = defaultStylesMap[type]
  if (!factory) throw new Error(`No default styles for type: ${type}`)
  return factory()
}

// Create default Start/Middle/End stacks for header/footer
function createHeaderFooterStacks(): SectionBlock[] {
  return [
    {
      id: generateId(),
      type: 'stack',
      name: 'Start',
      children: [],
      settings: { gap: '8', direction: 'horizontal' },
      styles: { alignItems: 'center', justifyContent: 'flex-start', padding: { top: '0', bottom: '0', left: '0', right: '0' } },
    },
    {
      id: generateId(),
      type: 'stack',
      name: 'Middle',
      children: [],
      settings: { gap: '8', direction: 'horizontal' },
      styles: { alignItems: 'center', justifyContent: 'center', padding: { top: '0', bottom: '0', left: '0', right: '0' } },
    },
    {
      id: generateId(),
      type: 'stack',
      name: 'End',
      children: [],
      settings: { gap: '8', direction: 'horizontal' },
      styles: { alignItems: 'center', justifyContent: 'flex-end', padding: { top: '0', bottom: '0', left: '0', right: '0' } },
    },
  ]
}

export function createSectionBlock(type: SectionBlockType): SectionBlock {
  // For header and footer, create with Start/Middle/End stacks
  if (type === 'header' || type === 'footer') {
    return {
      id: generateId(),
      type,
      name: sectionBlockLabels[type],
      children: createHeaderFooterStacks(),
      settings: getDefaultSettings(type),
      styles: getDefaultStyles(type),
    }
  }

  return {
    id: generateId(),
    type,
    name: sectionBlockLabels[type],
    children: canHaveChildren(type) ? [] : undefined,
    settings: getDefaultSettings(type),
    styles: getDefaultStyles(type),
  }
}

// ============================================
// PRESET FACTORY FUNCTIONS
// ============================================

// Helper to create a configured block with custom settings/styles
function createConfiguredBlock(
  type: SectionBlockType,
  name: string,
  settingsOverrides?: Partial<SectionBlock['settings']>,
  stylesOverrides?: Partial<SectionBlock['styles']>
): SectionBlock {
  const block = createSectionBlock(type)
  block.name = name
  if (settingsOverrides) {
    block.settings = { ...block.settings, ...settingsOverrides } as SectionBlock['settings']
  }
  if (stylesOverrides) {
    block.styles = { ...block.styles, ...stylesOverrides } as SectionBlock['styles']
  }
  return block
}

// Create a stack item with children
function createStackItem(name: string, children: SectionBlock[]): SectionBlock {
  const stack = createSectionBlock('stack')
  stack.name = name
  stack.children = children
  return stack
}

// Link List: Stack > [Stack(Cover), Stack(Title+Description), Stack(Link)]
export function createLinkListPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Link List', { columns: 3 })

  const createLinkItem = (name: string) =>
    createStackItem(name, [
      createStackItem('Cover', [
        createConfiguredBlock('image', 'Cover', { src: '', alt: 'Link image' }),
      ]),
      createStackItem('Content', [
        createConfiguredBlock('heading', 'Title', { content: 'Link Title', level: 'h3' }),
        createConfiguredBlock('text', 'Description', { content: 'Description text goes here.' }),
      ]),
      createStackItem('Action', [
        createConfiguredBlock('button', 'Link', { label: 'Learn More', url: '#' }),
      ]),
    ])

  grid.children = [
    createLinkItem('Link 1'),
    createLinkItem('Link 2'),
    createLinkItem('Link 3'),
  ]
  return grid
}

// Product List: Stack > [Stack(IMG+Badge), Stack(Stack(Title+desc), Stack(Stack(Variants), Stack(Price)), Stack(Button))]
export function createProductListPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Product List', { columns: 3 })

  const createProductItem = (name: string, badge: string) =>
    createStackItem(name, [
      createStackItem('Media', [
        createConfiguredBlock('image', 'Cover', { src: '', alt: 'Product image' }),
        createConfiguredBlock('text', 'Badge', { content: badge }),
      ]),
      createStackItem('Details', [
        createStackItem('Info', [
          createConfiguredBlock('heading', 'Title', { content: 'Product Name', level: 'h3' }),
          createConfiguredBlock('text', 'Description', { content: 'Product description goes here.' }),
        ]),
        createStackItem('Pricing', [
          createStackItem('Variants', [
            createSectionBlock('variants'),
          ]),
          createStackItem('Price', [
            createConfiguredBlock('text', 'Price', { content: '$99.00' }),
          ]),
        ]),
        createStackItem('Action', [
          createConfiguredBlock('button', 'Buy link', { label: 'Buy Now', url: '#' }),
        ]),
      ]),
    ])

  grid.children = [
    createProductItem('Product 1', 'New'),
    createProductItem('Product 2', 'Sale'),
    createProductItem('Product 3', 'Best Seller'),
  ]
  return grid
}

// Card List: Stack > [Stack(Cover), Stack(Stack(Label+Title+Description), Stack(Link))]
export function createCardListPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Card List', { columns: 3 })

  const createCardItem = (name: string, label: string) =>
    createStackItem(name, [
      createStackItem('Media', [
        createConfiguredBlock('image', 'Cover', { src: '', alt: 'Card image' }),
      ]),
      createStackItem('Content', [
        createStackItem('Info', [
          createConfiguredBlock('text', 'Label', { content: label }),
          createConfiguredBlock('heading', 'Title', { content: 'Card Title', level: 'h3' }),
          createConfiguredBlock('text', 'Description', { content: 'Card description goes here.' }),
        ]),
        createStackItem('Action', [
          createConfiguredBlock('button', 'Link', { label: 'Read More', url: '#' }),
        ]),
      ]),
    ])

  grid.children = [
    createCardItem('Card 1', 'Featured'),
    createCardItem('Card 2', 'Popular'),
    createCardItem('Card 3', 'New'),
  ]
  return grid
}

// Feature List: Stack > [Stack(Cover/IMAGE), Stack(Stack(Label+Title+Description), Stack(Link))]
export function createFeatureListPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Feature List', { columns: 3 })

  const createFeatureItem = (name: string, label: string) =>
    createStackItem(name, [
      createStackItem('Media', [
        createConfiguredBlock('image', 'Cover', { src: '', alt: 'Feature image' }),
      ]),
      createStackItem('Content', [
        createStackItem('Info', [
          createConfiguredBlock('text', 'Label', { content: label }),
          createConfiguredBlock('heading', 'Title', { content: 'Feature Title', level: 'h3' }),
          createConfiguredBlock('text', 'Description', { content: 'Feature description goes here.' }),
        ]),
        createStackItem('Action', [
          createConfiguredBlock('button', 'Link', { label: 'Learn More', url: '#' }),
        ]),
      ]),
    ])

  grid.children = [
    createFeatureItem('Feature 1', 'Step 1'),
    createFeatureItem('Feature 2', 'Step 2'),
    createFeatureItem('Feature 3', 'Step 3'),
  ]
  return grid
}

// Social List: Stack > [Stack(Logo), Stack(Username+Description), Stack(Link)]
export function createSocialListPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Social List', { columns: 4 })

  const createSocialItem = (name: string, icon: string, username: string, description: string, buttonLabel: string) =>
    createStackItem(name, [
      createStackItem('Media', [
        createConfiguredBlock('icon', 'Logo', { icon, size: '32' }),
      ]),
      createStackItem('Content', [
        createConfiguredBlock('heading', 'Username', { content: username, level: 'h4' }),
        createConfiguredBlock('text', 'Description', { content: description }),
      ]),
      createStackItem('Action', [
        createConfiguredBlock('button', 'Link', { label: buttonLabel, url: '#' }),
      ]),
    ])

  grid.children = [
    createSocialItem('Twitter', 'list-social', '@username', 'Follow us on X', 'Follow'),
    createSocialItem('Instagram', 'list-social', '@username', 'Follow us on Instagram', 'Follow'),
    createSocialItem('LinkedIn', 'list-social', 'Company Name', 'Connect with us', 'Connect'),
    createSocialItem('YouTube', 'list-social', 'Channel Name', 'Subscribe to our channel', 'Subscribe'),
  ]
  return grid
}

// Testimonials: Stack > [Stack(Name+Description), Stack(Quote), Stack(Avatar)] - NO LINK
export function createTestimonialsPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Testimonials', { columns: 3 })

  const createTestimonialItem = (name: string, authorName: string, role: string, quote: string) =>
    createStackItem(name, [
      createStackItem('Author', [
        createConfiguredBlock('heading', 'Name', { content: authorName, level: 'h4' }),
        createConfiguredBlock('text', 'Description', { content: role }),
      ]),
      createStackItem('Quote', [
        createConfiguredBlock('text', 'Quote', { content: quote }),
      ]),
      createStackItem('Media', [
        createConfiguredBlock('image', 'Avatar', { src: '', alt: 'Customer photo' }),
      ]),
    ])

  grid.children = [
    createTestimonialItem('Testimonial 1', 'John Doe', 'CEO at Company', '"This product changed my life. Highly recommended!"'),
    createTestimonialItem('Testimonial 2', 'Jane Smith', 'Designer', '"Amazing experience from start to finish."'),
    createTestimonialItem('Testimonial 3', 'Mike Johnson', 'Developer', '"Best decision I ever made. Thank you!"'),
  ]
  return grid
}

// Menu List: Stack > [Stack(IMG), Stack(Stack(Title+Price), Stack(Description))]
export function createMenuListPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Menus List', {
    columns: 1,
    gap: '24',
  })

  const createMenuItem = (name: string, title: string, description: string, price: string) =>
    createStackItem(name, [
      createStackItem('Media', [
        createConfiguredBlock('image', 'Cover', { src: '', alt: 'Menu item photo' }),
      ]),
      createStackItem('Content', [
        createStackItem('Header', [
          createConfiguredBlock('heading', 'Title', { content: title, level: 'h3' }),
          createConfiguredBlock('text', 'Price', { content: price }),
        ]),
        createStackItem('Body', [
          createConfiguredBlock('text', 'Description', { content: description }),
        ]),
      ]),
    ])

  grid.children = [
    createMenuItem('Menu Item 1', 'Signature Dish', 'House specialty prepared with seasonal ingredients.', '$18.00'),
    createMenuItem('Menu Item 2', 'Chef\'s Pasta', 'Fresh pasta tossed in a slow-simmered sauce.', '$15.00'),
    createMenuItem('Menu Item 3', 'Garden Salad', 'Locally sourced greens with citrus dressing.', '$12.50'),
  ]

  return grid
}

// FAQ List: Stack > [Stack(Question), Stack(Answer+Link)]
export function createFAQListPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'FAQ List', { columns: 1 })

  const createFAQItem = (name: string, question: string, answer: string, linkLabel: string) =>
    createStackItem(name, [
      createStackItem('Header', [
        createConfiguredBlock('heading', 'Question', { content: question, level: 'h3' }),
      ]),
      createStackItem('Content', [
        createConfiguredBlock('text', 'Answer', { content: answer }),
        createConfiguredBlock('button', 'Link', { label: linkLabel, url: '#' }),
      ]),
    ])

  grid.children = [
    createFAQItem('FAQ 1', 'What is your return policy?', 'We offer a 30-day money-back guarantee on all purchases.', 'Learn More'),
    createFAQItem('FAQ 2', 'How do I contact support?', 'You can reach our support team via email or live chat.', 'Contact Us'),
    createFAQItem('FAQ 3', 'Do you offer discounts?', 'Yes! Sign up for our newsletter to receive exclusive offers.', 'Subscribe'),
  ]
  return grid
}

// Gallery: Grid with Image blocks
export function createGalleryPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Gallery', { columns: 3 })
  grid.children = [
    createConfiguredBlock('image', 'Image 1', { src: '', alt: 'Gallery image 1' }),
    createConfiguredBlock('image', 'Image 2', { src: '', alt: 'Gallery image 2' }),
    createConfiguredBlock('image', 'Image 3', { src: '', alt: 'Gallery image 3' }),
    createConfiguredBlock('image', 'Image 4', { src: '', alt: 'Gallery image 4' }),
    createConfiguredBlock('image', 'Image 5', { src: '', alt: 'Gallery image 5' }),
    createConfiguredBlock('image', 'Image 6', { src: '', alt: 'Gallery image 6' }),
  ]
  return grid
}

// Slider: Grid in slider mode with Stack slides
export function createSliderPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Slider', {
    columns: 1,
    gap: '16',
    isSlider: true,
    slidesPerView: 1,
    showArrows: true,
    showDots: true,
    autoplay: false,
    autoplayInterval: 5000,
    loop: false,
  })

  const createSlideItem = (name: string, title: string, description: string) =>
    createStackItem(name, [
      createStackItem('Media', [
        createConfiguredBlock('image', 'Cover', { src: '', alt: 'Slide image' }),
      ]),
      createStackItem('Content', [
        createConfiguredBlock('heading', 'Title', { content: title, level: 'h3' }),
        createConfiguredBlock('text', 'Description', { content: description }),
      ]),
      createStackItem('Action', [
        createConfiguredBlock('button', 'Link', { label: 'Learn More', url: '#' }),
      ]),
    ])

  grid.children = [
    createSlideItem('Slide 1', 'First Slide', 'Description for the first slide goes here.'),
    createSlideItem('Slide 2', 'Second Slide', 'Description for the second slide goes here.'),
    createSlideItem('Slide 3', 'Third Slide', 'Description for the third slide goes here.'),
  ]
  return grid
}

// Factory function to create preset by type
export function createPresetBlock(presetType: PresetType): SectionBlock {
  switch (presetType) {
    case 'preset-link-list':
      return createLinkListPreset()
    case 'preset-product-list':
      return createProductListPreset()
    case 'preset-card-list':
      return createCardListPreset()
    case 'preset-feature-list':
      return createFeatureListPreset()
    case 'preset-social-list':
      return createSocialListPreset()
    case 'preset-testimonials':
      return createTestimonialsPreset()
    case 'preset-menu-list':
      return createMenuListPreset()
    case 'preset-faq-list':
      return createFAQListPreset()
    case 'preset-gallery':
      return createGalleryPreset()
    case 'preset-slider':
      return createSliderPreset()
    default:
      throw new Error(`Unknown preset type: ${presetType}`)
  }
}

// ============================================
// BLOCK DUPLICATION
// ============================================

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function regenerateIds<T extends { id: string }>(items: T[]): T[] {
  return items.map(item => ({ ...item, id: generateId() }))
}

export function duplicateSectionBlock(block: SectionBlock): SectionBlock {
  const newBlock: SectionBlock = {
    ...deepClone(block),
    id: generateId(),
  }

  // Regenerate IDs for nested children
  if (newBlock.children) {
    newBlock.children = newBlock.children.map((child: SectionBlock) => duplicateSectionBlock(child))
  }

  // Regenerate IDs for items in settings
  const settings = newBlock.settings as Record<string, unknown>

  // Handle arrays with IDs in settings
  const arrayFields = ['navLinks', 'links', 'socialLinks', 'fields']

  for (const field of arrayFields) {
    if (Array.isArray(settings[field])) {
      settings[field] = regenerateIds(settings[field] as { id: string }[])
    }
  }

  return newBlock
}

// ============================================
// PAGE SETTINGS
// ============================================

export function getDefaultPageSettings(): PageSettings {
  return {
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    textColor: '#09090b',
    maxWidth: '1200px',
    padding: { y: '0', x: '16' },
    sectionGap: '0',
  }
}

// ============================================
// ITEM CREATORS
// ============================================

export function createHeaderNavLink(): HeaderNavLink {
  return { id: generateId(), label: 'Link', url: '#' }
}

export function createFooterLink(): FooterLink {
  return { id: generateId(), label: 'Link', url: '#' }
}

export function createFooterSocialLink(platform: SocialPlatform = 'twitter'): FooterSocialLink {
  return { id: generateId(), platform, url: '#' }
}

// ============================================
// STYLE OPTIONS
// ============================================

export const alignmentOptions = [
  { value: 'left', label: 'Left', icon: 'style-text-left' },
  { value: 'center', label: 'Center', icon: 'style-text-center' },
  { value: 'right', label: 'Right', icon: 'style-text-right' },
] as const

export const verticalAlignmentOptions = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
] as const

// Flexbox options for layout blocks (with icons for segmented controls)
export const flexDirectionOptions = [
  { value: 'row', label: 'Row', icon: 'style-row' },
  { value: 'column', label: 'Column', icon: 'style-align-bottom' },
  { value: 'row-reverse', label: 'Row Reverse', icon: 'style-invert-row' },
  { value: 'column-reverse', label: 'Column Reverse', icon: 'style-align-start' },
] as const

export const justifyContentOptions = [
  { value: 'flex-start', label: 'Start', icon: 'style-justify-start' },
  { value: 'center', label: 'Center', icon: 'style-text-center' },
  { value: 'flex-end', label: 'End', icon: 'style-justify-end' },
  { value: 'space-between', label: 'Space Between', icon: 'lni-arrow-both-direction-horizontal-1' },
] as const

export const alignItemsOptions = [
  { value: 'flex-start', label: 'Start', icon: 'style-align-start' },
  { value: 'center', label: 'Center', icon: 'lni-minus' },
  { value: 'flex-end', label: 'End', icon: 'style-align-bottom' },
  { value: 'stretch', label: 'Stretch', icon: 'lni-arrow-both-direction-vertical-1' },
] as const

export const flexWrapOptions = [
  { value: 'nowrap', label: 'No Wrap', icon: 'lni-line' },
  { value: 'wrap', label: 'Wrap', icon: 'lni-enter' },
] as const

export const justifyItemsOptions = [
  { value: 'start', label: 'Start', icon: 'style-justify-start' },
  { value: 'center', label: 'Center', icon: 'style-text-center' },
  { value: 'end', label: 'End', icon: 'style-justify-end' },
  { value: 'stretch', label: 'Stretch', icon: 'lni-arrow-both-direction-horizontal-1' },
] as const

// Flex child options (for blocks inside Stack/Container)
export const flexGrowOptions = [
  { value: '0', label: '0 (Don\'t grow)' },
  { value: '1', label: '1 (Grow)' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
] as const

export const flexShrinkOptions = [
  { value: '0', label: '0 (Don\'t shrink)' },
  { value: '1', label: '1 (Shrink)' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
] as const

export const flexBasisOptions = [
  { value: 'auto', label: 'Auto' },
  { value: '0', label: '0' },
  { value: '25%', label: '25%' },
  { value: '33.33%', label: '33%' },
  { value: '50%', label: '50%' },
  { value: '66.66%', label: '66%' },
  { value: '75%', label: '75%' },
  { value: '100%', label: '100%' },
] as const

export const mixBlendModeOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' },
] as const

export const fontSizeOptions = [
  { value: 'xs', label: 'XS' },
  { value: 'sm', label: 'SM' },
  { value: 'base', label: 'Base' },
  { value: 'lg', label: 'LG' },
  { value: 'xl', label: 'XL' },
  { value: '2xl', label: '2XL' },
  { value: '3xl', label: '3XL' },
  { value: '4xl', label: '4XL' },
  { value: '5xl', label: '5XL' },
  { value: '6xl', label: '6XL' },
] as const

export const fontWeightOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'semibold', label: 'Semibold' },
  { value: 'bold', label: 'Bold' },
] as const

export const lineHeightOptions = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'loose', label: 'Loose' },
] as const

export const aspectRatioOptions = [
  { value: 'auto', label: 'Auto' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
] as const

export const objectFitOptions = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
  { value: 'none', label: 'None' },
] as const

export const buttonVariantOptions = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'outline', label: 'Outline' },
] as const

export const buttonSizeOptions = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
] as const

export const headingLevelOptions = [
  { value: 'h1', label: 'H1' },
  { value: 'h2', label: 'H2' },
  { value: 'h3', label: 'H3' },
  { value: 'h4', label: 'H4' },
  { value: 'h5', label: 'H5' },
  { value: 'h6', label: 'H6' },
] as const

export const dividerStyleOptions = [
  { value: 'line', label: 'Line' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'space', label: 'Space' },
] as const

export const mediaPositionOptions = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
] as const

export const animationOptions = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'slide-down', label: 'Slide Down' },
  { value: 'slide-left', label: 'Slide Left' },
  { value: 'slide-right', label: 'Slide Right' },
  { value: 'zoom', label: 'Zoom' },
] as const

export const spacingOptions = [
  { value: '0', label: '0' },
  { value: '4', label: '4' },
  { value: '8', label: '8' },
  { value: '12', label: '12' },
  { value: '16', label: '16' },
  { value: '24', label: '24' },
  { value: '32', label: '32' },
  { value: '48', label: '48' },
  { value: '64', label: '64' },
] as const

export const columnsOptions = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
] as const

export const maxWidthOptions = [
  { value: 'none', label: 'None' },
  { value: '640px', label: 'SM' },
  { value: '768px', label: 'MD' },
  { value: '1024px', label: 'LG' },
  { value: '1200px', label: 'XL' },
  { value: '1400px', label: '2XL' },
] as const

export const blockHeightOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'half', label: '50%' },
  { value: 'full', label: '100%' },
] as const
