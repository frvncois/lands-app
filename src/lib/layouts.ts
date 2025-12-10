import type { SectionBlock, PageSettings, HeaderSettings, FooterSettings, UseCaseCategory } from '@/types/editor'
import {
  createSectionBlock,
  getDefaultPageSettings,
  generateId,
} from './editor-utils'

// Re-export UseCaseCategory from editor types
export type { UseCaseCategory } from '@/types/editor'

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
    id: 'personal',
    name: 'Personal & Bio',
    description: 'For personal sites, link-in-bio, and social profiles',
    icon: 'lni-user-4',
  },
]

// Create default header block with Start/Middle/End stacks
function createHeaderBlock(settings?: Partial<HeaderSettings>): SectionBlock {
  const header = createSectionBlock('header')
  if (settings) {
    header.settings = { ...header.settings, ...settings }
  }
  return header
}

// Create default footer block with Start/Middle/End stacks
function createFooterBlock(settings?: Partial<FooterSettings>): SectionBlock {
  const footer = createSectionBlock('footer')
  if (settings) {
    footer.settings = { ...footer.settings, ...settings }
  }
  return footer
}

// Wrap layout blocks with header and footer
function wrapWithHeaderFooter(blocks: SectionBlock[]): SectionBlock[] {
  return [createHeaderBlock(), ...blocks, createFooterBlock()]
}

// ============================================
// LAYOUT TEMPLATES
// ============================================

// Helper to create blocks with unique IDs
function createBlock(
  type: SectionBlock['type'],
  name: string,
  settings: Partial<SectionBlock['settings']>,
  styles: Partial<SectionBlock['styles']>,
  children?: SectionBlock[]
): SectionBlock {
  return {
    id: generateId(),
    type,
    name,
    settings: settings as SectionBlock['settings'],
    styles: styles as SectionBlock['styles'],
    children,
  }
}

// Personal Bio Layout - A clean, modern personal portfolio/bio page
function createPersonalBioLayout(): ProjectLayout {
  // Hero Section
  const heroSection = createBlock(
    'container',
    'Hero',
    { height: '100vh', backgroundType: 'color' },
    {
      padding: { top: '64', bottom: '64', left: '24', right: '24' },
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '24',
      backgroundColor: '#fafafa',
    },
    [
      createBlock(
        'image',
        'Avatar',
        { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face', alt: 'Profile photo' },
        { width: '150px', height: '150px', objectFit: 'cover', mask: 'circle' }
      ),
      createBlock(
        'heading',
        'Name',
        { content: 'Alex Johnson', level: 'h1' },
        { fontSize: '5xl', fontWeight: 'bold', alignment: 'center', color: '#09090b' }
      ),
      createBlock(
        'text',
        'Title',
        { content: 'Product Designer & Creative Developer' },
        { fontSize: 'xl', alignment: 'center', color: '#71717a' }
      ),
      createBlock(
        'text',
        'Bio',
        { content: 'I design and build digital experiences that delight users. Based in San Francisco, working with startups and established brands to create memorable products.', maxWidth: '600px' },
        { fontSize: 'base', alignment: 'center', color: '#52525b', lineHeight: 'relaxed' }
      ),
      createBlock(
        'stack',
        'Social Links',
        { gap: '16', direction: 'horizontal' },
        { justifyContent: 'center', alignItems: 'center', padding: { top: '16', bottom: '0', left: '0', right: '0' } },
        [
          createBlock('icon', 'Twitter', { icon: 'lni-x', size: '24', linkUrl: '#' }, { color: '#09090b' }),
          createBlock('icon', 'Instagram', { icon: 'lni-instagram', size: '24', linkUrl: '#' }, { color: '#09090b' }),
          createBlock('icon', 'LinkedIn', { icon: 'lni-linkedin', size: '24', linkUrl: '#' }, { color: '#09090b' }),
          createBlock('icon', 'Dribbble', { icon: 'lni-dribbble', size: '24', linkUrl: '#' }, { color: '#09090b' }),
        ]
      ),
    ]
  )

  // About Section
  const aboutSection = createBlock(
    'container',
    'About',
    { backgroundType: 'color' },
    {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '32',
      backgroundColor: '#ffffff',
    },
    [
      createBlock(
        'heading',
        'Section Title',
        { content: 'About Me', level: 'h2' },
        { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: '#09090b' }
      ),
      createBlock(
        'text',
        'About Text',
        { content: 'With over 8 years of experience in product design and development, I\'ve had the privilege of working with incredible teams at companies like Airbnb, Stripe, and various early-stage startups. My approach combines strategic thinking with hands-on execution, ensuring that every project not only looks beautiful but also solves real user problems.', maxWidth: '700px' },
        { fontSize: 'lg', alignment: 'center', color: '#52525b', lineHeight: 'relaxed' }
      ),
    ]
  )

  // Skills Section
  const skillsSection = createBlock(
    'container',
    'Skills',
    { backgroundType: 'color' },
    {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '48',
      backgroundColor: '#fafafa',
    },
    [
      createBlock(
        'heading',
        'Section Title',
        { content: 'What I Do', level: 'h2' },
        { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: '#09090b' }
      ),
      createBlock(
        'grid',
        'Skills Grid',
        { columns: 3, gap: '32', mobileColumns: 1, tabletColumns: 2 },
        { padding: { top: '0', bottom: '0', left: '0', right: '0' } },
        [
          createBlock(
            'stack',
            'Skill 1',
            { gap: '16', direction: 'vertical' },
            { padding: { top: '24', bottom: '24', left: '24', right: '24' }, backgroundColor: '#ffffff', border: { radius: '16' }, alignItems: 'center' },
            [
              createBlock('icon', 'Icon', { icon: 'lni-pencil-1', size: '32' }, { color: '#09090b' }),
              createBlock('heading', 'Title', { content: 'UI/UX Design', level: 'h3' }, { fontSize: 'xl', fontWeight: 'semibold', alignment: 'center', color: '#09090b' }),
              createBlock('text', 'Description', { content: 'Creating intuitive interfaces and seamless user experiences that drive engagement.' }, { fontSize: 'base', alignment: 'center', color: '#71717a' }),
            ]
          ),
          createBlock(
            'stack',
            'Skill 2',
            { gap: '16', direction: 'vertical' },
            { padding: { top: '24', bottom: '24', left: '24', right: '24' }, backgroundColor: '#ffffff', border: { radius: '16' }, alignItems: 'center' },
            [
              createBlock('icon', 'Icon', { icon: 'lni-code-2', size: '32' }, { color: '#09090b' }),
              createBlock('heading', 'Title', { content: 'Development', level: 'h3' }, { fontSize: 'xl', fontWeight: 'semibold', alignment: 'center', color: '#09090b' }),
              createBlock('text', 'Description', { content: 'Building responsive, performant web applications with modern technologies.' }, { fontSize: 'base', alignment: 'center', color: '#71717a' }),
            ]
          ),
          createBlock(
            'stack',
            'Skill 3',
            { gap: '16', direction: 'vertical' },
            { padding: { top: '24', bottom: '24', left: '24', right: '24' }, backgroundColor: '#ffffff', border: { radius: '16' }, alignItems: 'center' },
            [
              createBlock('icon', 'Icon', { icon: 'lni-book-open-1', size: '32' }, { color: '#09090b' }),
              createBlock('heading', 'Title', { content: 'Strategy', level: 'h3' }, { fontSize: 'xl', fontWeight: 'semibold', alignment: 'center', color: '#09090b' }),
              createBlock('text', 'Description', { content: 'Defining product vision and roadmaps that align with business goals.' }, { fontSize: 'base', alignment: 'center', color: '#71717a' }),
            ]
          ),
        ]
      ),
    ]
  )

  // Portfolio/Work Section
  const workSection = createBlock(
    'container',
    'Work',
    { backgroundType: 'color' },
    {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '48',
      backgroundColor: '#ffffff',
    },
    [
      createBlock(
        'heading',
        'Section Title',
        { content: 'Selected Work', level: 'h2' },
        { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: '#09090b' }
      ),
      createBlock(
        'grid',
        'Work Grid',
        { columns: 2, gap: '24', mobileColumns: 1 },
        { padding: { top: '0', bottom: '0', left: '0', right: '0' } },
        [
          createBlock(
            'stack',
            'Project 1',
            { gap: '16', direction: 'vertical' },
            { padding: { top: '0', bottom: '0', left: '0', right: '0' } },
            [
              createBlock('image', 'Cover', { src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', alt: 'Project screenshot' }, { aspectRatio: '16:9', objectFit: 'cover' }),
              createBlock('heading', 'Title', { content: 'Fintech Dashboard', level: 'h3' }, { fontSize: 'xl', fontWeight: 'semibold', color: '#09090b' }),
              createBlock('text', 'Description', { content: 'A comprehensive analytics dashboard for a leading fintech startup.' }, { fontSize: 'base', color: '#71717a' }),
            ]
          ),
          createBlock(
            'stack',
            'Project 2',
            { gap: '16', direction: 'vertical' },
            { padding: { top: '0', bottom: '0', left: '0', right: '0' } },
            [
              createBlock('image', 'Cover', { src: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop', alt: 'Project screenshot' }, { aspectRatio: '16:9', objectFit: 'cover' }),
              createBlock('heading', 'Title', { content: 'E-commerce Mobile App', level: 'h3' }, { fontSize: 'xl', fontWeight: 'semibold', color: '#09090b' }),
              createBlock('text', 'Description', { content: 'A delightful shopping experience for iOS and Android platforms.' }, { fontSize: 'base', color: '#71717a' }),
            ]
          ),
          createBlock(
            'stack',
            'Project 3',
            { gap: '16', direction: 'vertical' },
            { padding: { top: '0', bottom: '0', left: '0', right: '0' } },
            [
              createBlock('image', 'Cover', { src: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&h=400&fit=crop', alt: 'Project screenshot' }, { aspectRatio: '16:9', objectFit: 'cover' }),
              createBlock('heading', 'Title', { content: 'SaaS Landing Page', level: 'h3' }, { fontSize: 'xl', fontWeight: 'semibold', color: '#09090b' }),
              createBlock('text', 'Description', { content: 'High-converting landing page that increased sign-ups by 40%.' }, { fontSize: 'base', color: '#71717a' }),
            ]
          ),
          createBlock(
            'stack',
            'Project 4',
            { gap: '16', direction: 'vertical' },
            { padding: { top: '0', bottom: '0', left: '0', right: '0' } },
            [
              createBlock('image', 'Cover', { src: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop', alt: 'Project screenshot' }, { aspectRatio: '16:9', objectFit: 'cover' }),
              createBlock('heading', 'Title', { content: 'Brand Identity System', level: 'h3' }, { fontSize: 'xl', fontWeight: 'semibold', color: '#09090b' }),
              createBlock('text', 'Description', { content: 'Complete visual identity for an emerging wellness brand.' }, { fontSize: 'base', color: '#71717a' }),
            ]
          ),
        ]
      ),
    ]
  )

  // Contact Section
  const contactSection = createBlock(
    'container',
    'Contact',
    { backgroundType: 'color' },
    {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '32',
      backgroundColor: '#09090b',
    },
    [
      createBlock(
        'heading',
        'Section Title',
        { content: 'Let\'s Work Together', level: 'h2' },
        { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: '#ffffff' }
      ),
      createBlock(
        'text',
        'Contact Text',
        { content: 'I\'m always open to discussing new projects, creative ideas, or opportunities to be part of your vision.', maxWidth: '500px' },
        { fontSize: 'lg', alignment: 'center', color: '#a1a1aa' }
      ),
      createBlock(
        'button',
        'Email Button',
        { label: 'hello@alexjohnson.design', url: 'mailto:hello@alexjohnson.design', variant: 'outline', size: 'lg' },
        { textColor: '#ffffff', backgroundColor: 'transparent', border: { width: '1', color: '#ffffff' } }
      ),
    ]
  )

  return {
    id: 'personal-bio',
    name: 'Personal Bio',
    description: 'A clean, modern personal portfolio page',
    useCase: 'personal',
    pageSettings: {
      ...getDefaultPageSettings(),
      backgroundColor: '#ffffff',
      fontFamily: 'Inter',
      textColor: '#09090b',
      sectionGap: '0',
    },
    blocks: [heroSection, aboutSection, skillsSection, workSection, contactSection],
  }
}

export const LAYOUTS: ProjectLayout[] = [
  // ===== BLANK LAYOUT =====
  {
    id: 'blank',
    name: 'Blank',
    description: 'Start from scratch',
    useCase: 'personal',
    pageSettings: getDefaultPageSettings(),
    blocks: [],
  },
  // ===== PERSONAL BIO LAYOUT =====
  createPersonalBioLayout(),
]

// Helper functions
export function getUseCaseById(id: UseCaseCategory): UseCase | undefined {
  return USE_CASES.find(uc => uc.id === id)
}

export function getLayoutsByUseCase(_useCase: UseCaseCategory): ProjectLayout[] {
  // For now, just return blank layout
  return LAYOUTS.map(layout => ({
    ...layout,
    pageSettings: {
      ...layout.pageSettings,
      useCase: layout.useCase,
      layoutId: layout.id,
    },
    blocks: wrapWithHeaderFooter(layout.blocks),
  }))
}

export function getLayoutById(id: string): ProjectLayout | undefined {
  const layout = LAYOUTS.find(l => l.id === id)
  if (!layout) return undefined

  // Return a copy with header and footer added, and useCase/layoutId in pageSettings
  return {
    ...layout,
    pageSettings: {
      ...layout.pageSettings,
      useCase: layout.useCase,
      layoutId: layout.id,
    },
    blocks: wrapWithHeaderFooter(layout.blocks),
  }
}

export function getBlankLayout(): ProjectLayout {
  const blank = LAYOUTS.find(l => l.id === 'blank')!
  return {
    ...blank,
    pageSettings: {
      ...blank.pageSettings,
      useCase: undefined,
      layoutId: 'blank',
    },
    blocks: wrapWithHeaderFooter([]), // Just header and footer
  }
}

// Get all layouts for a use case (for style switching in editor)
export function getStylesForUseCase(_useCase: UseCaseCategory): ProjectLayout[] {
  // For now, just return blank layout
  return LAYOUTS.map(layout => ({
    ...layout,
    pageSettings: {
      ...layout.pageSettings,
      useCase: layout.useCase,
      layoutId: layout.id,
    },
    blocks: wrapWithHeaderFooter(layout.blocks),
  }))
}
