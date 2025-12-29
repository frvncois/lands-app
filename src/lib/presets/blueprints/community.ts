import type { SectionBlueprint } from '../types'

export const nonprofitHero: SectionBlueprint = {
  id: 'nonprofit-hero',
  type: 'hero',
  variant: 'overlay',
  dataOverrides: {
    headline: 'Organization Name',
    subheadline: 'Making a difference in [cause]',
    primaryCTA: { label: 'Donate Now', url: '#' },
  },
}

export const communityBlueprints: SectionBlueprint[] = [
  nonprofitHero,
]
