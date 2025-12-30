import type { PresetCategory, UseCasePreset } from '../types'

export const nonprofitPreset: UseCasePreset = {
  id: 'nonprofit',
  name: 'Non-profit Organization',
  description: 'Share your mission and accept donations',
  icon: 'heart',
  categoryId: 'community',
  themeId: 'modern',
  sections: [
    'centeredHeader',
    'nonprofit-hero',
    'gallery-section',
    'faq-section',
    'cta-section',
    'default-footer',
  ],
  tags: ['nonprofit', 'charity', 'organization'],
}

export const fundraisingPreset: UseCasePreset = {
  id: 'fundraising',
  name: 'Fundraising Page',
  description: 'Raise money for your cause',
  icon: 'dollar',
  categoryId: 'community',
  themeId: 'modern',
  sections: [
    'simple-header',
    'nonprofit-hero',
    'testimonials-section',
    'cta-section',
    'default-footer',
  ],
  tags: ['fundraising', 'donate', 'campaign', 'crowdfunding'],
}

export const communityGroupPreset: UseCasePreset = {
  id: 'community-group',
  name: 'Community Group',
  description: 'Connect people around a shared interest',
  icon: 'users',
  categoryId: 'community',
  themeId: 'modern',
  sections: [
    'simple-header',
    'nonprofit-hero',
    'gallery-section',
    'subscribe-newsletter',
    'default-footer',
  ],
  tags: ['community', 'group', 'club', 'organization'],
}

export const churchPreset: UseCasePreset = {
  id: 'church-spiritual',
  name: 'Church / Spiritual Group',
  description: 'Welcome visitors and share your faith',
  icon: 'heart',
  categoryId: 'community',
  themeId: 'modern',
  sections: [
    'centeredHeader',
    'nonprofit-hero',
    'hours-location',
    'default-footer',
  ],
  tags: ['church', 'spiritual', 'faith', 'worship', 'religion'],
}

export const openSourcePreset: UseCasePreset = {
  id: 'open-source',
  name: 'Open-source Project',
  description: 'Document and promote your project',
  icon: 'code',
  categoryId: 'community',
  themeId: 'modern',
  sections: [
    'simple-header',
    'nonprofit-hero',
    'faq-section',
    'default-footer',
  ],
  tags: ['open source', 'github', 'project', 'code', 'developer'],
}

export const volunteerSignupPreset: UseCasePreset = {
  id: 'volunteer-signup',
  name: 'Volunteer Signup',
  description: 'Recruit volunteers for your cause',
  icon: 'hand',
  categoryId: 'community',
  themeId: 'modern',
  sections: [
    'simple-header',
    'nonprofit-hero',
    'contact-section',
    'default-footer',
  ],
  tags: ['volunteer', 'signup', 'help', 'community'],
}

export const petitionPreset: UseCasePreset = {
  id: 'petition-cause',
  name: 'Petition / Cause Page',
  description: 'Rally support for your cause',
  icon: 'megaphone',
  categoryId: 'community',
  themeId: 'bold',
  sections: [
    'simple-header',
    'nonprofit-hero',
    'social-links',
    'default-footer',
  ],
  tags: ['petition', 'cause', 'activism', 'change'],
}

export const communityCategory: PresetCategory = {
  id: 'community',
  name: 'Community & Non-Profit',
  description: 'Non-profits, causes, and community groups',
  icon: 'heart',
  order: 9,
  useCases: [
    'nonprofit',
    'fundraising',
    'community-group',
    'church-spiritual',
    'open-source',
    'volunteer-signup',
    'petition-cause',
  ],
}

export const communityPresets = {
  nonprofitPreset,
  fundraisingPreset,
  communityGroupPreset,
  churchPreset,
  openSourcePreset,
  volunteerSignupPreset,
  petitionPreset,
}
