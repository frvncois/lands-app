import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export function useAccountActions() {
  const userStore = useUserStore()

  return {
    settings: computed(() => userStore.settings),

    updateProfile: (data: { name?: string; email?: string }) =>
      userStore.updateProfile(data),

    updatePreferences: (data: {
      theme?: 'light' | 'dark' | 'system'
      emailNotifications?: boolean
      marketingEmails?: boolean
    }) => userStore.updatePreferences(data),
  }
}
