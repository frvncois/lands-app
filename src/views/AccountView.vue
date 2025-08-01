 <!-- AccountView: Secure user account management with authentication guards -->
<script setup>
import { ref, computed, onMounted, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountStore } from '@/stores/account'
import SectionTitle from '@/components/global/SectionTitle.vue'
import NavTab from '@/components/global/NavTab.vue'
import AccountProfile from '@/components/account/AccountProfile.vue'
import AccountSettings from '@/components/account/AccountSettings.vue'
import AccountStatus from '@/components/alert/AccountStatus.vue'

const router = useRouter()
const accountStore = useAccountStore()
const activeTab = ref('profile')
const componentError = ref(null)
const isLoading = ref(true)

const tabItems = [
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' }
]

const isAuthenticated = computed(() => accountStore.isAuthenticated)

const profileData = computed(() => ({
  profile: accountStore.profile,
  userEmail: accountStore.userEmail,
  updateProfile: accountStore.updateProfile
}))

const settingsData = computed(() => ({
  settings: accountStore.profile?.settings || {},
  updateSettings: accountStore.updateProfile
}))

onErrorCaptured((error, instance, info) => {
  componentError.value = `Component error: ${error.message}`
  return false
})

onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/')
    return
  }
  
  try {
    if (!accountStore.profile?.id) {
      await accountStore.loadUserData()
    }
  } catch (error) {
    componentError.value = 'Failed to load account data'
  } finally {
    isLoading.value = false
  }
})

function handleTabChange(tabId) {
  activeTab.value = tabId
  componentError.value = null 
}
</script>

<template>
  <ul class="content">
    <li>
      <SectionTitle title="Account Settings" />
    </li>
    
    <AccountStatus v-if="isLoading" message="Loading account data..." type="updating" />
    <AccountStatus v-else-if="componentError" :message="componentError" type="error" />
    <AccountStatus v-else-if="!isAuthenticated" message="Authentication required" type="error" />
    
    <template v-else>
      <li>
        <NavTab 
          :items="tabItems" 
          :activeTab="activeTab" 
          @tab-change="handleTabChange" 
        />
      </li>
      
      <li v-if="activeTab === 'profile'">
        <AccountProfile :account="profileData" />
      </li>
      
      <li v-if="activeTab === 'settings'">
        <AccountSettings :account="settingsData" />
      </li>
    </template>
  </ul>
</template>