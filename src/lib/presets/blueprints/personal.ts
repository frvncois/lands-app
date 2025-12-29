import type { SectionBlueprint } from '../types'

export const personalHero: SectionBlueprint = {
  id: 'personal-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Your Name',
    subheadline: 'Designer, Developer, Creator',
    primaryCTA: { label: 'Get in Touch', url: '#' },
  },
}

export const personalBlueprints: SectionBlueprint[] = [
  personalHero,
]
