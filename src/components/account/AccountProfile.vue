<script setup>
import { ref, onMounted } from 'vue'
import InputNormal from '@/components/input/InputNormal.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'

const props = defineProps(['account'])

// Local reactive copies - these don't affect the store until save
const localFirstName = ref('')
const localLastName = ref('')
const localEmail = ref('')
const localPassword = ref('')

// Initialize local values from props
onMounted(() => {
  localFirstName.value = props.account?.firstName || ''
  localLastName.value = props.account?.lastName || ''
  localEmail.value = props.account?.email || ''
  localPassword.value = props.account?.password || ''
})

// Save function - updates the actual store
function saveAccount() {
  // Update the store/props with local values
  if (props.account) {
    props.account.firstName = localFirstName.value
    props.account.lastName = localLastName.value
    props.account.email = localEmail.value
    props.account.password = localPassword.value
  }
  
  console.log('Account saved:', {
    firstName: localFirstName.value,
    lastName: localLastName.value,
    email: localEmail.value,
    password: localPassword.value
  })
  
  // Here you could also emit an event or call an API
  // emit('account-saved', { ... })
}

// Check if there are unsaved changes
function hasChanges() {
  return (
    localFirstName.value !== (props.account?.firstName || '') ||
    localLastName.value !== (props.account?.lastName || '') ||
    localEmail.value !== (props.account?.email || '') ||
    localPassword.value !== (props.account?.password || '')
  )
}
</script>

<template>
  <ul class="list">
    <InputNormal label="First Name" v-model="localFirstName" />
    <InputNormal label="Last Name" v-model="localLastName" />
    <InputNormal label="Email" type="email" v-model="localEmail" />
    <InputNormal label="Password" type="password" v-model="localPassword" />
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