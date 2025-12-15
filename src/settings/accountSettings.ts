import type { SettingsSection } from '@/types/settings'

import AccountProfileCard from '@/features/account/AccountProfileCard.vue'
import AccountPreferencesCard from '@/features/account/AccountPreferencesCard.vue'
import AccountNotificationsCard from '@/features/account/AccountNotificationsCard.vue'
import AccountBillingCard from '@/features/account/AccountBillingCard.vue'
import AccountInvoicesCard from '@/features/account/AccountInvoicesCard.vue'
import AccountProjectsCard from '@/features/projects/AccountProjectsCard.vue'
import AccountDangerZone from '@/features/account/AccountDangerZone.vue'

export const ACCOUNT_SETTINGS: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Profile',
    icon: 'lni-user-4',
    component: AccountProfileCard,
  },
  {
    id: 'preferences',
    title: 'Preferences',
    icon: 'lni-gear-1',
    component: AccountPreferencesCard,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'lni-bell-1',
    component: AccountNotificationsCard,
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: 'lni-folder-1',
    component: AccountProjectsCard,
  },
  {
    id: 'billing',
    title: 'Billing',
    icon: 'lni-credit-card-multiple',
    component: AccountBillingCard,
  },
  {
    id: 'invoices',
    title: 'Invoices',
    icon: 'lni-receipt-2',
    component: AccountInvoicesCard,
  },
  {
    id: 'danger',
    title: 'Danger Zone',
    component: AccountDangerZone,
  },
]
