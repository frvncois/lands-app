import type {
  SectionBlock,
  SectionBlockType,
  BlockCategory,
  PageSettings,
  SpacingYX,
  CanvasChildBlockType,
  MaskShape,
  SocialPlatform,
  // Settings types
  ContainerSettings,
  GridSettings,
  StackSettings,
  HeadingSettings,
  TextSettings,
  ImageSettings,
  VideoSettings,
  ButtonSettings,
  IconSettings,
  VariantsSettings,
  CanvasSettings,
  FreeformSettings,
  // Style types
  ContainerStyles,
  GridStyles,
  StackStyles,
  HeadingStyles,
  TextStyles,
  ImageStyles,
  VideoStyles,
  ButtonStyles,
  IconStyles,
  VariantsStyles,
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
  // Product-specific
  variants: 'Variants',
}

export const sectionBlockIcons: Record<SectionBlockType, string> = {
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
  // Product-specific
  variants: 'layout-container',
}

// Block categories for sidebar organization
export const blocksByCategory: Record<BlockCategory, SectionBlockType[]> = {
  layout: ['container', 'grid', 'stack', 'canvas'],
  content: ['heading', 'text', 'image', 'video', 'button', 'icon'],
}

export const categoryLabels: Record<BlockCategory, string> = {
  layout: 'Layout',
  content: 'Content',
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
]

// Labels for canvas child blocks in the add menu
export const canvasChildBlockLabels: Record<CanvasChildBlockType, string> = {
  'heading': 'Heading',
  'text': 'Text',
  'image': 'Image',
  'video': 'Video',
  'button': 'Button',
  'icon': 'Icon',
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

// Which blocks can contain children
export const layoutBlockTypes: SectionBlockType[] = ['container', 'grid', 'stack']

// Blocks that can have children (layout blocks + canvas + button)
export function canHaveChildren(type: SectionBlockType): boolean {
  return layoutBlockTypes.includes(type) || type === 'canvas' || type === 'button'
}

// Check if a block type is a canvas child (can only be child of canvas)
export function isCanvasChildBlock(type: SectionBlockType): boolean {
  return (canvasChildBlockTypes as SectionBlockType[]).includes(type)
}

// ============================================
// DESCENDANT UTILITIES
// ============================================

export interface DescendantBlock {
  block: SectionBlock
  path: string // e.g., "Container > Grid > Button"
  depth: number
}

/**
 * Get ALL descendants of a block (recursive), including nested children
 * Each descendant includes its full path for display purposes
 */
export function getAllDescendants(block: SectionBlock | null | undefined): DescendantBlock[] {
  if (!block?.children?.length) return []

  const descendants: DescendantBlock[] = []

  const collectDescendants = (children: SectionBlock[], parentPath: string, depth: number) => {
    for (const child of children) {
      const childLabel = child.name || sectionBlockLabels[child.type] || child.type
      const path = parentPath ? `${parentPath} → ${childLabel}` : childLabel

      descendants.push({
        block: child,
        path,
        depth,
      })

      // Recurse into nested children
      if (child.children?.length) {
        collectDescendants(child.children, path, depth + 1)
      }
    }
  }

  collectDescendants(block.children, '', 1)
  return descendants
}

// ============================================
// SHARED STYLES - CONTENT FIELD EXCLUSION
// ============================================

// Content fields that should NOT be synced with shared styles (per block type)
// These are "content" fields - things like text, URLs, images, etc.
// Everything else (styling, layout, sizing) WILL be synced
export const contentFieldsByBlockType: Record<SectionBlockType, string[]> = {
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
  // E-commerce
  variants: ['productId', 'variants'],
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
    label: '', // Legacy - buttons now use children for content
    url: '#',
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


// ============================================
// CANVAS BLOCK DEFAULT SETTINGS
// ============================================

export function getDefaultCanvasSettings(): CanvasSettings {
  return {
    backgroundType: 'color',
    height: '600px',
    childPositions: {
      desktop: {},
    },
  }
}


// ============================================
// DEFAULT STYLES
// ============================================

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
    justifyItems: 'flex-start',
    alignItems: 'flex-start',
    // Flexbox properties (shared with other layout blocks)
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flexWrap: 'nowrap',
    gap: '16px',
  }
}

export function getDefaultStackStyles(): StackStyles {
  return {
    padding: { top: '0', bottom: '0', left: '0', right: '0' },
    alignment: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flexWrap: 'nowrap',
    gap: '16px',
  }
}

export function getDefaultHeadingStyles(): HeadingStyles {
  return {
    padding: { top: '0', bottom: '0', left: '0', right: '0' },
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    fontSize: '36px',
    fontWeight: 'bold',
    lineHeight: '1.25',
    alignment: 'left',
  }
}

export function getDefaultTextStyles(): TextStyles {
  return {
    padding: { top: '0', bottom: '0', left: '0', right: '0' },
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    fontSize: '16px',
    lineHeight: '1.625',
    alignment: 'left',
  }
}

export function getDefaultImageStyles(): ImageStyles {
  return {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }
}

export function getDefaultVideoStyles(): VideoStyles {
  return {
    aspectRatio: '16:9',
  }
}

export function getDefaultButtonStyles(): ButtonStyles {
  return {
    // Button is just a plain <a> tag - users style it themselves
  }
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
// BLOCK CREATION
// ============================================

// Lookup map for default settings - O(1) access instead of switch statement
const defaultSettingsMap: Record<SectionBlockType, () => SectionBlock['settings']> = {
  'container': getDefaultContainerSettings,
  'grid': getDefaultGridSettings,
  'stack': getDefaultStackSettings,
  'heading': getDefaultHeadingSettings,
  'text': getDefaultTextSettings,
  'image': getDefaultImageSettings,
  'video': getDefaultVideoSettings,
  'button': getDefaultButtonSettings,
  'icon': getDefaultIconSettings,
  'variants': getDefaultVariantsSettings,
  'canvas': getDefaultCanvasSettings,
  'freeform': getDefaultFreeformSettings,
}

// Lookup map for default styles - O(1) access instead of switch statement
const defaultStylesMap: Record<SectionBlockType, () => SectionBlock['styles']> = {
  'container': getDefaultContainerStyles,
  'grid': getDefaultGridStyles,
  'stack': getDefaultStackStyles,
  'heading': getDefaultHeadingStyles,
  'text': getDefaultTextStyles,
  'image': getDefaultImageStyles,
  'video': getDefaultVideoStyles,
  'button': getDefaultButtonStyles,
  'icon': getDefaultIconStyles,
  'variants': getDefaultVariantsStyles,
  'canvas': getDefaultCanvasStyles,
  'freeform': getDefaultFreeformStyles,
}

export function getDefaultSettings(type: SectionBlockType): SectionBlock['settings'] {
  const factory = defaultSettingsMap[type]
  if (!factory) throw new Error(`No default settings for type: ${type}`)
  return factory()
}

export function getDefaultStyles(type: SectionBlockType): SectionBlock['styles'] {
  const factory = defaultStylesMap[type]
  if (!factory) throw new Error(`No default styles for type: ${type}`)
  return factory()
}

export function createSectionBlock(type: SectionBlockType): SectionBlock {
  const block: SectionBlock = {
    id: generateId(),
    type,
    name: sectionBlockLabels[type],
    children: canHaveChildren(type) ? [] : undefined,
    settings: getDefaultSettings(type),
    styles: getDefaultStyles(type),
  }

  // Add default Text child for buttons
  if (type === 'button') {
    block.children = [{
      id: generateId(),
      type: 'text',
      name: 'Text',
      settings: { content: 'Click me' },
      styles: {
        padding: { top: '0', bottom: '0', left: '0', right: '0' },
        margin: { top: '0', bottom: '0', left: '0', right: '0' },
        fontSize: '16px',
        lineHeight: '1',
        alignment: 'center',
      },
    }]
  }

  return block
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
