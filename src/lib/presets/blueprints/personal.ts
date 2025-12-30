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
  styleOverrides: {
    spacingY: 0,
    spacingX: 60,
  },
}

export const personalBlueprints: SectionBlueprint[] = [
  personalHero,
]
