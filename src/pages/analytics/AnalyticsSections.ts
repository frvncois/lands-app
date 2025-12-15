import type { SettingsSection } from '@/types/settings'

import AnalyticsOverview from './sections/AnalyticsOverview.vue'
import AnalyticsTraffic from './sections/AnalyticsTraffic.vue'
import AnalyticsSources from './sections/AnalyticsSources.vue'
import AnalyticsDevices from './sections/AnalyticsDevices.vue'

export const ANALYTICS_SECTIONS: SettingsSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    component: AnalyticsOverview,
  },
  {
    id: 'traffic',
    title: 'Traffic',
    component: AnalyticsTraffic,
  },
  {
    id: 'sources',
    title: 'Sources',
    component: AnalyticsSources,
  },
  {
    id: 'devices',
    title: 'Devices',
    component: AnalyticsDevices,
  },
]
