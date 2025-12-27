import type { StyleControl } from '@/components/editor/style-controls/types'

// Media aspect ratio options for Cards and Products
const cardMediaAspectOptions = [
  { value: 'paysage', label: '4:3 (Paysage)' },
  { value: 'square', label: '1:1 (Square)' },
  { value: 'portrait', label: '3:4 (Portrait)' },
]

const productMediaAspectOptions = [
  { value: 'square', label: '1:1 (Square)' },
  { value: 'paysage', label: '4:3 (Paysage)' },
  { value: 'portrait', label: '3:4 (Portrait)' },
]

// ===========================================
// SECTION GENERAL STYLE CONFIG
// ===========================================

export const sectionStyleConfig = {
  spacing: {
    icon: 'content-spacing',
    title: 'Spacing',
    controls: [
      { type: 'slider', key: 'spaceBetween', label: 'Space Between', min: 0, max: 96, unit: 'px' },
      { type: 'slider', key: 'spacingY', label: 'Spacing Y', min: 0, max: 128, unit: 'px' },
      { type: 'slider', key: 'spacingX', label: 'Spacing X', min: 0, max: 128, unit: 'px' },
    ] as StyleControl[],
    defaults: { spaceBetween: 32, spacingY: 64, spacingX: 32 },
  },
  background: {
    icon: 'content-background',
    title: 'Background',
    controls: [
      { type: 'color', key: 'backgroundColor', label: 'Background Color' },
    ] as StyleControl[],
    defaults: { backgroundColor: '' },
  },
}

// Carousel/Slider config for Cards, Products, Gallery
export const carouselStyleConfig = {
  slider: {
    icon: 'style-column',
    title: 'Slider',
    controls: [
      { type: 'slider', key: 'slidesPerView', label: 'Slides In View', min: 1, max: 6, step: 0.5 },
      { type: 'toggle', key: 'autoplay', label: 'Autoplay' },
      { type: 'toggle', key: 'showArrows', label: 'Show Arrows' },
    ] as StyleControl[],
    defaults: { slidesPerView: 3, autoplay: false, showArrows: true },
  },
}

// Products Carousel config (uses select instead of slider for slidesPerView)
export const productsCarouselStyleConfig = {
  slider: {
    icon: 'style-column',
    title: 'Slider',
    controls: [
      { type: 'select', key: 'slidesPerView', label: 'Slides In View', options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' }
      ] },
      { type: 'toggle', key: 'autoplay', label: 'Autoplay' },
      { type: 'toggle', key: 'showArrows', label: 'Show Arrows' },
    ] as StyleControl[],
    defaults: { slidesPerView: '1', autoplay: false, showArrows: true },
  },
}

// Gallery Carousel config (supports decimal slidesPerView values)
export const galleryCarouselStyleConfig = {
  slider: {
    icon: 'style-column',
    title: 'Slider',
    controls: [
      { type: 'select', key: 'slidesPerView', label: 'Slides In View', options: [
        { value: '1', label: '1' },
        { value: '1.5', label: '1.5' },
        { value: '2', label: '2' },
        { value: '2.5', label: '2.5' },
        { value: '3', label: '3' },
        { value: '3.5', label: '3.5' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' }
      ] },
      { type: 'toggle', key: 'autoplay', label: 'Autoplay' },
      { type: 'toggle', key: 'showArrows', label: 'Show Arrows' },
    ] as StyleControl[],
    defaults: { slidesPerView: '3', autoplay: false, showArrows: true },
  },
}

// Hero Overlay specific configs (section level)
export const heroOverlayStyleConfig = {
  height: {
    icon: 'style-size',
    title: 'Size',
    controls: [
      { type: 'select', key: 'overlayHeight', label: 'Height', options: [{ value: 'full', label: 'Full Screen' }, { value: 'half', label: 'Half Screen' }] },
    ] as StyleControl[],
    defaults: { overlayHeight: 'full' },
  },
  position: {
    icon: 'style-column',
    title: 'Position',
    controls: [
      { type: 'select', key: 'overlayPositionX', label: 'Position X', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }] },
      { type: 'select', key: 'overlayPositionY', label: 'Position Y', options: [{ value: 'top', label: 'Top' }, { value: 'middle', label: 'Middle' }, { value: 'bottom', label: 'Bottom' }] },
    ] as StyleControl[],
    defaults: { overlayPositionX: 'center', overlayPositionY: 'middle' },
  },
}

// Hero Overlay specific configs (media level)
export const heroOverlayMediaStyleConfig = {
  overlay: {
    icon: 'content-background',
    title: 'Overlay',
    controls: [
      { type: 'color', key: 'overlayColor', label: 'Overlay Color' },
      { type: 'slider', key: 'overlayOpacity', label: 'Overlay Opacity', min: 0, max: 100, step: 5 },
      { type: 'slider', key: 'overlayBlur', label: 'Overlay Blur', min: 0, max: 32, step: 2, unit: 'px' },
    ] as StyleControl[],
    defaults: { overlayColor: '#000000', overlayOpacity: 50, overlayBlur: 0 },
  },
}

// ===========================================
// TEXT FIELD STYLE CONFIG
// ===========================================

export const textFieldStyleConfig = {
  font: {
    icon: 'content-heading',
    title: 'Font',
    controls: [
      { type: 'slider', key: 'fontSize', label: 'Font Size', min: 8, max: 120, unit: 'px' },
      { type: 'slider', key: 'lineHeight', label: 'Line Height', min: 0.8, max: 3, step: 0.1 },
      { type: 'color', key: 'color', label: 'Color' },
    ] as StyleControl[],
    defaults: { fontSize: 16, lineHeight: 1.5, color: '' },
  },
  spacing: {
    icon: 'content-spacing',
    title: 'Spacing',
    controls: [
      { type: 'slider', key: 'spacingY', label: 'Spacing Y', min: 0, max: 64, unit: 'px' },
      { type: 'slider', key: 'spacingX', label: 'Spacing X', min: 0, max: 64, unit: 'px' },
    ] as StyleControl[],
    defaults: { spacingY: 0, spacingX: 0 },
  },
}

// Button-specific field style config
export const buttonFieldStyleConfig = {
  background: {
    icon: 'content-background',
    title: 'Background',
    controls: [
      { type: 'color', key: 'backgroundColor', label: 'Background Color' },
    ] as StyleControl[],
    defaults: { backgroundColor: '' },
  },
  borders: {
    icon: 'content-borders',
    title: 'Borders',
    controls: [
      { type: 'slider', key: 'borderWidth', label: 'Border Width', min: 0, max: 8, unit: 'px' },
      { type: 'color', key: 'borderColor', label: 'Border Color' },
      { type: 'slider', key: 'borderRadius', label: 'Rounded', min: 0, max: 48, unit: 'px' },
    ] as StyleControl[],
    defaults: { borderWidth: 0, borderColor: '', borderRadius: 8 },
  },
}

// ===========================================
// MEDIA FIELD STYLE CONFIG
// ===========================================

// Hero Stacked media field
export const heroStackedMediaStyleConfig = {
  size: {
    icon: 'style-size',
    title: 'Size',
    controls: [
      { type: 'select', key: 'aspectRatio', label: 'Aspect Ratio', options: [
        { value: '16 / 9', label: '16:9' },
        { value: '4 / 3', label: '4:3' },
        { value: '3 / 4', label: '3:4' },
        { value: '1 / 1', label: '1:1' },
        { value: '21 / 9', label: '21:9' }
      ] },
    ] as StyleControl[],
    defaults: { aspectRatio: '16 / 9' },
  },
  borders: {
    icon: 'content-borders',
    title: 'Borders',
    controls: [
      { type: 'slider', key: 'borderWidth', label: 'Border Width', min: 0, max: 8, unit: 'px' },
      { type: 'color', key: 'borderColor', label: 'Border Color' },
      { type: 'slider', key: 'borderRadius', label: 'Rounded', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { borderWidth: 0, borderColor: '', borderRadius: 8 },
  },
}

// General media field (with spacing)
export const mediaFieldStyleConfig = {
  spacing: {
    icon: 'content-spacing',
    title: 'Spacing',
    controls: [
      { type: 'slider', key: 'spacingY', label: 'Spacing Y', min: 0, max: 64, unit: 'px' },
      { type: 'slider', key: 'spacingX', label: 'Spacing X', min: 0, max: 64, unit: 'px' },
    ] as StyleControl[],
    defaults: { spacingY: 0, spacingX: 0 },
  },
  borders: {
    icon: 'content-borders',
    title: 'Borders',
    controls: [
      { type: 'slider', key: 'borderWidth', label: 'Border Width', min: 0, max: 8, unit: 'px' },
      { type: 'color', key: 'borderColor', label: 'Border Color' },
      { type: 'slider', key: 'borderRadius', label: 'Rounded', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { borderWidth: 0, borderColor: '', borderRadius: 8 },
  },
}

// Image field (for header logo, etc.)
export const imageFieldStyleConfig = {
  size: {
    icon: 'style-size',
    title: 'Size',
    controls: [
      { type: 'slider', key: 'width', label: 'Width', min: 24, max: 300, unit: 'px' },
    ] as StyleControl[],
    defaults: { width: 120 },
  },
  spacing: {
    icon: 'content-spacing',
    title: 'Spacing',
    controls: [
      { type: 'slider', key: 'spacingY', label: 'Spacing Y', min: 0, max: 64, unit: 'px' },
      { type: 'slider', key: 'spacingX', label: 'Spacing X', min: 0, max: 64, unit: 'px' },
    ] as StyleControl[],
    defaults: { spacingY: 0, spacingX: 0 },
  },
}

// ===========================================
// HEADER SECTION CONFIG
// ===========================================

export const headerStyleConfig = {
  position: {
    icon: 'style-column',
    title: 'Position',
    controls: [
      { type: 'toggle', key: 'sticky', label: 'Sticky Header' },
    ] as StyleControl[],
    defaults: { sticky: true },
  },
}

// ===========================================
// CARDS SECTION CONFIG
// ===========================================

export const cardsStyleConfig = {
  spacing: {
    icon: 'content-spacing',
    title: 'Spacing',
    controls: [
      { type: 'slider', key: 'spaceBetween', label: 'Space between', min: 0, max: 64, unit: 'px' },
      { type: 'slider', key: 'cardPaddingX', label: 'Padding X', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'cardPaddingY', label: 'Padding Y', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'cardInnerSpaceBetween', label: 'Space between', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { spaceBetween: 16, cardPaddingX: 16, cardPaddingY: 16, cardInnerSpaceBetween: 8 },
  },
  borders: {
    icon: 'content-borders',
    title: 'Borders',
    controls: [
      { type: 'slider', key: 'cardBorderWidth', label: 'Border Width', min: 0, max: 8, unit: 'px' },
      { type: 'color', key: 'cardBorderColor', label: 'Border Color' },
      { type: 'slider', key: 'cardRadius', label: 'Rounded', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { cardBorderWidth: 0, cardBorderColor: '', cardRadius: 8 },
  },
  background: {
    icon: 'content-background',
    title: 'Background',
    controls: [
      { type: 'color', key: 'cardBackgroundColor', label: 'Background Color' },
    ] as StyleControl[],
    defaults: { cardBackgroundColor: '' },
  },
  media: {
    icon: 'content-image',
    title: 'Media',
    controls: [
      { type: 'select', key: 'cardMediaAspect', label: 'Aspect Ratio', options: cardMediaAspectOptions },
      { type: 'slider', key: 'cardMediaRadius', label: 'Radius', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { cardMediaAspect: 'paysage', cardMediaRadius: 0 },
  },
  headline: {
    icon: 'content-heading',
    title: 'Headline',
    controls: [
      { type: 'slider', key: 'cardHeadlineFontSize', label: 'Font Size', min: 12, max: 48, unit: 'px' },
      { type: 'color', key: 'cardHeadlineTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { cardHeadlineFontSize: 20, cardHeadlineTextColor: '' },
  },
  subheadline: {
    icon: 'content-heading',
    title: 'Subheadline',
    controls: [
      { type: 'slider', key: 'cardSubheadlineFontSize', label: 'Font Size', min: 10, max: 32, unit: 'px' },
      { type: 'color', key: 'cardSubheadlineTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { cardSubheadlineFontSize: 14, cardSubheadlineTextColor: '' },
  },
  paragraph: {
    icon: 'content-text',
    title: 'Paragraph',
    controls: [
      { type: 'slider', key: 'cardParagraphFontSize', label: 'Font Size', min: 10, max: 24, unit: 'px' },
      { type: 'color', key: 'cardParagraphTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { cardParagraphFontSize: 16, cardParagraphTextColor: '' },
  },
  button: {
    icon: 'content-link',
    title: 'Button',
    controls: [
      { type: 'slider', key: 'cardButtonFontSize', label: 'Font Size', min: 10, max: 24, unit: 'px' },
      { type: 'color', key: 'cardButtonTextColor', label: 'Text Color' },
      { type: 'color', key: 'cardButtonBackgroundColor', label: 'Background Color' },
      { type: 'slider', key: 'cardButtonPaddingX', label: 'Padding X', min: 4, max: 48, unit: 'px' },
      { type: 'slider', key: 'cardButtonPaddingY', label: 'Padding Y', min: 2, max: 24, unit: 'px' },
      { type: 'slider', key: 'cardButtonRadius', label: 'Radius', min: 0, max: 24, unit: 'px' },
    ] as StyleControl[],
    defaults: { cardButtonFontSize: 14, cardButtonTextColor: '', cardButtonBackgroundColor: '', cardButtonPaddingX: 16, cardButtonPaddingY: 8, cardButtonRadius: 8 },
  },
}

// ===========================================
// PRODUCTS SECTION CONFIG (mirrors Cards but uses 'product' prefix)
// ===========================================

export const productsStyleConfig = {
  spacing: {
    icon: 'content-spacing',
    title: 'Spacing',
    controls: [
      { type: 'slider', key: 'spaceBetween', label: 'Space between', min: 0, max: 64, unit: 'px' },
      { type: 'slider', key: 'productPaddingX', label: 'Padding X', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'productPaddingY', label: 'Padding Y', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'productInnerSpaceBetween', label: 'Space between', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { spaceBetween: 16, productPaddingX: 16, productPaddingY: 16, productInnerSpaceBetween: 8 },
  },
  borders: {
    icon: 'content-borders',
    title: 'Borders',
    controls: [
      { type: 'slider', key: 'productBorderWidth', label: 'Border Width', min: 0, max: 8, unit: 'px' },
      { type: 'color', key: 'productBorderColor', label: 'Border Color' },
      { type: 'slider', key: 'productRadius', label: 'Rounded', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { productBorderWidth: 0, productBorderColor: '', productRadius: 8 },
  },
  background: {
    icon: 'content-background',
    title: 'Background',
    controls: [
      { type: 'color', key: 'productBackgroundColor', label: 'Background Color' },
    ] as StyleControl[],
    defaults: { productBackgroundColor: '' },
  },
  media: {
    icon: 'content-image',
    title: 'Media',
    controls: [
      { type: 'select', key: 'productMediaAspect', label: 'Aspect Ratio', options: productMediaAspectOptions },
      { type: 'slider', key: 'productMediaRadius', label: 'Radius', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { productMediaAspect: 'square', productMediaRadius: 0 },
  },
  headline: {
    icon: 'content-heading',
    title: 'Headline',
    controls: [
      { type: 'slider', key: 'productHeadlineFontSize', label: 'Font Size', min: 12, max: 48, unit: 'px' },
      { type: 'color', key: 'productHeadlineTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { productHeadlineFontSize: 20, productHeadlineTextColor: '' },
  },
  subheadline: {
    icon: 'content-heading',
    title: 'Subheadline',
    controls: [
      { type: 'slider', key: 'productSubheadlineFontSize', label: 'Font Size', min: 10, max: 32, unit: 'px' },
      { type: 'color', key: 'productSubheadlineTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { productSubheadlineFontSize: 14, productSubheadlineTextColor: '' },
  },
  paragraph: {
    icon: 'content-text',
    title: 'Paragraph',
    controls: [
      { type: 'slider', key: 'productParagraphFontSize', label: 'Font Size', min: 10, max: 24, unit: 'px' },
      { type: 'color', key: 'productParagraphTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { productParagraphFontSize: 16, productParagraphTextColor: '' },
  },
  button: {
    icon: 'content-link',
    title: 'Button',
    controls: [
      { type: 'slider', key: 'productButtonFontSize', label: 'Font Size', min: 10, max: 24, unit: 'px' },
      { type: 'color', key: 'productButtonTextColor', label: 'Text Color' },
      { type: 'color', key: 'productButtonBackgroundColor', label: 'Background Color' },
      { type: 'slider', key: 'productButtonPaddingX', label: 'Padding X', min: 4, max: 48, unit: 'px' },
      { type: 'slider', key: 'productButtonPaddingY', label: 'Padding Y', min: 2, max: 24, unit: 'px' },
      { type: 'slider', key: 'productButtonRadius', label: 'Radius', min: 0, max: 24, unit: 'px' },
    ] as StyleControl[],
    defaults: { productButtonFontSize: 14, productButtonTextColor: '', productButtonBackgroundColor: '', productButtonPaddingX: 16, productButtonPaddingY: 8, productButtonRadius: 8 },
  },
}

// ===========================================
// ACCORDION SECTION CONFIG
// ===========================================

export const accordionStyleConfig = {
  spacing: {
    icon: 'content-spacing',
    title: 'Spacing',
    controls: [
      { type: 'slider', key: 'spaceBetween', label: 'Space between', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'accordionPaddingX', label: 'Padding X', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'accordionPaddingY', label: 'Padding Y', min: 0, max: 48, unit: 'px' },
    ] as StyleControl[],
    defaults: { spaceBetween: 12, accordionPaddingX: 16, accordionPaddingY: 16 },
  },
  borders: {
    icon: 'content-borders',
    title: 'Borders',
    controls: [
      { type: 'slider', key: 'accordionBorderWidth', label: 'Border Width', min: 0, max: 8, unit: 'px' },
      { type: 'color', key: 'accordionBorderColor', label: 'Border Color' },
      { type: 'slider', key: 'accordionRadius', label: 'Rounded', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { accordionBorderWidth: 1, accordionBorderColor: '', accordionRadius: 8 },
  },
  background: {
    icon: 'content-background',
    title: 'Background',
    controls: [
      { type: 'color', key: 'accordionBackgroundColor', label: 'Background Color' },
    ] as StyleControl[],
    defaults: { accordionBackgroundColor: '' },
  },
  headline: {
    icon: 'content-heading',
    title: 'Headline',
    controls: [
      { type: 'slider', key: 'accordionHeadlineFontSize', label: 'Font Size', min: 12, max: 36, unit: 'px' },
      { type: 'color', key: 'accordionHeadlineTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { accordionHeadlineFontSize: 18, accordionHeadlineTextColor: '' },
  },
  paragraph: {
    icon: 'content-text',
    title: 'Paragraph',
    controls: [
      { type: 'slider', key: 'accordionContentFontSize', label: 'Font Size', min: 12, max: 24, unit: 'px' },
      { type: 'color', key: 'accordionContentTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { accordionContentFontSize: 16, accordionContentTextColor: '' },
  },
}

// ===========================================
// LINKS SECTION CONFIG
// ===========================================

export const linksStyleConfig = {
  spacing: {
    icon: 'content-spacing',
    title: 'Spacing',
    controls: [
      { type: 'slider', key: 'spaceBetween', label: 'Space between', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'linkPaddingX', label: 'Padding X', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'linkPaddingY', label: 'Padding Y', min: 0, max: 48, unit: 'px' },
    ] as StyleControl[],
    defaults: { spaceBetween: 12, linkPaddingX: 16, linkPaddingY: 16 },
  },
  borders: {
    icon: 'content-borders',
    title: 'Borders',
    controls: [
      { type: 'slider', key: 'linkBorderWidth', label: 'Border Width', min: 0, max: 8, unit: 'px' },
      { type: 'color', key: 'linkBorderColor', label: 'Border Color' },
      { type: 'slider', key: 'linkRadius', label: 'Rounded', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { linkBorderWidth: 1, linkBorderColor: '', linkRadius: 8 },
  },
  background: {
    icon: 'content-background',
    title: 'Background',
    controls: [
      { type: 'color', key: 'linkBackgroundColor', label: 'Background Color' },
    ] as StyleControl[],
    defaults: { linkBackgroundColor: '' },
  },
  headline: {
    icon: 'content-heading',
    title: 'Headline',
    controls: [
      { type: 'slider', key: 'linkLabelFontSize', label: 'Font Size', min: 12, max: 36, unit: 'px' },
      { type: 'color', key: 'linkLabelTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { linkLabelFontSize: 18, linkLabelTextColor: '' },
  },
  paragraph: {
    icon: 'content-text',
    title: 'Paragraph',
    controls: [
      { type: 'slider', key: 'linkDescriptionFontSize', label: 'Font Size', min: 10, max: 20, unit: 'px' },
      { type: 'color', key: 'linkDescriptionTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { linkDescriptionFontSize: 14, linkDescriptionTextColor: '' },
  },
}

// ===========================================
// CONTACT FORM FIELDS CONFIG
// ===========================================

export const contactFormFieldsStyleConfig = {
  spacing: {
    icon: 'content-spacing',
    title: 'Spacing',
    controls: [
      { type: 'slider', key: 'spaceBetween', label: 'Space between', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'formInputPaddingX', label: 'Padding X', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'formInputPaddingY', label: 'Padding Y', min: 0, max: 48, unit: 'px' },
    ] as StyleControl[],
    defaults: { spaceBetween: 12, formInputPaddingX: 16, formInputPaddingY: 12 },
  },
  borders: {
    icon: 'content-borders',
    title: 'Borders',
    controls: [
      { type: 'slider', key: 'formInputBorderWidth', label: 'Border Width', min: 0, max: 8, unit: 'px' },
      { type: 'color', key: 'formInputBorderColor', label: 'Border Color' },
      { type: 'slider', key: 'formInputRadius', label: 'Rounded', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { formInputBorderWidth: 1, formInputBorderColor: '', formInputRadius: 8 },
  },
  background: {
    icon: 'content-background',
    title: 'Background',
    controls: [
      { type: 'color', key: 'formInputBackgroundColor', label: 'Background Color' },
    ] as StyleControl[],
    defaults: { formInputBackgroundColor: '' },
  },
  typography: {
    icon: 'content-text',
    title: 'Typography',
    controls: [
      { type: 'slider', key: 'formInputFontSize', label: 'Font Size', min: 12, max: 24, unit: 'px' },
      { type: 'color', key: 'formInputTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { formInputFontSize: 16, formInputTextColor: '' },
  },
}

// ===========================================
// CONTACT SOCIAL LINKS CONFIG
// ===========================================

export const contactSocialLinksStyleConfig = {
  spacing: {
    icon: 'content-spacing',
    title: 'Spacing',
    controls: [
      { type: 'slider', key: 'spaceBetween', label: 'Space between', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'linkPaddingX', label: 'Padding X', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'linkPaddingY', label: 'Padding Y', min: 0, max: 48, unit: 'px' },
    ] as StyleControl[],
    defaults: { spaceBetween: 12, linkPaddingX: 16, linkPaddingY: 16 },
  },
  borders: {
    icon: 'content-borders',
    title: 'Borders',
    controls: [
      { type: 'slider', key: 'linkBorderWidth', label: 'Border Width', min: 0, max: 8, unit: 'px' },
      { type: 'color', key: 'linkBorderColor', label: 'Border Color' },
      { type: 'slider', key: 'linkRadius', label: 'Rounded', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { linkBorderWidth: 1, linkBorderColor: '', linkRadius: 8 },
  },
  background: {
    icon: 'content-background',
    title: 'Background',
    controls: [
      { type: 'color', key: 'linkBackgroundColor', label: 'Background Color' },
    ] as StyleControl[],
    defaults: { linkBackgroundColor: '' },
  },
  label: {
    icon: 'content-text',
    title: 'Label',
    controls: [
      { type: 'slider', key: 'linkLabelFontSize', label: 'Font Size', min: 12, max: 24, unit: 'px' },
      { type: 'color', key: 'linkLabelTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { linkLabelFontSize: 16, linkLabelTextColor: '' },
  },
  description: {
    icon: 'content-text',
    title: 'Description',
    controls: [
      { type: 'slider', key: 'linkDescriptionFontSize', label: 'Font Size', min: 10, max: 20, unit: 'px' },
      { type: 'color', key: 'linkDescriptionTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { linkDescriptionFontSize: 14, linkDescriptionTextColor: '' },
  },
}
