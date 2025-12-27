import type { SettingsSection } from '@/types/settings'

import IntegrationsConnected from './sections/IntegrationsConnected.vue'
import IntegrationsCategory from './sections/IntegrationsCategory.vue'

export const INTEGRATIONS_SECTIONS: SettingsSection[] = [
  {
    id: 'connected',
    title: 'Connected',
    component: IntegrationsConnected,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    component: IntegrationsCategory,
  },
  {
    id: 'calendar',
    title: 'Calendar',
    component: IntegrationsCategory,
  },
  {
    id: 'payment',
    title: 'Payments & E-commerce',
    component: IntegrationsCategory,
  },
  {
    id: 'music',
    title: 'Music & Audio',
    component: IntegrationsCategory,
  },
  {
    id: 'email',
    title: 'Email Marketing',
    component: IntegrationsCategory,
  },
  {
    id: 'automation',
    title: 'Automation',
    component: IntegrationsCategory,
  },
]
