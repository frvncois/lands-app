import type { SectionBlockType } from '@/types/designer'

/**
 * Configuration for block rendering behavior
 * Defines capabilities and requirements for each block type
 */
export interface BlockRenderConfig {
  /** Display name for the block type */
  label: string
  /** Icon name from lineicons */
  icon: string
  /** Whether this block can contain children */
  hasChildren: boolean
  /** Whether this block supports background media (image/video) */
  hasBackground: boolean
  /** Whether to show empty state when no children */
  hasEmptyState: boolean
  /** Whether this block supports inline text editing */
  supportsInlineEdit: boolean
  /** Fields that can be edited inline (e.g., ['content', 'label']) */
  editableFields?: string[]
  /** Whether this block is a layout block */
  isLayout: boolean
  /** Default tag/element to render as */
  defaultTag?: string
}

/**
 * Block rendering configuration
 * Mirrors the pattern in inspector-config.ts
 */
export const blockRenderConfig: Record<SectionBlockType, BlockRenderConfig> = {
  // Layout blocks
  container: {
    label: 'Container',
    icon: 'layout',
    hasChildren: true,
    hasBackground: true,
    hasEmptyState: true,
    supportsInlineEdit: false,
    isLayout: true,
    defaultTag: 'div',
  },
  grid: {
    label: 'Grid',
    icon: 'layout-grid',
    hasChildren: true,
    hasBackground: true,
    hasEmptyState: true,
    supportsInlineEdit: false,
    isLayout: true,
    defaultTag: 'div',
  },
  stack: {
    label: 'Stack',
    icon: 'layout-stack',
    hasChildren: true,
    hasBackground: true,
    hasEmptyState: true,
    supportsInlineEdit: false,
    isLayout: true,
    defaultTag: 'div',
  },
  freeform: {
    label: 'Freeform',
    icon: 'layout-canvas',
    hasChildren: true,
    hasBackground: true,
    hasEmptyState: true,
    supportsInlineEdit: false,
    isLayout: true,
    defaultTag: 'div',
  },
  canvas: {
    label: 'Canvas',
    icon: 'layout-canvas',
    hasChildren: true,
    hasBackground: true,
    hasEmptyState: true,
    supportsInlineEdit: false,
    isLayout: true,
    defaultTag: 'div',
  },
  slider: {
    label: 'Slider',
    icon: 'lni-gallery',
    hasChildren: true,
    hasBackground: true,
    hasEmptyState: true,
    supportsInlineEdit: false,
    isLayout: true,
    defaultTag: 'div',
  },
  form: {
    label: 'Form',
    icon: 'form',
    hasChildren: true,
    hasBackground: true,
    hasEmptyState: true,
    supportsInlineEdit: false,
    isLayout: true,
    defaultTag: 'form',
  },

  // Content blocks
  heading: {
    label: 'Heading',
    icon: 'text-format',
    hasChildren: false,
    hasBackground: false,
    hasEmptyState: false,
    supportsInlineEdit: true,
    editableFields: ['content'],
    isLayout: false,
    defaultTag: 'h2',
  },
  text: {
    label: 'Text',
    icon: 'text-align-left',
    hasChildren: false,
    hasBackground: false,
    hasEmptyState: false,
    supportsInlineEdit: true,
    editableFields: ['content'],
    isLayout: false,
    defaultTag: 'div',
  },
  image: {
    label: 'Image',
    icon: 'image',
    hasChildren: false,
    hasBackground: false,
    hasEmptyState: false,
    supportsInlineEdit: false,
    isLayout: false,
    defaultTag: 'img',
  },
  video: {
    label: 'Video',
    icon: 'video',
    hasChildren: false,
    hasBackground: false,
    hasEmptyState: false,
    supportsInlineEdit: false,
    isLayout: false,
    defaultTag: 'video',
  },
  button: {
    label: 'Button',
    icon: 'cursor',
    hasChildren: false,
    hasBackground: false,
    hasEmptyState: false,
    supportsInlineEdit: true,
    editableFields: ['label'],
    isLayout: false,
    defaultTag: 'button',
  },
  icon: {
    label: 'Icon',
    icon: 'emoji-smile',
    hasChildren: false,
    hasBackground: false,
    hasEmptyState: false,
    supportsInlineEdit: false,
    isLayout: false,
    defaultTag: 'span',
  },
  variants: {
    label: 'Variants',
    icon: 'layers',
    hasChildren: true,
    hasBackground: false,
    hasEmptyState: false,
    supportsInlineEdit: false,
    isLayout: false,
    defaultTag: 'div',
  },

  // Form element blocks
  'form-input': {
    label: 'Input',
    icon: 'form-input',
    hasChildren: false,
    hasBackground: false,
    hasEmptyState: false,
    supportsInlineEdit: false,
    isLayout: false,
    defaultTag: 'input',
  },
  'form-textarea': {
    label: 'Textarea',
    icon: 'form-textarea',
    hasChildren: false,
    hasBackground: false,
    hasEmptyState: false,
    supportsInlineEdit: false,
    isLayout: false,
    defaultTag: 'textarea',
  },
  'form-checkbox': {
    label: 'Checkbox',
    icon: 'form-checkbox',
    hasChildren: false,
    hasBackground: false,
    hasEmptyState: false,
    supportsInlineEdit: false,
    isLayout: false,
    defaultTag: 'input',
  },
  'form-radio': {
    label: 'Radio',
    icon: 'form-radio',
    hasChildren: false,
    hasBackground: false,
    hasEmptyState: false,
    supportsInlineEdit: false,
    isLayout: false,
    defaultTag: 'input',
  },
  'form-button': {
    label: 'Submit Button',
    icon: 'form-button',
    hasChildren: false,
    hasBackground: false,
    hasEmptyState: false,
    supportsInlineEdit: true,
    editableFields: ['label'],
    isLayout: false,
    defaultTag: 'button',
  },
  'form-label': {
    label: 'Label',
    icon: 'form-label',
    hasChildren: false,
    hasBackground: false,
    hasEmptyState: false,
    supportsInlineEdit: true,
    editableFields: ['content'],
    isLayout: false,
    defaultTag: 'label',
  },

}

/**
 * Get layout block types
 */
export const layoutBlockTypes = Object.entries(blockRenderConfig)
  .filter(([_, config]) => config.isLayout)
  .map(([type]) => type as SectionBlockType)

/**
 * Get content block types (non-layout)
 */
export const contentBlockTypes = Object.entries(blockRenderConfig)
  .filter(([_, config]) => !config.isLayout)
  .map(([type]) => type as SectionBlockType)

/**
 * Get blocks that support inline editing
 */
export const inlineEditableBlockTypes = Object.entries(blockRenderConfig)
  .filter(([_, config]) => config.supportsInlineEdit)
  .map(([type]) => type as SectionBlockType)

/**
 * Get blocks that support background media
 */
export const backgroundSupportingBlockTypes = Object.entries(blockRenderConfig)
  .filter(([_, config]) => config.hasBackground)
  .map(([type]) => type as SectionBlockType)

/**
 * Check if a block type has specific capability
 */
export function hasCapability(
  blockType: SectionBlockType,
  capability: keyof BlockRenderConfig
): boolean {
  const config = blockRenderConfig[blockType]
  return config ? Boolean(config[capability]) : false
}

/**
 * Get editable fields for a block type
 */
export function getEditableFields(blockType: SectionBlockType): string[] {
  return blockRenderConfig[blockType]?.editableFields || []
}
