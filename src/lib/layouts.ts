import type { SectionBlock, PageSettings, HeaderSettings, FooterSettings, UseCaseCategory } from '@/types/editor'
import {
  generateId,
  getDefaultHeaderSettings,
  getDefaultHeaderStyles,
  getDefaultFooterSettings,
  getDefaultFooterStyles,
  getDefaultPageSettings,
} from './editor-utils'

// Re-export UseCaseCategory from editor types
export type { UseCaseCategory } from '@/types/editor'

export interface UseCase {
  id: UseCaseCategory
  name: string
  description: string
  icon: string
}

export interface ProjectLayout {
  id: string
  name: string
  description: string
  useCase: UseCaseCategory
  thumbnail?: string
  pageSettings: PageSettings
  blocks: SectionBlock[]
}

// Available use cases
export const USE_CASES: UseCase[] = [
  {
    id: 'personal',
    name: 'Personal & Bio',
    description: 'For personal sites, link-in-bio, and social profiles',
    icon: 'lni-user-4',
  },
]

// Create default header block
function createHeaderBlock(settings?: Partial<HeaderSettings>): SectionBlock {
  return {
    id: generateId(),
    type: 'header',
    name: 'Header',
    settings: {
      ...getDefaultHeaderSettings(),
      ...settings,
    },
    styles: getDefaultHeaderStyles(),
  }
}

// Create default footer block
function createFooterBlock(settings?: Partial<FooterSettings>): SectionBlock {
  return {
    id: generateId(),
    type: 'footer',
    name: 'Footer',
    settings: {
      ...getDefaultFooterSettings(),
      ...settings,
    },
    styles: getDefaultFooterStyles(),
  }
}

// Wrap layout blocks with header and footer
function wrapWithHeaderFooter(blocks: SectionBlock[]): SectionBlock[] {
  return [createHeaderBlock(), ...blocks, createFooterBlock()]
}

// ============================================
// LAYOUT TEMPLATES
// ============================================

export const LAYOUTS: ProjectLayout[] = [
  // ===== BLANK LAYOUT =====
  {
    id: 'blank',
    name: 'Blank',
    description: 'Start from scratch',
    useCase: 'personal',
    pageSettings: getDefaultPageSettings(),
    blocks: [],
  },
]

// Helper functions
export function getUseCaseById(id: UseCaseCategory): UseCase | undefined {
  return USE_CASES.find(uc => uc.id === id)
}

export function getLayoutsByUseCase(_useCase: UseCaseCategory): ProjectLayout[] {
  // For now, just return blank layout
  return LAYOUTS.map(layout => ({
    ...layout,
    pageSettings: {
      ...layout.pageSettings,
      useCase: layout.useCase,
      layoutId: layout.id,
    },
    blocks: wrapWithHeaderFooter(layout.blocks),
  }))
}

export function getLayoutById(id: string): ProjectLayout | undefined {
  const layout = LAYOUTS.find(l => l.id === id)
  if (!layout) return undefined

  // Return a copy with header and footer added, and useCase/layoutId in pageSettings
  return {
    ...layout,
    pageSettings: {
      ...layout.pageSettings,
      useCase: layout.useCase,
      layoutId: layout.id,
    },
    blocks: wrapWithHeaderFooter(layout.blocks),
  }
}

export function getBlankLayout(): ProjectLayout {
  const blank = LAYOUTS.find(l => l.id === 'blank')!
  return {
    ...blank,
    pageSettings: {
      ...blank.pageSettings,
      useCase: undefined,
      layoutId: 'blank',
    },
    blocks: wrapWithHeaderFooter([]), // Just header and footer
  }
}

// Get all layouts for a use case (for style switching in editor)
export function getStylesForUseCase(_useCase: UseCaseCategory): ProjectLayout[] {
  // For now, just return blank layout
  return LAYOUTS.map(layout => ({
    ...layout,
    pageSettings: {
      ...layout.pageSettings,
      useCase: layout.useCase,
      layoutId: layout.id,
    },
    blocks: wrapWithHeaderFooter(layout.blocks),
  }))
}
