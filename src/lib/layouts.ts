import type { SectionBlock, PageSettings, HeaderSectionSettings, FooterSectionSettings } from '@/types/editor'

// Use case categories
export type UseCaseCategory =
  | 'music'
  | 'restaurant'
  | 'event'
  | 'portfolio'
  | 'business'
  | 'personal'
  | 'ecommerce'
  | 'saas'

export interface UseCase {
  id: UseCaseCategory
  name: string
  description: string
  icon: string
}

export interface ProjectLayout {
  id: string
  name: string
  description: string
  useCase: UseCaseCategory
  thumbnail?: string
  pageSettings: PageSettings
  blocks: SectionBlock[]
}

// Available use cases
export const USE_CASES: UseCase[] = [
  {
    id: 'music',
    name: 'Music & Artist',
    description: 'For musicians, bands, DJs, and music producers',
    icon: 'lni-music',
  },
  {
    id: 'restaurant',
    name: 'Restaurant & Food',
    description: 'For restaurants, cafes, bars, and food businesses',
    icon: 'lni-restaurant',
  },
  {
    id: 'event',
    name: 'Event & Concert',
    description: 'For events, concerts, festivals, and shows',
    icon: 'lni-ticket',
  },
  {
    id: 'portfolio',
    name: 'Portfolio & Creative',
    description: 'For designers, photographers, and creatives',
    icon: 'lni-gallery',
  },
  {
    id: 'business',
    name: 'Business & Agency',
    description: 'For agencies, consultants, and professionals',
    icon: 'lni-briefcase-1',
  },
  {
    id: 'personal',
    name: 'Personal & Bio',
    description: 'For personal sites, link-in-bio, and social profiles',
    icon: 'lni-user-4',
  },
  {
    id: 'ecommerce',
    name: 'E-commerce & Products',
    description: 'For selling products, merch, and digital goods',
    icon: 'lni-shopping-cart-1',
  },
  {
    id: 'saas',
    name: 'SaaS & Startup',
    description: 'For software products and tech startups',
    icon: 'lni-code-1',
  },
]

// Helper to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

// Create default header block
function createHeaderBlock(settings?: Partial<HeaderSectionSettings>): SectionBlock {
  return {
    id: generateId(),
    type: 'header',
    name: 'Header',
    children: [],
    styles: {
      align: 'center',
      margin: { y: '0', x: '0' },
      padding: { y: '12', x: '16' },
    },
    headerSettings: {
      logo: '',
      logoAlt: 'Logo',
      navLinks: [
        { id: generateId(), label: 'Home', url: '#' },
        { id: generateId(), label: 'About', url: '#about' },
        { id: generateId(), label: 'Contact', url: '#contact' },
      ],
      ctaButton: { label: 'Get Started', url: '#', show: true },
      isHidden: false,
      ...settings,
    },
  }
}

// Create default footer block
function createFooterBlock(settings?: Partial<FooterSectionSettings>): SectionBlock {
  return {
    id: generateId(),
    type: 'footer',
    name: 'Footer',
    children: [],
    styles: {
      align: 'center',
      margin: { y: '0', x: '0' },
      padding: { y: '24', x: '16' },
    },
    footerSettings: {
      links: [
        { id: generateId(), label: 'Privacy', url: '#privacy' },
        { id: generateId(), label: 'Terms', url: '#terms' },
      ],
      copyrightText: '© 2024 Your Company. All rights reserved.',
      socialLinks: [
        { id: generateId(), platform: 'twitter', url: '#' },
        { id: generateId(), platform: 'instagram', url: '#' },
      ],
      isHidden: false,
      ...settings,
    },
  }
}

// Wrap layout blocks with header and footer
function wrapWithHeaderFooter(blocks: SectionBlock[]): SectionBlock[] {
  return [createHeaderBlock(), ...blocks, createFooterBlock()]
}

// Layout templates
export const LAYOUTS: ProjectLayout[] = [
  // ===== MUSIC LAYOUTS =====
  {
    id: 'music-dark',
    name: 'Dark Stage',
    description: 'Bold dark theme perfect for artists and bands',
    useCase: 'music',
    pageSettings: {
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      maxWidth: '1200px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Hero',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '120px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'Artist Name', level: 'h1' },
            styles: { fontSize: '5xl', fontWeight: 'bold', textColor: '#ffffff', textAlign: 'center' },
          },
          {
            id: generateId(),
            type: 'subheading',
            settings: { content: 'New Album Out Now' },
            styles: { fontSize: 'xl', textColor: '#a1a1aa', textAlign: 'center', margin: { y: '16px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'button',
            settings: { title: 'Listen Now', link: '#', variant: 'primary' },
            styles: { backgroundColor: '#ffffff', textColor: '#000000', margin: { y: '24px', x: '0' } },
          },
        ],
      },
      {
        id: generateId(),
        type: 'text',
        name: 'About',
        styles: {
          backgroundColor: '#111111',
          padding: { y: '80px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'About', level: 'h2' },
            styles: { fontSize: '3xl', fontWeight: 'bold', textColor: '#ffffff', textAlign: 'center' },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'Write your bio here. Tell your fans about your journey, your music, and what drives you as an artist.' },
            styles: { fontSize: 'lg', textColor: '#a1a1aa', textAlign: 'center', margin: { y: '24px', x: '0' } },
          },
        ],
      },
      {
        id: generateId(),
        type: 'link',
        name: 'Music Links',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '80px', x: '24px' },
          layout: 'list',
          gap: '12px',
        },
        children: [],
        linkSettings: {
          links: [
            { id: generateId(), image: '', heading: 'Spotify', url: '#' },
            { id: generateId(), image: '', heading: 'Apple Music', url: '#' },
            { id: generateId(), image: '', heading: 'YouTube', url: '#' },
          ],
          showImage: false,
          showHeading: true,
        },
      },
    ],
  },
  {
    id: 'music-vibrant',
    name: 'Neon Vibes',
    description: 'Colorful gradient style for electronic artists',
    useCase: 'music',
    pageSettings: {
      backgroundColor: '#1a1a2e',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      maxWidth: '1200px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Hero',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '140px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'subheading',
            settings: { content: 'Electronic Music Producer' },
            styles: { fontSize: 'sm', textColor: '#a78bfa', textAlign: 'center', fontWeight: 'medium' },
          },
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'DJ NAME', level: 'h1' },
            styles: { fontSize: '5xl', fontWeight: 'bold', textColor: '#ffffff', textAlign: 'center', margin: { y: '16px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'button',
            settings: { title: 'Book Now', link: '#', variant: 'primary' },
            styles: { backgroundColor: '#a78bfa', textColor: '#ffffff', margin: { y: '32px', x: '0' } },
          },
        ],
      },
    ],
  },

  // ===== RESTAURANT LAYOUTS =====
  {
    id: 'restaurant-elegant',
    name: 'Fine Dining',
    description: 'Elegant and sophisticated restaurant theme',
    useCase: 'restaurant',
    pageSettings: {
      backgroundColor: '#1c1917',
      textColor: '#fafaf9',
      fontFamily: 'Playfair Display',
      maxWidth: '1200px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Hero',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '120px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'subheading',
            settings: { content: 'Fine Dining Experience' },
            styles: { fontSize: 'sm', textColor: '#d4a574', textAlign: 'center', fontWeight: 'medium' },
          },
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'Restaurant Name', level: 'h1' },
            styles: { fontSize: '5xl', fontWeight: 'bold', textColor: '#fafaf9', textAlign: 'center', margin: { y: '16px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'An unforgettable culinary journey awaits' },
            styles: { fontSize: 'lg', textColor: '#a8a29e', textAlign: 'center', margin: { y: '16px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'button',
            settings: { title: 'Reserve a Table', link: '#', variant: 'primary' },
            styles: { backgroundColor: '#d4a574', textColor: '#1c1917', margin: { y: '32px', x: '0' } },
          },
        ],
      },
      {
        id: generateId(),
        type: 'text',
        name: 'Hours',
        styles: {
          backgroundColor: '#292524',
          padding: { y: '60px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'Hours & Location', level: 'h2' },
            styles: { fontSize: '2xl', fontWeight: 'bold', textColor: '#fafaf9', textAlign: 'center' },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'Monday - Sunday: 5pm - 11pm\n123 Main Street, City' },
            styles: { fontSize: 'base', textColor: '#a8a29e', textAlign: 'center', margin: { y: '16px', x: '0' } },
          },
        ],
      },
    ],
  },
  {
    id: 'restaurant-casual',
    name: 'Casual Eatery',
    description: 'Warm and inviting cafe or bistro theme',
    useCase: 'restaurant',
    pageSettings: {
      backgroundColor: '#fef7ed',
      textColor: '#1c1917',
      fontFamily: 'Inter',
      maxWidth: '1200px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Hero',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '100px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'Cafe Name', level: 'h1' },
            styles: { fontSize: '4xl', fontWeight: 'bold', textColor: '#1c1917', textAlign: 'center' },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'Fresh food, good vibes, great coffee' },
            styles: { fontSize: 'lg', textColor: '#78716c', textAlign: 'center', margin: { y: '16px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'button',
            settings: { title: 'View Menu', link: '#', variant: 'primary' },
            styles: { backgroundColor: '#ea580c', textColor: '#ffffff', margin: { y: '24px', x: '0' } },
          },
        ],
      },
    ],
  },

  // ===== EVENT LAYOUTS =====
  {
    id: 'event-concert',
    name: 'Concert Night',
    description: 'High-energy event and concert landing page',
    useCase: 'event',
    pageSettings: {
      backgroundColor: '#0f0f0f',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      maxWidth: '1200px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Hero',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '140px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'subheading',
            settings: { content: 'December 31, 2025 - New York City' },
            styles: { fontSize: 'sm', textColor: '#ef4444', textAlign: 'center', fontWeight: 'bold' },
          },
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'EVENT NAME', level: 'h1' },
            styles: { fontSize: '5xl', fontWeight: 'bold', textColor: '#ffffff', textAlign: 'center', margin: { y: '16px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'The biggest night of the year' },
            styles: { fontSize: 'xl', textColor: '#a1a1aa', textAlign: 'center', margin: { y: '16px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'button',
            settings: { title: 'Get Tickets', link: '#', variant: 'primary' },
            styles: { backgroundColor: '#ef4444', textColor: '#ffffff', margin: { y: '32px', x: '0' } },
          },
        ],
      },
      {
        id: generateId(),
        type: 'text',
        name: 'Lineup',
        styles: {
          backgroundColor: '#171717',
          padding: { y: '80px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'Lineup', level: 'h2' },
            styles: { fontSize: '3xl', fontWeight: 'bold', textColor: '#ffffff', textAlign: 'center' },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'Artist 1 - Artist 2 - Artist 3 - And more...' },
            styles: { fontSize: 'lg', textColor: '#a1a1aa', textAlign: 'center', margin: { y: '24px', x: '0' } },
          },
        ],
      },
    ],
  },
  {
    id: 'event-minimal',
    name: 'Minimal Event',
    description: 'Clean and minimal event page',
    useCase: 'event',
    pageSettings: {
      backgroundColor: '#ffffff',
      textColor: '#09090b',
      fontFamily: 'Inter',
      maxWidth: '800px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Hero',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '100px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'Event Title', level: 'h1' },
            styles: { fontSize: '4xl', fontWeight: 'bold', textColor: '#09090b', textAlign: 'center' },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'January 15, 2025 - 7:00 PM\nVenue Name, City' },
            styles: { fontSize: 'lg', textColor: '#71717a', textAlign: 'center', margin: { y: '24px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'button',
            settings: { title: 'RSVP Now', link: '#', variant: 'primary' },
            styles: { backgroundColor: '#09090b', textColor: '#ffffff', margin: { y: '24px', x: '0' } },
          },
        ],
      },
    ],
  },

  // ===== PORTFOLIO LAYOUTS =====
  {
    id: 'portfolio-minimal',
    name: 'Minimal Portfolio',
    description: 'Clean showcase for creatives',
    useCase: 'portfolio',
    pageSettings: {
      backgroundColor: '#fafafa',
      textColor: '#18181b',
      fontFamily: 'Inter',
      maxWidth: '1200px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Hero',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '120px', x: '24px' },
          align: 'left',
        },
        children: [
          {
            id: generateId(),
            type: 'subheading',
            settings: { content: 'Designer & Creative Director' },
            styles: { fontSize: 'sm', textColor: '#71717a', textAlign: 'left' },
          },
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'Your Name', level: 'h1' },
            styles: { fontSize: '5xl', fontWeight: 'bold', textColor: '#18181b', textAlign: 'left', margin: { y: '8px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'Creating meaningful digital experiences through design and strategy.' },
            styles: { fontSize: 'xl', textColor: '#52525b', textAlign: 'left', margin: { y: '24px', x: '0' } },
          },
        ],
      },
      {
        id: generateId(),
        type: 'post',
        name: 'Work',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '80px', x: '24px' },
          layout: 'grid',
          columns: 2,
          gap: '24px',
        },
        children: [],
        postSettings: {
          posts: [
            { id: generateId(), image: '', heading: 'Project One', text: 'Brand Identity', buttonTitle: 'View', buttonLink: '#' },
            { id: generateId(), image: '', heading: 'Project Two', text: 'Web Design', buttonTitle: 'View', buttonLink: '#' },
          ],
          showImage: true,
          showHeading: true,
          showText: true,
          showButton: false,
        },
      },
    ],
  },
  {
    id: 'portfolio-dark',
    name: 'Dark Portfolio',
    description: 'Bold dark theme for photographers',
    useCase: 'portfolio',
    pageSettings: {
      backgroundColor: '#09090b',
      textColor: '#fafafa',
      fontFamily: 'Inter',
      maxWidth: '1400px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Hero',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '140px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'Your Name', level: 'h1' },
            styles: { fontSize: '5xl', fontWeight: 'bold', textColor: '#fafafa', textAlign: 'center' },
          },
          {
            id: generateId(),
            type: 'subheading',
            settings: { content: 'Photographer' },
            styles: { fontSize: 'lg', textColor: '#71717a', textAlign: 'center', margin: { y: '16px', x: '0' } },
          },
        ],
      },
    ],
  },

  // ===== BUSINESS LAYOUTS =====
  {
    id: 'business-corporate',
    name: 'Corporate',
    description: 'Professional business landing page',
    useCase: 'business',
    pageSettings: {
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      fontFamily: 'Inter',
      maxWidth: '1200px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Hero',
        styles: {
          backgroundColor: '#0f172a',
          padding: { y: '100px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'Company Name', level: 'h1' },
            styles: { fontSize: '4xl', fontWeight: 'bold', textColor: '#ffffff', textAlign: 'center' },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'Helping businesses grow with innovative solutions' },
            styles: { fontSize: 'xl', textColor: '#94a3b8', textAlign: 'center', margin: { y: '16px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'button',
            settings: { title: 'Get Started', link: '#', variant: 'primary' },
            styles: { backgroundColor: '#3b82f6', textColor: '#ffffff', margin: { y: '32px', x: '0' } },
          },
        ],
      },
      {
        id: generateId(),
        type: 'text',
        name: 'Services',
        styles: {
          backgroundColor: '#ffffff',
          padding: { y: '80px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'Our Services', level: 'h2' },
            styles: { fontSize: '3xl', fontWeight: 'bold', textColor: '#0f172a', textAlign: 'center' },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'We offer a range of professional services tailored to your needs.' },
            styles: { fontSize: 'lg', textColor: '#64748b', textAlign: 'center', margin: { y: '16px', x: '0' } },
          },
        ],
      },
    ],
  },
  {
    id: 'business-agency',
    name: 'Creative Agency',
    description: 'Modern agency showcase',
    useCase: 'business',
    pageSettings: {
      backgroundColor: '#fafafa',
      textColor: '#09090b',
      fontFamily: 'Inter',
      maxWidth: '1200px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Hero',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '120px', x: '24px' },
          align: 'left',
        },
        children: [
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'We build brands that matter', level: 'h1' },
            styles: { fontSize: '5xl', fontWeight: 'bold', textColor: '#09090b', textAlign: 'left' },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'A creative agency specializing in brand strategy, design, and digital experiences.' },
            styles: { fontSize: 'xl', textColor: '#52525b', textAlign: 'left', margin: { y: '24px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'button',
            settings: { title: 'Start a Project', link: '#', variant: 'primary' },
            styles: { backgroundColor: '#09090b', textColor: '#fafafa', margin: { y: '24px', x: '0' } },
          },
        ],
      },
    ],
  },

  // ===== PERSONAL LAYOUTS =====
  {
    id: 'personal-linktree',
    name: 'Link in Bio',
    description: 'Simple link-in-bio style page',
    useCase: 'personal',
    pageSettings: {
      backgroundColor: '#18181b',
      textColor: '#fafafa',
      fontFamily: 'Inter',
      maxWidth: '600px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Profile',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '60px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'image',
            settings: { src: '', alt: 'Profile' },
            styles: { aspectRatio: '1:1', margin: { y: '0', x: '0' }, border: { size: '0', color: '', radius: '9999px' } },
          },
          {
            id: generateId(),
            type: 'heading',
            settings: { content: '@username', level: 'h1' },
            styles: { fontSize: '2xl', fontWeight: 'bold', textColor: '#fafafa', textAlign: 'center', margin: { y: '16px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'Bio description goes here' },
            styles: { fontSize: 'sm', textColor: '#a1a1aa', textAlign: 'center' },
          },
        ],
      },
      {
        id: generateId(),
        type: 'link',
        name: 'Links',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '24px', x: '24px' },
          layout: 'list',
          gap: '12px',
        },
        children: [],
        linkSettings: {
          links: [
            { id: generateId(), image: '', heading: 'My Website', url: '#' },
            { id: generateId(), image: '', heading: 'YouTube', url: '#' },
            { id: generateId(), image: '', heading: 'Twitter', url: '#' },
            { id: generateId(), image: '', heading: 'Instagram', url: '#' },
          ],
          showImage: false,
          showHeading: true,
        },
      },
    ],
  },
  {
    id: 'personal-card',
    name: 'Digital Card',
    description: 'Professional digital business card',
    useCase: 'personal',
    pageSettings: {
      backgroundColor: '#ffffff',
      textColor: '#09090b',
      fontFamily: 'Inter',
      maxWidth: '500px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Card',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '80px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'John Doe', level: 'h1' },
            styles: { fontSize: '3xl', fontWeight: 'bold', textColor: '#09090b', textAlign: 'center' },
          },
          {
            id: generateId(),
            type: 'subheading',
            settings: { content: 'Product Designer' },
            styles: { fontSize: 'lg', textColor: '#71717a', textAlign: 'center', margin: { y: '8px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'hello@email.com' },
            styles: { fontSize: 'base', textColor: '#52525b', textAlign: 'center', margin: { y: '24px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'button',
            settings: { title: 'Save Contact', link: '#', variant: 'primary' },
            styles: { backgroundColor: '#09090b', textColor: '#fafafa', margin: { y: '16px', x: '0' } },
          },
        ],
      },
    ],
  },

  // ===== ECOMMERCE LAYOUTS =====
  {
    id: 'ecommerce-store',
    name: 'Product Store',
    description: 'Clean product showcase',
    useCase: 'ecommerce',
    pageSettings: {
      backgroundColor: '#ffffff',
      textColor: '#18181b',
      fontFamily: 'Inter',
      maxWidth: '1200px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Hero',
        styles: {
          backgroundColor: '#f4f4f5',
          padding: { y: '80px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'subheading',
            settings: { content: 'New Collection' },
            styles: { fontSize: 'sm', textColor: '#71717a', textAlign: 'center', fontWeight: 'medium' },
          },
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'Store Name', level: 'h1' },
            styles: { fontSize: '4xl', fontWeight: 'bold', textColor: '#18181b', textAlign: 'center', margin: { y: '8px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'button',
            settings: { title: 'Shop Now', link: '#', variant: 'primary' },
            styles: { backgroundColor: '#18181b', textColor: '#ffffff', margin: { y: '24px', x: '0' } },
          },
        ],
      },
      {
        id: generateId(),
        type: 'product',
        name: 'Products',
        styles: {
          backgroundColor: '#ffffff',
          padding: { y: '60px', x: '24px' },
          layout: 'grid',
          columns: 3,
          gap: '24px',
        },
        children: [],
        productSettings: {
          products: [
            { id: generateId(), image: '', heading: 'Product 1', subtitle: '', text: '', price: '$49', buttonTitle: 'Buy', buttonLink: '#' },
            { id: generateId(), image: '', heading: 'Product 2', subtitle: '', text: '', price: '$59', buttonTitle: 'Buy', buttonLink: '#' },
            { id: generateId(), image: '', heading: 'Product 3', subtitle: '', text: '', price: '$39', buttonTitle: 'Buy', buttonLink: '#' },
          ],
          showImage: true,
          showHeading: true,
          showSubtitle: false,
          showText: false,
          showPrice: true,
          showButton: true,
        },
      },
    ],
  },
  {
    id: 'ecommerce-merch',
    name: 'Merch Drop',
    description: 'Limited edition merch page',
    useCase: 'ecommerce',
    pageSettings: {
      backgroundColor: '#09090b',
      textColor: '#fafafa',
      fontFamily: 'Inter',
      maxWidth: '1200px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Hero',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '100px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'subheading',
            settings: { content: 'Limited Edition' },
            styles: { fontSize: 'xs', textColor: '#ef4444', textAlign: 'center', fontWeight: 'bold' },
          },
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'MERCH DROP', level: 'h1' },
            styles: { fontSize: '5xl', fontWeight: 'bold', textColor: '#fafafa', textAlign: 'center', margin: { y: '8px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'Available for 48 hours only' },
            styles: { fontSize: 'lg', textColor: '#71717a', textAlign: 'center', margin: { y: '16px', x: '0' } },
          },
        ],
      },
    ],
  },

  // ===== SAAS LAYOUTS =====
  {
    id: 'saas-modern',
    name: 'Modern SaaS',
    description: 'Clean software product page',
    useCase: 'saas',
    pageSettings: {
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      fontFamily: 'Inter',
      maxWidth: '1200px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Hero',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '120px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'subheading',
            settings: { content: 'Introducing' },
            styles: { fontSize: 'sm', textColor: '#6366f1', textAlign: 'center', fontWeight: 'medium' },
          },
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'Product Name', level: 'h1' },
            styles: { fontSize: '5xl', fontWeight: 'bold', textColor: '#0f172a', textAlign: 'center', margin: { y: '8px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'The all-in-one platform that helps you build, launch, and grow your business faster.' },
            styles: { fontSize: 'xl', textColor: '#64748b', textAlign: 'center', margin: { y: '24px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'button',
            settings: { title: 'Get Started Free', link: '#', variant: 'primary' },
            styles: { backgroundColor: '#6366f1', textColor: '#ffffff', margin: { y: '24px', x: '0' } },
          },
        ],
      },
      {
        id: generateId(),
        type: 'text',
        name: 'Features',
        styles: {
          backgroundColor: '#f8fafc',
          padding: { y: '80px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'Everything you need', level: 'h2' },
            styles: { fontSize: '3xl', fontWeight: 'bold', textColor: '#0f172a', textAlign: 'center' },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'Powerful features to help you manage your business.' },
            styles: { fontSize: 'lg', textColor: '#64748b', textAlign: 'center', margin: { y: '16px', x: '0' } },
          },
        ],
      },
    ],
  },
  {
    id: 'saas-startup',
    name: 'Startup Launch',
    description: 'Bold startup landing page',
    useCase: 'saas',
    pageSettings: {
      backgroundColor: '#0f0f0f',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      maxWidth: '1200px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [
      {
        id: generateId(),
        type: 'hero',
        name: 'Hero',
        styles: {
          backgroundColor: 'transparent',
          padding: { y: '140px', x: '24px' },
          align: 'center',
        },
        children: [
          {
            id: generateId(),
            type: 'heading',
            settings: { content: 'Ship faster with AI', level: 'h1' },
            styles: { fontSize: '5xl', fontWeight: 'bold', textColor: '#ffffff', textAlign: 'center' },
          },
          {
            id: generateId(),
            type: 'text',
            settings: { content: 'Build and deploy production-ready apps in minutes, not months.' },
            styles: { fontSize: 'xl', textColor: '#a1a1aa', textAlign: 'center', margin: { y: '24px', x: '0' } },
          },
          {
            id: generateId(),
            type: 'button',
            settings: { title: 'Join Waitlist', link: '#', variant: 'primary' },
            styles: { backgroundColor: '#ffffff', textColor: '#0f0f0f', margin: { y: '24px', x: '0' } },
          },
        ],
      },
    ],
  },

  // ===== BLANK LAYOUT =====
  {
    id: 'blank',
    name: 'Start from Scratch',
    description: 'Empty canvas to build your own',
    useCase: 'personal',
    pageSettings: {
      backgroundColor: '#ffffff',
      textColor: '#09090b',
      fontFamily: 'Inter',
      maxWidth: '1200px',
      padding: { y: '0', x: '16px' },
    },
    blocks: [],
  },
]

// Helper functions
export function getUseCaseById(id: UseCaseCategory): UseCase | undefined {
  return USE_CASES.find(uc => uc.id === id)
}

export function getLayoutsByUseCase(useCase: UseCaseCategory): ProjectLayout[] {
  return LAYOUTS
    .filter(l => l.useCase === useCase || l.id === 'blank')
    .map(layout => ({
      ...layout,
      blocks: wrapWithHeaderFooter(layout.blocks),
    }))
}

export function getLayoutById(id: string): ProjectLayout | undefined {
  const layout = LAYOUTS.find(l => l.id === id)
  if (!layout) return undefined

  // Return a copy with header and footer added
  return {
    ...layout,
    blocks: wrapWithHeaderFooter(layout.blocks),
  }
}

export function getBlankLayout(): ProjectLayout {
  const blank = LAYOUTS.find(l => l.id === 'blank')!
  return {
    ...blank,
    blocks: wrapWithHeaderFooter([]), // Just header and footer
  }
}
