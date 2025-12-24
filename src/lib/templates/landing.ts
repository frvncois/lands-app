import type { Template } from '@/types/sections'

/**
 * Landing Template
 * Product/service landing page: Hero + Cards + Text
 */
export const landingTemplate: Template = {
  id: 'landing',
  name: 'Landing Page',
  description: 'Promote your product or service',
  category: 'landing',
  themeId: 'bold',
  sections: [
    {
      type: 'hero',
      variant: 'stacked',
      data: {
        headline: 'Build Something Amazing',
        subheadline: 'The fastest way to create beautiful landing pages that convert visitors into customers.',
      },
    },
    {
      type: 'cards',
      variant: 'grid',
      data: {
        items: [
          { image: '', headline: 'Fast', paragraph: 'Launch in minutes, not days' },
          { image: '', headline: 'Beautiful', paragraph: 'Stunning designs out of the box' },
          { image: '', headline: 'Powerful', paragraph: 'All the features you need' },
        ],
      },
    },
    {
      type: 'text',
      variant: 'default',
      data: {
        headline: 'Ready to get started?',
        content: 'Join thousands of creators who are already building with us. Start your free trial today.',
      },
    },
  ],
}
