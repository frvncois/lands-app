<script setup>
import { ref, onMounted } from 'vue'
import InputBoolean from '@/components/input/InputBoolean.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'

const props = defineProps(['account'])

// Local reactive copies - these don't affect the store until save
const localMarketing = ref(false)
const localAnalytics = ref(false)

// Initialize local values from props
onMounted(() => {
  localMarketing.value = props.account?.settings?.marketing || false
  localAnalytics.value = props.account?.settings?.analytics || false
})

// Save function - updates the actual store
function saveAccount() {
  // Ensure account object structure exists
  if (props.account) {
    if (!props.account.settings) {
      props.account.settings = {}
    }
    
    // Update the store/props with local values
    props.account.settings.marketing = localMarketing.value
    props.account.settings.analytics = localAnalytics.value
  }
  
  console.log('Account settings saved:', {
    marketing: localMarketing.value,
    analytics: localAnalytics.value
  })
  
  // Here you could also emit an event or call an API
  // emit('settings-saved', { marketing: localMarketing.value, analytics: localAnalytics.value })
}

// Check if there are unsaved changes
function hasChanges() {
  const currentMarketing = props.account?.settings?.marketing || false
  const currentAnalytics = props.account?.settings?.analytics || false
  
  return (
    localMarketing.value !== currentMarketing ||
    localAnalytics.value !== currentAnalytics
  )
}
</script>

<template>
  <ul class="list">
    <InputBoolean 
      label="Marketing" 
      details="Stay up to date and receive news and updates communications about Lands.app and its parent company" 
      v-model="localMarketing" 
    />
    <InputBoolean 
      label="Analytics" 
      details="Receive your monthly analytics report" 
      v-model="localAnalytics" 
    />
  </ul>
      <ButtonMain
      label="Update settings"
      @click="saveAccount"
      :buttonStyle="hasChanges() ? 'light' : 'dark'"
    />
</template>

<style scoped>
ul.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg) 0;
}
</style>