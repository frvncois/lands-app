import type { Template } from '@/types/sections'

/**
 * Creator Template
 * Link-in-bio style: Hero + Links
 */
export const creatorTemplate: Template = {
  id: 'creator',
  name: 'Creator',
  description: 'Perfect for link-in-bio and creator pages',
  category: 'creator',
  themeId: 'minimal',
  sections: [
    {
      type: 'hero',
      variant: 'stacked',
      data: {
        headline: '@yourname',
        subheadline: 'Creator | Artist | Builder',
      },
    },
    {
      type: 'links',
      variant: 'stacked',
      data: {
        items: [
          { label: 'My Latest Video', url: 'https://youtube.com' },
          { label: 'Shop My Merch', url: 'https://shop.example.com' },
          { label: 'Newsletter', url: 'https://newsletter.example.com' },
          { label: 'Twitter', url: 'https://twitter.com' },
          { label: 'Instagram', url: 'https://instagram.com' },
        ],
      },
    },
  ],
}
