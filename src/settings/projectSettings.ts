import type { SettingsSection } from '@/types/settings'

import GeneralCard from '@/features/project-settings/GeneralCard.vue'

// Sidebar navigation DSL
export const PROJECT_NAV: SettingsSection[] = [
  {
    id: 'designer',
    title: 'Designer',
    breadcrumbLabel: 'Designer',
    icon: 'app-designer',
    routeName: 'designer',
    showInHeader: true,
    showInCommand: true,
  },
  {
    id: 'content',
    title: 'Content',
    breadcrumbLabel: 'Content',
    icon: 'lni-text-format',
    routeName: 'content',
    showInHeader: true,
    showInCommand: true,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    breadcrumbLabel: 'Analytics',
    icon: 'app-analytics',
    routeName: 'analytics',
    requiresFeature: 'analytics',
    showInHeader: true,
    showInCommand: true,
  },
  {
    id: 'integrations',
    title: 'Integrations',
    breadcrumbLabel: 'Integrations',
    icon: 'app-integration',
    routeName: 'integration',
    requiresFeature: 'integrations',
    showInHeader: false,
    showInCommand: true,
  },
  {
    id: 'settings',
    title: 'Settings',
    breadcrumbLabel: 'Settings',
    icon: 'app-settings',
    routeName: 'settings',
    showInHeader: true,
    showInCommand: true,
  },
]

// Settings page cards DSL
import DomainCard from '@/features/project-settings/DomainCard.vue'
import SeoCard from '@/features/project-settings/SeoCard.vue'
import PublishingCard from '@/features/project-settings/PublishingCard.vue'
import AnalyticsCard from '@/features/project-settings/AnalyticsCard.vue'
import CollaboratorsCard from '@/features/project-settings/CollaboratorsCard.vue'
import PlanCard from '@/features/project-settings/PlanCard.vue'
import DangerZoneCard from '@/features/project-settings/DangerZoneCard.vue'

export const PROJECT_SETTINGS: SettingsSection[] = [
  {
    id: 'general',
    title: 'General',
    icon: 'lni-gear-1',
    component: GeneralCard,
  },
  {
    id: 'domain',
    title: 'Domain',
    icon: 'lni-globe-1',
    component: DomainCard,
  },
  {
    id: 'seo',
    title: 'SEO',
    icon: 'app-seo',
    component: SeoCard,
  },
  {
    id: 'publishing',
    title: 'Publishing',
    icon: 'lni-globe-1',
    component: PublishingCard,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: 'lni-bar-chart-4',
    component: AnalyticsCard,
  },
  {
    id: 'collaborators',
    title: 'Collaborators',
    icon: 'lni-user-multiple-4',
    component: CollaboratorsCard,
  },
  {
    id: 'plan',
    title: 'Plan',
    icon: 'lni-credit-card-multiple',
    component: PlanCard,
  },
  {
    id: 'danger',
    title: 'Danger Zone',
    component: DangerZoneCard,
  },
]
