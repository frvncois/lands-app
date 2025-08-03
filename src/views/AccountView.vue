<script setup>
import { ref, computed } from 'vue'
import SectionTitle from '@/components/global/SectionTitle.vue'
import NavTab from '@/components/global/NavTab.vue'
import AccountProfile from '@/components/account/AccountProfile.vue'
import AccountSettings from '@/components/account/AccountSettings.vue'

const props = defineProps({
  userStore: {
    type: Object,
    required: true
  }
})

const activeTab = ref('profile')

const tabItems = [
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' }
]

// Just use the data that's already loaded
const profileData = computed(() => ({
  profile: props.userStore.profile,
  userEmail: props.userStore.userEmail,
  updateProfile: props.userStore.updateProfile
}))

const settingsData = computed(() => ({
  settings: props.userStore.profile?.settings || {},
  updateSettings: props.userStore.updateProfile
}))

function handleTabChange(tabId) {
  activeTab.value = tabId
}
</script>

<template>
  <ul class="content">
    <li>
      <SectionTitle title="Account Settings" />
    </li>
    
    <li>
      <NavTab 
        :items="tabItems" 
        :activeTab="activeTab" 
        @tab-change="handleTabChange" 
      />
    </li>
    
    <li v-if="activeTab === 'profile'">
      <AccountProfile 
        :account="profileData" 
        :user-store="userStore"
      />
    </li>
    
    <li v-if="activeTab === 'settings'">
      <AccountSettings 
        :account="settingsData"
        :user-store="userStore"
      />
    </li>
  </ul>
</template>