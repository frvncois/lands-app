export interface TourStep {
  id: string
  target: string // CSS selector (data-tour attribute)
  title: string
  description: string
  placement: 'top' | 'right' | 'bottom' | 'left'
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'add-section',
    target: '[data-tour="add-section"]',
    title: 'Build Your Page',
    description: 'Click here to add sections like headers, features, testimonials, and more to create your landing page.',
    placement: 'right',
  },
  {
    id: 'inspector',
    target: '[data-tour="inspector"]',
    title: 'Customize Content & Style',
    description: 'Select any section to edit its content, adjust colors, change layouts, and fine-tune every detail.',
    placement: 'left',
  },
  {
    id: 'translations',
    target: '[data-tour="translations"]',
    title: 'Go Multilingual',
    description: 'Add languages to reach a global audience. Translate your content with just a few clicks.',
    placement: 'bottom',
  },
  {
    id: 'settings',
    target: '[data-tour="settings"]',
    title: 'Configure Your Project',
    description: 'Set up custom domains, SEO settings, integrations, and manage your subscription plan.',
    placement: 'bottom',
  },
  {
    id: 'publish',
    target: '[data-tour="publish"]',
    title: 'Go Live',
    description: 'When you\'re ready, publish your page to share it with the world instantly.',
    placement: 'bottom',
  },
]

export const TOTAL_STEPS = TOUR_STEPS.length
