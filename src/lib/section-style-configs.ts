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
// CARDS SECTION CONFIG
// ===========================================

export const cardsStyleConfig = {
  spacing: {
    icon: 'spacing-horizontal',
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
    icon: 'border-all',
    title: 'Borders',
    controls: [
      { type: 'slider', key: 'cardBorderWidth', label: 'Border Width', min: 0, max: 8, unit: 'px' },
      { type: 'color', key: 'cardBorderColor', label: 'Border Color' },
      { type: 'slider', key: 'cardRadius', label: 'Rounded', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { cardBorderWidth: 0, cardBorderColor: '', cardRadius: 8 },
  },
  background: {
    icon: 'palette',
    title: 'Background',
    controls: [
      { type: 'color', key: 'cardBackgroundColor', label: 'Background Color' },
    ] as StyleControl[],
    defaults: { cardBackgroundColor: '' },
  },
  media: {
    icon: 'image',
    title: 'Media',
    controls: [
      { type: 'select', key: 'cardMediaAspect', label: 'Aspect Ratio', options: cardMediaAspectOptions },
      { type: 'slider', key: 'cardMediaRadius', label: 'Radius', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { cardMediaAspect: 'paysage', cardMediaRadius: 0 },
  },
  headline: {
    icon: 'type-h1',
    title: 'Headline',
    controls: [
      { type: 'slider', key: 'cardHeadlineFontSize', label: 'Font Size', min: 12, max: 48, unit: 'px' },
      { type: 'color', key: 'cardHeadlineTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { cardHeadlineFontSize: 20, cardHeadlineTextColor: '' },
  },
  subheadline: {
    icon: 'type-h2',
    title: 'Subheadline',
    controls: [
      { type: 'slider', key: 'cardSubheadlineFontSize', label: 'Font Size', min: 10, max: 32, unit: 'px' },
      { type: 'color', key: 'cardSubheadlineTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { cardSubheadlineFontSize: 14, cardSubheadlineTextColor: '' },
  },
  paragraph: {
    icon: 'text-paragraph',
    title: 'Paragraph',
    controls: [
      { type: 'slider', key: 'cardParagraphFontSize', label: 'Font Size', min: 10, max: 24, unit: 'px' },
      { type: 'color', key: 'cardParagraphTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { cardParagraphFontSize: 16, cardParagraphTextColor: '' },
  },
  button: {
    icon: 'mouse-pointer-click',
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
    icon: 'spacing-horizontal',
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
    icon: 'border-all',
    title: 'Borders',
    controls: [
      { type: 'slider', key: 'productBorderWidth', label: 'Border Width', min: 0, max: 8, unit: 'px' },
      { type: 'color', key: 'productBorderColor', label: 'Border Color' },
      { type: 'slider', key: 'productRadius', label: 'Rounded', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { productBorderWidth: 0, productBorderColor: '', productRadius: 8 },
  },
  background: {
    icon: 'palette',
    title: 'Background',
    controls: [
      { type: 'color', key: 'productBackgroundColor', label: 'Background Color' },
    ] as StyleControl[],
    defaults: { productBackgroundColor: '' },
  },
  media: {
    icon: 'image',
    title: 'Media',
    controls: [
      { type: 'select', key: 'productMediaAspect', label: 'Aspect Ratio', options: productMediaAspectOptions },
      { type: 'slider', key: 'productMediaRadius', label: 'Radius', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { productMediaAspect: 'square', productMediaRadius: 0 },
  },
  headline: {
    icon: 'type-h1',
    title: 'Headline',
    controls: [
      { type: 'slider', key: 'productHeadlineFontSize', label: 'Font Size', min: 12, max: 48, unit: 'px' },
      { type: 'color', key: 'productHeadlineTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { productHeadlineFontSize: 20, productHeadlineTextColor: '' },
  },
  subheadline: {
    icon: 'type-h2',
    title: 'Subheadline',
    controls: [
      { type: 'slider', key: 'productSubheadlineFontSize', label: 'Font Size', min: 10, max: 32, unit: 'px' },
      { type: 'color', key: 'productSubheadlineTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { productSubheadlineFontSize: 14, productSubheadlineTextColor: '' },
  },
  paragraph: {
    icon: 'text-paragraph',
    title: 'Paragraph',
    controls: [
      { type: 'slider', key: 'productParagraphFontSize', label: 'Font Size', min: 10, max: 24, unit: 'px' },
      { type: 'color', key: 'productParagraphTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { productParagraphFontSize: 16, productParagraphTextColor: '' },
  },
  button: {
    icon: 'mouse-pointer-click',
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
    icon: 'spacing-horizontal',
    title: 'Spacing',
    controls: [
      { type: 'slider', key: 'spaceBetween', label: 'Space between', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'accordionPaddingX', label: 'Padding X', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'accordionPaddingY', label: 'Padding Y', min: 0, max: 48, unit: 'px' },
    ] as StyleControl[],
    defaults: { spaceBetween: 12, accordionPaddingX: 16, accordionPaddingY: 16 },
  },
  borders: {
    icon: 'border-all',
    title: 'Borders',
    controls: [
      { type: 'slider', key: 'accordionBorderWidth', label: 'Border Width', min: 0, max: 8, unit: 'px' },
      { type: 'color', key: 'accordionBorderColor', label: 'Border Color' },
      { type: 'slider', key: 'accordionRadius', label: 'Rounded', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { accordionBorderWidth: 1, accordionBorderColor: '', accordionRadius: 8 },
  },
  background: {
    icon: 'palette',
    title: 'Background',
    controls: [
      { type: 'color', key: 'accordionBackgroundColor', label: 'Background Color' },
    ] as StyleControl[],
    defaults: { accordionBackgroundColor: '' },
  },
  headline: {
    icon: 'type-h1',
    title: 'Headline',
    controls: [
      { type: 'slider', key: 'accordionHeadlineFontSize', label: 'Font Size', min: 12, max: 36, unit: 'px' },
      { type: 'color', key: 'accordionHeadlineTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { accordionHeadlineFontSize: 18, accordionHeadlineTextColor: '' },
  },
  paragraph: {
    icon: 'text-paragraph',
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
    icon: 'spacing-horizontal',
    title: 'Spacing',
    controls: [
      { type: 'slider', key: 'spaceBetween', label: 'Space between', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'linkPaddingX', label: 'Padding X', min: 0, max: 48, unit: 'px' },
      { type: 'slider', key: 'linkPaddingY', label: 'Padding Y', min: 0, max: 48, unit: 'px' },
    ] as StyleControl[],
    defaults: { spaceBetween: 12, linkPaddingX: 16, linkPaddingY: 16 },
  },
  borders: {
    icon: 'border-all',
    title: 'Borders',
    controls: [
      { type: 'slider', key: 'linkBorderWidth', label: 'Border Width', min: 0, max: 8, unit: 'px' },
      { type: 'color', key: 'linkBorderColor', label: 'Border Color' },
      { type: 'slider', key: 'linkRadius', label: 'Rounded', min: 0, max: 32, unit: 'px' },
    ] as StyleControl[],
    defaults: { linkBorderWidth: 1, linkBorderColor: '', linkRadius: 8 },
  },
  background: {
    icon: 'palette',
    title: 'Background',
    controls: [
      { type: 'color', key: 'linkBackgroundColor', label: 'Background Color' },
    ] as StyleControl[],
    defaults: { linkBackgroundColor: '' },
  },
  headline: {
    icon: 'type-h1',
    title: 'Headline',
    controls: [
      { type: 'slider', key: 'linkLabelFontSize', label: 'Font Size', min: 12, max: 36, unit: 'px' },
      { type: 'color', key: 'linkLabelTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { linkLabelFontSize: 18, linkLabelTextColor: '' },
  },
  paragraph: {
    icon: 'text-paragraph',
    title: 'Paragraph',
    controls: [
      { type: 'slider', key: 'linkDescriptionFontSize', label: 'Font Size', min: 10, max: 20, unit: 'px' },
      { type: 'color', key: 'linkDescriptionTextColor', label: 'Text Color' },
    ] as StyleControl[],
    defaults: { linkDescriptionFontSize: 14, linkDescriptionTextColor: '' },
  },
}
