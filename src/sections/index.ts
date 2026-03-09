export interface SectionSettings {
  layout: 'full-width' | 'contained' | 'split'
}

export interface SectionPrimitive {
  id: string
  label: string
  defaultSettings: SectionSettings
}

export const sectionPrimitives: SectionPrimitive[] = [
  { id: 'header', label: 'Header', defaultSettings: { layout: 'full-width' } },
  { id: 'text', label: 'Text', defaultSettings: { layout: 'contained' } },
  { id: 'list', label: 'List', defaultSettings: { layout: 'contained' } },
  { id: 'collection', label: 'Collection', defaultSettings: { layout: 'full-width' } },
  { id: 'store', label: 'Store', defaultSettings: { layout: 'full-width' } },
  { id: 'campaign', label: 'Campaign', defaultSettings: { layout: 'contained' } },
  { id: 'footer', label: 'Footer', defaultSettings: { layout: 'full-width' } },
]

export const layoutOptions = ['full-width', 'contained', 'split']
