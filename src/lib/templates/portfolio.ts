import type { Template } from '@/types/sections'

/**
 * Portfolio Template
 * Simple portfolio structure: Hero + Cards + Links
 */
export const portfolioTemplate: Template = {
  id: 'portfolio',
  name: 'Portfolio',
  description: 'Showcase your work with a clean portfolio layout',
  category: 'portfolio',
  themeId: 'modern',
  sections: [
    {
      type: 'hero',
      variant: 'stacked',
      data: {
        headline: 'Your Name',
        subheadline: 'Designer, Developer, Creator',
      },
    },
    {
      type: 'cards',
      variant: 'grid',
      data: {
        items: [
          { image: '', headline: 'Project One', paragraph: 'Brief description of this project' },
          { image: '', headline: 'Project Two', paragraph: 'Brief description of this project' },
          { image: '', headline: 'Project Three', paragraph: 'Brief description of this project' },
        ],
      },
    },
    {
      type: 'links',
      variant: 'stacked',
      data: {
        items: [
          { label: 'Twitter', url: 'https://twitter.com' },
          { label: 'GitHub', url: 'https://github.com' },
          { label: 'Email', url: 'mailto:hello@example.com' },
        ],
      },
    },
  ],
}
