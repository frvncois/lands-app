import type { SectionBlockType } from '@/types/editor'
import {
  headingLevelOptions as headingLevelOptionsRaw,
  buttonSizeOptions as buttonSizeOptionsRaw,
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
  | 'link'

// Select/Segmented option type
export interface SelectOption {
  value: string
  label: string
  icon?: string
}

// Convert readonly arrays from editor-utils to mutable SelectOption arrays
const headingLevelOptions: SelectOption[] = [...headingLevelOptionsRaw]
const buttonSizeOptions: SelectOption[] = [...buttonSizeOptionsRaw]
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

// Inline group - multiple fields on one line
export interface InlineGroupConfig {
  type: 'inline-group'
  label: string
  fields: FieldConfig[]
}

// Content section configuration
export interface ContentSectionConfig {
  title: string
  icon: string
  fields: (FieldConfig | ToggleGroupConfig | InlineGroupConfig)[]
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
  | 'display'
  | 'styles'
  | 'typography'
  | 'effects'

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
            type: 'inline-group',
            label: 'Text',
            fields: [
              {
                key: 'content',
                type: 'text',
                label: '',
                placeholder: 'Heading text',
                translatable: true,
              },
              {
                key: 'level',
                type: 'select',
                label: '',
                props: { options: headingLevelOptions },
              },
            ],
          },
        ],
      },
    ],
    sections: ['typography', 'display', 'styles', 'effects'],
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
    sections: ['typography', 'display', 'styles', 'effects'],
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
            key: 'url',
            type: 'link',
            label: 'Link to',
          },
        ],
      },
    ],
    sections: ['typography', 'display', 'styles', 'effects'],
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
            key: 'overlay',
            type: 'color',
            label: 'Overlay',
            horizontal: true,
            props: {
              swatchOnly: true,
            },
          },
          {
            key: 'overlayOpacity',
            type: 'slider',
            label: 'Overlay Opacity',
            horizontal: true,
            condition: {
              field: 'overlay',
              operator: '!=',
              value: '',
            },
            props: {
              min: 0,
              max: 100,
              step: 5,
              unit: '%',
              defaultValue: '50',
            },
          },
        ],
      },
    ],
    sections: ['display', 'styles', 'effects'],
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
    sections: ['display', 'styles', 'effects'],
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
    sections: ['display', 'styles', 'effects'],
  },

  // Layout blocks
  grid: {
    sections: ['display', 'styles', 'effects'],
  },

  container: {
    sections: ['display', 'styles', 'effects'],
  },

  stack: {
    sections: ['display', 'styles', 'effects'],
  },

  canvas: {
    sections: ['display', 'styles', 'effects'],
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
  'variants',
]

// Check if block type uses custom inspector
export function usesCustomInspector(type: SectionBlockType): boolean {
  return customInspectorTypes.includes(type)
}
