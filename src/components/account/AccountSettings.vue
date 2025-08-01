 <!-- AccountSettings - Cleaned -->

<script setup>
import { ref, onMounted, computed } from 'vue'
import InputBoolean from '@/components/input/InputBoolean.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'
import AccountStatus from '@/components/alert/AccountStatus.vue'

const props = defineProps(['account'])

const localMarketing = ref(false)
const localAnalytics = ref(false)
const isUpdatingSettings = ref(false)
const statusMessage = ref('')
const statusType = ref('')
const showStatus = ref(false)

onMounted(() => {
  localMarketing.value = props.account?.settings?.marketing || false
  localAnalytics.value = props.account?.settings?.analytics || false
})

const hasChanges = computed(() => {
  const currentMarketing = props.account?.settings?.marketing || false
  const currentAnalytics = props.account?.settings?.analytics || false
  
  return (
    localMarketing.value !== currentMarketing ||
    localAnalytics.value !== currentAnalytics
  )
})

function showMessage(message, type = 'success') {
  statusMessage.value = message
  statusType.value = type
  showStatus.value = true
  
  setTimeout(() => {
    showStatus.value = false
  }, type === 'success' ? 3000 : 5000)
}

async function saveAccount() {
  if (!hasChanges.value) return
  
  showStatus.value = false
  isUpdatingSettings.value = true
  showMessage('Updating settings...', 'updating')
  
  try {
    if (props.account) {
      if (!props.account.settings) {
        props.account.settings = {}
      }
      props.account.settings.marketing = localMarketing.value
      props.account.settings.analytics = localAnalytics.value
    }
    
    showMessage('Settings updated successfully!', 'success')
    
  } catch (err) {
    showMessage(err.message || 'Failed to update settings', 'error')
  } finally {
    isUpdatingSettings.value = false
  }
}
</script>

<template>
  <ul class="list">
    <ul class="form">
      <InputBoolean 
        label="Marketing" 
        details="Stay up to date and receive news and updates communications about Lands.app and its parent company" 
        v-model="localMarketing" 
        :disabled="isUpdatingSettings"
      />
      <InputBoolean 
        label="Analytics" 
        details="Receive your monthly analytics report" 
        v-model="localAnalytics" 
        :disabled="isUpdatingSettings"
      />
      <ButtonMain
        label="Update settings"
        @click="saveAccount"
        :buttonStyle="hasChanges ? 'light' : 'disabled'"
        :disabled="!hasChanges || isUpdatingSettings"
      />
      <AccountStatus v-if="showStatus" :message="statusMessage" :type="statusType" />
    </ul>
  </ul>
</template>