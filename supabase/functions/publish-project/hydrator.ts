/**
 * CANONICAL PROJECT HYDRATOR (Deno version)
 * Ensures consistent data shape between editor and publish
 * NO Vue, NO computed, NO side effects
 */

// Section registry data (minimal version for publish)
const SECTION_DEFAULTS: Record<string, () => Record<string, unknown>> = {
  header: () => ({
    title: 'Site Name',
    link: { label: 'Get Started', url: '#' },
  }),
  hero: () => ({
    headline: 'Welcome to Your Site',
    subheadline: 'A compelling tagline that captures attention',
    paragraph: 'Add more details about your product, service, or message here.',
    primaryCTA: { label: 'Get Started', url: '#' },
  }),
  cards: () => ({
    headline: 'Section headline',
    subheadline: 'Optional subheadline',
    paragraph: 'Use this space to introduce the cards below.',
    items: [
      { headline: 'Card One', paragraph: 'Description for the first card.' },
      { headline: 'Card Two', paragraph: 'Description for the second card.' },
      { headline: 'Card Three', paragraph: 'Description for the third card.' },
    ],
  }),
  products: () => ({
    headline: 'Featured Products',
    subheadline: 'Showcase your best offerings',
    paragraph: 'Use this section to highlight products, packages, or merchandise with pricing and purchase links.',
    items: [],
  }),
  cta: () => ({
    headline: 'Ready to get started?',
    subheadline: 'Your compelling tagline here',
    paragraph: 'Join thousands of happy customers today.',
    primaryCTA: { label: 'Get Started', url: '#' },
  }),
  accordion: () => ({
    headline: 'Frequently Asked Questions',
    paragraph: 'Find answers to common questions below.',
    useCase: 'faq',
    items: [],
  }),
  faq: () => ({
    headline: 'Frequently Asked Questions',
    paragraph: 'Find answers to common questions below.',
    useCase: 'faq',
    items: [],
  }),
  menu: () => ({
    headline: 'Menu',
    paragraph: 'Featured menu categories and highlighted items.',
    useCase: 'menu',
    items: [],
  }),
  events: () => ({
    headline: 'Upcoming Events',
    paragraph: 'Mark your calendar for what\'s next.',
    useCase: 'event',
    items: [],
  }),
  services: () => ({
    headline: 'Services',
    paragraph: 'What we can do for you.',
    useCase: 'faq',
    items: [],
  }),
  gallery: () => ({
    items: [],
  }),
  links: () => ({
    headline: 'Useful Links',
    paragraph: 'Explore our resources and helpful links.',
    items: [],
  }),
  contact: () => ({
    headline: 'Get in Touch',
    subheadline: 'We\'d love to hear from you',
    paragraphs: [],
    formFields: [],
    submitButton: { label: 'Send Message', url: '#' },
    socialLinks: [],
  }),
  subscribe: () => ({
    headline: 'Stay Updated',
    subheadline: 'Subscribe to our newsletter',
    paragraph: 'Get the latest news and updates delivered to your inbox.',
    emailPlaceholder: 'Enter your email',
    submitButton: { label: 'Subscribe', url: '#' },
  }),
  footer: () => ({
    title: 'Site Name',
    paragraph: 'A brief description of your site or company.',
    secondaryText: '© 2024 Company. All rights reserved.',
  }),
}

interface SectionInstance {
  id: string
  type: string
  variant: string
  data: Record<string, unknown>
  fieldStyles?: Record<string, Record<string, unknown>>
  styles?: Record<string, unknown>
  itemStyles?: Record<string, unknown>
}

interface Project {
  sections: SectionInstance[]
  [key: string]: unknown
}

export function hydrateProject(project: Project): Project {
  return {
    ...project,
    sections: project.sections.map(section => hydrateSection(section))
  }
}

function hydrateSection(section: SectionInstance): SectionInstance {
  const defaultDataFn = SECTION_DEFAULTS[section.type]

  if (!defaultDataFn) {
    throw new Error(`[hydrate] Unknown section type: ${section.type}`)
  }

  // Merge default data with section data
  const defaultData = defaultDataFn()

  return {
    ...section,
    data: {
      ...structuredClone(defaultData),
      ...(section.data ?? {})
    },
    styles: {
      ...(section.styles ?? {})
    },
    fieldStyles: {
      ...(section.fieldStyles ?? {})
    },
    itemStyles: {
      ...(section.itemStyles ?? {})
    }
  }
}
