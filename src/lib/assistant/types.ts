export type FlowId = 'create' | 'edit' | 'learn' | 'billing' | 'support'

export interface FlowOption {
  id: string
  label: string
  icon?: string
  description?: string
}

export interface SectionPreset {
  type: string
  variant?: string
}

export interface SubcategoryOption {
  id: string
  label: string
  sections: SectionPreset[]
  placeholders: {
    headline: string
    subheadline: string
    paragraph?: string
    ctaLabel?: string
  }
}

export interface CategoryOption {
  id: string
  label: string
  icon: string
  subcategories: SubcategoryOption[]
}

export type AssistantStep =
  | { type: 'options'; prompt: string; options: FlowOption[] }
  | { type: 'categories' }
  | { type: 'subcategories'; categoryId: string }
  | { type: 'input'; prompt: string; placeholder: string; key: string }
  | { type: 'themes' }
  | { type: 'projects' }
  | { type: 'complete'; action: string }
