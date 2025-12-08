import type {
  SectionBlock,
  SectionBlockType,
  BlockCategory,
  PageSettings,
  SpacingYX,
  FreeformChildBlockType,
  // Shared types
  SocialPlatform,
  // Settings types
  HeaderSettings,
  HeaderNavLink,
  FooterSettings,
  FooterLink,
  FooterSocialLink,
  ContainerSettings,
  GridSettings,
  StackSettings,
  DividerSettings,
  HeadingSettings,
  TextSettings,
  ImageSettings,
  VideoSettings,
  ButtonSettings,
  IconSettings,
  FormSettings,
  FormInputSettings,
  FormTextareaSettings,
  FormSelectSettings,
  FormRadioSettings,
  FormCheckboxSettings,
  FormButtonSettings,
  FreeformSettings,
  // Style types
  HeaderStyles,
  FooterStyles,
  ContainerStyles,
  GridStyles,
  StackStyles,
  DividerStyles,
  HeadingStyles,
  TextStyles,
  ImageStyles,
  VideoStyles,
  ButtonStyles,
  IconStyles,
  FormStyles,
  FormInputStyles,
  FormTextareaStyles,
  FormSelectStyles,
  FormRadioStyles,
  FormCheckboxStyles,
  FormButtonStyles,
  FreeformStyles,
} from '@/types/editor'

// ============================================
// ID GENERATION
// ============================================

export function generateId(): string {
  return crypto.randomUUID()
}

// ============================================
// BLOCK LABELS & ICONS
// ============================================

export const sectionBlockLabels: Record<SectionBlockType, string> = {
  // Special
  header: 'Header',
  footer: 'Footer',
  // Layout
  container: 'Container',
  grid: 'Grid',
  stack: 'Stack',
  freeform: 'Freeform',
  // Content
  heading: 'Heading',
  text: 'Text',
  image: 'Image',
  video: 'Video',
  button: 'Button',
  icon: 'Icon',
  divider: 'Divider',
  form: 'Form',
  // Form field blocks (children of form)
  'form-input': 'Input',
  'form-textarea': 'Textarea',
  'form-select': 'Dropdown',
  'form-radio': 'Radio Select',
  'form-checkbox': 'Checkbox',
  'form-button': 'Submit Button',
}

export const sectionBlockIcons: Record<SectionBlockType, string> = {
  // Special
  header: 'lni-arrow-upward',
  footer: 'lni-arrow-downward',
  // Layout
  container: 'lni-layout-26',
  grid: 'lni-layout-9',
  stack: 'lni-layers-1',
  freeform: 'lni-move',
  // Content
  heading: 'lni-text-format',
  text: 'lni-text-paragraph',
  image: 'lni-photos',
  video: 'lni-play',
  button: 'lni-power-button',
  icon: 'lni-emoji-smile',
  divider: 'lni-minus',
  form: 'lni-clipboard',
  // Form field blocks
  'form-input': 'lni-keyboard',
  'form-textarea': 'lni-text-paragraph',
  'form-select': 'lni-chevron-down-circle',
  'form-radio': 'lni-radio-button',
  'form-checkbox': 'lni-checkmark-square',
  'form-button': 'lni-arrow-right-circle',
}

// Block categories for sidebar organization
export const blocksByCategory: Record<BlockCategory, SectionBlockType[]> = {
  layout: ['container', 'grid', 'stack', 'freeform'],
  content: ['heading', 'text', 'image', 'video', 'button', 'icon', 'divider', 'form'],
}

export const categoryLabels: Record<BlockCategory, string> = {
  layout: 'Layout',
  content: 'Content',
}

// Form field block types (for adding to form)
export const formFieldBlockTypes: SectionBlockType[] = [
  'form-input',
  'form-textarea',
  'form-select',
  'form-radio',
  'form-checkbox',
  'form-button',
]

// Labels for form field blocks in the add menu
export const formFieldBlockLabels: Record<string, string> = {
  'form-input': 'Input Field',
  'form-textarea': 'Textarea',
  'form-select': 'Dropdown Select',
  'form-radio': 'Radio Select',
  'form-checkbox': 'Checkbox',
  'form-button': 'Submit Button',
}

// Freeform child block types (blocks that can be placed in Freeform)
export const freeformChildBlockTypes: FreeformChildBlockType[] = [
  'heading',
  'text',
  'image',
  'video',
  'button',
]

// Labels for freeform child blocks in the add menu
export const freeformChildBlockLabels: Record<FreeformChildBlockType, string> = {
  'heading': 'Heading',
  'text': 'Text',
  'image': 'Image',
  'video': 'Video',
  'button': 'Button',
}

// ============================================
// PRESET TEMPLATES (Pre-built block compositions)
// ============================================

export type PresetType =
  | 'preset-link-list'
  | 'preset-product-list'
  | 'preset-card-list'
  | 'preset-feature-list'
  | 'preset-social-list'
  | 'preset-testimonials'
  | 'preset-faq-list'
  | 'preset-gallery'

export const presetLabels: Record<PresetType, string> = {
  'preset-link-list': 'Link List',
  'preset-product-list': 'Product List',
  'preset-card-list': 'Card List',
  'preset-feature-list': 'Feature List',
  'preset-social-list': 'Social List',
  'preset-testimonials': 'Testimonials',
  'preset-faq-list': 'FAQ List',
  'preset-gallery': 'Gallery',
}

export const presetIcons: Record<PresetType, string> = {
  'preset-link-list': 'lni-link-2-angular-right',
  'preset-product-list': 'lni-cart-2',
  'preset-card-list': 'lni-credit-card-multiple',
  'preset-feature-list': 'lni-check-square-2',
  'preset-social-list': 'lni-instagram',
  'preset-testimonials': 'lni-comment-1-text',
  'preset-faq-list': 'lni-chat-bubble-2',
  'preset-gallery': 'lni-gallery',
}

export const presetTypes: PresetType[] = [
  'preset-link-list',
  'preset-product-list',
  'preset-card-list',
  'preset-feature-list',
  'preset-social-list',
  'preset-testimonials',
  'preset-faq-list',
  'preset-gallery',
]

// Which blocks can contain children
export const layoutBlockTypes: SectionBlockType[] = ['container', 'grid', 'stack']

// Blocks that can have children (layout blocks + form + freeform)
export function canHaveChildren(type: SectionBlockType): boolean {
  return layoutBlockTypes.includes(type) || type === 'form' || type === 'freeform'
}

// Check if a block type is a form field (can only be child of form)
export function isFormFieldBlock(type: SectionBlockType): boolean {
  return formFieldBlockTypes.includes(type)
}

// Check if a block type is a freeform child (can only be child of freeform)
export function isFreeformChildBlock(type: SectionBlockType): boolean {
  return (freeformChildBlockTypes as SectionBlockType[]).includes(type)
}

// ============================================
// FORM INPUT TYPE OPTIONS
// ============================================

export const formInputTypeOptions = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'password', label: 'Password' },
  { value: 'url', label: 'URL' },
]


// ============================================
// SOCIAL PLATFORM UTILITIES
// ============================================

export const socialPlatformLabels: Record<SocialPlatform, string> = {
  twitter: 'Twitter / X',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  github: 'GitHub',
  discord: 'Discord',
  dribbble: 'Dribbble',
  behance: 'Behance',
  medium: 'Medium',
  threads: 'Threads',
}

export const socialPlatformIcons: Record<SocialPlatform, string> = {
  twitter: 'lni-x',
  instagram: 'lni-instagram',
  facebook: 'lni-facebook',
  linkedin: 'lni-linkedin',
  youtube: 'lni-youtube',
  tiktok: 'lni-tiktok',
  github: 'lni-github',
  discord: 'lni-discord',
  dribbble: 'lni-dribbble',
  behance: 'lni-behance',
  medium: 'lni-medium',
  threads: 'lni-x', // Threads uses X icon as fallback
}

// ============================================
// DEFAULT SETTINGS
// ============================================

export function getDefaultHeaderSettings(): HeaderSettings {
  return {
    logo: '',
    logoAlt: 'Logo',
    navLinks: [],
    ctaButton: { label: 'Get Started', url: '#', show: false },
    isHidden: true,
  }
}

export function getDefaultFooterSettings(): FooterSettings {
  return {
    links: [],
    copyrightText: '',
    socialLinks: [],
    isHidden: true,
  }
}

export function getDefaultContainerSettings(): ContainerSettings {
  return {}
}

export function getDefaultGridSettings(): GridSettings {
  return {
    columns: 3,
    gap: '16',
  }
}

export function getDefaultStackSettings(): StackSettings {
  return {
    gap: '16',
  }
}

export function getDefaultDividerSettings(): DividerSettings {
  return {
    style: 'line',
    thickness: '1',
    width: '100',
  }
}

export function getDefaultHeadingSettings(): HeadingSettings {
  return {
    content: 'Heading',
    level: 'h2',
  }
}

export function getDefaultTextSettings(): TextSettings {
  return {
    content: 'Enter your text here...',
  }
}

export function getDefaultImageSettings(): ImageSettings {
  return {
    src: '',
    alt: '',
  }
}

export function getDefaultVideoSettings(): VideoSettings {
  return {
    src: '',
    autoplay: false,
    loop: false,
    muted: true,
    controls: true,
  }
}

export function getDefaultButtonSettings(): ButtonSettings {
  return {
    label: 'Click me',
    url: '#',
    variant: 'primary',
    size: 'md',
  }
}

export function getDefaultIconSettings(): IconSettings {
  return {
    icon: 'lni-star-1',
    size: '24',
  }
}

export function getDefaultFormSettings(): FormSettings {
  return {
    successMessage: 'Thank you! Your submission has been received.',
    errorMessage: 'Something went wrong. Please try again.',
    gap: '16',
  }
}

// ============================================
// FREEFORM BLOCK DEFAULT SETTINGS
// ============================================

export function getDefaultFreeformSettings(): FreeformSettings {
  return {
    backgroundType: 'color',
    minHeight: '600px',
    childPositions: {
      desktop: {},
    },
  }
}

// ============================================
// FORM FIELD BLOCK DEFAULT SETTINGS
// ============================================

export function getDefaultFormInputSettings(): FormInputSettings {
  return {
    label: 'Label',
    name: 'field_' + generateId().slice(0, 6),
    inputType: 'text',
    placeholder: 'Enter text...',
    required: false,
    width: '100',
  }
}

export function getDefaultFormTextareaSettings(): FormTextareaSettings {
  return {
    label: 'Message',
    name: 'message_' + generateId().slice(0, 6),
    placeholder: 'Enter your message...',
    required: false,
    rows: 4,
    width: '100',
  }
}

export function getDefaultFormSelectSettings(): FormSelectSettings {
  return {
    label: 'Select',
    name: 'select_' + generateId().slice(0, 6),
    placeholder: 'Choose an option...',
    required: false,
    options: [
      { id: generateId(), label: 'Option 1', value: 'option_1' },
      { id: generateId(), label: 'Option 2', value: 'option_2' },
      { id: generateId(), label: 'Option 3', value: 'option_3' },
    ],
    width: '100',
  }
}

export function getDefaultFormRadioSettings(): FormRadioSettings {
  return {
    label: 'Select one',
    name: 'radio_' + generateId().slice(0, 6),
    required: false,
    options: [
      { id: generateId(), label: 'Option 1', value: 'option_1' },
      { id: generateId(), label: 'Option 2', value: 'option_2' },
    ],
    layout: 'vertical',
    width: '100',
  }
}

export function getDefaultFormCheckboxSettings(): FormCheckboxSettings {
  return {
    label: 'Select all that apply',
    name: 'checkbox_' + generateId().slice(0, 6),
    required: false,
    options: [
      { id: generateId(), label: 'Option 1', value: 'option_1' },
      { id: generateId(), label: 'Option 2', value: 'option_2' },
    ],
    layout: 'vertical',
    width: '100',
  }
}

export function getDefaultFormButtonSettings(): FormButtonSettings {
  return {
    label: 'Submit',
    variant: 'primary',
    size: 'md',
    fullWidth: false,
    alignment: 'left',
  }
}

// ============================================
// DEFAULT STYLES
// ============================================

export function getDefaultHeaderStyles(): HeaderStyles {
  return {
    padding: { top: '12', bottom: '12', left: '16', right: '16' },
    alignment: 'center',
  }
}

export function getDefaultFooterStyles(): FooterStyles {
  return {
    padding: { top: '24', bottom: '24', left: '16', right: '16' },
    alignment: 'center',
  }
}

export function getDefaultContainerStyles(): ContainerStyles {
  return {
    padding: { top: '16', bottom: '16', left: '16', right: '16' },
    alignment: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flexWrap: 'nowrap',
    gap: '16',
  }
}

export function getDefaultGridStyles(): GridStyles {
  return {
    padding: { top: '16', bottom: '16', left: '16', right: '16' },
    horizontalAlign: 'left',
    verticalAlign: 'top',
    justifyItems: 'stretch',
    alignItems: 'stretch',
  }
}

export function getDefaultStackStyles(): StackStyles {
  return {
    padding: { top: '16', bottom: '16', left: '16', right: '16' },
    alignment: 'center',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flexWrap: 'nowrap',
  }
}

export function getDefaultDividerStyles(): DividerStyles {
  return {
    margin: { top: '24', bottom: '24' },
    alignment: 'center',
  }
}

export function getDefaultHeadingStyles(): HeadingStyles {
  return {
    padding: { top: '8', bottom: '8' },
    fontSize: '4xl',
    fontWeight: 'bold',
    lineHeight: 'tight',
    alignment: 'left',
  }
}

export function getDefaultTextStyles(): TextStyles {
  return {
    padding: { top: '8', bottom: '8' },
    fontSize: 'base',
    lineHeight: 'relaxed',
    alignment: 'left',
  }
}

export function getDefaultImageStyles(): ImageStyles {
  return {
    objectFit: 'cover',
    borderRadius: '8',
  }
}

export function getDefaultVideoStyles(): VideoStyles {
  return {
    aspectRatio: '16:9',
    borderRadius: '8',
  }
}

export function getDefaultButtonStyles(): ButtonStyles {
  return {
    borderRadius: '8',
  }
}

export function getDefaultIconStyles(): IconStyles {
  return {}
}

export function getDefaultFormStyles(): FormStyles {
  return {
    padding: { top: '32', bottom: '32', left: '16', right: '16' },
    gap: '16',
  }
}

// ============================================
// FREEFORM BLOCK DEFAULT STYLES
// ============================================

export function getDefaultFreeformStyles(): FreeformStyles {
  return {
    padding: { top: '0', bottom: '0', left: '0', right: '0' },
  }
}

// ============================================
// FORM FIELD BLOCK DEFAULT STYLES
// ============================================

export function getDefaultFormInputStyles(): FormInputStyles {
  return {
    borderRadius: '8',
  }
}

export function getDefaultFormTextareaStyles(): FormTextareaStyles {
  return {
    borderRadius: '8',
  }
}

export function getDefaultFormSelectStyles(): FormSelectStyles {
  return {
    borderRadius: '8',
  }
}

export function getDefaultFormRadioStyles(): FormRadioStyles {
  return {}
}

export function getDefaultFormCheckboxStyles(): FormCheckboxStyles {
  return {}
}

export function getDefaultFormButtonStyles(): FormButtonStyles {
  return {
    borderRadius: '8',
  }
}

// ============================================
// BLOCK CREATION
// ============================================

// Lookup map for default settings - O(1) access instead of switch statement
const defaultSettingsMap: Record<SectionBlockType, () => SectionBlock['settings']> = {
  'header': getDefaultHeaderSettings,
  'footer': getDefaultFooterSettings,
  'container': getDefaultContainerSettings,
  'grid': getDefaultGridSettings,
  'stack': getDefaultStackSettings,
  'divider': getDefaultDividerSettings,
  'heading': getDefaultHeadingSettings,
  'text': getDefaultTextSettings,
  'image': getDefaultImageSettings,
  'video': getDefaultVideoSettings,
  'button': getDefaultButtonSettings,
  'icon': getDefaultIconSettings,
  'form': getDefaultFormSettings,
  // Freeform block
  'freeform': getDefaultFreeformSettings,
  // Form field blocks
  'form-input': getDefaultFormInputSettings,
  'form-textarea': getDefaultFormTextareaSettings,
  'form-select': getDefaultFormSelectSettings,
  'form-radio': getDefaultFormRadioSettings,
  'form-checkbox': getDefaultFormCheckboxSettings,
  'form-button': getDefaultFormButtonSettings,
}

// Lookup map for default styles - O(1) access instead of switch statement
const defaultStylesMap: Record<SectionBlockType, () => SectionBlock['styles']> = {
  'header': getDefaultHeaderStyles,
  'footer': getDefaultFooterStyles,
  'container': getDefaultContainerStyles,
  'grid': getDefaultGridStyles,
  'stack': getDefaultStackStyles,
  'divider': getDefaultDividerStyles,
  'heading': getDefaultHeadingStyles,
  'text': getDefaultTextStyles,
  'image': getDefaultImageStyles,
  'video': getDefaultVideoStyles,
  'button': getDefaultButtonStyles,
  'icon': getDefaultIconStyles,
  'form': getDefaultFormStyles,
  // Freeform block
  'freeform': getDefaultFreeformStyles,
  // Form field blocks
  'form-input': getDefaultFormInputStyles,
  'form-textarea': getDefaultFormTextareaStyles,
  'form-select': getDefaultFormSelectStyles,
  'form-radio': getDefaultFormRadioStyles,
  'form-checkbox': getDefaultFormCheckboxStyles,
  'form-button': getDefaultFormButtonStyles,
}

function getDefaultSettings(type: SectionBlockType): SectionBlock['settings'] {
  return defaultSettingsMap[type]()
}

function getDefaultStyles(type: SectionBlockType): SectionBlock['styles'] {
  return defaultStylesMap[type]()
}

export function createSectionBlock(type: SectionBlockType): SectionBlock {
  return {
    id: generateId(),
    type,
    name: sectionBlockLabels[type],
    children: canHaveChildren(type) ? [] : undefined,
    settings: getDefaultSettings(type),
    styles: getDefaultStyles(type),
  }
}

// ============================================
// PRESET FACTORY FUNCTIONS
// ============================================

// Helper to create a configured block with custom settings/styles
function createConfiguredBlock(
  type: SectionBlockType,
  name: string,
  settingsOverrides?: Partial<SectionBlock['settings']>,
  stylesOverrides?: Partial<SectionBlock['styles']>
): SectionBlock {
  const block = createSectionBlock(type)
  block.name = name
  if (settingsOverrides) {
    block.settings = { ...block.settings, ...settingsOverrides } as SectionBlock['settings']
  }
  if (stylesOverrides) {
    block.styles = { ...block.styles, ...stylesOverrides } as SectionBlock['styles']
  }
  return block
}

// Create a stack item with children
function createStackItem(name: string, children: SectionBlock[]): SectionBlock {
  const stack = createSectionBlock('stack')
  stack.name = name
  stack.children = children
  return stack
}

// Link List: Grid with Stack items containing Image, Heading, Text, Button
export function createLinkListPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Link List', { columns: 3 })
  grid.children = [
    createStackItem('Link 1', [
      createConfiguredBlock('image', 'Image', { src: '', alt: 'Link image' }),
      createConfiguredBlock('heading', 'Heading', { content: 'Link Title', level: 'h3' }),
      createConfiguredBlock('text', 'Text', { content: 'Description text goes here.' }),
      createConfiguredBlock('button', 'Button', { label: 'Learn More', url: '#' }),
    ]),
    createStackItem('Link 2', [
      createConfiguredBlock('image', 'Image', { src: '', alt: 'Link image' }),
      createConfiguredBlock('heading', 'Heading', { content: 'Link Title', level: 'h3' }),
      createConfiguredBlock('text', 'Text', { content: 'Description text goes here.' }),
      createConfiguredBlock('button', 'Button', { label: 'Learn More', url: '#' }),
    ]),
    createStackItem('Link 3', [
      createConfiguredBlock('image', 'Image', { src: '', alt: 'Link image' }),
      createConfiguredBlock('heading', 'Heading', { content: 'Link Title', level: 'h3' }),
      createConfiguredBlock('text', 'Text', { content: 'Description text goes here.' }),
      createConfiguredBlock('button', 'Button', { label: 'Learn More', url: '#' }),
    ]),
  ]
  return grid
}

// Product List: Grid with Stack items containing Image, Heading, Text, Button
export function createProductListPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Product List', { columns: 3 })
  grid.children = [
    createStackItem('Product 1', [
      createConfiguredBlock('image', 'Image', { src: '', alt: 'Product image' }),
      createConfiguredBlock('heading', 'Heading', { content: 'Product Name', level: 'h3' }),
      createConfiguredBlock('text', 'Text', { content: '$99.00' }),
      createConfiguredBlock('button', 'Button', { label: 'Buy Now', url: '#' }),
    ]),
    createStackItem('Product 2', [
      createConfiguredBlock('image', 'Image', { src: '', alt: 'Product image' }),
      createConfiguredBlock('heading', 'Heading', { content: 'Product Name', level: 'h3' }),
      createConfiguredBlock('text', 'Text', { content: '$99.00' }),
      createConfiguredBlock('button', 'Button', { label: 'Buy Now', url: '#' }),
    ]),
    createStackItem('Product 3', [
      createConfiguredBlock('image', 'Image', { src: '', alt: 'Product image' }),
      createConfiguredBlock('heading', 'Heading', { content: 'Product Name', level: 'h3' }),
      createConfiguredBlock('text', 'Text', { content: '$99.00' }),
      createConfiguredBlock('button', 'Button', { label: 'Buy Now', url: '#' }),
    ]),
  ]
  return grid
}

// Card List: Grid with Stack items containing Image, Heading, Subheading, Text, Button
export function createCardListPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Card List', { columns: 3 })
  grid.children = [
    createStackItem('Card 1', [
      createConfiguredBlock('image', 'Image', { src: '', alt: 'Card image' }),
      createConfiguredBlock('heading', 'Title', { content: 'Card Title', level: 'h3' }),
      createConfiguredBlock('heading', 'Subtitle', { content: 'Subtitle', level: 'h4' }),
      createConfiguredBlock('text', 'Text', { content: 'Card description goes here.' }),
      createConfiguredBlock('button', 'Button', { label: 'Read More', url: '#' }),
    ]),
    createStackItem('Card 2', [
      createConfiguredBlock('image', 'Image', { src: '', alt: 'Card image' }),
      createConfiguredBlock('heading', 'Title', { content: 'Card Title', level: 'h3' }),
      createConfiguredBlock('heading', 'Subtitle', { content: 'Subtitle', level: 'h4' }),
      createConfiguredBlock('text', 'Text', { content: 'Card description goes here.' }),
      createConfiguredBlock('button', 'Button', { label: 'Read More', url: '#' }),
    ]),
    createStackItem('Card 3', [
      createConfiguredBlock('image', 'Image', { src: '', alt: 'Card image' }),
      createConfiguredBlock('heading', 'Title', { content: 'Card Title', level: 'h3' }),
      createConfiguredBlock('heading', 'Subtitle', { content: 'Subtitle', level: 'h4' }),
      createConfiguredBlock('text', 'Text', { content: 'Card description goes here.' }),
      createConfiguredBlock('button', 'Button', { label: 'Read More', url: '#' }),
    ]),
  ]
  return grid
}

// Feature List: Grid with Stack items containing Icon, Heading, Subheading, Text, Button
export function createFeatureListPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Feature List', { columns: 3 })
  grid.children = [
    createStackItem('Feature 1', [
      createConfiguredBlock('icon', 'Icon', { icon: 'lni-star-1', size: '48' }),
      createConfiguredBlock('heading', 'Title', { content: 'Feature Title', level: 'h3' }),
      createConfiguredBlock('heading', 'Subtitle', { content: 'Subtitle', level: 'h4' }),
      createConfiguredBlock('text', 'Text', { content: 'Feature description goes here.' }),
      createConfiguredBlock('button', 'Button', { label: 'Learn More', url: '#' }),
    ]),
    createStackItem('Feature 2', [
      createConfiguredBlock('icon', 'Icon', { icon: 'lni-rocket-2', size: '48' }),
      createConfiguredBlock('heading', 'Title', { content: 'Feature Title', level: 'h3' }),
      createConfiguredBlock('heading', 'Subtitle', { content: 'Subtitle', level: 'h4' }),
      createConfiguredBlock('text', 'Text', { content: 'Feature description goes here.' }),
      createConfiguredBlock('button', 'Button', { label: 'Learn More', url: '#' }),
    ]),
    createStackItem('Feature 3', [
      createConfiguredBlock('icon', 'Icon', { icon: 'lni-heart-1', size: '48' }),
      createConfiguredBlock('heading', 'Title', { content: 'Feature Title', level: 'h3' }),
      createConfiguredBlock('heading', 'Subtitle', { content: 'Subtitle', level: 'h4' }),
      createConfiguredBlock('text', 'Text', { content: 'Feature description goes here.' }),
      createConfiguredBlock('button', 'Button', { label: 'Learn More', url: '#' }),
    ]),
  ]
  return grid
}

// Social List: Grid with Stack items containing Icon, Heading, Text, Button
export function createSocialListPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Social List', { columns: 4 })
  grid.children = [
    createStackItem('Twitter', [
      createConfiguredBlock('icon', 'Icon', { icon: 'lni-x', size: '32' }),
      createConfiguredBlock('heading', 'Heading', { content: '@username', level: 'h4' }),
      createConfiguredBlock('text', 'Text', { content: 'Follow us on X' }),
      createConfiguredBlock('button', 'Button', { label: 'Follow', url: '#' }),
    ]),
    createStackItem('Instagram', [
      createConfiguredBlock('icon', 'Icon', { icon: 'lni-instagram', size: '32' }),
      createConfiguredBlock('heading', 'Heading', { content: '@username', level: 'h4' }),
      createConfiguredBlock('text', 'Text', { content: 'Follow us on Instagram' }),
      createConfiguredBlock('button', 'Button', { label: 'Follow', url: '#' }),
    ]),
    createStackItem('LinkedIn', [
      createConfiguredBlock('icon', 'Icon', { icon: 'lni-linkedin', size: '32' }),
      createConfiguredBlock('heading', 'Heading', { content: 'Company Name', level: 'h4' }),
      createConfiguredBlock('text', 'Text', { content: 'Connect with us' }),
      createConfiguredBlock('button', 'Button', { label: 'Connect', url: '#' }),
    ]),
    createStackItem('YouTube', [
      createConfiguredBlock('icon', 'Icon', { icon: 'lni-youtube', size: '32' }),
      createConfiguredBlock('heading', 'Heading', { content: 'Channel Name', level: 'h4' }),
      createConfiguredBlock('text', 'Text', { content: 'Subscribe to our channel' }),
      createConfiguredBlock('button', 'Button', { label: 'Subscribe', url: '#' }),
    ]),
  ]
  return grid
}

// Testimonials: Grid with Stack items containing Image, Heading, Text, Button
export function createTestimonialsPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Testimonials', { columns: 3 })
  grid.children = [
    createStackItem('Testimonial 1', [
      createConfiguredBlock('image', 'Avatar', { src: '', alt: 'Customer photo' }),
      createConfiguredBlock('heading', 'Name', { content: 'John Doe', level: 'h4' }),
      createConfiguredBlock('text', 'Quote', { content: '"This product changed my life. Highly recommended!"' }),
      createConfiguredBlock('button', 'Button', { label: 'Read Story', url: '#' }),
    ]),
    createStackItem('Testimonial 2', [
      createConfiguredBlock('image', 'Avatar', { src: '', alt: 'Customer photo' }),
      createConfiguredBlock('heading', 'Name', { content: 'Jane Smith', level: 'h4' }),
      createConfiguredBlock('text', 'Quote', { content: '"Amazing experience from start to finish."' }),
      createConfiguredBlock('button', 'Button', { label: 'Read Story', url: '#' }),
    ]),
    createStackItem('Testimonial 3', [
      createConfiguredBlock('image', 'Avatar', { src: '', alt: 'Customer photo' }),
      createConfiguredBlock('heading', 'Name', { content: 'Mike Johnson', level: 'h4' }),
      createConfiguredBlock('text', 'Quote', { content: '"Best decision I ever made. Thank you!"' }),
      createConfiguredBlock('button', 'Button', { label: 'Read Story', url: '#' }),
    ]),
  ]
  return grid
}

// FAQ List: Grid with Stack items containing Heading, Text, Button
export function createFAQListPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'FAQ List', { columns: 1 })
  grid.children = [
    createStackItem('FAQ 1', [
      createConfiguredBlock('heading', 'Question', { content: 'What is your return policy?', level: 'h3' }),
      createConfiguredBlock('text', 'Answer', { content: 'We offer a 30-day money-back guarantee on all purchases.' }),
      createConfiguredBlock('button', 'Button', { label: 'Learn More', url: '#' }),
    ]),
    createStackItem('FAQ 2', [
      createConfiguredBlock('heading', 'Question', { content: 'How do I contact support?', level: 'h3' }),
      createConfiguredBlock('text', 'Answer', { content: 'You can reach our support team via email or live chat.' }),
      createConfiguredBlock('button', 'Button', { label: 'Contact Us', url: '#' }),
    ]),
    createStackItem('FAQ 3', [
      createConfiguredBlock('heading', 'Question', { content: 'Do you offer discounts?', level: 'h3' }),
      createConfiguredBlock('text', 'Answer', { content: 'Yes! Sign up for our newsletter to receive exclusive offers.' }),
      createConfiguredBlock('button', 'Button', { label: 'Subscribe', url: '#' }),
    ]),
  ]
  return grid
}

// Gallery: Grid with Image blocks
export function createGalleryPreset(): SectionBlock {
  const grid = createConfiguredBlock('grid', 'Gallery', { columns: 3 })
  grid.children = [
    createConfiguredBlock('image', 'Image 1', { src: '', alt: 'Gallery image 1' }),
    createConfiguredBlock('image', 'Image 2', { src: '', alt: 'Gallery image 2' }),
    createConfiguredBlock('image', 'Image 3', { src: '', alt: 'Gallery image 3' }),
    createConfiguredBlock('image', 'Image 4', { src: '', alt: 'Gallery image 4' }),
    createConfiguredBlock('image', 'Image 5', { src: '', alt: 'Gallery image 5' }),
    createConfiguredBlock('image', 'Image 6', { src: '', alt: 'Gallery image 6' }),
  ]
  return grid
}

// Factory function to create preset by type
export function createPresetBlock(presetType: PresetType): SectionBlock {
  switch (presetType) {
    case 'preset-link-list':
      return createLinkListPreset()
    case 'preset-product-list':
      return createProductListPreset()
    case 'preset-card-list':
      return createCardListPreset()
    case 'preset-feature-list':
      return createFeatureListPreset()
    case 'preset-social-list':
      return createSocialListPreset()
    case 'preset-testimonials':
      return createTestimonialsPreset()
    case 'preset-faq-list':
      return createFAQListPreset()
    case 'preset-gallery':
      return createGalleryPreset()
    default:
      throw new Error(`Unknown preset type: ${presetType}`)
  }
}

// ============================================
// BLOCK DUPLICATION
// ============================================

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function regenerateIds<T extends { id: string }>(items: T[]): T[] {
  return items.map(item => ({ ...item, id: generateId() }))
}

export function duplicateSectionBlock(block: SectionBlock): SectionBlock {
  const newBlock: SectionBlock = {
    ...deepClone(block),
    id: generateId(),
  }

  // Regenerate IDs for nested children
  if (newBlock.children) {
    newBlock.children = newBlock.children.map(child => duplicateSectionBlock(child))
  }

  // Regenerate IDs for items in settings
  const settings = newBlock.settings as Record<string, unknown>

  // Handle arrays with IDs in settings
  const arrayFields = ['navLinks', 'links', 'socialLinks', 'fields']

  for (const field of arrayFields) {
    if (Array.isArray(settings[field])) {
      settings[field] = regenerateIds(settings[field] as { id: string }[])
    }
  }

  return newBlock
}

// ============================================
// PAGE SETTINGS
// ============================================

export function getDefaultPageSettings(): PageSettings {
  return {
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    textColor: '#09090b',
    maxWidth: '1200px',
    padding: { y: '0', x: '16' },
    sectionGap: '0',
  }
}

// ============================================
// ITEM CREATORS
// ============================================

export function createHeaderNavLink(): HeaderNavLink {
  return { id: generateId(), label: 'Link', url: '#' }
}

export function createFooterLink(): FooterLink {
  return { id: generateId(), label: 'Link', url: '#' }
}

export function createFooterSocialLink(platform: SocialPlatform = 'twitter'): FooterSocialLink {
  return { id: generateId(), platform, url: '#' }
}

// ============================================
// STYLE OPTIONS
// ============================================

export const alignmentOptions = [
  { value: 'left', label: 'Left', icon: 'lni-align-text-left' },
  { value: 'center', label: 'Center', icon: 'lni-align-text-center' },
  { value: 'right', label: 'Right', icon: 'lni-align-text-right' },
] as const

export const verticalAlignmentOptions = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
] as const

// Flexbox options for layout blocks (with icons for segmented controls)
export const flexDirectionOptions = [
  { value: 'row', label: 'Row', icon: 'lni-arrow-right' },
  { value: 'column', label: 'Column', icon: 'lni-arrow-downward' },
  { value: 'row-reverse', label: 'Row Reverse', icon: 'lni-arrow-left' },
  { value: 'column-reverse', label: 'Column Reverse', icon: 'lni-arrow-upward' },
] as const

export const justifyContentOptions = [
  { value: 'flex-start', label: 'Start', icon: 'lni-shift-left' },
  { value: 'center', label: 'Center', icon: 'lni-align-text-center' },
  { value: 'flex-end', label: 'End', icon: 'lni-shift-right' },
  { value: 'space-between', label: 'Space Between', icon: 'lni-arrow-both-direction-horizontal-1' },
] as const

export const alignItemsOptions = [
  { value: 'flex-start', label: 'Start', icon: 'lni-arrow-upward' },
  { value: 'center', label: 'Center', icon: 'lni-minus' },
  { value: 'flex-end', label: 'End', icon: 'lni-arrow-downward' },
  { value: 'stretch', label: 'Stretch', icon: 'lni-arrow-both-direction-vertical-1' },
] as const

export const flexWrapOptions = [
  { value: 'nowrap', label: 'No Wrap', icon: 'lni-line' },
  { value: 'wrap', label: 'Wrap', icon: 'lni-enter' },
] as const

export const justifyItemsOptions = [
  { value: 'start', label: 'Start', icon: 'lni-shift-left' },
  { value: 'center', label: 'Center', icon: 'lni-align-text-center' },
  { value: 'end', label: 'End', icon: 'lni-shift-right' },
  { value: 'stretch', label: 'Stretch', icon: 'lni-arrow-both-direction-horizontal-1' },
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
  { value: '6xl', label: '6XL' },
] as const

export const fontWeightOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'semibold', label: 'Semibold' },
  { value: 'bold', label: 'Bold' },
] as const

export const lineHeightOptions = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'loose', label: 'Loose' },
] as const

export const aspectRatioOptions = [
  { value: 'auto', label: 'Auto' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
] as const

export const objectFitOptions = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
  { value: 'none', label: 'None' },
] as const

export const buttonVariantOptions = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'outline', label: 'Outline' },
] as const

export const buttonSizeOptions = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
] as const

export const headingLevelOptions = [
  { value: 'h1', label: 'H1' },
  { value: 'h2', label: 'H2' },
  { value: 'h3', label: 'H3' },
  { value: 'h4', label: 'H4' },
  { value: 'h5', label: 'H5' },
  { value: 'h6', label: 'H6' },
] as const

export const dividerStyleOptions = [
  { value: 'line', label: 'Line' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'space', label: 'Space' },
] as const

export const mediaPositionOptions = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
] as const

export const animationOptions = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'slide-down', label: 'Slide Down' },
  { value: 'slide-left', label: 'Slide Left' },
  { value: 'slide-right', label: 'Slide Right' },
  { value: 'zoom', label: 'Zoom' },
] as const

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

export const columnsOptions = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
] as const

export const maxWidthOptions = [
  { value: 'none', label: 'None' },
  { value: '640px', label: 'SM' },
  { value: '768px', label: 'MD' },
  { value: '1024px', label: 'LG' },
  { value: '1200px', label: 'XL' },
  { value: '1400px', label: '2XL' },
] as const

export const blockHeightOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'half', label: '50%' },
  { value: 'full', label: '100%' },
] as const
