/**
 * SECTION REGISTRY
 * Single source of truth for all available sections
 *
 * ALL BLOCKS MUST:
 * - Follow the same contract: { data, variant, theme }
 * - Render content ONLY from data
 * - Control layout ONLY via variant
 * - Style ONLY via theme tokens (CSS variables)
 * - Contain ZERO editor logic
 * - Contain ZERO custom CSS
 */

import { defineAsyncComponent } from 'vue'
import type { SectionDefinition, FieldSchema } from '@/types/sections'

// ============================================
// DATA TYPES
// ============================================

/** CTA button data - reused across multiple blocks */
export interface CTAData {
  label: string
  url: string
}

/** Social link item */
export interface SocialItem {
  id?: string
  label: string
  url: string
}

/** Form field definition */
export interface FormFieldItem {
  id?: string
  name: string
  type: 'text' | 'email' | 'tel' | 'textarea'
  placeholder: string
  required?: boolean
}

// --- Header (Global) ---
export interface HeaderData {
  logo?: {
    src: string
    alt?: string
  }
  title?: string
  link?: {
    label: string
    url: string
  }
}

// --- Hero ---
export interface HeroMedia {
  type: 'image' | 'video'
  src: string
  alt?: string
}

export interface HeroData {
  headline?: string
  subheadline?: string
  paragraph?: string
  primaryCTA?: CTAData
  secondaryCTA?: CTAData
  media?: HeroMedia
}



// --- Cards ---
export interface CardItem {
  id?: string
  media?: HeroMedia  // Reuses HeroMedia type (image/video)
  headline?: string
  subheadline?: string
  paragraph?: string
}

export interface CardsLayoutOptions {
  // carousel variant only
  slidesPerView?: '1' | '2' | '3'
  autoplay?: boolean
  showArrows?: boolean
}

export interface CardsData {
  items: CardItem[]
  layout?: CardsLayoutOptions
}

// --- Links ---
export interface LinkItem {
  id?: string
  label: string
  url: string
  description?: string
  image?: {
    src: string
    alt?: string
  }
}

export interface LinksData {
  headline?: string
  paragraph?: string
  items: LinkItem[]
}

// --- Accordion ---
export type AccordionUseCase = 'faq' | 'menu' | 'event'

/** FAQ item - question/answer format */
export interface AccordionItemFAQ {
  id?: string
  headline: string      // Question
  content: string       // Answer (rich text)
}

/** Menu sub-item (inside accordion content) */
export interface MenuSubItem {
  id?: string
  subheadline: string   // Item name
  details?: string      // Description
  price?: string
  image?: {
    src: string
    alt?: string
  }
}

/** Menu item - collapsible category with sub-items */
export interface AccordionItemMenu {
  id?: string
  headline: string      // Category title
  items: MenuSubItem[]
}

/** Event item - full event with datetime */
export interface AccordionItemEvent {
  id?: string
  headline: string      // Event title
  datetime: string      // ISO date-time
  location?: string
  details?: string      // Description
  price?: string
  image?: {
    src: string
    alt?: string
  }
  button?: CTAData
}

/** Union of all accordion item types */
export type AccordionItem = AccordionItemFAQ | AccordionItemMenu | AccordionItemEvent

export interface AccordionData {
  headline?: string
  paragraph?: string
  useCase: AccordionUseCase
  items: AccordionItem[]
}

// --- CTA ---
export interface CTABlockData {
  headline: string
  subheadline?: string
  paragraph?: string
  primaryCTA: CTAData
  secondaryCTA?: CTAData
}

// --- Subscribe ---
export interface SubscribeData {
  headline: string
  paragraph?: string
  form: {
    placeholder: string
    submitLabel: string
  }
}

// --- Contact ---
export interface ContactInfo {
  phone?: string
  email?: string
  address?: string
}

export interface ContactFormField {
  id?: string
  name: string
  type: 'text' | 'email' | 'textarea'
  placeholder?: string
}

export interface ContactForm {
  fields: ContactFormField[]
  submitLabel: string
}

export interface ContactData {
  headline: string
  paragraph?: string
  contactInfo?: ContactInfo
  socials?: SocialItem[]
  form?: ContactForm
}

// --- Footer (Global) ---
export interface FooterLinkItem {
  id?: string
  label: string
  url: string
}

export interface FooterData {
  logo?: string
  title?: string
  paragraph?: string
  links?: FooterLinkItem[]
  secondaryText?: string
}


// --- Gallery ---
export interface GalleryItemLink {
  url: string
  target?: '_blank' | '_self'
}

export interface GalleryItem {
  id?: string
  media: HeroMedia  // Reuses HeroMedia type (image/video)
  link?: GalleryItemLink
}

export interface GalleryLayoutOptions {
  // carousel variant only
  slidesPerView?: '1' | '2' | '3'
  autoplay?: boolean
  showArrows?: boolean
}

export interface GalleryData {
  items: GalleryItem[]
  layout?: GalleryLayoutOptions
}

// --- Logo List ---
export interface LogoListItemLink {
  url: string
  target?: '_blank' | '_self'
}

export interface LogoListItem {
  id?: string
  image: {
    src: string
    alt?: string
  }
  link?: LogoListItemLink
}

export interface LogoListData {
  headline?: string
  subheadline?: string
  paragraph?: string
  items: LogoListItem[]
}

// --- Promo ---
export interface PromoLink {
  id?: string
  label: string
  url: string
}

export interface PromoData {
  image?: {
    src: string
    alt?: string
  }
  headline: string
  subheadline?: string
  paragraph?: string
  links: PromoLink[]
}


// ============================================
// FIELD SCHEMAS
// ============================================

const ctaItemSchema: FieldSchema[] = [
  { type: 'text', key: 'label', label: 'Label', required: true, placeholder: 'Click here' },
  { type: 'url', key: 'url', label: 'URL', required: true, placeholder: 'https://' },
]

const headerSchema: FieldSchema[] = [
  { type: 'image', key: 'logo.src', label: 'Logo' },
  { type: 'text', key: 'title', label: 'Title', placeholder: 'Site Name' },
  { type: 'link', key: 'link', label: 'Link' },
]

const heroSchema: FieldSchema[] = [
  { type: 'text', key: 'headline', label: 'Headline', placeholder: 'Your headline' },
  { type: 'text', key: 'subheadline', label: 'Subheadline', placeholder: 'Supporting text' },
  { type: 'richText', key: 'paragraph', label: 'Paragraph' },
  { type: 'link', key: 'primaryCTA', label: 'Primary Button' },
  { type: 'link', key: 'secondaryCTA', label: 'Secondary Button' },
  { type: 'media', key: 'media', label: 'Media', typeKey: 'media.type' },
]


const cardsSchema: FieldSchema[] = [
  {
    type: 'repeater',
    key: 'items',
    label: 'Cards',
    minItems: 1,
    maxItems: 12,
    itemSchema: [
      { type: 'media', key: 'media', label: 'Media', typeKey: 'media.type' },
      { type: 'text', key: 'headline', label: 'Headline', required: true },
      { type: 'text', key: 'subheadline', label: 'Subheadline' },
      { type: 'richText', key: 'paragraph', label: 'Paragraph' },
    ],
  },
]

const linksSchema: FieldSchema[] = [
  { type: 'text', key: 'headline', label: 'Headline', placeholder: 'Section headline' },
  { type: 'richText', key: 'paragraph', label: 'Paragraph' },
  {
    type: 'repeater',
    key: 'items',
    label: 'Links',
    minItems: 1,
    maxItems: 20,
    itemSchema: [
      { type: 'image', key: 'image.src', label: 'Image' },
      { type: 'text', key: 'label', label: 'Label', required: true },
      { type: 'url', key: 'url', label: 'URL', required: true },
      { type: 'text', key: 'description', label: 'Description' },
    ],
  },
]

const accordionSchema: FieldSchema[] = [
  { type: 'text', key: 'headline', label: 'Headline', placeholder: 'Section headline' },
  { type: 'richText', key: 'paragraph', label: 'Paragraph' },
  {
    type: 'select',
    key: 'useCase',
    label: 'Use Case',
    category: 'design',
    options: [
      { value: 'faq', label: 'FAQ' },
      { value: 'menu', label: 'Menu' },
      { value: 'event', label: 'Event' },
    ],
  },
  {
    type: 'repeater',
    key: 'items',
    label: 'Items',
    minItems: 1,
    maxItems: 20,
    useCaseKey: 'useCase',
    // Default schema (faq)
    itemSchema: [
      { type: 'text', key: 'headline', label: 'Question', required: true },
      { type: 'richText', key: 'content', label: 'Answer', required: true },
    ],
    useCaseSchemas: {
      faq: [
        { type: 'text', key: 'headline', label: 'Question', required: true },
        { type: 'richText', key: 'content', label: 'Answer', required: true },
      ],
      menu: [
        { type: 'text', key: 'headline', label: 'Category', required: true },
        {
          type: 'repeater',
          key: 'items',
          label: 'Menu Items',
          minItems: 1,
          maxItems: 20,
          itemSchema: [
            { type: 'text', key: 'subheadline', label: 'Item Name', required: true },
            { type: 'text', key: 'details', label: 'Description' },
            { type: 'text', key: 'price', label: 'Price' },
            { type: 'image', key: 'image.src', label: 'Image' },
          ],
        },
      ],
      event: [
        { type: 'text', key: 'headline', label: 'Event Title', required: true },
        { type: 'text', key: 'datetime', label: 'Date & Time', required: true, placeholder: 'e.g. January 15, 2025 at 7:00 PM' },
        { type: 'text', key: 'location', label: 'Location' },
        { type: 'richText', key: 'details', label: 'Details' },
        { type: 'text', key: 'price', label: 'Price' },
        { type: 'image', key: 'image.src', label: 'Image' },
        { type: 'link', key: 'button', label: 'Button' },
      ],
    },
  },
]

const ctaBlockSchema: FieldSchema[] = [
  { type: 'text', key: 'headline', label: 'Headline', required: true },
  { type: 'text', key: 'subheadline', label: 'Subheadline' },
  { type: 'richText', key: 'paragraph', label: 'Paragraph' },
  { type: 'link', key: 'primaryCTA', label: 'Primary Button', required: true },
  { type: 'link', key: 'secondaryCTA', label: 'Secondary Button' },
]

const subscribeSchema: FieldSchema[] = [
  { type: 'text', key: 'headline', label: 'Headline', required: true },
  { type: 'richText', key: 'paragraph', label: 'Paragraph' },
  { type: 'text', key: 'form.placeholder', label: 'Placeholder', placeholder: 'Enter your email' },
  { type: 'text', key: 'form.submitLabel', label: 'Submit Label', required: true, placeholder: 'Subscribe' },
]

const contactSchema: FieldSchema[] = [
  { type: 'text', key: 'headline', label: 'Headline', required: true },
  { type: 'richText', key: 'paragraph', label: 'Paragraph' },
  { type: 'text', key: 'contactInfo.phone', label: 'Phone' },
  { type: 'text', key: 'contactInfo.email', label: 'Email' },
  { type: 'text', key: 'contactInfo.address', label: 'Address' },
  {
    type: 'repeater',
    key: 'socials',
    label: 'Social Links',
    minItems: 0,
    maxItems: 10,
    itemSchema: [
      { type: 'text', key: 'label', label: 'Label', required: true },
      { type: 'url', key: 'url', label: 'URL', required: true },
    ],
    itemDefault: { label: 'New Link', url: '' },
  },
  {
    type: 'repeater',
    key: 'form.fields',
    label: 'Form Fields',
    minItems: 0,
    maxItems: 5,
    itemSchema: [
      { type: 'text', key: 'name', label: 'Field Name', required: true },
      { type: 'select', key: 'type', label: 'Type', options: [{ value: 'text', label: 'Text' }, { value: 'email', label: 'Email' }, { value: 'textarea', label: 'Textarea' }] },
      { type: 'text', key: 'placeholder', label: 'Placeholder' },
    ],
    itemDefault: { name: 'New Field', type: 'text', placeholder: '' },
  },
  { type: 'text', key: 'form.submitLabel', label: 'Form', placeholder: 'Send Message' },
]

const footerSchema: FieldSchema[] = [
  { type: 'image', key: 'logo', label: 'Logo' },
  { type: 'text', key: 'title', label: 'Title' },
  { type: 'richText', key: 'paragraph', label: 'Paragraph' },
  {
    type: 'repeater',
    key: 'links',
    label: 'Links',
    minItems: 0,
    maxItems: 10,
    itemSchema: [
      { type: 'text', key: 'label', label: 'Label', required: true },
      { type: 'url', key: 'url', label: 'URL', required: true },
    ],
  },
  { type: 'text', key: 'secondaryText', label: 'Secondary Text', placeholder: '© 2024 Company' },
]


const gallerySchema: FieldSchema[] = [
  {
    type: 'repeater',
    key: 'items',
    label: 'Gallery Items',
    minItems: 1,
    maxItems: 24,
    itemSchema: [
      { type: 'media', key: 'media', label: 'Media', typeKey: 'media.type', required: true },
      { type: 'url', key: 'link.url', label: 'Link URL' },
      { type: 'select', key: 'link.target', label: 'Link Target', options: [{ value: '_self', label: 'Same Tab' }, { value: '_blank', label: 'New Tab' }] },
    ],
  },
]

const logoListSchema: FieldSchema[] = [
  { type: 'text', key: 'headline', label: 'Headline', placeholder: 'Trusted by' },
  { type: 'text', key: 'subheadline', label: 'Subheadline', placeholder: 'Leading companies' },
  { type: 'richText', key: 'paragraph', label: 'Paragraph' },
  {
    type: 'repeater',
    key: 'items',
    label: 'Logos',
    minItems: 1,
    maxItems: 20,
    itemSchema: [
      { type: 'image', key: 'image.src', label: 'Logo', required: true },
      { type: 'url', key: 'link.url', label: 'Link URL' },
    ],
  },
]

const promoSchema: FieldSchema[] = [
  { type: 'image', key: 'image.src', label: 'Image' },
  { type: 'text', key: 'headline', label: 'Headline', required: true },
  { type: 'text', key: 'subheadline', label: 'Subheadline' },
  { type: 'richText', key: 'paragraph', label: 'Paragraph' },
  {
    type: 'repeater',
    key: 'links',
    label: 'Links',
    minItems: 0,
    maxItems: 10,
    itemSchema: [
      { type: 'text', key: 'label', label: 'Label', required: true },
      { type: 'url', key: 'url', label: 'URL', required: true },
    ],
  },
]


// ============================================
// SECTION DEFINITIONS
// ============================================

const headerSection: SectionDefinition<HeaderData> = {
  type: 'header',
  displayName: 'Header',
  icon: 'section-header',
  defaultVariant: 'default',
  variants: [
    { id: 'default', label: 'Default' },
    { id: 'centered', label: 'Centered' },
  ],
  styleOptions: {
    _global: [
      { key: 'sticky', label: 'Sticky Header', type: 'toggle', default: true },
    ],
  },
  schema: headerSchema,
  component: defineAsyncComponent(() => import('@/components/sections/HeaderSection.vue')),
  createDefaultData: () => ({
    title: 'Site Name',
    link: { label: 'Get Started', url: '#' },
  }),
}

const heroSection: SectionDefinition<HeroData> = {
  type: 'hero',
  displayName: 'Hero',
  icon: 'section-hero',
  defaultVariant: 'stacked',
  variants: [
    { id: 'stacked', label: 'Stacked' },
    { id: 'overlay', label: 'Overlay' },
    { id: 'split', label: 'Split' },
    { id: 'presentation', label: 'Presentation' },
  ],
  fieldOrder: {
    stacked: ['headline', 'subheadline', 'media', 'paragraph', 'primaryCTA', 'secondaryCTA'],
    overlay: ['media', 'headline', 'subheadline', 'paragraph', 'primaryCTA', 'secondaryCTA'],
    split: ['media', 'headline', 'subheadline', 'paragraph', 'primaryCTA', 'secondaryCTA'],
    presentation: ['media', 'headline', 'primaryCTA', 'secondaryCTA', 'subheadline', 'paragraph'],
  },
  styleOptions: {
    stacked: [
      { key: 'stackedLayout', label: 'Layout', type: 'select', options: [{ value: 'option1', label: 'Option 1' }, { value: 'option2', label: 'Option 2' }, { value: 'option3', label: 'Option 3' }], default: 'option1' },
    ],
    overlay: [
      { key: 'height', label: 'Height', type: 'select', options: [{ value: 'full', label: 'Full' }, { value: 'half', label: 'Half' }], default: 'full' },
      { key: 'positionX', label: 'X Position', type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }], default: 'center' },
      { key: 'positionY', label: 'Y Position', type: 'select', options: [{ value: 'top', label: 'Top' }, { value: 'middle', label: 'Middle' }, { value: 'bottom', label: 'Bottom' }], default: 'middle' },
      { key: 'overlayOpacity', label: 'Overlay Opacity', type: 'select', options: [{ value: '0', label: '0%' }, { value: '25', label: '25%' }, { value: '50', label: '50%' }, { value: '75', label: '75%' }, { value: '100', label: '100%' }], default: '50' },
      { key: 'overlayBlur', label: 'Overlay Blur', type: 'select', options: [{ value: '0', label: 'None' }, { value: '4', label: 'Light' }, { value: '8', label: 'Medium' }, { value: '16', label: 'Heavy' }], default: '0' },
    ],
    split: [
      { key: 'height', label: 'Height', type: 'select', options: [{ value: 'full', label: 'Full' }, { value: 'half', label: 'Half' }], default: 'full' },
      { key: 'contentPosition', label: 'Content Position', type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], default: 'right' },
    ],
    presentation: [],
  },
  schema: heroSchema,
  component: defineAsyncComponent(() => import('@/components/sections/HeroSection.vue')),
  createDefaultData: () => ({
    headline: 'Welcome to Your Site',
    subheadline: 'A compelling tagline that captures attention',
    paragraph: 'Add more details about your product, service, or message here.',
    primaryCTA: { label: 'Get Started', url: '#' },
  }),
}


const cardsSection: SectionDefinition<CardsData> = {
  type: 'cards',
  displayName: 'Cards',
  icon: 'section-cards',
  defaultVariant: 'grid',
  variants: [
    { id: 'grid', label: 'Grid' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'row', label: 'Row' },
  ],
  layoutOptions: {
    carousel: [
      { key: 'slidesPerView', label: 'Slides Per View', type: 'select', options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }], default: '1' },
      { key: 'autoplay', label: 'Autoplay', type: 'toggle', default: false },
      { key: 'showArrows', label: 'Show Arrows', type: 'toggle', default: true },
    ],
  },
  schema: cardsSchema,
  component: defineAsyncComponent(() => import('@/components/sections/CardsSection.vue')),
  createDefaultData: () => ({
    items: [
      { headline: 'Card One', paragraph: 'Description for the first card.' },
      { headline: 'Card Two', paragraph: 'Description for the second card.' },
      { headline: 'Card Three', paragraph: 'Description for the third card.' },
    ],
  }),
}

const linksSection: SectionDefinition<LinksData> = {
  type: 'links',
  displayName: 'Links',
  icon: 'section-links',
  defaultVariant: 'grid',
  variants: [
    { id: 'grid', label: 'Grid' },
    { id: 'split', label: 'Split' },
    { id: 'stacked', label: 'Stacked' },
  ],
  styleOptions: {
    split: [
      { key: 'splitLayout', label: 'Layout', type: 'select', options: [{ value: 'title-content', label: 'Title | Content' }, { value: 'content-title', label: 'Content | Title' }], default: 'title-content' },
    ],
  },
  schema: linksSchema,
  component: defineAsyncComponent(() => import('@/components/sections/LinksSection.vue')),
  createDefaultData: () => ({
    headline: 'Useful Links',
    paragraph: 'Explore our resources and helpful links.',
    items: [
      { label: 'Documentation', url: 'https://example.com/docs' },
      { label: 'Support', url: 'https://example.com/support' },
      { label: 'Contact Us', url: 'https://example.com/contact' },
    ],
  }),
}

const accordionSection: SectionDefinition<AccordionData> = {
  type: 'accordion',
  displayName: 'Accordion',
  icon: 'section-accordions',
  defaultVariant: 'list',
  variants: [
    { id: 'list', label: 'List' },
    { id: 'split', label: 'Split' },
  ],
  schema: accordionSchema,
  component: defineAsyncComponent(() => import('@/components/sections/AccordionSection.vue')),
  createDefaultData: () => ({
    headline: 'Frequently Asked Questions',
    paragraph: 'Find answers to common questions below.',
    useCase: 'faq' as AccordionUseCase,
    items: [
      { headline: 'What is this product?', content: 'This is a detailed answer to the first question.' },
      { headline: 'How does it work?', content: 'This is a detailed answer to the second question.' },
    ],
  }),
}

const ctaSection: SectionDefinition<CTABlockData> = {
  type: 'cta',
  displayName: 'CTA',
  icon: 'section-cta',
  defaultVariant: 'stacked',
  variants: [
    { id: 'stacked', label: 'Stacked' },
    { id: 'split', label: 'Split' },
  ],
  styleOptions: {
    _global: [
      { key: 'height', label: 'Height', type: 'select', options: [{ value: 'auto', label: 'Auto' }, { value: 'full', label: 'Full' }, { value: 'half', label: 'Half' }], default: 'auto' },
      { key: 'wrapGap', label: 'Wrap Gap', type: 'select', options: [{ value: '16', label: 'Small' }, { value: '32', label: 'Medium' }, { value: '48', label: 'Large' }, { value: '64', label: 'X-Large' }], default: '32' },
    ],
    stacked: [
      { key: 'stackedLayout', label: 'Layout', type: 'select', options: [{ value: 'option1', label: 'Option 1' }, { value: 'option2', label: 'Option 2' }], default: 'option1' },
    ],
  },
  schema: ctaBlockSchema,
  component: defineAsyncComponent(() => import('@/components/sections/CTASection.vue')),
  createDefaultData: () => ({
    headline: 'Ready to get started?',
    subheadline: 'Your compelling tagline here',
    paragraph: 'Join thousands of happy customers today.',
    primaryCTA: { label: 'Get Started', url: '#' },
  }),
}

const subscribeSection: SectionDefinition<SubscribeData> = {
  type: 'subscribe',
  displayName: 'Subscribe',
  icon: 'section-subscribe',
  defaultVariant: 'stacked',
  variants: [
    { id: 'stacked', label: 'Stacked' },
    { id: 'split', label: 'Split' },
  ],
  styleOptions: {
    split: [
      { key: 'splitLayout', label: 'Layout', type: 'select', options: [{ value: 'content-form', label: 'Content | Form' }, { value: 'form-content', label: 'Form | Content' }], default: 'content-form' },
    ],
  },
  schema: subscribeSchema,
  component: defineAsyncComponent(() => import('@/components/sections/SubscribeSection.vue')),
  createDefaultData: () => ({
    headline: 'Stay Updated',
    paragraph: 'Get the latest news delivered to your inbox.',
    form: {
      placeholder: 'Enter your email',
      submitLabel: 'Subscribe',
    },
  }),
}

const contactSection: SectionDefinition<ContactData> = {
  type: 'contact',
  displayName: 'Contact',
  icon: 'section-contact',
  defaultVariant: 'stacked',
  variants: [
    { id: 'stacked', label: 'Stacked' },
    { id: 'split', label: 'Split' },
  ],
  schema: contactSchema,
  component: defineAsyncComponent(() => import('@/components/sections/ContactSection.vue')),
  createDefaultData: () => ({
    headline: 'Get in Touch',
    paragraph: 'We\'d love to hear from you.',
    contactInfo: {
      email: 'hello@example.com',
    },
    form: {
      fields: [
        { name: 'name', type: 'text', placeholder: 'Your name' },
        { name: 'email', type: 'email', placeholder: 'Your email' },
        { name: 'message', type: 'textarea', placeholder: 'Your message' },
      ],
      submitLabel: 'Send Message',
    },
  }),
}


const gallerySection: SectionDefinition<GalleryData> = {
  type: 'gallery',
  displayName: 'Gallery',
  icon: 'section-gallery',
  defaultVariant: 'grid',
  variants: [
    { id: 'masonry', label: 'Masonry' },
    { id: 'grid', label: 'Grid' },
    { id: 'carousel', label: 'Carousel' },
  ],
  styleOptions: {
    _global: [
      { key: 'spaceBetween', label: 'Space Between', type: 'select', options: [{ value: '8', label: 'Small' }, { value: '16', label: 'Medium' }, { value: '24', label: 'Large' }, { value: '32', label: 'X-Large' }], default: '16' },
    ],
  },
  layoutOptions: {
    carousel: [
      { key: 'slidesPerView', label: 'Slides Per View', type: 'select', options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }], default: '3' },
      { key: 'autoplay', label: 'Autoplay', type: 'toggle', default: false },
      { key: 'showArrows', label: 'Show Arrows', type: 'toggle', default: true },
    ],
  },
  schema: gallerySchema,
  component: defineAsyncComponent(() => import('@/components/sections/GallerySection.vue')),
  createDefaultData: () => ({
    items: [
      { media: { type: 'image', src: '', alt: 'Gallery image 1' } },
      { media: { type: 'image', src: '', alt: 'Gallery image 2' } },
      { media: { type: 'image', src: '', alt: 'Gallery image 3' } },
      { media: { type: 'image', src: '', alt: 'Gallery image 4' } },
      { media: { type: 'image', src: '', alt: 'Gallery image 5' } },
      { media: { type: 'image', src: '', alt: 'Gallery image 6' } },
    ],
  }),
}

const footerSection: SectionDefinition<FooterData> = {
  type: 'footer',
  displayName: 'Footer',
  icon: 'section-footer',
  defaultVariant: 'default',
  variants: [
    { id: 'default', label: 'Default' },
    { id: 'centered', label: 'Centered' },
    { id: 'minimal', label: 'Minimal' },
  ],
  schema: footerSchema,
  component: defineAsyncComponent(() => import('@/components/sections/FooterSection.vue')),
  createDefaultData: () => ({
    title: 'Site Name',
    paragraph: 'A brief description of your site or company.',
    secondaryText: '© 2024 Company. All rights reserved.',
  }),
}

const logoListSection: SectionDefinition<LogoListData> = {
  type: 'logoList',
  displayName: 'Logo List',
  icon: 'section-logos',
  defaultVariant: 'grid',
  variants: [
    { id: 'grid', label: 'Grid' },
    { id: 'stacked', label: 'Stacked' },
  ],
  schema: logoListSchema,
  component: defineAsyncComponent(() => import('@/components/sections/LogoListSection.vue')),
  createDefaultData: () => ({
    headline: 'Trusted by',
    items: [
      { image: { src: '', alt: 'Logo 1' } },
      { image: { src: '', alt: 'Logo 2' } },
      { image: { src: '', alt: 'Logo 3' } },
    ],
  }),
}

const promoSection: SectionDefinition<PromoData> = {
  type: 'promo',
  displayName: 'Promo',
  icon: 'section-promo',
  defaultVariant: 'card',
  variants: [
    { id: 'card', label: 'Card' },
    { id: 'split', label: 'Split' },
  ],
  styleOptions: {
    _global: [
      { key: 'smartBackground', label: 'Smart Background', type: 'toggle', default: false },
    ],
  },
  schema: promoSchema,
  component: defineAsyncComponent(() => import('@/components/sections/PromoSection.vue')),
  createDefaultData: () => ({
    headline: 'Coming Soon',
    subheadline: 'Something exciting is on the way',
    paragraph: 'Sign up to be the first to know when we launch.',
    links: [
      { label: 'Pre-save Now', url: '#' },
    ],
  }),
}


// ============================================
// REGISTRY
// ============================================

/**
 * The section registry - single source of truth
 */
export const sectionRegistry = new Map<string, SectionDefinition>([
  ['header', headerSection as unknown as SectionDefinition],
  ['hero', heroSection as unknown as SectionDefinition],
  ['promo', promoSection as unknown as SectionDefinition],
  ['cards', cardsSection as unknown as SectionDefinition],
  ['cta', ctaSection as unknown as SectionDefinition],
  ['accordion', accordionSection as unknown as SectionDefinition],
  ['gallery', gallerySection as unknown as SectionDefinition],
  ['links', linksSection as unknown as SectionDefinition],
  ['subscribe', subscribeSection as unknown as SectionDefinition],
  ['contact', contactSection as unknown as SectionDefinition],
  ['logoList', logoListSection as unknown as SectionDefinition],
  ['footer', footerSection as unknown as SectionDefinition],
])

/**
 * Global sections that appear once per page
 */
export const GLOBAL_SECTIONS = ['header', 'footer'] as const

/**
 * Check if a section type is global
 */
export function isGlobalSection(type: string): boolean {
  return GLOBAL_SECTIONS.includes(type as typeof GLOBAL_SECTIONS[number])
}

// ============================================
// REGISTRY HELPERS
// ============================================

export function getSectionDefinition(type: string): SectionDefinition | undefined {
  return sectionRegistry.get(type)
}

export function getAllSectionDefinitions(): SectionDefinition[] {
  return Array.from(sectionRegistry.values())
}

export function getSectionTypes(): string[] {
  return Array.from(sectionRegistry.keys())
}

export function createSectionInstance(type: string, id: string): import('@/types/sections').SectionInstance | null {
  const definition = getSectionDefinition(type)
  if (!definition) return null

  return {
    id,
    type,
    variant: definition.defaultVariant,
    data: definition.createDefaultData(),
  }
}

export function validateSectionData(instance: import('@/types/sections').SectionInstance): boolean {
  const definition = getSectionDefinition(instance.type)
  if (!definition) return false

  for (const field of definition.schema) {
    if (field.required && !instance.data[field.key]) {
      return false
    }
  }

  return true
}
