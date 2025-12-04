import type {
  SectionBlock,
  SectionBlockType,
  BlockItem,
  BlockItemType,
  BlockItemStyles,
  SectionBlockStyles,
  PostSectionStyles,
  PostSectionSettings,
  PostItem,
  LinkSectionStyles,
  LinkSectionSettings,
  LinkItem,
  ProductSectionStyles,
  ProductSectionSettings,
  ProductItem,
  PageSettings,
  HeadingSettings,
  SubheadingSettings,
  TextSettings,
  ButtonSettings,
  ImageSettings,
  VideoSettings,
  AccordionSettings,
  FormSectionSettings,
  FormField,
  FormFieldType,
  HeaderSectionSettings,
  HeaderNavLink,
  FooterSectionSettings,
  FooterLink,
  FooterSocialLink,
} from '@/types/editor'

// Generate unique ID
export function generateId(): string {
  return crypto.randomUUID()
}

// Deep clone a block item with new IDs
export function duplicateBlockItem(item: BlockItem): BlockItem {
  return {
    ...item,
    id: generateId(),
    settings: JSON.parse(JSON.stringify(item.settings)),
    styles: JSON.parse(JSON.stringify(item.styles)),
  }
}

// Deep clone a section block with new IDs
export function duplicateSectionBlock(block: SectionBlock): SectionBlock {
  const newBlock: SectionBlock = {
    ...block,
    id: generateId(),
    name: block.name,
    children: block.children.map(child => duplicateBlockItem(child)),
    styles: JSON.parse(JSON.stringify(block.styles)),
  }

  // Clone post settings with new IDs
  if (block.postSettings) {
    newBlock.postSettings = {
      ...block.postSettings,
      posts: block.postSettings.posts.map(post => ({
        ...post,
        id: generateId(),
      })),
    }
  }

  // Clone link settings with new IDs
  if (block.linkSettings) {
    newBlock.linkSettings = {
      ...block.linkSettings,
      links: block.linkSettings.links.map(link => ({
        ...link,
        id: generateId(),
      })),
    }
  }

  // Clone product settings with new IDs
  if (block.productSettings) {
    newBlock.productSettings = {
      ...block.productSettings,
      products: block.productSettings.products.map(product => ({
        ...product,
        id: generateId(),
      })),
    }
  }

  // Clone form settings with new IDs
  if (block.formSettings) {
    newBlock.formSettings = {
      ...block.formSettings,
      fields: block.formSettings.fields.map(field => ({
        ...field,
        id: generateId(),
      })),
    }
  }

  // Clone header settings with new IDs
  if (block.headerSettings) {
    newBlock.headerSettings = {
      ...block.headerSettings,
      navLinks: block.headerSettings.navLinks.map(link => ({
        ...link,
        id: generateId(),
      })),
    }
  }

  // Clone footer settings with new IDs
  if (block.footerSettings) {
    newBlock.footerSettings = {
      ...block.footerSettings,
      links: block.footerSettings.links.map(link => ({
        ...link,
        id: generateId(),
      })),
      socialLinks: block.footerSettings.socialLinks.map(link => ({
        ...link,
        id: generateId(),
      })),
    }
  }

  return newBlock
}

// Default page settings
export function getDefaultPageSettings(): PageSettings {
  return {
    backgroundColor: '',
    backgroundImage: '',
    fontFamily: '',
    textColor: '',
    maxWidth: '1280',
    padding: { y: '0', x: '0' },
  }
}

// Default styles for block items
export function getDefaultBlockItemStyles(type: BlockItemType): BlockItemStyles {
  const baseStyles: BlockItemStyles = {
    align: 'left',
    margin: { y: '0', x: '0' },
    padding: { y: '0', x: '0' },
    effect: 'none',
  }

  switch (type) {
    case 'heading':
      return {
        ...baseStyles,
        fontSize: '4xl',
        fontWeight: 'bold',
        lineHeight: 'tight',
        textAlign: 'left',
      }
    case 'subheading':
      return {
        ...baseStyles,
        fontSize: 'xl',
        fontWeight: 'medium',
        lineHeight: 'normal',
        textAlign: 'left',
      }
    case 'text':
      return {
        ...baseStyles,
        fontSize: 'base',
        fontWeight: 'normal',
        lineHeight: 'relaxed',
        textAlign: 'left',
      }
    case 'button':
      return {
        ...baseStyles,
        align: 'left',
      }
    case 'image':
    case 'video':
      return {
        ...baseStyles,
        aspectRatio: 'auto',
        align: 'center',
      }
    default:
      return baseStyles
  }
}

// Default styles for section blocks
export function getDefaultSectionBlockStyles(): SectionBlockStyles {
  return {
    align: 'center',
    margin: { y: '0', x: '0' },
    padding: { y: '16', x: '16' },
    effect: 'none',
  }
}

// Default styles for post section
export function getDefaultPostSectionStyles(): PostSectionStyles {
  return {
    ...getDefaultSectionBlockStyles(),
    layout: 'grid',
    columns: 3,
    gap: '24',
  }
}

// Create a default post item
export function createPostItem(): PostItem {
  return {
    id: generateId(),
    image: '',
    heading: 'Post Title',
    text: 'Post description goes here...',
    buttonTitle: 'Read More',
    buttonLink: '#',
  }
}

// Default post section settings
export function getDefaultPostSectionSettings(): PostSectionSettings {
  return {
    posts: [createPostItem(), createPostItem(), createPostItem()],
    showImage: true,
    showHeading: true,
    showText: true,
    showButton: true,
  }
}

// Default styles for link section
export function getDefaultLinkSectionStyles(): LinkSectionStyles {
  return {
    ...getDefaultSectionBlockStyles(),
    layout: 'grid',
    columns: 3,
    gap: '24',
  }
}

// Create a default link item
export function createLinkItem(): LinkItem {
  return {
    id: generateId(),
    image: '',
    heading: 'Link Title',
    url: '#',
  }
}

// Default link section settings
export function getDefaultLinkSectionSettings(): LinkSectionSettings {
  return {
    links: [createLinkItem(), createLinkItem(), createLinkItem()],
    showImage: true,
    showHeading: true,
  }
}

// Default styles for product section
export function getDefaultProductSectionStyles(): ProductSectionStyles {
  return {
    ...getDefaultSectionBlockStyles(),
    layout: 'grid',
    columns: 3,
    gap: '24',
  }
}

// Create a default product item
export function createProductItem(): ProductItem {
  return {
    id: generateId(),
    image: '',
    heading: 'Product Name',
    subtitle: 'Product subtitle',
    text: 'Product description goes here...',
    price: '$0.00',
    buttonTitle: 'Buy Now',
    buttonLink: '#',
  }
}

// Default product section settings
export function getDefaultProductSectionSettings(): ProductSectionSettings {
  return {
    products: [createProductItem(), createProductItem(), createProductItem()],
    showImage: true,
    showHeading: true,
    showSubtitle: true,
    showText: true,
    showPrice: true,
    showButton: true,
  }
}

// Create a default form field
export function createFormField(type: FormFieldType): FormField {
  const labels: Record<FormFieldType, string> = {
    text: 'Text Field',
    email: 'Email',
    textarea: 'Message',
    select: 'Select Option',
    checkbox: 'Checkbox',
    radio: 'Radio Option',
    date: 'Date',
    phone: 'Phone Number',
    number: 'Number',
    file: 'File Upload',
  }

  const placeholders: Record<FormFieldType, string> = {
    text: 'Enter text...',
    email: 'your@email.com',
    textarea: 'Type your message here...',
    select: '',
    checkbox: '',
    radio: '',
    date: '',
    phone: '+1 (555) 000-0000',
    number: '0',
    file: '',
  }

  const field: FormField = {
    id: generateId(),
    type,
    label: labels[type],
    placeholder: placeholders[type],
    required: type === 'email', // Email required by default
  }

  // Add default options for select, checkbox, radio
  if (type === 'select' || type === 'radio') {
    field.options = ['Option 1', 'Option 2', 'Option 3']
  } else if (type === 'checkbox') {
    field.options = ['I agree to the terms']
  }

  return field
}

// Default form section settings
export function getDefaultFormSectionSettings(): FormSectionSettings {
  return {
    fields: [
      createFormField('text'),
      createFormField('email'),
    ],
    submitButtonText: 'Submit',
    successMessage: 'Thank you! Your submission has been received.',
  }
}

// Create a default header nav link
export function createHeaderNavLink(): HeaderNavLink {
  return {
    id: generateId(),
    label: 'Link',
    url: '#',
  }
}

// Default header section settings
export function getDefaultHeaderSectionSettings(): HeaderSectionSettings {
  return {
    logo: '',
    logoAlt: 'Logo',
    navLinks: [
      { id: generateId(), label: 'Home', url: '#' },
      { id: generateId(), label: 'About', url: '#about' },
      { id: generateId(), label: 'Contact', url: '#contact' },
    ],
    ctaButton: { label: 'Get Started', url: '#', show: true },
    isHidden: false,
  }
}

// Create a default footer link
export function createFooterLink(): FooterLink {
  return {
    id: generateId(),
    label: 'Link',
    url: '#',
  }
}

// Create a default footer social link
export function createFooterSocialLink(platform: FooterSocialLink['platform'] = 'twitter'): FooterSocialLink {
  return {
    id: generateId(),
    platform,
    url: '#',
  }
}

// Default footer section settings
export function getDefaultFooterSectionSettings(): FooterSectionSettings {
  return {
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
  }
}

// Form field type labels
export const formFieldLabels: Record<FormFieldType, string> = {
  text: 'Text',
  email: 'Email',
  textarea: 'Text Area',
  select: 'Dropdown',
  checkbox: 'Checkbox',
  radio: 'Radio',
  date: 'Date',
  phone: 'Phone',
  number: 'Number',
  file: 'File',
}

// Form field type icons (Lineicons classes)
export const formFieldIcons: Record<FormFieldType, string> = {
  text: 'lni-text-format',
  email: 'lni-envelope-1',
  textarea: 'lni-text-paragraph',
  select: 'lni-chevron-down-circle',
  checkbox: 'lni-checkbox',
  radio: 'lni-radio-button',
  date: 'lni-calendar-2',
  phone: 'lni-phone-1',
  number: 'lni-calculator-1',
  file: 'lni-cloud-upload-1',
}

// Social platform labels
export const socialPlatformLabels: Record<FooterSocialLink['platform'], string> = {
  twitter: 'Twitter / X',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  github: 'GitHub',
  discord: 'Discord',
}

// Social platform icons (Lineicons classes)
export const socialPlatformIcons: Record<FooterSocialLink['platform'], string> = {
  twitter: 'lni-x',
  instagram: 'lni-instagram-fill',
  facebook: 'lni-facebook-fill',
  linkedin: 'lni-linkedin-fill',
  youtube: 'lni-youtube-fill',
  tiktok: 'lni-tiktok-fill',
  github: 'lni-github-fill',
  discord: 'lni-discord-fill',
}

// Default settings for block items
export function getDefaultBlockItemSettings(type: BlockItemType) {
  switch (type) {
    case 'heading':
      return {
        content: 'Heading',
        level: 'h2',
      } as HeadingSettings
    case 'subheading':
      return {
        content: 'Subheading',
      } as SubheadingSettings
    case 'text':
      return {
        content: 'Enter your text here...',
      } as TextSettings
    case 'button':
      return {
        title: 'Click me',
        link: '#',
        variant: 'primary',
      } as ButtonSettings
    case 'image':
      return {
        src: '',
        alt: '',
      } as ImageSettings
    case 'video':
      return {
        src: '',
        poster: '',
        autoplay: false,
        loop: false,
        muted: true,
      } as VideoSettings
    case 'accordion':
      return {
        items: [
          { id: generateId(), title: 'Accordion Item 1', content: 'Content for item 1' },
        ],
      } as AccordionSettings
  }
}

// Create a block item
export function createBlockItem(type: BlockItemType): BlockItem {
  return {
    id: generateId(),
    type,
    settings: getDefaultBlockItemSettings(type),
    styles: getDefaultBlockItemStyles(type),
  }
}

// Section block templates with default children
export function getSectionBlockTemplate(type: SectionBlockType): {
  name: string
  children: BlockItemType[]
} {
  switch (type) {
    case 'header':
      return {
        name: 'Header',
        children: [], // Header uses headerSettings
      }
    case 'footer':
      return {
        name: 'Footer',
        children: [], // Footer uses footerSettings
      }
    case 'hero':
      return {
        name: 'Hero',
        children: ['heading', 'image'],
      }
    case 'text':
      return {
        name: 'Text',
        children: ['heading', 'subheading', 'text', 'button'],
      }
    case 'text-image':
      return {
        name: 'Text + Image',
        children: ['image', 'heading', 'subheading', 'text', 'button'],
      }
    case 'text-video':
      return {
        name: 'Text + Video',
        children: ['video', 'heading', 'subheading', 'text', 'button'],
      }
    case 'video':
      return {
        name: 'Video',
        children: ['video'],
      }
    case 'image':
      return {
        name: 'Image',
        children: ['image'],
      }
    case 'link':
      return {
        name: 'Links',
        children: [], // Link section has no block item children, uses linkSettings instead
      }
    case 'post':
      return {
        name: 'Posts',
        children: [], // Post section has no block item children, uses postSettings instead
      }
    case 'product':
      return {
        name: 'Products',
        children: [], // Product section has no block item children, uses productSettings instead
      }
    case 'form':
      return {
        name: 'Form',
        children: [], // Form section has no block item children, uses formSettings instead
      }
  }
}

// Create a section block with default children
export function createSectionBlock(type: SectionBlockType): SectionBlock {
  const template = getSectionBlockTemplate(type)

  // Determine styles based on section type
  let styles: SectionBlock['styles']
  if (type === 'post') {
    styles = getDefaultPostSectionStyles()
  } else if (type === 'link') {
    styles = getDefaultLinkSectionStyles()
  } else if (type === 'product') {
    styles = getDefaultProductSectionStyles()
  } else if (type === 'header' || type === 'footer') {
    // Header and footer have minimal padding
    styles = {
      ...getDefaultSectionBlockStyles(),
      padding: { y: '12', x: '16' },
    }
  } else {
    styles = getDefaultSectionBlockStyles()
  }

  const block: SectionBlock = {
    id: generateId(),
    type,
    name: template.name,
    children: template.children.map((childType) => createBlockItem(childType)),
    styles,
  }

  // Add post settings for post sections
  if (type === 'post') {
    block.postSettings = getDefaultPostSectionSettings()
  }

  // Add link settings for link sections
  if (type === 'link') {
    block.linkSettings = getDefaultLinkSectionSettings()
  }

  // Add product settings for product sections
  if (type === 'product') {
    block.productSettings = getDefaultProductSectionSettings()
  }

  // Add form settings for form sections
  if (type === 'form') {
    block.formSettings = getDefaultFormSectionSettings()
  }

  // Add header settings for header sections
  if (type === 'header') {
    block.headerSettings = getDefaultHeaderSectionSettings()
  }

  // Add footer settings for footer sections
  if (type === 'footer') {
    block.footerSettings = getDefaultFooterSectionSettings()
  }

  return block
}

// Block item type labels
export const blockItemLabels: Record<BlockItemType, string> = {
  heading: 'Heading',
  subheading: 'Subheading',
  text: 'Text',
  button: 'Button',
  image: 'Image',
  video: 'Video',
  accordion: 'Accordion',
}

// Section block type labels
export const sectionBlockLabels: Record<SectionBlockType, string> = {
  header: 'Header',
  footer: 'Footer',
  hero: 'Hero',
  text: 'Text',
  'text-image': 'Text + Image',
  'text-video': 'Text + Video',
  video: 'Video',
  image: 'Image',
  link: 'Links',
  post: 'Posts',
  product: 'Products',
  form: 'Form',
}

// Section block type icons (Lineicons classes)
export const sectionBlockIcons: Record<SectionBlockType, string> = {
  header: 'lni-navigation-up',
  footer: 'lni-navigation-down',
  hero: 'lni-star-fat',
  text: 'lni-text-format',
  'text-image': 'lni-layout-9',
  'text-video': 'lni-layout-9',
  video: 'lni-play',
  image: 'lni-photos',
  link: 'lni-link-2-angular-right',
  post: 'lni-text-format',
  product: 'lni-cart-1',
  form: 'lni-clipboard-data',
}

// Block item type icons (Lineicons classes)
export const blockItemIcons: Record<BlockItemType, string> = {
  heading: 'lni-text-format',
  subheading: 'lni-text-format',
  text: 'lni-text-paragraph',
  button: 'lni-pointer-1',
  image: 'lni-photos',
  video: 'lni-play',
  accordion: 'lni-chevron-down',
}

// Allowed children for each section block type
export const allowedChildrenBySection: Record<SectionBlockType, BlockItemType[]> = {
  header: [], // Header uses headerSettings
  footer: [], // Footer uses footerSettings
  hero: ['heading', 'image'],
  text: ['heading', 'subheading', 'text', 'button'],
  'text-image': ['image', 'heading', 'subheading', 'text', 'button'],
  'text-video': ['video', 'heading', 'subheading', 'text', 'button'],
  video: ['video'],
  image: ['image'],
  link: [], // Link section doesn't have block item children, uses linkSettings instead
  post: [], // Post section doesn't have block item children
  product: [], // Product section doesn't have block item children, uses productSettings instead
  form: [], // Form section uses formSettings instead
}

// Get allowed children for a section block type
export function getAllowedChildren(sectionType: SectionBlockType): BlockItemType[] {
  return allowedChildrenBySection[sectionType]
}

// Style option labels for UI
export const alignmentOptions = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
] as const

export const orientationOptions = [
  { value: 'vertical', label: 'Vertical' },
  { value: 'horizontal', label: 'Horizontal' },
] as const

export const aspectRatioOptions = [
  { value: 'auto', label: 'Auto' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
] as const

export const fontWeightOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'semibold', label: 'Semibold' },
  { value: 'bold', label: 'Bold' },
] as const

export const fontSizeOptions = [
  { value: 'xs', label: 'XS' },
  { value: 'sm', label: 'SM' },
  { value: 'base', label: 'Base' },
  { value: 'lg', label: 'LG' },
  { value: 'xl', label: 'XL' },
  { value: '2xl', label: '2XL' },
  { value: '3xl', label: '3XL' },
  { value: '4xl', label: '4XL' },
  { value: '5xl', label: '5XL' },
] as const

export const lineHeightOptions = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'loose', label: 'Loose' },
] as const

export const effectOptions = [
  { value: 'none', label: 'None' },
  { value: 'fade-in', label: 'Fade In' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'slide-down', label: 'Slide Down' },
  { value: 'scale-in', label: 'Scale In' },
] as const

export const postLayoutOptions = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'carousel', label: 'Carousel' },
] as const

export const linkLayoutOptions = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
] as const

export const productLayoutOptions = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
] as const

export const columnsOptions = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
] as const

// Spacing presets
export const spacingOptions = [
  { value: '0', label: '0' },
  { value: '4', label: '4' },
  { value: '8', label: '8' },
  { value: '12', label: '12' },
  { value: '16', label: '16' },
  { value: '24', label: '24' },
  { value: '32', label: '32' },
  { value: '48', label: '48' },
  { value: '64', label: '64' },
] as const

// Max width presets for page
export const maxWidthOptions = [
  { value: 'none', label: 'None' },
  { value: '640', label: 'SM (640px)' },
  { value: '768', label: 'MD (768px)' },
  { value: '1024', label: 'LG (1024px)' },
  { value: '1280', label: 'XL (1280px)' },
  { value: '1536', label: '2XL (1536px)' },
] as const

// Font family options
export const fontFamilyOptions = [
  { value: '', label: 'Default' },
  { value: 'sans', label: 'Sans-serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Monospace' },
] as const
