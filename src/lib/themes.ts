import type { Theme } from '@/types/editor'
import { getDefaultPageSettings } from './editor-utils'

// Just a blank theme for now - more can be added later
export const THEMES: Theme[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Start with a clean slate',
    preview: '#ffffff',
    pageSettings: getDefaultPageSettings(),
    blocks: [],
  },
]

export function getThemeById(id: string): Theme | undefined {
  return THEMES.find(t => t.id === id)
}

export function getAllThemes(): Theme[] {
  return THEMES
}
