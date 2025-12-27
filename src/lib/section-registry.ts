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
  buttonLabel?: string
  buttonUrl?: string
}

export interface CardsLayoutOptions {
  // carousel variant only
  slidesPerView?: number  // Supports decimals (e.g., 2.5)
  autoplay?: boolean
  showArrows?: boolean
}

export interface CardsData {
  headline?: string
  subheadline?: string
  paragraph?: string
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

// --- Contact ---
export interface ContactFormField {
  id?: string
  type: 'text' | 'email' | 'phone' | 'datetime' | 'select' | 'checkbox' | 'radio' | 'textarea'
  label: string  // Used as placeholder
  options?: string[]  // For select, checkbox, radio
  required?: boolean
}

export interface ContactData {
  headline?: string
  subheadline?: string
  paragraphs: string[]  // Exactly 3 paragraphs (email, phone, address)
  formFields: ContactFormField[]
  submitButton: CTAData  // Uses existing Button system
  socialLinks: LinkItem[]
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

// --- Footer (Global) ---
export interface FooterData {
  logo?: string
  title?: string
  paragraph?: string
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
  // slider variant only
  slidesPerView?: number
  autoplay?: boolean
  showArrows?: boolean
}

export interface GalleryData {
  headline?: string
  subheadline?: string
  paragraph?: string
  items: GalleryItem[]
  layout?: GalleryLayoutOptions
}

// --- Products ---
export interface ProductVariant {
  id?: string
  label: string
  price: number
  compareAtPrice?: number
}

export interface ProductItem {
  id?: string
  image?: {
    src: string
    alt?: string
  }
  heading: string
  subheading?: string
  description?: string
  variants?: ProductVariant[]
  ctaLabel?: string
  ctaUrl?: string
}

export interface ProductsLayoutOptions {
  // carousel variant only
  slidesPerView?: '1' | '2' | '3'
  autoplay?: boolean
  showArrows?: boolean
}

export interface ProductsData {
  headline?: string
  subheadline?: string
  paragraph?: string
  items: ProductItem[]
  layout?: ProductsLayoutOptions
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
  { type: 'text', key: 'headline', label: 'Headline' },
  { type: 'text', key: 'subheadline', label: 'Subheadline' },
  { type: 'richText', key: 'paragraph', label: 'Paragraph' },
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
      { type: 'text', key: 'buttonLabel', label: 'Button Label', placeholder: 'Learn more' },
      { type: 'url', key: 'buttonUrl', label: 'Button URL', placeholder: 'https://' },
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

const contactSchema: FieldSchema[] = [
  { type: 'text', key: 'headline', label: 'Headline', placeholder: 'Get in Touch' },
  { type: 'text', key: 'subheadline', label: 'Subheadline', placeholder: 'We\'d love to hear from you' },
  { type: 'text', key: 'paragraphs.0', label: 'Email', placeholder: 'contact@example.com' },
  { type: 'text', key: 'paragraphs.1', label: 'Phone', placeholder: '+1 (555) 123-4567' },
  { type: 'text', key: 'paragraphs.2', label: 'Address', placeholder: '123 Main St, City, State 12345' },
  {
    type: 'repeater',
    key: 'formFields',
    label: 'Form Fields',
    minItems: 1,
    maxItems: 20,
    itemSchema: [
      {
        type: 'select',
        key: 'type',
        label: 'Field Type',
        required: true,
        options: [
          { value: 'text', label: 'Text Input' },
          { value: 'email', label: 'Email Input' },
          { value: 'phone', label: 'Phone Input' },
          { value: 'datetime', label: 'Date + Time Picker' },
          { value: 'select', label: 'Dropdown Select' },
          { value: 'checkbox', label: 'Checkbox Select' },
          { value: 'radio', label: 'Radio Input' },
          { value: 'textarea', label: 'Textarea' },
        ] as { value: string; label: string }[],
      },
      { type: 'text', key: 'label', label: 'Label (used as placeholder)', required: true },
      { type: 'text', key: 'options', label: 'Options (comma-separated, for select/checkbox/radio)' },
    ],
  },
  { type: 'link', key: 'submitButton', label: 'Submit Button' },
  {
    type: 'repeater',
    key: 'socialLinks',
    label: 'Social Links',
    minItems: 0,
    maxItems: 10,
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

const footerSchema: FieldSchema[] = [
  { type: 'image', key: 'logo', label: 'Logo' },
  { type: 'text', key: 'title', label: 'Title' },
  { type: 'richText', key: 'paragraph', label: 'Paragraph' },
  { type: 'text', key: 'secondaryText', label: 'Secondary Text', placeholder: '© 2024 Company' },
]


const gallerySchema: FieldSchema[] = [
  { type: 'text', key: 'headline', label: 'Headline', placeholder: 'Gallery headline' },
  { type: 'text', key: 'subheadline', label: 'Subheadline', placeholder: 'Supporting line' },
  { type: 'richText', key: 'paragraph', label: 'Paragraph' },
  {
    type: 'repeater',
    key: 'items',
    label: 'Gallery Items',
    minItems: 1,
    maxItems: 24,
    itemSchema: [
      { type: 'media', key: 'media', label: 'Media', typeKey: 'media.type', required: true },
      { type: 'url', key: 'link.url', label: 'Link URL' },
      // Link target removed - all gallery links open in new tab by default
    ],
  },
]

const productsSchema: FieldSchema[] = [
  { type: 'text', key: 'headline', label: 'Headline' },
  { type: 'text', key: 'subheadline', label: 'Subheadline' },
  { type: 'richText', key: 'paragraph', label: 'Paragraph' },
  {
    type: 'repeater',
    key: 'items',
    label: 'Products',
    minItems: 1,
    maxItems: 12,
    itemSchema: [
      { type: 'image', key: 'image.src', label: 'Image' },
      { type: 'text', key: 'heading', label: 'Product Name', required: true },
      { type: 'text', key: 'subheading', label: 'Subheading' },
      { type: 'richText', key: 'description', label: 'Description' },
      {
        type: 'repeater',
        key: 'variants',
        label: 'Variants',
        minItems: 1,
        maxItems: 10,
        itemSchema: [
          { type: 'text', key: 'label', label: 'Variant Label', required: true, placeholder: 'e.g. Small, Medium, Large' },
          { type: 'text', key: 'price', label: 'Price', required: true, placeholder: '29.99' },
          { type: 'text', key: 'compareAtPrice', label: 'Compare At Price', placeholder: '39.99' },
        ],
        itemDefault: { label: 'Default', price: 0 },
      },
      { type: 'text', key: 'ctaLabel', label: 'Button Label', placeholder: 'Buy Now' },
      { type: 'url', key: 'ctaUrl', label: 'Button URL', placeholder: 'https://' },
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
  description: 'Site navigation bar with logo and links',
  useCase: 'Brand identity, main navigation, sticky header',
  previewImage: '/previews/header.png',
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
  description: 'Eye-catching introduction with headline, media, and call-to-action',
  useCase: 'Landing page intro, product launch, campaign header',
  previewImage: '/previews/hero.png',
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
  description: 'Display content in card format with images, titles, and descriptions',
  useCase: 'Features showcase, team members, service highlights',
  previewImage: '/previews/cards.png',
  defaultVariant: 'grid',
  variants: [
    { id: 'grid', label: 'Grid' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'row', label: 'Row' },
    { id: 'split', label: 'Split' },
  ],
  styleOptions: {
    carousel: [
      { key: 'autoplay', label: 'Autoplay', type: 'toggle', default: false },
      { key: 'showArrows', label: 'Show Arrows', type: 'toggle', default: true },
      { key: 'slidesPerView', label: 'Slides In View', type: 'range', min: 1, max: 6, step: 0.5, default: 3 },
    ],
    split: [
      {
        key: 'splitLayout',
        label: 'Content Layout',
        type: 'select',
        options: [
          { value: 'grid', label: 'Card' },
          { value: 'row', label: 'Row' },
          { value: 'carousel', label: '1.5 card in view' },
        ],
        default: 'grid',
      },
    ],
  },
  schema: cardsSchema,
  component: defineAsyncComponent(() => import('@/components/sections/CardsSection.vue')),
  createDefaultData: () => ({
    headline: 'Section headline',
    subheadline: 'Optional subheadline',
    paragraph: 'Use this space to introduce the cards below.',
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
  description: 'Collection of clickable links with optional descriptions',
  useCase: 'Resource lists, social links, navigation shortcuts',
  previewImage: '/previews/links.png',
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
      { label: 'Support Center', url: 'https://example.com/support' },
    ],
  }),
}

const contactSection: SectionDefinition<ContactData> = {
  type: 'contact',
  displayName: 'Contact',
  icon: 'section-contact',
  description: 'Contact form with email, phone, address and social links',
  useCase: 'Contact pages, get in touch sections, inquiry forms',
  previewImage: '/previews/contact.png',
  defaultVariant: 'stacked',
  variants: [
    { id: 'stacked', label: 'Stacked' },
    { id: 'split', label: 'Split' },
  ],
  styleOptions: {
    split: [
      { key: 'splitLayout', label: 'Layout', type: 'select', options: [{ value: 'title-content', label: 'Title | Content' }, { value: 'content-title', label: 'Content | Title' }], default: 'title-content' },
    ],
  },
  schema: contactSchema,
  component: defineAsyncComponent(() => import('@/components/sections/ContactSection.vue')),
  createDefaultData: () => ({
    headline: 'Get in Touch',
    subheadline: 'We\'d love to hear from you',
    paragraphs: [
      'contact@example.com',
      '+1 (555) 123-4567',
      '123 Main St, City, State 12345',
    ],
    formFields: [
      { type: 'text', label: 'Your Name' },
      { type: 'email', label: 'Your Email' },
      { type: 'textarea', label: 'Your Message' },
    ],
    submitButton: {
      label: 'Send Message',
      url: '#',
    },
    socialLinks: [
      { label: 'Twitter', url: 'https://twitter.com' },
      { label: 'LinkedIn', url: 'https://linkedin.com' },
    ],
  }),
}

const accordionVariants = [
  { id: 'list', label: 'List' },
  { id: 'split', label: 'Split' },
]

const accordionSection: SectionDefinition<AccordionData> = {
  type: 'accordion',
  displayName: 'Accordion',
  icon: 'section-accordions',
  description: 'Expandable content panels for FAQ, menus, or events',
  useCase: 'FAQ sections, restaurant menus, event schedules',
  previewImage: '/previews/accordion.png',
  defaultVariant: 'list',
  variants: accordionVariants,
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
  // Hidden from Add Section menu - users should use FAQ, Menu, Events, or Services instead
  hidden: true,
}

const faqSection: SectionDefinition<AccordionData> = {
  type: 'faq',
  displayName: 'FAQ',
  icon: 'section-faq',
  description: 'Answer common customer questions with collapsible entries',
  useCase: 'Support, onboarding, product knowledge',
  previewImage: '/previews/accordion.png',
  defaultVariant: 'list',
  variants: accordionVariants,
  schema: accordionSchema,
  component: defineAsyncComponent(() => import('@/components/sections/AccordionSection.vue')),
  createDefaultData: () => ({
    headline: 'Frequently Asked Questions',
    paragraph: 'Find answers to common questions below.',
    useCase: 'faq' as AccordionUseCase,
    items: [
      { headline: 'Question', content: 'Answer' },
      { headline: 'Another question', content: 'Another answer' },
    ],
  }),
}

const menuSection: SectionDefinition<AccordionData> = {
  type: 'menu',
  displayName: 'Menu',
  icon: 'section-menu',
  description: 'Showcase menu items with pricing inside collapsible groups',
  useCase: 'Restaurants, cafés, service menus',
  previewImage: '/previews/accordion.png',
  defaultVariant: 'list',
  variants: accordionVariants,
  schema: accordionSchema,
  component: defineAsyncComponent(() => import('@/components/sections/AccordionSection.vue')),
  createDefaultData: () => ({
    headline: 'Menu',
    paragraph: 'Featured menu categories and highlighted items.',
    useCase: 'menu' as AccordionUseCase,
    items: [
      {
        headline: 'Featured Items',
        items: [
          { subheadline: 'Item name', details: 'Description', price: '$12' },
          { subheadline: 'Another item', details: 'Chef speciality', price: '$18' },
        ],
      },
    ],
  }),
}

const eventsSection: SectionDefinition<AccordionData> = {
  type: 'events',
  displayName: 'Events',
  icon: 'section-event',
  description: 'Promote upcoming events with dates, locations, and details',
  useCase: 'Workshops, launches, community meetups',
  previewImage: '/previews/accordion.png',
  defaultVariant: 'list',
  variants: accordionVariants,
  schema: accordionSchema,
  component: defineAsyncComponent(() => import('@/components/sections/AccordionSection.vue')),
  createDefaultData: () => ({
    headline: 'Upcoming Events',
    paragraph: 'Mark your calendar for what’s next.',
    useCase: 'event' as AccordionUseCase,
    items: [
      {
        headline: 'Event name',
        datetime: 'June 21, 2024',
        location: 'Downtown Studio',
        details: 'Event details and registration info.',
      },
    ],
  }),
}

const servicesSection: SectionDefinition<AccordionData> = {
  type: 'services',
  displayName: 'Services',
  icon: 'section-accordions',
  description: 'Outline service offerings with expandable descriptions',
  useCase: 'Agencies, consultants, professional services',
  previewImage: '/previews/accordion.png',
  defaultVariant: 'list',
  variants: accordionVariants,
  schema: accordionSchema,
  component: defineAsyncComponent(() => import('@/components/sections/AccordionSection.vue')),
  createDefaultData: () => ({
    headline: 'Services',
    paragraph: 'What we can do for you.',
    useCase: 'faq' as AccordionUseCase,
    items: [
      { headline: 'Service name', content: 'Service description and key benefits.' },
      { headline: 'Another service', content: 'Summary of what’s included.' },
    ],
  }),
}

const ctaSection: SectionDefinition<CTABlockData> = {
  type: 'cta',
  displayName: 'CTA',
  icon: 'section-cta',
  description: 'Call-to-action block with headline and buttons',
  useCase: 'Conversion prompts, sign-up encouragement, promotional banners',
  previewImage: '/previews/cta.png',
  defaultVariant: 'stacked',
  variants: [
    { id: 'stacked', label: 'Stacked' },
    { id: 'split', label: 'Split' },
  ],
  // NOTE: height, wrapGap, and layout controls are in StyleInspector.vue
  // stored as sectionStyles.ctaHeight, ctaWrapGap, ctaLayout
  schema: ctaBlockSchema,
  component: defineAsyncComponent(() => import('@/components/sections/CTASection.vue')),
  createDefaultData: () => ({
    headline: 'Ready to get started?',
    subheadline: 'Your compelling tagline here',
    paragraph: 'Join thousands of happy customers today.',
    primaryCTA: { label: 'Get Started', url: '#' },
  }),
}


const gallerySection: SectionDefinition<GalleryData> = {
  type: 'gallery',
  displayName: 'Gallery',
  icon: 'section-gallery',
  description: 'Visual showcase of images or videos in various layouts',
  useCase: 'Portfolio display, product photos, event galleries',
  previewImage: '/previews/gallery.png',
  defaultVariant: 'grid',
  variants: [
    { id: 'masonry', label: 'Masonry' },
    { id: 'grid', label: 'Grid' },
    { id: 'slider', label: 'Slider' },
  ],
  styleOptions: {
    slider: [
      { key: 'slidesPerView', label: 'Slides Per View', type: 'select', options: [{ value: '1', label: '1' }, { value: '1.5', label: '1.5' }, { value: '2', label: '2' }, { value: '2.5', label: '2.5' }, { value: '3', label: '3' }, { value: '3.5', label: '3.5' }, { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' }], default: '3' },
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
  description: 'Page footer with branding and copyright',
  useCase: 'Site footer with branding information',
  previewImage: '/previews/footer.png',
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

const productsSection: SectionDefinition<ProductsData> = {
  type: 'products',
  displayName: 'Products',
  icon: 'section-products',
  description: 'Product cards with pricing, variants, and buy buttons',
  useCase: 'E-commerce, merchandise, service packages',
  previewImage: '/previews/products.png',
  defaultVariant: 'grid',
  variants: [
    { id: 'grid', label: 'Grid' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'row', label: 'Row' },
    { id: 'split', label: 'Split' },
  ],
  styleOptions: {
    carousel: [
      { key: 'slidesPerView', label: 'Slides Per View', type: 'select', options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }], default: '1' },
      { key: 'autoplay', label: 'Autoplay', type: 'toggle', default: false },
      { key: 'showArrows', label: 'Show Arrows', type: 'toggle', default: true },
    ],
    split: [
      {
        key: 'splitLayout',
        label: 'Content Layout',
        type: 'select',
        options: [
          { value: 'grid', label: 'Grid' },
          { value: 'row', label: 'Row' },
          { value: 'carousel', label: 'Carousel' },
        ],
        default: 'grid',
      },
    ],
  },
  schema: productsSchema,
  component: defineAsyncComponent(() => import('@/components/sections/ProductsSection.vue')),
  createDefaultData: () => ({
    headline: 'Featured Products',
    subheadline: 'Showcase your best offerings',
    paragraph: 'Use this section to highlight products, packages, or merchandise with pricing and purchase links.',
    items: [
      {
        heading: 'Product One',
        subheading: 'Best seller',
        description: 'A great product that you will love.',
        variants: [{ label: 'Default', price: 29.99 }],
        ctaLabel: 'Buy Now',
        ctaUrl: '#',
      },
      {
        heading: 'Product Two',
        subheading: 'New arrival',
        description: 'Another amazing product.',
        variants: [{ label: 'Default', price: 39.99 }],
        ctaLabel: 'Buy Now',
        ctaUrl: '#',
      },
      {
        heading: 'Product Three',
        subheading: 'Limited edition',
        description: 'Get it while it lasts.',
        variants: [{ label: 'Default', price: 49.99 }],
        ctaLabel: 'Buy Now',
        ctaUrl: '#',
      },
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
  ['cards', cardsSection as unknown as SectionDefinition],
  ['products', productsSection as unknown as SectionDefinition],
  ['cta', ctaSection as unknown as SectionDefinition],
  ['accordion', accordionSection as unknown as SectionDefinition],
  ['faq', faqSection as unknown as SectionDefinition],
  ['menu', menuSection as unknown as SectionDefinition],
  ['events', eventsSection as unknown as SectionDefinition],
  ['services', servicesSection as unknown as SectionDefinition],
  ['gallery', gallerySection as unknown as SectionDefinition],
  ['links', linksSection as unknown as SectionDefinition],
  ['contact', contactSection as unknown as SectionDefinition],
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
  // Filter out hidden sections (internal use only, not shown in Add Section menu)
  return Array.from(sectionRegistry.values()).filter(section => !section.hidden)
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
