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

export const waitlistSubscribe: SectionBlueprint = {
  id: 'waitlist-subscribe',
  type: 'subscribe',
  variant: 'stacked',
  dataOverrides: {
    headline: 'Join the Waitlist',
    paragraph: 'Be the first to know when we launch.',
    emailPlaceholder: 'Enter your email',
    submitButton: { label: 'Join Waitlist', url: '#' },
  },
}

export const businessBlueprints: SectionBlueprint[] = [
  startupHero,
  waitlistSubscribe,
]
