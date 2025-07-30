import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProjectStore } from './projects'
import { useTeamStore } from './team'

export const useAccountStore = defineStore('account', () => {
  const firstName = ref('')
  const lastName = ref('')
  const email = ref('')
  const password = ref('')
  const isAuthenticated = ref(false)
  
  // Account status management
  const status = ref('') // 'NewAccount', 'Confirmed', 'Delete'
  const statusTimestamp = ref(null) // Timestamp for status tracking

  // Settings for AccountSettings component
  const settings = ref({
    marketing: false,
    analytics: false
  })

  // Get projects from project store
  const userProjects = computed(() => {
    const projectStore = useProjectStore()
    return projectStore.projects
  })

  // Check if user should see create project modal
  const shouldShowCreateModal = computed(() => {
    return status.value === 'NewAccount' && userProjects.value.length === 0
  })

  // Check if account is eligible for cleanup (30+ days as NewAccount)
  const isEligibleForCleanup = computed(() => {
    if (status.value !== 'NewAccount' || !statusTimestamp.value) return false
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    return new Date(statusTimestamp.value) < thirtyDaysAgo
  })

  // Check if account is in grace period for deletion (7 days)
  const isInGracePeriod = computed(() => {
    if (status.value !== 'Delete' || !statusTimestamp.value) return false
    
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    return new Date(statusTimestamp.value) > sevenDaysAgo
  })

  // Computed account object for easy component access
  const account = computed(() => ({
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    password: password.value,
    settings: settings.value,
    status: status.value,
    statusTimestamp: statusTimestamp.value
  }))

  function login(loginData) {
    firstName.value = loginData.firstName
    lastName.value = loginData.lastName
    email.value = loginData.email
    isAuthenticated.value = true

    // Set status to NewAccount for new registrations
    status.value = 'NewAccount'
    statusTimestamp.value = new Date().toISOString()

    // Initialize settings if provided, otherwise use defaults
    if (loginData.settings) {
      settings.value = { ...settings.value, ...loginData.settings }
    }
  }

  function confirmAccount() {
    status.value = 'Confirmed'
    statusTimestamp.value = new Date().toISOString()
  }

  function requestAccountDeletion() {
    status.value = 'Delete'
    statusTimestamp.value = new Date().toISOString()
  }

  function cancelAccountDeletion() {
    // Restore to confirmed status if canceling deletion
    status.value = 'Confirmed'
    statusTimestamp.value = new Date().toISOString()
  }

  function logout() {
    // Clear account data
    firstName.value = ''
    lastName.value = ''
    email.value = ''
    password.value = ''
    isAuthenticated.value = false
    status.value = ''
    statusTimestamp.value = null

    // Reset settings to defaults
    settings.value = {
      marketing: false,
      analytics: false
    }

    // Clear project store
    const projectStore = useProjectStore()
    projectStore.reset()

    // Clear team store
    const teamStore = useTeamStore()
    teamStore.reset()

    // Clear localStorage
    localStorage.removeItem('account')
    localStorage.removeItem('projects')
    localStorage.removeItem('team')
  }

  function updateProfile(data) {
    firstName.value = data.firstName || firstName.value
    lastName.value = data.lastName || lastName.value
    email.value = data.email || email.value
    password.value = data.password || password.value
  }

  function updateSettings(newSettings) {
    settings.value = { ...settings.value, ...newSettings }
  }

  function reset() {
    firstName.value = ''
    lastName.value = ''
    email.value = ''
    password.value = ''
    status.value = ''
    statusTimestamp.value = null
    settings.value = {
      marketing: false,
      analytics: false
    }
  }

  return {
    firstName,
    lastName,
    email,
    password,
    isAuthenticated,
    status,
    statusTimestamp,
    settings,
    userProjects,
    account,
    shouldShowCreateModal,
    isEligibleForCleanup,
    isInGracePeriod,
    login,
    confirmAccount,
    requestAccountDeletion,
    cancelAccountDeletion,
    logout,
    updateProfile,
    updateSettings,
    reset
  }
}, {
  persist: true
})