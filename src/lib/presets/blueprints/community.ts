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

export const communitySubscribe: SectionBlueprint = {
  id: 'community-subscribe',
  type: 'subscribe',
  variant: 'stacked',
  dataOverrides: {
    headline: 'Join Our Community',
    paragraph: 'Stay connected with news and updates.',
    emailPlaceholder: 'Your email',
    submitButton: { label: 'Subscribe', url: '#' },
  },
}

export const newsletterSubscribe: SectionBlueprint = {
  id: 'newsletter-subscribe',
  type: 'subscribe',
  variant: 'split',
  dataOverrides: {
    headline: 'Newsletter',
    paragraph: 'Get our monthly newsletter with updates and stories.',
    emailPlaceholder: 'Enter your email',
    submitButton: { label: 'Subscribe', url: '#' },
  },
}

export const communityBlueprints: SectionBlueprint[] = [
  nonprofitHero,
  communitySubscribe,
  newsletterSubscribe,
]
