<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAccountStore } from '@/stores/account'
import SectionTitle from '@/components/global/SectionTitle.vue'
import NavTab from '@/components/global/NavTab.vue'
import AccountProfile from '@/components/account/AccountProfile.vue'
// import BillingSettings from '@/components/account/BillingSettings.vue'
import AccountSettings from '@/components/account/AccountSettings.vue'

const route = useRoute()
const accountStore = useAccountStore()

const activeTab = ref('profile')
const tabItems = [
  { id: 'profile', label: 'Profile' },
  { id: 'billing', label: 'Billing' },
  { id: 'settings', label: 'Settings' }
]

function handleTabChange(tabId) {
  activeTab.value = tabId
}
</script>

<template>
  <ul class="content">
    <li>
      <SectionTitle
        title="Account Settings"
        buttonLabel="Need help?"
        buttonStyle="dark"
        @action="showModal = true"
      />
    </li>
    <li>
      <NavTab
        :items="tabItems"
        :activeTab="activeTab"
        @tab-change="handleTabChange"
      />
    </li>
    <li v-if="activeTab === 'profile'">
      <!-- Pass the entire account store so AccountProfile can access profile data -->
      <AccountProfile :account="accountStore" />
    </li>
    <li v-if="activeTab === 'billing'">
      Billing content here
    </li>
    <li v-if="activeTab === 'settings'">
      <AccountSettings :account="accountStore" />
    </li>
  </ul>
</template>