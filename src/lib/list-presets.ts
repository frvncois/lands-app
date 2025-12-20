/**
 * List Preset Factory
 *
 * Creates pre-configured list blocks with:
 * - Container (Stack or Grid)
 * - 3 items with dummy content
 * - Shared style for all items
 */

import { generateId } from './designer-utils'
import type {
  SectionBlock,
  SectionBlockType,
  SharedStyle,
  BlockStyles,
} from '@/types/designer'

// ============================================
// TYPES
// ============================================

export type ListPresetType =
  | 'link-list'
  | 'accordion-list'
  | 'card-grid'
  | 'slider'
  | 'feature-list'
  | 'testimonial-slider'

export interface ListPresetConfig {
  type: ListPresetType
  name: string
  description: string
  icon: string
  category: 'list' | 'grid' | 'slider'
}

export interface ListPresetResult {
  block: SectionBlock
  sharedStyle: SharedStyle
}

// ============================================
// PRESET DEFINITIONS
// ============================================

export const listPresetConfigs: ListPresetConfig[] = [
  {
    type: 'link-list',
    name: 'Link List',
    description: 'Vertical list of clickable links with icons',
    icon: 'list',
    category: 'list',
  },
  {
    type: 'accordion-list',
    name: 'Accordion',
    description: 'Expandable FAQ-style list',
    icon: 'chevron-down',
    category: 'list',
  },
  {
    type: 'feature-list',
    name: 'Feature List',
    description: 'Icon + title + description list',
    icon: 'checkmark-circle',
    category: 'list',
  },
  {
    type: 'card-grid',
    name: 'Card Grid',
    description: 'Grid of image cards',
    icon: 'layout-grid-2',
    category: 'grid',
  },
  {
    type: 'slider',
    name: 'Content Slider',
    description: 'Horizontal scrollable cards',
    icon: 'arrow-right',
    category: 'slider',
  },
  {
    type: 'testimonial-slider',
    name: 'Testimonial Slider',
    description: 'Customer testimonials carousel',
    icon: 'quotation',
    category: 'slider',
  },
]

// ============================================
// DUMMY CONTENT
// ============================================

const dummyContent = {
  linkList: [
    { icon: 'home-2', text: 'Home', url: '/' },
    { icon: 'user-4', text: 'About Us', url: '/about' },
    { icon: 'envelope', text: 'Contact', url: '/contact' },
  ],
  accordion: [
    {
      question: 'What is your return policy?',
      answer:
        'We offer a 30-day money-back guarantee on all products. Simply contact our support team to initiate a return.',
    },
    {
      question: 'How long does shipping take?',
      answer:
        'Standard shipping takes 5-7 business days. Express shipping is available for 2-3 day delivery.',
    },
    {
      question: 'Do you offer international shipping?',
      answer:
        'Yes! We ship to over 50 countries worldwide. Shipping costs and times vary by location.',
    },
  ],
  features: [
    {
      icon: 'rocket',
      title: 'Fast Performance',
      description: 'Lightning-fast load times with optimized delivery.',
    },
    {
      icon: 'shield',
      title: 'Secure by Default',
      description: 'Enterprise-grade security built into every layer.',
    },
    {
      icon: 'reload',
      title: 'Always Updated',
      description: 'Automatic updates keep you on the latest version.',
    },
  ],
  cards: [
    {
      image:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
      title: 'Creative Design',
      description: 'Beautiful and functional designs.',
    },
    {
      image:
        'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400&h=300&fit=crop',
      title: 'Modern Stack',
      description: 'Built with the latest technologies.',
    },
    {
      image:
        'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=400&h=300&fit=crop',
      title: 'Fast Delivery',
      description: 'Launch your project quickly.',
    },
  ],
  testimonials: [
    {
      quote: 'This product changed how we work. Highly recommended!',
      author: 'Sarah Johnson',
      role: 'CEO, TechCorp',
      avatar: 'https://i.pravatar.cc/100?img=1',
    },
    {
      quote: 'The best investment we made this year. Amazing results.',
      author: 'Michael Chen',
      role: 'Founder, StartupXYZ',
      avatar: 'https://i.pravatar.cc/100?img=2',
    },
    {
      quote: 'Incredible support team and fantastic product quality.',
      author: 'Emily Davis',
      role: 'CTO, InnovateCo',
      avatar: 'https://i.pravatar.cc/100?img=3',
    },
  ],
}

// ============================================
// HELPER: Create Block with ID
// ============================================

function createBlock(
  type: SectionBlockType,
  name: string,
  settings: Record<string, unknown>,
  styles: Record<string, unknown>,
  children?: SectionBlock[],
  sharedStyleId?: string
): SectionBlock {
  const block: SectionBlock = {
    id: generateId(),
    type,
    name,
    settings,
    styles,
  } as SectionBlock

  if (children) {
    block.children = children
  }
  if (sharedStyleId) {
    block.sharedStyleId = sharedStyleId
  }

  return block
}

// ============================================
// LINK LIST PRESET
// ============================================

function createLinkListItem(
  icon: string,
  text: string,
  sharedStyleId: string
): SectionBlock {
  return createBlock(
    'stack',
    'Link Item',
    {
      direction: 'horizontal',
      align: 'center',
      gap: '12',
    },
    {
      padding: { top: '16', bottom: '16', left: '16', right: '16' },
      backgroundColor: '#ffffff',
      borderWidth: '1',
      borderStyle: 'solid',
      borderColor: '#e5e5e5',
      borderRadius: '12',
    },
    [
      // Left side: Icon + Text
      createBlock(
        'stack',
        'Link Content',
        { direction: 'horizontal', align: 'center', gap: '12' },
        {},
        [
          createBlock(
            'icon',
            'Icon',
            { icon, size: '20' },
            { color: '#171717' }
          ),
          createBlock(
            'text',
            'Label',
            { content: text },
            { fontSize: 'base', fontWeight: '500', color: '#171717' }
          ),
        ]
      ),
      // Right side: Arrow
      createBlock(
        'icon',
        'Arrow',
        { icon: 'chevron-right', size: '16' },
        { color: '#a3a3a3' }
      ),
    ],
    sharedStyleId
  )
}

export function createLinkListPreset(): ListPresetResult {
  const sharedStyleId = generateId()

  const sharedStyle: SharedStyle = {
    id: sharedStyleId,
    name: 'Link List Item',
    blockType: 'stack',
    styles: {
      padding: { top: '16', bottom: '16', left: '16', right: '16' },
      backgroundColor: '#ffffff',
      borderWidth: '1',
      borderStyle: 'solid',
      borderColor: '#e5e5e5',
      borderRadius: '12',
    } as BlockStyles,
    settings: {
      direction: 'horizontal',
      align: 'center',
      gap: '12',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const items = dummyContent.linkList.map((item) =>
    createLinkListItem(item.icon, item.text, sharedStyleId)
  )

  const container = createBlock(
    'stack',
    'Link List',
    {
      direction: 'vertical',
      align: 'stretch',
      gap: '8',
    },
    {
      padding: { top: '0', bottom: '0', left: '0', right: '0' },
    },
    items
  )

  return { block: container, sharedStyle }
}

// ============================================
// ACCORDION PRESET
// ============================================

function createAccordionItem(
  question: string,
  answer: string,
  sharedStyleId: string
): SectionBlock {
  return createBlock(
    'stack',
    'Accordion Item',
    {
      direction: 'vertical',
      align: 'stretch',
      gap: '0',
    },
    {
      backgroundColor: '#ffffff',
      borderWidth: '1',
      borderStyle: 'solid',
      borderColor: '#e5e5e5',
      borderRadius: '12',
      overflow: 'hidden',
    },
    [
      // Header (always visible)
      createBlock(
        'stack',
        'Accordion Header',
        {
          direction: 'horizontal',
          align: 'center',
          gap: '12',
        },
        {
          padding: { top: '16', bottom: '16', left: '20', right: '20' },
        },
        [
          createBlock(
            'text',
            'Question',
            { content: question },
            { fontSize: 'base', fontWeight: '600', color: '#171717' }
          ),
          createBlock(
            'icon',
            'Chevron',
            { icon: 'chevron-down', size: '20' },
            { color: '#737373' }
          ),
        ]
      ),
      // Content
      createBlock(
        'stack',
        'Accordion Content',
        {
          direction: 'vertical',
          gap: '0',
        },
        {
          padding: { top: '0', bottom: '16', left: '20', right: '20' },
        },
        [
          createBlock(
            'text',
            'Answer',
            { content: answer },
            { fontSize: 'sm', color: '#525252', lineHeight: '1.6' }
          ),
        ]
      ),
    ],
    sharedStyleId
  )
}

export function createAccordionPreset(): ListPresetResult {
  const sharedStyleId = generateId()

  const sharedStyle: SharedStyle = {
    id: sharedStyleId,
    name: 'Accordion Item',
    blockType: 'stack',
    styles: {
      backgroundColor: '#ffffff',
      borderWidth: '1',
      borderStyle: 'solid',
      borderColor: '#e5e5e5',
      borderRadius: '12',
      overflow: 'hidden',
    } as BlockStyles,
    settings: {
      direction: 'vertical',
      align: 'stretch',
      gap: '0',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const items = dummyContent.accordion.map((item) =>
    createAccordionItem(item.question, item.answer, sharedStyleId)
  )

  const container = createBlock(
    'stack',
    'Accordion',
    {
      direction: 'vertical',
      align: 'stretch',
      gap: '8',
    },
    {},
    items
  )

  return { block: container, sharedStyle }
}

// ============================================
// FEATURE LIST PRESET
// ============================================

function createFeatureItem(
  icon: string,
  title: string,
  description: string,
  sharedStyleId: string
): SectionBlock {
  return createBlock(
    'stack',
    'Feature Item',
    {
      direction: 'horizontal',
      align: 'start',
      gap: '16',
    },
    {
      padding: { top: '16', bottom: '16', left: '0', right: '0' },
    },
    [
      // Icon container
      createBlock(
        'stack',
        'Icon Wrapper',
        {
          direction: 'vertical',
          align: 'center',
        },
        {
          width: '48',
          height: '48',
          backgroundColor: '#f5f5f5',
          borderRadius: '12',
          flexShrink: '0',
        },
        [
          createBlock(
            'icon',
            'Icon',
            { icon, size: '24' },
            { color: '#171717' }
          ),
        ]
      ),
      // Text content
      createBlock(
        'stack',
        'Content',
        {
          direction: 'vertical',
          align: 'stretch',
          gap: '4',
        },
        { flexGrow: '1' },
        [
          createBlock(
            'heading',
            'Title',
            { content: title, level: 'h3' },
            { fontSize: 'lg', fontWeight: '600', color: '#171717' }
          ),
          createBlock(
            'text',
            'Description',
            { content: description },
            { fontSize: 'sm', color: '#525252', lineHeight: '1.5' }
          ),
        ]
      ),
    ],
    sharedStyleId
  )
}

export function createFeatureListPreset(): ListPresetResult {
  const sharedStyleId = generateId()

  const sharedStyle: SharedStyle = {
    id: sharedStyleId,
    name: 'Feature Item',
    blockType: 'stack',
    styles: {
      padding: { top: '16', bottom: '16', left: '0', right: '0' },
    } as BlockStyles,
    settings: {
      direction: 'horizontal',
      align: 'start',
      gap: '16',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const items = dummyContent.features.map((item) =>
    createFeatureItem(item.icon, item.title, item.description, sharedStyleId)
  )

  const container = createBlock(
    'stack',
    'Feature List',
    {
      direction: 'vertical',
      align: 'stretch',
      gap: '8',
    },
    {},
    items
  )

  return { block: container, sharedStyle }
}

// ============================================
// CARD GRID PRESET
// ============================================

function createCardItem(
  image: string,
  title: string,
  description: string,
  sharedStyleId: string
): SectionBlock {
  return createBlock(
    'stack',
    'Card',
    {
      direction: 'vertical',
      align: 'stretch',
      gap: '12',
    },
    {
      backgroundColor: '#ffffff',
      borderWidth: '1',
      borderStyle: 'solid',
      borderColor: '#e5e5e5',
      borderRadius: '16',
      overflow: 'hidden',
    },
    [
      // Image
      createBlock(
        'image',
        'Card Image',
        { src: image, alt: title },
        {
          aspectRatio: '16:9',
          objectFit: 'cover',
          width: '100%',
        }
      ),
      // Content
      createBlock(
        'stack',
        'Card Content',
        {
          direction: 'vertical',
          align: 'stretch',
          gap: '8',
        },
        {
          padding: { top: '16', bottom: '20', left: '20', right: '20' },
        },
        [
          createBlock(
            'heading',
            'Card Title',
            { content: title, level: 'h3' },
            { fontSize: 'lg', fontWeight: '600', color: '#171717' }
          ),
          createBlock(
            'text',
            'Card Description',
            { content: description },
            { fontSize: 'sm', color: '#525252', lineHeight: '1.5' }
          ),
        ]
      ),
    ],
    sharedStyleId
  )
}

export function createCardGridPreset(): ListPresetResult {
  const sharedStyleId = generateId()

  const sharedStyle: SharedStyle = {
    id: sharedStyleId,
    name: 'Card',
    blockType: 'stack',
    styles: {
      backgroundColor: '#ffffff',
      borderWidth: '1',
      borderStyle: 'solid',
      borderColor: '#e5e5e5',
      borderRadius: '16',
      overflow: 'hidden',
    } as BlockStyles,
    settings: {
      direction: 'vertical',
      align: 'stretch',
      gap: '12',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const items = dummyContent.cards.map((item) =>
    createCardItem(item.image, item.title, item.description, sharedStyleId)
  )

  const container = createBlock(
    'grid',
    'Card Grid',
    {
      columns: 3,
      gap: '24',
    },
    {
      tablet: { columns: 2 },
      mobile: { columns: 1 },
    },
    items
  )

  return { block: container, sharedStyle }
}

// ============================================
// SLIDER PRESET
// ============================================

function createSliderItem(
  image: string,
  title: string,
  description: string,
  sharedStyleId: string
): SectionBlock {
  return createBlock(
    'stack',
    'Slide',
    {
      direction: 'vertical',
      align: 'stretch',
      gap: '12',
    },
    {
      width: '300',
      flexShrink: '0',
      backgroundColor: '#ffffff',
      borderWidth: '1',
      borderStyle: 'solid',
      borderColor: '#e5e5e5',
      borderRadius: '16',
      overflow: 'hidden',
    },
    [
      createBlock(
        'image',
        'Slide Image',
        { src: image, alt: title },
        {
          aspectRatio: '4:3',
          objectFit: 'cover',
          width: '100%',
        }
      ),
      createBlock(
        'stack',
        'Slide Content',
        {
          direction: 'vertical',
          align: 'stretch',
          gap: '8',
        },
        {
          padding: { top: '16', bottom: '20', left: '20', right: '20' },
        },
        [
          createBlock(
            'heading',
            'Slide Title',
            { content: title, level: 'h3' },
            { fontSize: 'base', fontWeight: '600', color: '#171717' }
          ),
          createBlock(
            'text',
            'Slide Description',
            { content: description },
            { fontSize: 'sm', color: '#525252' }
          ),
        ]
      ),
    ],
    sharedStyleId
  )
}

export function createSliderPreset(): ListPresetResult {
  const sharedStyleId = generateId()

  const sharedStyle: SharedStyle = {
    id: sharedStyleId,
    name: 'Slide',
    blockType: 'stack',
    styles: {
      width: '300',
      flexShrink: '0',
      backgroundColor: '#ffffff',
      borderWidth: '1',
      borderStyle: 'solid',
      borderColor: '#e5e5e5',
      borderRadius: '16',
      overflow: 'hidden',
    } as BlockStyles,
    settings: {
      direction: 'vertical',
      align: 'stretch',
      gap: '12',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const items = dummyContent.cards.map((item) =>
    createSliderItem(item.image, item.title, item.description, sharedStyleId)
  )

  const container = createBlock(
    'stack',
    'Slider',
    {
      direction: 'horizontal',
      align: 'stretch',
      gap: '16',
    },
    {
      overflowX: 'auto',
      padding: { top: '4', bottom: '4', left: '4', right: '4' },
    },
    items
  )

  return { block: container, sharedStyle }
}

// ============================================
// TESTIMONIAL SLIDER PRESET
// ============================================

function createTestimonialItem(
  quote: string,
  author: string,
  role: string,
  avatar: string,
  sharedStyleId: string
): SectionBlock {
  return createBlock(
    'stack',
    'Testimonial',
    {
      direction: 'vertical',
      align: 'stretch',
      gap: '16',
    },
    {
      width: '350',
      flexShrink: '0',
      backgroundColor: '#ffffff',
      borderWidth: '1',
      borderStyle: 'solid',
      borderColor: '#e5e5e5',
      borderRadius: '20',
      padding: { top: '24', bottom: '24', left: '24', right: '24' },
    },
    [
      // Quote icon
      createBlock(
        'icon',
        'Quote Icon',
        { icon: 'quotation', size: '32' },
        { color: '#e5e5e5' }
      ),
      // Quote text
      createBlock(
        'text',
        'Quote',
        { content: `"${quote}"` },
        {
          fontSize: 'base',
          color: '#171717',
          lineHeight: '1.6',
          fontStyle: 'italic',
        }
      ),
      // Author info
      createBlock(
        'stack',
        'Author',
        {
          direction: 'horizontal',
          align: 'center',
          gap: '12',
        },
        {},
        [
          // Avatar
          createBlock(
            'image',
            'Avatar',
            { src: avatar, alt: author },
            {
              width: '48',
              height: '48',
              borderRadius: '50',
              objectFit: 'cover',
            }
          ),
          // Name and role
          createBlock(
            'stack',
            'Author Info',
            {
              direction: 'vertical',
              gap: '2',
            },
            {},
            [
              createBlock(
                'text',
                'Author Name',
                { content: author },
                { fontSize: 'sm', fontWeight: '600', color: '#171717' }
              ),
              createBlock(
                'text',
                'Author Role',
                { content: role },
                { fontSize: 'xs', color: '#737373' }
              ),
            ]
          ),
        ]
      ),
    ],
    sharedStyleId
  )
}

export function createTestimonialSliderPreset(): ListPresetResult {
  const sharedStyleId = generateId()

  const sharedStyle: SharedStyle = {
    id: sharedStyleId,
    name: 'Testimonial',
    blockType: 'stack',
    styles: {
      width: '350',
      flexShrink: '0',
      backgroundColor: '#ffffff',
      borderWidth: '1',
      borderStyle: 'solid',
      borderColor: '#e5e5e5',
      borderRadius: '20',
      padding: { top: '24', bottom: '24', left: '24', right: '24' },
    } as BlockStyles,
    settings: {
      direction: 'vertical',
      align: 'stretch',
      gap: '16',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const items = dummyContent.testimonials.map((item) =>
    createTestimonialItem(
      item.quote,
      item.author,
      item.role,
      item.avatar,
      sharedStyleId
    )
  )

  const container = createBlock(
    'stack',
    'Testimonials',
    {
      direction: 'horizontal',
      align: 'stretch',
      gap: '20',
    },
    {
      overflowX: 'auto',
      padding: { top: '4', bottom: '4', left: '4', right: '4' },
    },
    items
  )

  return { block: container, sharedStyle }
}

// ============================================
// MAIN FACTORY
// ============================================

export function createListPreset(type: ListPresetType): ListPresetResult {
  switch (type) {
    case 'link-list':
      return createLinkListPreset()
    case 'accordion-list':
      return createAccordionPreset()
    case 'feature-list':
      return createFeatureListPreset()
    case 'card-grid':
      return createCardGridPreset()
    case 'slider':
      return createSliderPreset()
    case 'testimonial-slider':
      return createTestimonialSliderPreset()
    default:
      throw new Error(`Unknown list preset type: ${type}`)
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if a block is a list container (has children with shared styles)
 */
export function isListContainer(block: SectionBlock): boolean {
  if (block.type !== 'stack' && block.type !== 'grid') {
    return false
  }

  if (!block.children || block.children.length < 2) {
    return false
  }

  const firstChildStyleId = block.children[0]?.sharedStyleId
  if (!firstChildStyleId) {
    return false
  }

  return block.children.every((child) => child.sharedStyleId === firstChildStyleId)
}

/**
 * Get the shared style ID used by list items
 */
export function getListItemStyleId(container: SectionBlock): string | null {
  if (!container.children || container.children.length === 0) {
    return null
  }

  return container.children[0]?.sharedStyleId || null
}
