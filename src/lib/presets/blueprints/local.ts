import type { SectionBlueprint } from '../types'

export const realEstateHero: SectionBlueprint = {
  id: 'real-estate-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Agent Name',
    subheadline: 'Your Local Real Estate Expert',
    primaryCTA: { label: 'View Listings', url: '#' },
  },
  styleOverrides: {
    spacingY: 0,
    spacingX: 60,
  },
}

export const localBlueprints: SectionBlueprint[] = [
  realEstateHero,
]
