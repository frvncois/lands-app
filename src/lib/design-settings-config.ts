import type { PageSettings } from '@/types/designer'

export interface DesignSettingField {
  key: keyof PageSettings
  label: string
  type: 'color' | 'font-family' | 'size' | 'text'
  category: 'colors' | 'typography' | 'spacing' | 'layout'
  defaultValue?: string
}

export const designSettingsConfig: DesignSettingField[] = [
  // Color Palette
  {
    key: 'primaryColor',
    label: 'Primary',
    type: 'color',
    category: 'colors',
    defaultValue: '#171717',
  },
  {
    key: 'secondaryColor',
    label: 'Secondary',
    type: 'color',
    category: 'colors',
    defaultValue: '#f5f5f5',
  },
  {
    key: 'accentColor',
    label: 'Accent',
    type: 'color',
    category: 'colors',
    defaultValue: '#3b82f6',
  },
  {
    key: 'backgroundColor',
    label: 'Background',
    type: 'color',
    category: 'colors',
    defaultValue: '#ffffff',
  },
  {
    key: 'textColor',
    label: 'Text',
    type: 'color',
    category: 'colors',
    defaultValue: '#171717',
  },

  // Typography
  {
    key: 'fontFamily',
    label: 'Body Font',
    type: 'font-family',
    category: 'typography',
    defaultValue: 'Inter',
  },
  {
    key: 'headingFontFamily',
    label: 'Heading Font',
    type: 'font-family',
    category: 'typography',
    defaultValue: 'Inter',
  },
]

// Helper to get settings by category
export function getSettingsByCategory(
  category: DesignSettingField['category']
): DesignSettingField[] {
  return designSettingsConfig.filter((s) => s.category === category)
}

// Categories for UI organization
export const designCategories = [
  { id: 'colors' as const, label: 'Color Palette', icon: 'lni-palette' },
  { id: 'typography' as const, label: 'Typography', icon: 'lni-text-format' },
]
