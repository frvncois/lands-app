import type { SectionBlueprint } from '../types'

export const productLaunchHero: SectionBlueprint = {
  id: 'product-launch-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Product Name',
    subheadline: 'The future of [category] is here',
    primaryCTA: { label: 'Buy Now', url: '#' },
  },
  styleOverrides: {
    spacingY: 0,
    spacingX: 60,
  },
}

export const launchSubscribe: SectionBlueprint = {
  id: 'launch-subscribe',
  type: 'subscribe',
  variant: 'stacked',
  dataOverrides: {
    headline: 'Get Notified',
    paragraph: 'Be the first to know when we launch.',
    emailPlaceholder: 'Your email address',
    submitButton: { label: 'Notify Me', url: '#' },
  },
}

export const dropSubscribe: SectionBlueprint = {
  id: 'drop-subscribe',
  type: 'subscribe',
  variant: 'stacked',
  dataOverrides: {
    headline: 'Don\'t Miss the Drop',
    paragraph: 'Sign up to get notified when this drops.',
    emailPlaceholder: 'Enter your email',
    submitButton: { label: 'Notify Me', url: '#' },
  },
}

export const commerceBlueprints: SectionBlueprint[] = [
  productLaunchHero,
  launchSubscribe,
  dropSubscribe,
]
