import type { SectionBlueprint } from '../types'

export const startupHero: SectionBlueprint = {
  id: 'startup-hero',
  type: 'hero',
  variant: 'stacked',
  dataOverrides: {
    headline: 'The Future of [Industry]',
    subheadline: 'One line explaining your value proposition',
    primaryCTA: { label: 'Get Started', url: '#' },
  },
}

export const businessBlueprints: SectionBlueprint[] = [
  startupHero,
]
