import type { SectionBlockType } from '@/types/editor'
import {
  headingLevelOptions as headingLevelOptionsRaw,
  buttonSizeOptions as buttonSizeOptionsRaw,
  formInputTypeOptions as formInputTypeOptionsRaw,
  maskShapes,
  maskShapeLabels,
  justifyContentOptions as justifyContentOptionsRaw,
  alignItemsOptions as alignItemsOptionsRaw,
} from '@/lib/editor-utils'

// Field type definitions
export type FieldType =
  | 'text'
  | 'text-multiline'
  | 'image'
  | 'color'
  | 'toggle'
  | 'slider'
  | 'size'
  | 'select'
  | 'segmented'

// Select/Segmented option type
export interface SelectOption {
  value: string
  label: string
  icon?: string
}

// Convert readonly arrays from editor-utils to mutable SelectOption arrays
const headingLevelOptions: SelectOption[] = [...headingLevelOptionsRaw]
const buttonSizeOptions: SelectOption[] = [...buttonSizeOptionsRaw]
const formInputTypeOptions: SelectOption[] = [...formInputTypeOptionsRaw]
const justifyContentOptions: SelectOption[] = [...justifyContentOptionsRaw]
const alignItemsOptions: SelectOption[] = [...alignItemsOptionsRaw]

// Field configuration
export interface FieldConfig {
  key: string
  type: FieldType
  label: string
  target?: 'settings' | 'styles'
  horizontal?: boolean
  placeholder?: string
  translatable?: boolean
  condition?: {
    field: string
    operator: '==' | '!=' | 'in' | 'not-in'
    value: string | string[] | boolean
  }
  props?: {
    // For slider
    min?: number
    max?: number
    step?: number
    unit?: string
    // For select/segmented
    options?: SelectOption[]
    iconOnly?: boolean
    // For color
    swatchOnly?: boolean
    // For size
    defaultValue?: string
    // For nested key updates (like border.radius)
    nestedKey?: string
  }
}

// Group of toggles (like video settings)
export interface ToggleGroupConfig {
  type: 'toggle-group'
  fields: {
    key: string
    label: string
    defaultValue?: boolean
  }[]
}

// Content section configuration
export interface ContentSectionConfig {
  title: string
  icon: string
  fields: (FieldConfig | ToggleGroupConfig)[]
}

// Background section (special case with type switching)
export interface BackgroundSectionConfig {
  type: 'background'
  title: string
  icon: string
  typeKey: string
  colorKey: string
  imageKey: string
  videoKey: string
}

// Shadow section (special case with size presets)
export interface ShadowSectionConfig {
  type: 'shadow'
  title: string
  icon: string
}

// Shared section types
export type SharedSection =
  | 'size'
  | 'typography'
  | 'spacing'
  | 'border'
  | 'opacity'
  | 'position'
  | 'display'

// Typography section defaults (per block type)
export interface TypographyDefaults {
  defaultFontSize?: string
  defaultFontWeight?: string
}

// Block inspector configuration
export interface BlockInspectorConfig {
  content?: (ContentSectionConfig | BackgroundSectionConfig | ShadowSectionConfig)[]
  sections: SharedSection[]
  typographyDefaults?: TypographyDefaults
}

// Common options
const aspectRatioOptions: SelectOption[] = [
  { value: 'auto', label: 'Auto' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
  { value: '16:9', label: '16:9 (Widescreen)' },
  { value: '9:16', label: '9:16 (Portrait)' },
  { value: '3:2', label: '3:2' },
  { value: '2:3', label: '2:3' },
]

const videoAspectRatioOptions: SelectOption[] = [
  { value: 'auto', label: 'Auto' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '16:9', label: '16:9' },
]

const objectFitOptions: SelectOption[] = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
  { value: 'none', label: 'None' },
  { value: 'scale-down', label: 'Scale Down' },
]

const maskOptions: SelectOption[] = maskShapes.map(shape => ({
  value: shape,
  label: maskShapeLabels[shape],
}))

const stackDirectionOptions: SelectOption[] = [
  { value: 'vertical', label: 'Vertical', icon: 'style-column' },
  { value: 'horizontal', label: 'Horizontal', icon: 'style-row' },
]

const backgroundTypeOptions: SelectOption[] = [
  { value: 'color', label: 'Color', icon: 'style-color' },
  { value: 'image', label: 'Image', icon: 'content-image' },
  { value: 'video', label: 'Video', icon: 'content-video' },
]

const dividerStyleOptions: SelectOption[] = [
  { value: 'line', label: 'Line', icon: 'content-divider' },
  { value: 'dashed', label: 'Dashed', icon: 'content-divider' },
  { value: 'dotted', label: 'Dotted', icon: 'content-divider' },
  { value: 'space', label: 'Space', icon: 'style-row' },
]

// Inspector configurations for all block types
export const inspectorConfig: Partial<Record<SectionBlockType, BlockInspectorConfig>> = {
  // Content blocks
  heading: {
    content: [
      {
        title: 'Content',
        icon: 'content-heading',
        fields: [
          {
            key: 'content',
            type: 'text',
            label: 'Text',
            placeholder: 'Heading text',
            translatable: true,
          },
          {
            key: 'level',
            type: 'segmented',
            label: 'Level',
            horizontal: true,
            props: { options: headingLevelOptions },
          },
        ],
      },
    ],
    sections: ['size', 'typography', 'spacing', 'border', 'opacity', 'position'],
    typographyDefaults: {
      defaultFontSize: '36px',
      defaultFontWeight: 'bold',
    },
  },

  text: {
    content: [
      {
        title: 'Content',
        icon: 'content-text',
        fields: [
          {
            key: 'content',
            type: 'text-multiline',
            label: 'Text',
            placeholder: 'Enter your text...',
            translatable: true,
          },
        ],
      },
    ],
    sections: ['size', 'typography', 'spacing', 'border', 'opacity', 'position'],
    typographyDefaults: {
      defaultFontSize: '16px',
      defaultFontWeight: 'normal',
    },
  },

  button: {
    content: [
      {
        title: 'Button',
        icon: 'content-button',
        fields: [
          {
            key: 'label',
            type: 'text',
            label: 'Label',
            placeholder: 'Button text',
            translatable: true,
          },
          {
            key: 'url',
            type: 'text',
            label: 'URL',
            placeholder: 'https://...',
          },
          {
            key: 'newTab',
            type: 'toggle',
            label: 'Open in new tab',
          },
        ],
      },
      {
        type: 'background',
        title: 'Background',
        icon: 'style-color',
        typeKey: 'backgroundType',
        colorKey: 'backgroundColor',
        imageKey: 'backgroundImage',
        videoKey: 'backgroundVideo',
      },
    ],
    sections: ['size', 'display', 'typography', 'spacing', 'border', 'opacity', 'position'],
  },

  image: {
    content: [
      {
        title: 'Image',
        icon: 'content-image',
        fields: [
          {
            key: 'src',
            type: 'image',
            label: 'Source',
            placeholder: 'Upload image',
          },
          {
            key: 'alt',
            type: 'text',
            label: 'Alt Text',
            placeholder: 'Image description',
          },
          {
            key: 'linkUrl',
            type: 'text',
            label: 'Link URL',
            placeholder: 'https://...',
          },
        ],
      },
      {
        title: 'Style',
        icon: 'style-color',
        fields: [
          {
            key: 'aspectRatio',
            type: 'select',
            label: 'Aspect Ratio',
            target: 'styles',
            props: { options: aspectRatioOptions, defaultValue: 'auto' },
          },
          {
            key: 'objectFit',
            type: 'select',
            label: 'Object Fit',
            target: 'styles',
            props: { options: objectFitOptions, defaultValue: 'cover' },
          },
          {
            key: 'mask',
            type: 'select',
            label: 'Mask',
            target: 'styles',
            props: { options: maskOptions, defaultValue: 'none' },
          },
          {
            key: 'borderRadius',
            type: 'slider',
            label: 'Border Radius',
            target: 'styles',
            horizontal: true,
            props: { min: 0, max: 48, step: 4, defaultValue: '0' },
          },
        ],
      },
    ],
    sections: ['size', 'spacing', 'border', 'opacity', 'position'],
  },

  video: {
    content: [
      {
        title: 'Video',
        icon: 'content-video',
        fields: [
          {
            key: 'src',
            type: 'text',
            label: 'Source URL',
            placeholder: 'YouTube, Vimeo, or file URL',
          },
          {
            key: 'thumbnail',
            type: 'image',
            label: 'Thumbnail',
            placeholder: 'Upload thumbnail',
          },
          {
            type: 'toggle-group',
            fields: [
              { key: 'autoplay', label: 'Autoplay', defaultValue: false },
              { key: 'loop', label: 'Loop', defaultValue: false },
              { key: 'muted', label: 'Muted', defaultValue: false },
              { key: 'controls', label: 'Show controls', defaultValue: true },
            ],
          },
        ],
      },
      {
        title: 'Style',
        icon: 'style-color',
        fields: [
          {
            key: 'aspectRatio',
            type: 'select',
            label: 'Aspect Ratio',
            target: 'styles',
            props: { options: videoAspectRatioOptions, defaultValue: '16:9' },
          },
          {
            key: 'mask',
            type: 'select',
            label: 'Mask',
            target: 'styles',
            props: { options: maskOptions, defaultValue: 'none' },
          },
        ],
      },
    ],
    sections: ['size', 'spacing', 'border', 'opacity', 'position'],
  },

  icon: {
    content: [
      {
        title: 'Icon',
        icon: 'content-icon',
        fields: [
          {
            key: 'icon',
            type: 'text',
            label: 'Icon Name',
            placeholder: 'content-icon',
          },
          {
            key: 'size',
            type: 'slider',
            label: 'Size',
            horizontal: true,
            props: { min: 12, max: 96, step: 4, unit: 'px', defaultValue: '24' },
          },
          {
            key: 'linkUrl',
            type: 'text',
            label: 'Link URL',
            placeholder: 'https://...',
          },
          {
            key: 'linkNewTab',
            type: 'toggle',
            label: 'Open in new tab',
          },
        ],
      },
      {
        title: 'Style',
        icon: 'style-color',
        fields: [
          {
            key: 'color',
            type: 'color',
            label: 'Color',
            target: 'styles',
            horizontal: true,
            props: { swatchOnly: true },
          },
        ],
      },
    ],
    sections: ['size', 'spacing', 'border', 'opacity', 'position'],
  },

  divider: {
    content: [
      {
        title: 'Divider',
        icon: 'content-divider',
        fields: [
          {
            key: 'style',
            type: 'segmented',
            label: 'Style',
            horizontal: true,
            props: { options: dividerStyleOptions, iconOnly: true, defaultValue: 'line' },
          },
          {
            key: 'thickness',
            type: 'slider',
            label: 'Thickness',
            horizontal: true,
            condition: { field: 'style', operator: '!=', value: 'space' },
            props: { min: 1, max: 8, step: 1, defaultValue: '1' },
          },
          {
            key: 'width',
            type: 'slider',
            label: 'Width',
            horizontal: true,
            props: { min: 10, max: 100, step: 5, unit: '%', defaultValue: '100' },
          },
          {
            key: 'color',
            type: 'color',
            label: 'Color',
            horizontal: true,
            condition: { field: 'style', operator: '!=', value: 'space' },
            props: { swatchOnly: true },
          },
        ],
      },
    ],
    sections: ['size', 'spacing', 'opacity', 'position'],
  },

  // Layout blocks
  grid: {
    content: [
      {
        title: 'Grid',
        icon: 'layout-grid',
        fields: [
          {
            key: 'columns',
            type: 'slider',
            label: 'Columns',
            horizontal: true,
            props: {
              min: 1,
              max: 12,
              step: 1,
              unit: '',
            },
          },
        ],
      },
      {
        type: 'background',
        title: 'Background',
        icon: 'content-image',
        typeKey: 'backgroundType',
        colorKey: 'backgroundColor',
        imageKey: 'backgroundImage',
        videoKey: 'backgroundVideo',
      },
      {
        type: 'shadow',
        title: 'Shadow',
        icon: 'layout-stack',
      },
    ],
    sections: ['size', 'display', 'spacing', 'border', 'opacity', 'position'],
  },

  container: {
    content: [
      {
        type: 'background',
        title: 'Background',
        icon: 'content-image',
        typeKey: 'backgroundType',
        colorKey: 'backgroundColor',
        imageKey: 'backgroundImage',
        videoKey: 'backgroundVideo',
      },
    ],
    sections: ['size', 'display', 'spacing', 'border', 'opacity', 'position'],
  },

  stack: {
    content: [
      {
        type: 'background',
        title: 'Background',
        icon: 'content-image',
        typeKey: 'backgroundType',
        colorKey: 'backgroundColor',
        imageKey: 'backgroundImage',
        videoKey: 'backgroundVideo',
      },
      {
        type: 'shadow',
        title: 'Shadow',
        icon: 'layout-stack',
      },
    ],
    sections: ['size', 'display', 'spacing', 'border', 'opacity', 'position'],
  },

  canvas: {
    content: [
      {
        type: 'background',
        title: 'Background',
        icon: 'content-image',
        typeKey: 'backgroundType',
        colorKey: 'backgroundColor',
        imageKey: 'backgroundImage',
        videoKey: 'backgroundVideo',
      },
    ],
    sections: ['size', 'spacing', 'border', 'opacity', 'position'],
  },

  // Form blocks
  'form-input': {
    content: [
      {
        title: 'Input Settings',
        icon: 'content-form',
        fields: [
          {
            key: 'label',
            type: 'text',
            label: 'Label',
            placeholder: 'Field label',
          },
          {
            key: 'inputType',
            type: 'select',
            label: 'Input Type',
            props: { options: formInputTypeOptions },
          },
          {
            key: 'placeholder',
            type: 'text',
            label: 'Placeholder',
            placeholder: 'Placeholder text',
          },
          {
            key: 'required',
            type: 'toggle',
            label: 'Required field',
          },
        ],
      },
      {
        title: 'Style',
        icon: 'style-color',
        fields: [
          {
            key: 'fontSize',
            type: 'size',
            label: 'Font Size',
            target: 'styles',
            horizontal: true,
            placeholder: '16px',
            props: { defaultValue: '16px' },
          },
          {
            key: 'color',
            type: 'color',
            label: 'Text Color',
            target: 'styles',
            horizontal: true,
            props: { swatchOnly: true },
          },
          {
            key: 'labelColor',
            type: 'color',
            label: 'Label Color',
            target: 'styles',
            horizontal: true,
            props: { swatchOnly: true },
          },
        ],
      },
    ],
    sections: ['size', 'spacing', 'border', 'opacity', 'position'],
  },

  'form-textarea': {
    content: [
      {
        title: 'Textarea Settings',
        icon: 'content-form',
        fields: [
          {
            key: 'label',
            type: 'text',
            label: 'Label',
            placeholder: 'Field label',
          },
          {
            key: 'placeholder',
            type: 'text',
            label: 'Placeholder',
            placeholder: 'Placeholder text',
          },
          {
            key: 'rows',
            type: 'slider',
            label: 'Rows',
            horizontal: true,
            props: { min: 2, max: 10, step: 1, defaultValue: '4' },
          },
          {
            key: 'required',
            type: 'toggle',
            label: 'Required field',
          },
        ],
      },
      {
        title: 'Style',
        icon: 'style-color',
        fields: [
          {
            key: 'fontSize',
            type: 'size',
            label: 'Font Size',
            target: 'styles',
            horizontal: true,
            placeholder: '16px',
            props: { defaultValue: '16px' },
          },
          {
            key: 'color',
            type: 'color',
            label: 'Text Color',
            target: 'styles',
            horizontal: true,
            props: { swatchOnly: true },
          },
          {
            key: 'labelColor',
            type: 'color',
            label: 'Label Color',
            target: 'styles',
            horizontal: true,
            props: { swatchOnly: true },
          },
        ],
      },
    ],
    sections: ['size', 'spacing', 'border', 'opacity', 'position'],
  },

  'form-button': {
    content: [
      {
        title: 'Button Settings',
        icon: 'content-button',
        fields: [
          {
            key: 'label',
            type: 'text',
            label: 'Label',
            placeholder: 'Submit',
            translatable: true,
          },
          {
            key: 'size',
            type: 'segmented',
            label: 'Size',
            horizontal: true,
            props: { options: buttonSizeOptions },
          },
        ],
      },
      {
        title: 'Style',
        icon: 'style-color',
        fields: [
          {
            key: 'backgroundColor',
            type: 'color',
            label: 'Background',
            target: 'styles',
            horizontal: true,
            props: { swatchOnly: true },
          },
          {
            key: 'color',
            type: 'color',
            label: 'Text Color',
            target: 'styles',
            horizontal: true,
            props: { swatchOnly: true },
          },
        ],
      },
    ],
    sections: ['size', 'spacing', 'border', 'opacity', 'position'],
  },

  'form-label': {
    content: [
      {
        title: 'Label Settings',
        icon: 'content-text',
        fields: [
          {
            key: 'text',
            type: 'text',
            label: 'Text',
            placeholder: 'Label text',
            translatable: true,
          },
        ],
      },
      {
        title: 'Style',
        icon: 'style-color',
        fields: [
          {
            key: 'fontSize',
            type: 'size',
            label: 'Font Size',
            target: 'styles',
            horizontal: true,
            placeholder: '14px',
            props: { defaultValue: '14px' },
          },
          {
            key: 'fontWeight',
            type: 'segmented',
            label: 'Weight',
            target: 'styles',
            horizontal: true,
            props: {
              options: [
                { value: 'normal', label: 'Normal' },
                { value: 'medium', label: 'Medium' },
                { value: 'semibold', label: 'Semi' },
                { value: 'bold', label: 'Bold' },
              ],
            },
          },
          {
            key: 'color',
            type: 'color',
            label: 'Color',
            target: 'styles',
            horizontal: true,
            props: { swatchOnly: true },
          },
        ],
      },
    ],
    sections: ['spacing', 'opacity', 'position'],
  },

  form: {
    content: [
      {
        title: 'Form Settings',
        icon: 'content-form',
        fields: [
          {
            key: 'submitUrl',
            type: 'text',
            label: 'Submit URL',
            placeholder: 'https://...',
          },
          {
            key: 'submitMethod',
            type: 'segmented',
            label: 'Method',
            horizontal: true,
            props: {
              options: [
                { value: 'POST', label: 'POST' },
                { value: 'GET', label: 'GET' },
              ],
              defaultValue: 'POST',
            },
          },
          {
            key: 'successMessage',
            type: 'text',
            label: 'Success Message',
            placeholder: 'Thank you!',
            translatable: true,
          },
        ],
      },
      {
        type: 'background',
        title: 'Background',
        icon: 'content-image',
        typeKey: 'backgroundType',
        colorKey: 'backgroundColor',
        imageKey: 'backgroundImage',
        videoKey: 'backgroundVideo',
      },
    ],
    sections: ['display', 'spacing', 'border', 'opacity', 'position'],
  },
}

// Helper to check if a block type has a config
export function hasInspectorConfig(type: SectionBlockType): boolean {
  return type in inspectorConfig
}

// Helper to get config for a block type
export function getInspectorConfig(type: SectionBlockType): BlockInspectorConfig | undefined {
  return inspectorConfig[type]
}

// Types that should keep their custom inspector (complex logic)
export const customInspectorTypes: SectionBlockType[] = [
  'form-checkbox',
  'form-radio',
  'form-select',
  'variants',
]

// Check if block type uses custom inspector
export function usesCustomInspector(type: SectionBlockType): boolean {
  return customInspectorTypes.includes(type)
}
