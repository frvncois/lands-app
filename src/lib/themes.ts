import type { Theme } from '@/types/editor'
import { generateId } from './editor-utils'

// Helper to create a theme with fresh IDs
function createTheme(theme: Omit<Theme, 'id'> & { id?: string }): Theme {
  return {
    ...theme,
    id: theme.id || generateId(),
    blocks: theme.blocks.map(block => ({
      ...block,
      id: generateId(),
      children: block.children.map(child => ({
        ...child,
        id: generateId(),
      })),
      postSettings: block.postSettings ? {
        ...block.postSettings,
        posts: block.postSettings.posts.map(post => ({
          ...post,
          id: generateId(),
        })),
      } : undefined,
      linkSettings: block.linkSettings ? {
        ...block.linkSettings,
        links: block.linkSettings.links.map(link => ({
          ...link,
          id: generateId(),
        })),
      } : undefined,
      productSettings: block.productSettings ? {
        ...block.productSettings,
        products: block.productSettings.products.map(product => ({
          ...product,
          id: generateId(),
        })),
      } : undefined,
    })),
  }
}

// Blank theme - empty canvas
const blankTheme: Theme = {
  id: 'blank',
  name: 'Blank',
  description: 'Start with a clean slate',
  preview: '#ffffff',
  pageSettings: {
    backgroundColor: '#ffffff',
    backgroundImage: '',
    fontFamily: '',
    textColor: '#000000',
    maxWidth: '1280',
    padding: { y: '0', x: '0' },
  },
  blocks: [],
}

// Minimal theme - simple and clean
const minimalTheme: Theme = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Clean and simple design',
  preview: '#fafafa',
  pageSettings: {
    backgroundColor: '#fafafa',
    backgroundImage: '',
    fontFamily: 'sans',
    textColor: '#171717',
    maxWidth: '1024',
    padding: { y: '48', x: '24' },
  },
  blocks: [
    {
      id: '',
      type: 'hero',
      name: 'Hero',
      children: [
        {
          id: '',
          type: 'heading',
          settings: { content: 'Welcome', level: 'h1' },
          styles: {
            align: 'center',
            margin: { y: '0', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: '5xl',
            fontWeight: 'bold',
            lineHeight: 'tight',
            textAlign: 'center',
            textColor: '#171717',
            effect: 'none',
          },
        },
        {
          id: '',
          type: 'text',
          settings: { content: 'A minimal and elegant starting point for your next project.' },
          styles: {
            align: 'center',
            margin: { y: '16', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: 'lg',
            fontWeight: 'normal',
            lineHeight: 'relaxed',
            textAlign: 'center',
            textColor: '#525252',
            effect: 'none',
          },
        },
      ],
      styles: {
        align: 'center',
        margin: { y: '0', x: '0' },
        padding: { y: '64', x: '24' },
        effect: 'none',
      },
    },
  ],
}

// Bold theme - strong colors and typography
const boldTheme: Theme = {
  id: 'bold',
  name: 'Bold',
  description: 'Strong colors and impactful design',
  preview: '#000000',
  pageSettings: {
    backgroundColor: '#000000',
    backgroundImage: '',
    fontFamily: 'sans',
    textColor: '#ffffff',
    maxWidth: '1280',
    padding: { y: '0', x: '0' },
  },
  blocks: [
    {
      id: '',
      type: 'hero',
      name: 'Hero',
      children: [
        {
          id: '',
          type: 'heading',
          settings: { content: 'Make a Statement', level: 'h1' },
          styles: {
            align: 'left',
            margin: { y: '0', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: '5xl',
            fontWeight: 'bold',
            lineHeight: 'tight',
            textAlign: 'left',
            textColor: '#ffffff',
            effect: 'none',
          },
        },
        {
          id: '',
          type: 'text',
          settings: { content: 'Bold designs demand attention. Create something unforgettable.' },
          styles: {
            align: 'left',
            margin: { y: '24', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: 'xl',
            fontWeight: 'normal',
            lineHeight: 'relaxed',
            textAlign: 'left',
            textColor: '#a3a3a3',
            effect: 'none',
          },
        },
        {
          id: '',
          type: 'button',
          settings: { title: 'Get Started', link: '#', variant: 'primary' },
          styles: {
            align: 'left',
            margin: { y: '32', x: '0' },
            padding: { y: '0', x: '0' },
            effect: 'none',
          },
        },
      ],
      styles: {
        align: 'center',
        margin: { y: '0', x: '0' },
        padding: { y: '96', x: '48' },
        effect: 'none',
      },
    },
  ],
}

// Creative theme - colorful and expressive
const creativeTheme: Theme = {
  id: 'creative',
  name: 'Creative',
  description: 'Colorful and expressive layout',
  preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  pageSettings: {
    backgroundColor: '#f0f4ff',
    backgroundImage: '',
    fontFamily: 'sans',
    textColor: '#1e1b4b',
    maxWidth: '1280',
    padding: { y: '0', x: '0' },
  },
  blocks: [
    {
      id: '',
      type: 'hero',
      name: 'Hero',
      children: [
        {
          id: '',
          type: 'subheading',
          settings: { content: 'Welcome to' },
          styles: {
            align: 'center',
            margin: { y: '0', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: 'lg',
            fontWeight: 'medium',
            lineHeight: 'normal',
            textAlign: 'center',
            textColor: '#6366f1',
            effect: 'none',
          },
        },
        {
          id: '',
          type: 'heading',
          settings: { content: 'Creative Studio', level: 'h1' },
          styles: {
            align: 'center',
            margin: { y: '8', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: '5xl',
            fontWeight: 'bold',
            lineHeight: 'tight',
            textAlign: 'center',
            textColor: '#1e1b4b',
            effect: 'none',
          },
        },
        {
          id: '',
          type: 'text',
          settings: { content: 'Where imagination meets innovation. We bring your wildest ideas to life.' },
          styles: {
            align: 'center',
            margin: { y: '16', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: 'lg',
            fontWeight: 'normal',
            lineHeight: 'relaxed',
            textAlign: 'center',
            textColor: '#4338ca',
            effect: 'none',
          },
        },
      ],
      styles: {
        align: 'center',
        margin: { y: '0', x: '0' },
        padding: { y: '80', x: '32' },
        backgroundColor: '',
        effect: 'none',
      },
    },
    {
      id: '',
      type: 'text',
      name: 'Features',
      children: [
        {
          id: '',
          type: 'heading',
          settings: { content: 'What We Do', level: 'h2' },
          styles: {
            align: 'center',
            margin: { y: '0', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: '3xl',
            fontWeight: 'bold',
            lineHeight: 'tight',
            textAlign: 'center',
            textColor: '#1e1b4b',
            effect: 'none',
          },
        },
        {
          id: '',
          type: 'text',
          settings: { content: 'From branding to digital experiences, we craft solutions that stand out.' },
          styles: {
            align: 'center',
            margin: { y: '16', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: 'base',
            fontWeight: 'normal',
            lineHeight: 'relaxed',
            textAlign: 'center',
            textColor: '#6366f1',
            effect: 'none',
          },
        },
      ],
      styles: {
        align: 'center',
        margin: { y: '0', x: '0' },
        padding: { y: '64', x: '32' },
        backgroundColor: '#ffffff',
        effect: 'none',
      },
    },
  ],
}

// Portfolio theme - showcase focused
const portfolioTheme: Theme = {
  id: 'portfolio',
  name: 'Portfolio',
  description: 'Perfect for showcasing work',
  preview: '#18181b',
  pageSettings: {
    backgroundColor: '#18181b',
    backgroundImage: '',
    fontFamily: 'sans',
    textColor: '#fafafa',
    maxWidth: '1536',
    padding: { y: '0', x: '0' },
  },
  blocks: [
    {
      id: '',
      type: 'hero',
      name: 'Hero',
      children: [
        {
          id: '',
          type: 'subheading',
          settings: { content: 'John Doe' },
          styles: {
            align: 'left',
            margin: { y: '0', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: 'base',
            fontWeight: 'medium',
            lineHeight: 'normal',
            textAlign: 'left',
            textColor: '#a1a1aa',
            effect: 'none',
          },
        },
        {
          id: '',
          type: 'heading',
          settings: { content: 'Designer & Developer', level: 'h1' },
          styles: {
            align: 'left',
            margin: { y: '8', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: '5xl',
            fontWeight: 'bold',
            lineHeight: 'tight',
            textAlign: 'left',
            textColor: '#fafafa',
            effect: 'none',
          },
        },
        {
          id: '',
          type: 'text',
          settings: { content: 'I create digital experiences that are both beautiful and functional. Currently available for freelance work.' },
          styles: {
            align: 'left',
            margin: { y: '24', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: 'lg',
            fontWeight: 'normal',
            lineHeight: 'relaxed',
            textAlign: 'left',
            textColor: '#a1a1aa',
            effect: 'none',
          },
        },
      ],
      styles: {
        align: 'center',
        margin: { y: '0', x: '0' },
        padding: { y: '96', x: '48' },
        effect: 'none',
      },
    },
    {
      id: '',
      type: 'post',
      name: 'Projects',
      children: [],
      styles: {
        align: 'center',
        margin: { y: '0', x: '0' },
        padding: { y: '48', x: '48' },
        effect: 'none',
        layout: 'grid',
        columns: 2,
        gap: '32',
      },
      postSettings: {
        posts: [
          { id: '', image: '', heading: 'Project One', text: 'A brief description of this amazing project and what was accomplished.', buttonTitle: 'View Project', buttonLink: '#' },
          { id: '', image: '', heading: 'Project Two', text: 'Another fantastic project showcasing creative problem solving.', buttonTitle: 'View Project', buttonLink: '#' },
          { id: '', image: '', heading: 'Project Three', text: 'Innovative solutions for complex challenges in this project.', buttonTitle: 'View Project', buttonLink: '#' },
          { id: '', image: '', heading: 'Project Four', text: 'Pushing boundaries with cutting-edge design and technology.', buttonTitle: 'View Project', buttonLink: '#' },
        ],
        showImage: true,
        showHeading: true,
        showText: true,
        showButton: true,
      },
    },
  ],
}

// Business theme - professional and corporate
const businessTheme: Theme = {
  id: 'business',
  name: 'Business',
  description: 'Professional corporate layout',
  preview: '#1e40af',
  pageSettings: {
    backgroundColor: '#ffffff',
    backgroundImage: '',
    fontFamily: 'sans',
    textColor: '#1f2937',
    maxWidth: '1280',
    padding: { y: '0', x: '0' },
  },
  blocks: [
    {
      id: '',
      type: 'hero',
      name: 'Hero',
      children: [
        {
          id: '',
          type: 'heading',
          settings: { content: 'Grow Your Business', level: 'h1' },
          styles: {
            align: 'center',
            margin: { y: '0', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: '5xl',
            fontWeight: 'bold',
            lineHeight: 'tight',
            textAlign: 'center',
            textColor: '#1f2937',
            effect: 'none',
          },
        },
        {
          id: '',
          type: 'text',
          settings: { content: 'We help companies scale with innovative solutions and strategic partnerships.' },
          styles: {
            align: 'center',
            margin: { y: '16', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: 'xl',
            fontWeight: 'normal',
            lineHeight: 'relaxed',
            textAlign: 'center',
            textColor: '#6b7280',
            effect: 'none',
          },
        },
        {
          id: '',
          type: 'button',
          settings: { title: 'Contact Us', link: '#', variant: 'primary' },
          styles: {
            align: 'center',
            margin: { y: '32', x: '0' },
            padding: { y: '0', x: '0' },
            effect: 'none',
          },
        },
      ],
      styles: {
        align: 'center',
        margin: { y: '0', x: '0' },
        padding: { y: '80', x: '32' },
        backgroundColor: '#f9fafb',
        effect: 'none',
      },
    },
    {
      id: '',
      type: 'text',
      name: 'About',
      children: [
        {
          id: '',
          type: 'subheading',
          settings: { content: 'About Us' },
          styles: {
            align: 'center',
            margin: { y: '0', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: 'base',
            fontWeight: 'semibold',
            lineHeight: 'normal',
            textAlign: 'center',
            textColor: '#2563eb',
            effect: 'none',
          },
        },
        {
          id: '',
          type: 'heading',
          settings: { content: 'Trusted by Industry Leaders', level: 'h2' },
          styles: {
            align: 'center',
            margin: { y: '8', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: '3xl',
            fontWeight: 'bold',
            lineHeight: 'tight',
            textAlign: 'center',
            textColor: '#1f2937',
            effect: 'none',
          },
        },
        {
          id: '',
          type: 'text',
          settings: { content: 'With over a decade of experience, we have helped hundreds of businesses achieve their goals through technology and innovation.' },
          styles: {
            align: 'center',
            margin: { y: '16', x: '0' },
            padding: { y: '0', x: '0' },
            fontSize: 'lg',
            fontWeight: 'normal',
            lineHeight: 'relaxed',
            textAlign: 'center',
            textColor: '#6b7280',
            effect: 'none',
          },
        },
      ],
      styles: {
        align: 'center',
        margin: { y: '0', x: '0' },
        padding: { y: '64', x: '32' },
        effect: 'none',
      },
    },
  ],
}

// Export all themes
export const themes: Theme[] = [
  blankTheme,
  minimalTheme,
  boldTheme,
  creativeTheme,
  portfolioTheme,
  businessTheme,
]

// Get a theme by ID with fresh IDs for all elements
export function getThemeById(id: string): Theme | undefined {
  const theme = themes.find(t => t.id === id)
  if (!theme) return undefined
  return createTheme(theme)
}

// Get all themes (for display purposes, without regenerating IDs)
export function getAllThemes(): Theme[] {
  return themes
}
