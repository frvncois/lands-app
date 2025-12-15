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
    id: 'email',
    title: 'Email Marketing',
    component: IntegrationsCategory,
  },
  {
    id: 'payment',
    title: 'Payments',
    component: IntegrationsCategory,
  },
  {
    id: 'automation',
    title: 'Automation',
    component: IntegrationsCategory,
  },
]
