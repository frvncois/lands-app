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
}

export const commerceBlueprints: SectionBlueprint[] = [
  productLaunchHero,
]
