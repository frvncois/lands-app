import type { PresetCategory, UseCasePreset } from '../types'

export const productLaunchPreset: UseCasePreset = {
  id: 'product-launch',
  name: 'Product Launch Page',
  description: 'Launch your product with impact',
  icon: 'rocket',
  categoryId: 'commerce',
  themeId: 'bold',
  sections: [
    'simple-header',
    'product-launch-hero',
    'gallery-section',
    'faq-section',
    'cta-section',
    'default-footer',
  ],
  tags: ['product', 'launch', 'ecommerce'],
}

export const singleProductPreset: UseCasePreset = {
  id: 'single-product',
  name: 'Single-product Store',
  description: 'One product, one focus',
  icon: 'package',
  categoryId: 'commerce',
  themeId: 'modern',
  sections: [
    'simple-header',
    'product-launch-hero',
    'gallery-section',
    'faq-section',
    'default-footer',
  ],
  tags: ['product', 'single', 'store', 'dtc'],
}

export const digitalProductsPreset: UseCasePreset = {
  id: 'digital-products',
  name: 'Digital Products',
  description: 'Sell ebooks, templates, and downloads',
  icon: 'download',
  categoryId: 'commerce',
  themeId: 'modern',
  sections: [
    'simple-header',
    'product-launch-hero',
    'faq-section',
    'default-footer',
  ],
  tags: ['digital', 'download', 'ebook', 'template'],
}

export const coursesWorkshopsPreset: UseCasePreset = {
  id: 'courses-workshops',
  name: 'Courses / Workshops',
  description: 'Sell your knowledge online',
  icon: 'graduation',
  categoryId: 'commerce',
  themeId: 'modern',
  sections: [
    'simple-header',
    'product-launch-hero',
    'faq-section',
    'cta-section',
    'default-footer',
  ],
  tags: ['course', 'workshop', 'education', 'online learning'],
}

export const affiliateHubPreset: UseCasePreset = {
  id: 'affiliate-hub',
  name: 'Affiliate Link Hub',
  description: 'Curate and share your favorite products',
  icon: 'link',
  categoryId: 'commerce',
  themeId: 'modern',
  sections: [
    'simple-header',
    'product-launch-hero',
    'links-section',
    'default-footer',
  ],
  tags: ['affiliate', 'links', 'recommendations', 'curator'],
}

export const domainResalePreset: UseCasePreset = {
  id: 'domain-resale',
  name: 'Domain Resale',
  description: 'Sell your premium domain',
  icon: 'globe',
  categoryId: 'commerce',
  themeId: 'modern',
  sections: [
    'simple-header',
    'product-launch-hero',
    'contact-section',
    'minimal-footer',
  ],
  tags: ['domain', 'sale', 'premium domain'],
}

export const preordersPreset: UseCasePreset = {
  id: 'preorders',
  name: 'Pre-orders / Limited Drops',
  description: 'Build hype and collect pre-orders',
  icon: 'clock',
  categoryId: 'commerce',
  themeId: 'bold',
  sections: [
    'simple-header',
    'product-launch-hero',
    'gallery-section',
    'cta-section',
    'subscribe-newsletter',
    'default-footer',
  ],
  tags: ['preorder', 'limited', 'drop', 'exclusive'],
}

export const commerceCategory: PresetCategory = {
  id: 'commerce',
  name: 'Commerce & Selling',
  description: 'Products, courses, and digital goods',
  icon: 'shopping-cart',
  order: 4,
  useCases: [
    'product-launch',
    'single-product',
    'digital-products',
    'courses-workshops',
    'affiliate-hub',
    'domain-resale',
    'preorders',
  ],
}

export const commercePresets = {
  productLaunchPreset,
  singleProductPreset,
  digitalProductsPreset,
  coursesWorkshopsPreset,
  affiliateHubPreset,
  domainResalePreset,
  preordersPreset,
}
