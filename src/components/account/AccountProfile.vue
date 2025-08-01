 <!-- AccountProfile - Cleaned -->
  
<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import InputAuth from '@/components/input/InputAuth.vue'
import InputEmail from '@/components/input/InputEmail.vue'
import InputPassword from '@/components/input/InputPassword.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'
import AccountStatus from '@/components/alert/AccountStatus.vue'

const props = defineProps(['account'])

const localFirstName = ref('')
const localLastName = ref('')
const localEmail = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const isUpdatingProfile = ref(false)
const isUpdatingPassword = ref(false)
const statusMessage = ref('')
const statusType = ref('')
const showStatus = ref(false)

onMounted(() => {
  loadProfileData()
})

watch(() => props.account?.profile, (newProfile) => {
  if (newProfile) {
    loadProfileData()
  }
}, { deep: true })

function loadProfileData() {
  localFirstName.value = props.account?.profile?.first_name || ''
  localLastName.value = props.account?.profile?.last_name || ''
  localEmail.value = props.account?.profile?.email || props.account?.userEmail || ''
}

const hasProfileChanges = computed(() => {
  const currentFirstName = props.account?.profile?.first_name || ''
  const currentLastName = props.account?.profile?.last_name || ''
  
  return (
    localFirstName.value !== currentFirstName ||
    localLastName.value !== currentLastName
  )
})

const isPasswordValid = computed(() => {
  if (!newPassword.value || !confirmPassword.value) return false
  
  return newPassword.value.length >= 12 &&
         newPassword.value.length <= 128 &&
         newPassword.value === confirmPassword.value &&
         /(?=.*[a-z])/.test(newPassword.value) &&
         /(?=.*[A-Z])/.test(newPassword.value) &&
         /(?=.*\d)/.test(newPassword.value) &&
         /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?])/.test(newPassword.value)
})

function showMessage(message, type = 'success') {
  statusMessage.value = message
  statusType.value = type
  showStatus.value = true
  
  setTimeout(() => {
    showStatus.value = false
  }, type === 'success' ? 3000 : 5000)
}

async function updateProfile() {
  if (!hasProfileChanges.value) return
  
  showStatus.value = false
  isUpdatingProfile.value = true
  showMessage('Updating profile...', 'updating')
  
  try {
    const updates = {}
    
    if (localFirstName.value !== (props.account?.profile?.first_name || '')) {
      updates.first_name = localFirstName.value.trim()
    }
    if (localLastName.value !== (props.account?.profile?.last_name || '')) {
      updates.last_name = localLastName.value.trim()
    }
    
    Object.keys(updates).forEach(key => {
      if (updates[key] === '') {
        delete updates[key]
      }
    })
    
    if (Object.keys(updates).length === 0) {
      throw new Error('No changes to save')
    }
    
    const result = await props.account.updateProfile(updates)
    
    if (result.success) {
      showMessage('Profile updated successfully!', 'success')
    } else {
      throw new Error(result.error || 'Failed to update profile')
    }
    
  } catch (err) {
    showMessage(err.message || 'Failed to update profile', 'error')
  } finally {
    isUpdatingProfile.value = false
  }
}

async function updatePassword() {
  if (!isPasswordValid.value) {
    showMessage('Password does not meet requirements', 'error')
    return
  }
  
  showStatus.value = false
  isUpdatingPassword.value = true
  showMessage('Updating password...', 'updating')
  
  try {
    if (!props.account?.updatePassword) {
      throw new Error('Password update not available')
    }
    
    const result = await props.account.updatePassword(newPassword.value)
    
    if (!result || !result.success) {
      throw new Error(result?.error || 'Password update failed')
    }
    
    newPassword.value = ''
    confirmPassword.value = ''
    
    showMessage('Password updated successfully!', 'success')
    
  } catch (err) {
    showMessage(err.message || 'Password update failed', 'error')
  } finally {
    isUpdatingPassword.value = false
  }
}
</script>

<template>      
  <ul class="list">
    <ul class="form">
      <InputAuth 
        placeholder="First name"
        v-model="localFirstName" 
        :disabled="isUpdatingProfile"
      />
      <InputAuth 
        placeholder="Last name"
        v-model="localLastName" 
        :disabled="isUpdatingProfile"
      />
      <InputEmail 
        placeholder="Email address"
        v-model="localEmail"
        :disabled="true"
      />
    
      <ButtonMain
        label="Update Profile"
        @click="updateProfile"
        :buttonStyle="hasProfileChanges ? 'light' : 'disabled'"
        :disabled="!hasProfileChanges || isUpdatingProfile"
      />
      
      <AccountStatus v-if="showStatus" :message="statusMessage" :type="statusType" />
    </ul>

    <ul class="form">
      <InputPassword 
        placeholder="New password"
        v-model="newPassword"
        :disabled="isUpdatingPassword"
      />

      <InputPassword 
        placeholder="Confirm new password"
        v-model="confirmPassword"
        :disabled="isUpdatingPassword"
      />

      <ButtonMain
        label="Update Password"
        @click="updatePassword"
        :buttonStyle="isPasswordValid ? 'light' : 'disabled'"
        :disabled="!isPasswordValid || isUpdatingPassword"
      />
    </ul>
  </ul>
</template>