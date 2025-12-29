import type { PresetCategory, UseCasePreset } from '../types'

export const startupLandingPreset: UseCasePreset = {
  id: 'startup-landing',
  name: 'Startup Landing Page',
  description: 'Launch your startup with impact',
  icon: 'rocket',
  categoryId: 'business',
  themeId: 'bold',
  sections: [
    'centeredHeader',
    'startup-hero',
    'gallery-section',
    'faq-section',
    'cta-section',
    'default-footer',
  ],
  tags: ['startup', 'landing', 'saas'],
}

export const saasWaitlistPreset: UseCasePreset = {
  id: 'saas-waitlist',
  name: 'SaaS Waitlist',
  description: 'Build hype before launch',
  icon: 'clock',
  categoryId: 'business',
  themeId: 'minimal',
  sections: [
    'centeredHeader',
    'startup-hero',
    'gallery-section',
    'subscribe-newsletter',
    'default-footer',
  ],
  tags: ['saas', 'waitlist', 'launch', 'coming soon'],
}

export const appLaunchPreset: UseCasePreset = {
  id: 'app-launch',
  name: 'App Launch',
  description: 'Promote your mobile app',
  icon: 'mobile',
  categoryId: 'business',
  themeId: 'bold',
  sections: [
    'centeredHeader',
    'startup-hero',
    'gallery-section',
    'testimonials-section',
    'faq-section',
    'default-footer',
  ],
  tags: ['app', 'mobile', 'ios', 'android', 'download'],
}

export const betaSignupPreset: UseCasePreset = {
  id: 'beta-signup',
  name: 'Beta Signup',
  description: 'Recruit beta testers',
  icon: 'code',
  categoryId: 'business',
  themeId: 'minimal',
  sections: [
    'centeredHeader',
    'startup-hero',
    'faq-section',
    'default-footer',
  ],
  tags: ['beta', 'testing', 'early access', 'signup'],
}

export const featureAnnouncementPreset: UseCasePreset = {
  id: 'feature-announcement',
  name: 'Feature Announcement',
  description: 'Announce new features',
  icon: 'megaphone',
  categoryId: 'business',
  themeId: 'minimal',
  sections: [
    'centeredHeader',
    'startup-hero',
    'cta-section',
    'default-footer',
  ],
  tags: ['feature', 'announcement', 'product', 'update'],
}

export const changelogPreset: UseCasePreset = {
  id: 'changelog',
  name: 'Changelog / Updates',
  description: 'Keep users informed',
  icon: 'list',
  categoryId: 'business',
  themeId: 'minimal',
  sections: [
    'centeredHeader',
    'startup-hero',
    'subscribe-newsletter',
    'default-footer',
  ],
  tags: ['changelog', 'updates', 'releases', 'news'],
}

export const pricingPagePreset: UseCasePreset = {
  id: 'pricing-page',
  name: 'Pricing Page',
  description: 'Clear and compelling pricing',
  icon: 'tag',
  categoryId: 'business',
  themeId: 'minimal',
  sections: [
    'centeredHeader',
    'startup-hero',
    'faq-section',
    'cta-section',
    'default-footer',
  ],
  tags: ['pricing', 'plans', 'subscription', 'tiers'],
}

export const investorTeaserPreset: UseCasePreset = {
  id: 'investor-teaser',
  name: 'Investor Teaser',
  description: 'Attract investor interest',
  icon: 'chart-up',
  categoryId: 'business',
  themeId: 'minimal',
  sections: [
    'centeredHeader',
    'startup-hero',
    'contact-section',
    'minimal-footer',
  ],
  tags: ['investor', 'fundraising', 'pitch', 'startup'],
}

export const businessCategory: PresetCategory = {
  id: 'business',
  name: 'Business & Startups',
  description: 'SaaS, apps, and startup pages',
  icon: 'chart-up',
  order: 7,
  useCases: [
    'startup-landing',
    'saas-waitlist',
    'app-launch',
    'beta-signup',
    'feature-announcement',
    'changelog',
    'pricing-page',
    'investor-teaser',
  ],
}

export const businessPresets = {
  startupLandingPreset,
  saasWaitlistPreset,
  appLaunchPreset,
  betaSignupPreset,
  featureAnnouncementPreset,
  changelogPreset,
  pricingPagePreset,
  investorTeaserPreset,
}
