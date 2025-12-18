/**
 * AI Examples Database
 *
 * Working examples for common patterns that the AI can use as templates.
 * Each example includes the full JSON action that WORKS.
 */

export interface AIExample {
  id: string
  name: string
  description: string
  keywords: string[]
  category: 'section' | 'list' | 'component' | 'update'
  // The actual working action(s)
  actions: unknown[]
}

export const AI_EXAMPLES: AIExample[] = [
  // ============================================
  // HERO SECTIONS
  // ============================================
  {
    id: 'hero-centered',
    name: 'Centered Hero Section',
    description: 'Hero with centered headline, description, and CTA',
    keywords: ['hero', 'header', 'landing', 'main', 'top', 'headline', 'cta', 'centered'],
    category: 'section',
    actions: [{
      type: 'create_section',
      section: {
        name: 'Hero Section',
        container: {
          settings: { maxWidth: '1200px', height: 'auto' },
          styles: {
            padding: { top: '120', bottom: '120', left: '24', right: '24' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32',
          },
        },
        children: [
          {
            type: 'heading',
            name: 'Hero Headline',
            settings: { content: 'Build Beautiful Landing Pages in Minutes', level: 'h1' },
            styles: { fontSize: '56', fontWeight: 'bold', alignment: 'center', lineHeight: '1.1' },
          },
          {
            type: 'text',
            name: 'Hero Description',
            settings: { content: 'Create stunning, high-converting landing pages without code. Drag, drop, and publish in minutes.', maxWidth: '600px' },
            styles: { fontSize: '20', alignment: 'center', lineHeight: '1.6', color: '#666666' },
          },
          {
            type: 'stack',
            name: 'CTA Buttons',
            settings: { direction: 'horizontal', gap: '16', align: 'center' },
            styles: {},
            children: [
              {
                type: 'button',
                name: 'Primary CTA',
                settings: { label: 'Get Started Free', url: '#' },
                styles: { backgroundColor: '#6366f1', textColor: '#ffffff', padding: { top: '16', bottom: '16', left: '32', right: '32' }, borderRadius: '8', fontWeight: 'semibold' },
              },
              {
                type: 'button',
                name: 'Secondary CTA',
                settings: { label: 'Learn More', url: '#' },
                styles: { backgroundColor: 'transparent', textColor: '#6366f1', padding: { top: '16', bottom: '16', left: '32', right: '32' }, borderRadius: '8', border: { width: '2', color: '#6366f1', style: 'solid' } },
              },
            ],
          },
        ],
      },
    }],
  },

  // ============================================
  // FEATURE SECTIONS
  // ============================================
  {
    id: 'features-grid',
    name: 'Features Grid',
    description: '3-column grid of feature cards with icons',
    keywords: ['features', 'benefits', 'cards', 'grid', 'icons', 'what we offer', 'services'],
    category: 'section',
    actions: [{
      type: 'create_section',
      section: {
        name: 'Features Section',
        container: {
          settings: { maxWidth: '1200px' },
          styles: {
            padding: { top: '80', bottom: '80', left: '24', right: '24' },
            flexDirection: 'column',
            alignItems: 'center',
            gap: '48',
          },
        },
        children: [
          {
            type: 'heading',
            name: 'Section Title',
            settings: { content: 'Why Choose Us', level: 'h2' },
            styles: { fontSize: '40', fontWeight: 'bold', alignment: 'center' },
          },
          {
            type: 'grid',
            name: 'Features Grid',
            settings: { columns: 3, gap: '32', mobileColumns: 1 },
            styles: { width: '100%' },
            children: [
              {
                type: 'stack',
                name: 'Feature 1',
                settings: { direction: 'vertical', gap: '16', align: 'center' },
                styles: { padding: { top: '32', bottom: '32', left: '24', right: '24' }, backgroundColor: '#f9fafb', borderRadius: '16' },
                children: [
                  { type: 'icon', name: 'Icon', settings: { icon: 'bolt', size: '32' }, styles: { color: '#6366f1', backgroundColor: '#eef2ff', backgroundShape: 'circle', backgroundPadding: '16' } },
                  { type: 'heading', name: 'Title', settings: { content: 'Lightning Fast', level: 'h3' }, styles: { fontSize: '20', fontWeight: 'semibold', alignment: 'center' } },
                  { type: 'text', name: 'Description', settings: { content: 'Build and publish pages in minutes, not hours. Our intuitive editor makes it easy.' }, styles: { fontSize: '16', alignment: 'center', color: '#666666' } },
                ],
              },
              {
                type: 'stack',
                name: 'Feature 2',
                settings: { direction: 'vertical', gap: '16', align: 'center' },
                styles: { padding: { top: '32', bottom: '32', left: '24', right: '24' }, backgroundColor: '#f9fafb', borderRadius: '16' },
                children: [
                  { type: 'icon', name: 'Icon', settings: { icon: 'sparkles', size: '32' }, styles: { color: '#6366f1', backgroundColor: '#eef2ff', backgroundShape: 'circle', backgroundPadding: '16' } },
                  { type: 'heading', name: 'Title', settings: { content: 'Beautiful Design', level: 'h3' }, styles: { fontSize: '20', fontWeight: 'semibold', alignment: 'center' } },
                  { type: 'text', name: 'Description', settings: { content: 'Professional templates and components designed by experts.' }, styles: { fontSize: '16', alignment: 'center', color: '#666666' } },
                ],
              },
              {
                type: 'stack',
                name: 'Feature 3',
                settings: { direction: 'vertical', gap: '16', align: 'center' },
                styles: { padding: { top: '32', bottom: '32', left: '24', right: '24' }, backgroundColor: '#f9fafb', borderRadius: '16' },
                children: [
                  { type: 'icon', name: 'Icon', settings: { icon: 'shield', size: '32' }, styles: { color: '#6366f1', backgroundColor: '#eef2ff', backgroundShape: 'circle', backgroundPadding: '16' } },
                  { type: 'heading', name: 'Title', settings: { content: 'Secure & Reliable', level: 'h3' }, styles: { fontSize: '20', fontWeight: 'semibold', alignment: 'center' } },
                  { type: 'text', name: 'Description', settings: { content: 'Enterprise-grade hosting with 99.9% uptime guarantee.' }, styles: { fontSize: '16', alignment: 'center', color: '#666666' } },
                ],
              },
            ],
          },
        ],
      },
    }],
  },

  // ============================================
  // FAQ / ACCORDION
  // ============================================
  {
    id: 'faq-accordion',
    name: 'FAQ Accordion',
    description: 'Expandable FAQ section with questions and answers',
    keywords: ['faq', 'accordion', 'questions', 'answers', 'expandable', 'collapse', 'help'],
    category: 'section',
    actions: [{
      type: 'create_section',
      section: {
        name: 'FAQ Section',
        container: {
          settings: { maxWidth: '800px' },
          styles: {
            padding: { top: '80', bottom: '80', left: '24', right: '24' },
            flexDirection: 'column',
            alignItems: 'center',
            gap: '48',
          },
        },
        children: [
          {
            type: 'heading',
            name: 'Section Title',
            settings: { content: 'Frequently Asked Questions', level: 'h2' },
            styles: { fontSize: '36', fontWeight: 'bold', alignment: 'center' },
          },
          {
            type: 'stack',
            name: 'FAQ List',
            settings: { direction: 'vertical', gap: '8' },
            styles: { width: '100%' },
            children: [
              {
                type: 'stack',
                name: 'FAQ Item 1',
                settings: { direction: 'vertical', gap: '0' },
                styles: { backgroundColor: '#f9fafb', borderRadius: '12', overflow: 'hidden' },
                children: [
                  {
                    type: 'stack',
                    name: 'Question',
                    settings: { direction: 'horizontal', align: 'center' },
                    styles: { padding: { top: '16', bottom: '16', left: '20', right: '20' }, justifyContent: 'space-between' },
                    children: [
                      { type: 'text', name: 'Question Text', settings: { content: 'How do I get started?' }, styles: { fontWeight: 'semibold', fontSize: '16' } },
                      { type: 'icon', name: 'Chevron', settings: { icon: 'chevron-down', size: '20' }, styles: { color: '#666666' } },
                    ],
                  },
                  {
                    type: 'stack',
                    name: 'Answer',
                    settings: { direction: 'vertical' },
                    styles: { padding: { top: '0', bottom: '16', left: '20', right: '20' } },
                    children: [
                      { type: 'text', name: 'Answer Text', settings: { content: 'Simply sign up for a free account, choose a template, and start customizing. No credit card required.' }, styles: { fontSize: '15', color: '#666666', lineHeight: '1.6' } },
                    ],
                  },
                ],
              },
              {
                type: 'stack',
                name: 'FAQ Item 2',
                settings: { direction: 'vertical', gap: '0' },
                styles: { backgroundColor: '#f9fafb', borderRadius: '12', overflow: 'hidden' },
                children: [
                  {
                    type: 'stack',
                    name: 'Question',
                    settings: { direction: 'horizontal', align: 'center' },
                    styles: { padding: { top: '16', bottom: '16', left: '20', right: '20' }, justifyContent: 'space-between' },
                    children: [
                      { type: 'text', name: 'Question Text', settings: { content: 'Can I use my own domain?' }, styles: { fontWeight: 'semibold', fontSize: '16' } },
                      { type: 'icon', name: 'Chevron', settings: { icon: 'chevron-down', size: '20' }, styles: { color: '#666666' } },
                    ],
                  },
                  {
                    type: 'stack',
                    name: 'Answer',
                    settings: { direction: 'vertical' },
                    styles: { padding: { top: '0', bottom: '16', left: '20', right: '20' } },
                    children: [
                      { type: 'text', name: 'Answer Text', settings: { content: 'Yes! You can connect your own custom domain on any paid plan. We handle all the DNS configuration for you.' }, styles: { fontSize: '15', color: '#666666', lineHeight: '1.6' } },
                    ],
                  },
                ],
              },
              {
                type: 'stack',
                name: 'FAQ Item 3',
                settings: { direction: 'vertical', gap: '0' },
                styles: { backgroundColor: '#f9fafb', borderRadius: '12', overflow: 'hidden' },
                children: [
                  {
                    type: 'stack',
                    name: 'Question',
                    settings: { direction: 'horizontal', align: 'center' },
                    styles: { padding: { top: '16', bottom: '16', left: '20', right: '20' }, justifyContent: 'space-between' },
                    children: [
                      { type: 'text', name: 'Question Text', settings: { content: 'Is there a free plan?' }, styles: { fontWeight: 'semibold', fontSize: '16' } },
                      { type: 'icon', name: 'Chevron', settings: { icon: 'chevron-down', size: '20' }, styles: { color: '#666666' } },
                    ],
                  },
                  {
                    type: 'stack',
                    name: 'Answer',
                    settings: { direction: 'vertical' },
                    styles: { padding: { top: '0', bottom: '16', left: '20', right: '20' } },
                    children: [
                      { type: 'text', name: 'Answer Text', settings: { content: 'Absolutely! Our free plan includes all core features. Upgrade anytime for advanced features like custom domains and analytics.' }, styles: { fontSize: '15', color: '#666666', lineHeight: '1.6' } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    }],
  },

  // ============================================
  // TESTIMONIALS
  // ============================================
  {
    id: 'testimonials-grid',
    name: 'Testimonials Grid',
    description: 'Customer testimonials in a grid layout',
    keywords: ['testimonials', 'reviews', 'quotes', 'customers', 'feedback', 'social proof'],
    category: 'section',
    actions: [{
      type: 'create_section',
      section: {
        name: 'Testimonials Section',
        container: {
          settings: { maxWidth: '1200px' },
          styles: {
            padding: { top: '80', bottom: '80', left: '24', right: '24' },
            flexDirection: 'column',
            alignItems: 'center',
            gap: '48',
          },
        },
        children: [
          {
            type: 'heading',
            name: 'Section Title',
            settings: { content: 'What Our Customers Say', level: 'h2' },
            styles: { fontSize: '36', fontWeight: 'bold', alignment: 'center' },
          },
          {
            type: 'grid',
            name: 'Testimonials Grid',
            settings: { columns: 3, gap: '24', mobileColumns: 1 },
            styles: { width: '100%' },
            children: [
              {
                type: 'stack',
                name: 'Testimonial 1',
                settings: { direction: 'vertical', gap: '16' },
                styles: { padding: { top: '24', bottom: '24', left: '24', right: '24' }, backgroundColor: '#f9fafb', borderRadius: '16' },
                children: [
                  { type: 'icon', name: 'Quote', settings: { icon: 'quotation', size: '24' }, styles: { color: '#6366f1' } },
                  { type: 'text', name: 'Quote', settings: { content: 'This tool has completely transformed how we build landing pages. What used to take days now takes hours.' }, styles: { fontSize: '16', lineHeight: '1.6', fontStyle: 'italic' } },
                  {
                    type: 'stack',
                    name: 'Author',
                    settings: { direction: 'horizontal', gap: '12', align: 'center' },
                    styles: {},
                    children: [
                      { type: 'image', name: 'Avatar', settings: { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', alt: 'Sarah Johnson' }, styles: { width: '48', height: '48', borderRadius: '24', objectFit: 'cover' } },
                      {
                        type: 'stack',
                        name: 'Author Info',
                        settings: { direction: 'vertical', gap: '2' },
                        styles: {},
                        children: [
                          { type: 'text', name: 'Name', settings: { content: 'Sarah Johnson' }, styles: { fontWeight: 'semibold', fontSize: '14' } },
                          { type: 'text', name: 'Role', settings: { content: 'Marketing Director' }, styles: { fontSize: '13', color: '#666666' } },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'stack',
                name: 'Testimonial 2',
                settings: { direction: 'vertical', gap: '16' },
                styles: { padding: { top: '24', bottom: '24', left: '24', right: '24' }, backgroundColor: '#f9fafb', borderRadius: '16' },
                children: [
                  { type: 'icon', name: 'Quote', settings: { icon: 'quotation', size: '24' }, styles: { color: '#6366f1' } },
                  { type: 'text', name: 'Quote', settings: { content: 'The best landing page builder I\'ve ever used. Clean interface, powerful features, and amazing support.' }, styles: { fontSize: '16', lineHeight: '1.6', fontStyle: 'italic' } },
                  {
                    type: 'stack',
                    name: 'Author',
                    settings: { direction: 'horizontal', gap: '12', align: 'center' },
                    styles: {},
                    children: [
                      { type: 'image', name: 'Avatar', settings: { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', alt: 'Mike Chen' }, styles: { width: '48', height: '48', borderRadius: '24', objectFit: 'cover' } },
                      {
                        type: 'stack',
                        name: 'Author Info',
                        settings: { direction: 'vertical', gap: '2' },
                        styles: {},
                        children: [
                          { type: 'text', name: 'Name', settings: { content: 'Mike Chen' }, styles: { fontWeight: 'semibold', fontSize: '14' } },
                          { type: 'text', name: 'Role', settings: { content: 'Startup Founder' }, styles: { fontSize: '13', color: '#666666' } },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'stack',
                name: 'Testimonial 3',
                settings: { direction: 'vertical', gap: '16' },
                styles: { padding: { top: '24', bottom: '24', left: '24', right: '24' }, backgroundColor: '#f9fafb', borderRadius: '16' },
                children: [
                  { type: 'icon', name: 'Quote', settings: { icon: 'quotation', size: '24' }, styles: { color: '#6366f1' } },
                  { type: 'text', name: 'Quote', settings: { content: 'Our conversion rates increased by 40% after switching to this platform. Highly recommended!' }, styles: { fontSize: '16', lineHeight: '1.6', fontStyle: 'italic' } },
                  {
                    type: 'stack',
                    name: 'Author',
                    settings: { direction: 'horizontal', gap: '12', align: 'center' },
                    styles: {},
                    children: [
                      { type: 'image', name: 'Avatar', settings: { src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', alt: 'Emily Davis' }, styles: { width: '48', height: '48', borderRadius: '24', objectFit: 'cover' } },
                      {
                        type: 'stack',
                        name: 'Author Info',
                        settings: { direction: 'vertical', gap: '2' },
                        styles: {},
                        children: [
                          { type: 'text', name: 'Name', settings: { content: 'Emily Davis' }, styles: { fontWeight: 'semibold', fontSize: '14' } },
                          { type: 'text', name: 'Role', settings: { content: 'E-commerce Manager' }, styles: { fontSize: '13', color: '#666666' } },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    }],
  },

  // ============================================
  // PRICING
  // ============================================
  {
    id: 'pricing-cards',
    name: 'Pricing Cards',
    description: 'Pricing section with 3 plan cards',
    keywords: ['pricing', 'plans', 'subscription', 'cost', 'tiers', 'packages', 'buy'],
    category: 'section',
    actions: [{
      type: 'create_section',
      section: {
        name: 'Pricing Section',
        container: {
          settings: { maxWidth: '1200px' },
          styles: {
            padding: { top: '80', bottom: '80', left: '24', right: '24' },
            flexDirection: 'column',
            alignItems: 'center',
            gap: '48',
          },
        },
        children: [
          {
            type: 'stack',
            name: 'Section Header',
            settings: { direction: 'vertical', gap: '16', align: 'center' },
            styles: {},
            children: [
              { type: 'heading', name: 'Title', settings: { content: 'Simple, Transparent Pricing', level: 'h2' }, styles: { fontSize: '36', fontWeight: 'bold', alignment: 'center' } },
              { type: 'text', name: 'Subtitle', settings: { content: 'Choose the plan that works best for you' }, styles: { fontSize: '18', alignment: 'center', color: '#666666' } },
            ],
          },
          {
            type: 'grid',
            name: 'Pricing Grid',
            settings: { columns: 3, gap: '24', mobileColumns: 1 },
            styles: { width: '100%' },
            children: [
              {
                type: 'stack',
                name: 'Free Plan',
                settings: { direction: 'vertical', gap: '24' },
                styles: { padding: { top: '32', bottom: '32', left: '24', right: '24' }, border: { width: '1', color: '#e5e5e5', radius: '16', style: 'solid' } },
                children: [
                  {
                    type: 'stack',
                    name: 'Plan Header',
                    settings: { direction: 'vertical', gap: '8' },
                    styles: {},
                    children: [
                      { type: 'text', name: 'Plan Name', settings: { content: 'Free' }, styles: { fontWeight: 'semibold', fontSize: '18' } },
                      { type: 'heading', name: 'Price', settings: { content: '$0', level: 'h3' }, styles: { fontSize: '48', fontWeight: 'bold' } },
                      { type: 'text', name: 'Period', settings: { content: 'Forever free' }, styles: { fontSize: '14', color: '#666666' } },
                    ],
                  },
                  {
                    type: 'stack',
                    name: 'Features',
                    settings: { direction: 'vertical', gap: '12' },
                    styles: {},
                    children: [
                      { type: 'text', name: 'Feature 1', settings: { content: '✓ 1 landing page' }, styles: { fontSize: '15' } },
                      { type: 'text', name: 'Feature 2', settings: { content: '✓ Basic templates' }, styles: { fontSize: '15' } },
                      { type: 'text', name: 'Feature 3', settings: { content: '✓ Lands subdomain' }, styles: { fontSize: '15' } },
                    ],
                  },
                  { type: 'button', name: 'CTA', settings: { label: 'Get Started', url: '#' }, styles: { backgroundColor: '#f3f4f6', textColor: '#171717', padding: { top: '14', bottom: '14', left: '24', right: '24' }, borderRadius: '8', width: '100%', fontWeight: 'semibold' } },
                ],
              },
              {
                type: 'stack',
                name: 'Pro Plan',
                settings: { direction: 'vertical', gap: '24' },
                styles: { padding: { top: '32', bottom: '32', left: '24', right: '24' }, backgroundColor: '#6366f1', borderRadius: '16' },
                children: [
                  {
                    type: 'stack',
                    name: 'Plan Header',
                    settings: { direction: 'vertical', gap: '8' },
                    styles: {},
                    children: [
                      { type: 'text', name: 'Plan Name', settings: { content: 'Pro' }, styles: { fontWeight: 'semibold', fontSize: '18', color: '#ffffff' } },
                      { type: 'heading', name: 'Price', settings: { content: '$19', level: 'h3' }, styles: { fontSize: '48', fontWeight: 'bold', color: '#ffffff' } },
                      { type: 'text', name: 'Period', settings: { content: 'per month' }, styles: { fontSize: '14', color: '#c7d2fe' } },
                    ],
                  },
                  {
                    type: 'stack',
                    name: 'Features',
                    settings: { direction: 'vertical', gap: '12' },
                    styles: {},
                    children: [
                      { type: 'text', name: 'Feature 1', settings: { content: '✓ Unlimited pages' }, styles: { fontSize: '15', color: '#ffffff' } },
                      { type: 'text', name: 'Feature 2', settings: { content: '✓ Custom domain' }, styles: { fontSize: '15', color: '#ffffff' } },
                      { type: 'text', name: 'Feature 3', settings: { content: '✓ Premium templates' }, styles: { fontSize: '15', color: '#ffffff' } },
                      { type: 'text', name: 'Feature 4', settings: { content: '✓ Analytics' }, styles: { fontSize: '15', color: '#ffffff' } },
                    ],
                  },
                  { type: 'button', name: 'CTA', settings: { label: 'Start Free Trial', url: '#' }, styles: { backgroundColor: '#ffffff', textColor: '#6366f1', padding: { top: '14', bottom: '14', left: '24', right: '24' }, borderRadius: '8', width: '100%', fontWeight: 'semibold' } },
                ],
              },
              {
                type: 'stack',
                name: 'Business Plan',
                settings: { direction: 'vertical', gap: '24' },
                styles: { padding: { top: '32', bottom: '32', left: '24', right: '24' }, border: { width: '1', color: '#e5e5e5', radius: '16', style: 'solid' } },
                children: [
                  {
                    type: 'stack',
                    name: 'Plan Header',
                    settings: { direction: 'vertical', gap: '8' },
                    styles: {},
                    children: [
                      { type: 'text', name: 'Plan Name', settings: { content: 'Business' }, styles: { fontWeight: 'semibold', fontSize: '18' } },
                      { type: 'heading', name: 'Price', settings: { content: '$49', level: 'h3' }, styles: { fontSize: '48', fontWeight: 'bold' } },
                      { type: 'text', name: 'Period', settings: { content: 'per month' }, styles: { fontSize: '14', color: '#666666' } },
                    ],
                  },
                  {
                    type: 'stack',
                    name: 'Features',
                    settings: { direction: 'vertical', gap: '12' },
                    styles: {},
                    children: [
                      { type: 'text', name: 'Feature 1', settings: { content: '✓ Everything in Pro' }, styles: { fontSize: '15' } },
                      { type: 'text', name: 'Feature 2', settings: { content: '✓ Team collaboration' }, styles: { fontSize: '15' } },
                      { type: 'text', name: 'Feature 3', settings: { content: '✓ Priority support' }, styles: { fontSize: '15' } },
                      { type: 'text', name: 'Feature 4', settings: { content: '✓ Custom branding' }, styles: { fontSize: '15' } },
                    ],
                  },
                  { type: 'button', name: 'CTA', settings: { label: 'Contact Sales', url: '#' }, styles: { backgroundColor: '#f3f4f6', textColor: '#171717', padding: { top: '14', bottom: '14', left: '24', right: '24' }, borderRadius: '8', width: '100%', fontWeight: 'semibold' } },
                ],
              },
            ],
          },
        ],
      },
    }],
  },

  // ============================================
  // ADD CHILDREN EXAMPLES
  // ============================================
  {
    id: 'add-accordion-items',
    name: 'Add Accordion Items',
    description: 'Add multiple accordion items to an existing list',
    keywords: ['add', 'accordion', 'faq', 'item', 'question', 'answer', 'more'],
    category: 'list',
    actions: [{
      type: 'add_children',
      blockId: 'selected',
      children: [
        {
          type: 'stack',
          name: 'FAQ Item',
          settings: { direction: 'vertical', gap: '0' },
          styles: { backgroundColor: '#f9fafb', borderRadius: '12', overflow: 'hidden' },
          children: [
            {
              type: 'stack',
              name: 'Question',
              settings: { direction: 'horizontal', align: 'center' },
              styles: { padding: { top: '16', bottom: '16', left: '20', right: '20' }, justifyContent: 'space-between' },
              children: [
                { type: 'text', name: 'Question Text', settings: { content: 'Your question here?' }, styles: { fontWeight: 'semibold', fontSize: '16' } },
                { type: 'icon', name: 'Chevron', settings: { icon: 'chevron-down', size: '20' }, styles: { color: '#666666' } },
              ],
            },
            {
              type: 'stack',
              name: 'Answer',
              settings: { direction: 'vertical' },
              styles: { padding: { top: '0', bottom: '16', left: '20', right: '20' } },
              children: [
                { type: 'text', name: 'Answer Text', settings: { content: 'Your answer here. Provide helpful information to address the question.' }, styles: { fontSize: '15', color: '#666666', lineHeight: '1.6' } },
              ],
            },
          ],
        },
      ],
    }],
  },

  {
    id: 'add-feature-items',
    name: 'Add Feature Items',
    description: 'Add feature cards to an existing grid',
    keywords: ['add', 'feature', 'card', 'benefit', 'more', 'item'],
    category: 'list',
    actions: [{
      type: 'add_children',
      blockId: 'selected',
      children: [
        {
          type: 'stack',
          name: 'Feature',
          settings: { direction: 'vertical', gap: '16', align: 'center' },
          styles: { padding: { top: '32', bottom: '32', left: '24', right: '24' }, backgroundColor: '#f9fafb', borderRadius: '16' },
          children: [
            { type: 'icon', name: 'Icon', settings: { icon: 'star', size: '32' }, styles: { color: '#6366f1', backgroundColor: '#eef2ff', backgroundShape: 'circle', backgroundPadding: '16' } },
            { type: 'heading', name: 'Title', settings: { content: 'Feature Title', level: 'h3' }, styles: { fontSize: '20', fontWeight: 'semibold', alignment: 'center' } },
            { type: 'text', name: 'Description', settings: { content: 'Describe this feature and its benefits to your users.' }, styles: { fontSize: '16', alignment: 'center', color: '#666666' } },
          ],
        },
      ],
    }],
  },

  // ============================================
  // CTA SECTION
  // ============================================
  {
    id: 'cta-section',
    name: 'CTA Section',
    description: 'Call-to-action section with background',
    keywords: ['cta', 'call to action', 'signup', 'subscribe', 'get started', 'contact'],
    category: 'section',
    actions: [{
      type: 'create_section',
      section: {
        name: 'CTA Section',
        container: {
          settings: { maxWidth: '1200px' },
          styles: {
            padding: { top: '80', bottom: '80', left: '24', right: '24' },
            backgroundColor: '#6366f1',
            borderRadius: '24',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24',
          },
        },
        children: [
          { type: 'heading', name: 'CTA Title', settings: { content: 'Ready to Get Started?', level: 'h2' }, styles: { fontSize: '36', fontWeight: 'bold', alignment: 'center', color: '#ffffff' } },
          { type: 'text', name: 'CTA Description', settings: { content: 'Join thousands of creators building beautiful landing pages.' }, styles: { fontSize: '18', alignment: 'center', color: '#e0e7ff' } },
          { type: 'button', name: 'CTA Button', settings: { label: 'Start Building Free', url: '#' }, styles: { backgroundColor: '#ffffff', textColor: '#6366f1', padding: { top: '16', bottom: '16', left: '32', right: '32' }, borderRadius: '8', fontWeight: 'semibold', fontSize: '18' } },
        ],
      },
    }],
  },

  // ============================================
  // FOOTER
  // ============================================
  {
    id: 'footer-simple',
    name: 'Simple Footer',
    description: 'Simple footer with links and copyright',
    keywords: ['footer', 'bottom', 'copyright', 'links', 'social'],
    category: 'section',
    actions: [{
      type: 'create_section',
      section: {
        name: 'Footer',
        container: {
          settings: { maxWidth: '1200px', htmlTag: 'section' },
          styles: {
            padding: { top: '48', bottom: '48', left: '24', right: '24' },
            backgroundColor: '#171717',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24',
          },
        },
        children: [
          {
            type: 'stack',
            name: 'Social Links',
            settings: { direction: 'horizontal', gap: '16', align: 'center' },
            styles: {},
            children: [
              { type: 'icon', name: 'Twitter', settings: { icon: 'twitter', size: '20' }, styles: { color: '#ffffff' } },
              { type: 'icon', name: 'Instagram', settings: { icon: 'instagram', size: '20' }, styles: { color: '#ffffff' } },
              { type: 'icon', name: 'LinkedIn', settings: { icon: 'linkedin', size: '20' }, styles: { color: '#ffffff' } },
            ],
          },
          {
            type: 'stack',
            name: 'Footer Links',
            settings: { direction: 'horizontal', gap: '24', align: 'center' },
            styles: {},
            children: [
              { type: 'text', name: 'Link 1', settings: { content: 'Privacy' }, styles: { color: '#a3a3a3', fontSize: '14' } },
              { type: 'text', name: 'Link 2', settings: { content: 'Terms' }, styles: { color: '#a3a3a3', fontSize: '14' } },
              { type: 'text', name: 'Link 3', settings: { content: 'Contact' }, styles: { color: '#a3a3a3', fontSize: '14' } },
            ],
          },
          { type: 'text', name: 'Copyright', settings: { content: '© 2024 Your Company. All rights reserved.' }, styles: { color: '#737373', fontSize: '14', alignment: 'center' } },
        ],
      },
    }],
  },
]

// Helper to find relevant examples
export function findRelevantExamples(query: string, maxResults = 3): AIExample[] {
  const queryLower = query.toLowerCase()
  const words = queryLower.split(/\s+/)

  // Score each example based on keyword matches
  const scored = AI_EXAMPLES.map(example => {
    let score = 0

    // Check keywords
    for (const keyword of example.keywords) {
      if (queryLower.includes(keyword)) {
        score += 10
      }
      // Partial match
      for (const word of words) {
        if (keyword.includes(word) || word.includes(keyword)) {
          score += 3
        }
      }
    }

    // Check name and description
    if (example.name.toLowerCase().includes(queryLower)) score += 5
    if (example.description.toLowerCase().includes(queryLower)) score += 3

    return { example, score }
  })

  // Sort by score and return top results
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.example)
}
