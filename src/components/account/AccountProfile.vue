<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import InputAuth from '@/components/input/InputAuth.vue'
import InputEmail from '@/components/input/InputEmail.vue'
import InputPassword from '@/components/input/InputPassword.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'

const props = defineProps(['account'])

// Local reactive copies - these don't affect the store until save
const localFirstName = ref('')
const localLastName = ref('')
const localEmail = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// UI state
const isUpdatingProfile = ref(false)
const isUpdatingPassword = ref(false)
const showPasswordSection = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)

// Rate limiting
const lastProfileUpdate = ref(parseInt(localStorage.getItem('last_profile_update') || '0'))
const profileUpdateCount = ref(parseInt(localStorage.getItem('profile_update_count') || '0'))
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const MAX_UPDATES_PER_WINDOW = 3

// Initialize local values from account store profile
onMounted(() => {
  console.log('🔍 AccountProfile mounted, account store data:', {
    profile: props.account?.profile,
    userEmail: props.account?.userEmail,
    user: props.account?.user
  })
  
  loadProfileData()
})

// Watch for changes in the account store data
watch(() => props.account?.profile, (newProfile) => {
  console.log('👀 Profile data changed:', newProfile)
  if (newProfile) {
    loadProfileData()
  }
}, { deep: true })

function loadProfileData() {
  // Get data from account store profile
  localFirstName.value = props.account?.profile?.first_name || ''
  localLastName.value = props.account?.profile?.last_name || ''
  localEmail.value = props.account?.profile?.email || props.account?.userEmail || ''
  
  console.log('📋 Loaded profile data:', {
    firstName: localFirstName.value,
    lastName: localLastName.value,
    email: localEmail.value
  })
}

// Check if there are unsaved profile changes
const hasProfileChanges = computed(() => {
  const currentFirstName = props.account?.profile?.first_name || ''
  const currentLastName = props.account?.profile?.last_name || ''
  const currentEmail = props.account?.profile?.email || props.account?.userEmail || ''
  
  return (
    localFirstName.value !== currentFirstName ||
    localLastName.value !== currentLastName ||
    localEmail.value !== currentEmail
  )
})

// Check if password fields are valid
const isPasswordValid = computed(() => {
  if (!newPassword.value || !confirmPassword.value) return false
  
  return newPassword.value.length >= 12 &&
         newPassword.value === confirmPassword.value &&
         /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?])/.test(newPassword.value)
})

// Rate limiting check
function checkRateLimit() {
  const now = Date.now()
  const timeSinceLastUpdate = now - lastProfileUpdate.value
  
  // Reset count if window has passed
  if (timeSinceLastUpdate > RATE_LIMIT_WINDOW) {
    profileUpdateCount.value = 0
    localStorage.removeItem('profile_update_count')
  }
  
  if (profileUpdateCount.value >= MAX_UPDATES_PER_WINDOW) {
    const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - timeSinceLastUpdate) / 1000)
    throw new Error(`Too many updates. Please wait ${remainingTime} seconds before trying again.`)
  }
  
  return true
}

// Update profile information
async function updateProfile() {
  if (!hasProfileChanges.value) return
  
  // Clear previous messages
  showError.value = false
  showSuccess.value = false
  
  try {
    // Check rate limiting
    checkRateLimit()
    
    isUpdatingProfile.value = true
    
    const updates = {
      first_name: localFirstName.value.trim(),
      last_name: localLastName.value.trim()
      // Note: Email updates should be handled separately for security
    }
    
    // Remove empty values
    Object.keys(updates).forEach(key => {
      if (updates[key] === '') {
        delete updates[key]
      }
    })
    
    console.log('📤 Sending profile updates:', updates)
    
    // Call the account store's updateProfile method
    const result = await props.account.updateProfile(updates)
    
    if (result.success) {
      console.log('✅ Profile updated successfully')
      
      // Update rate limiting
      profileUpdateCount.value++
      lastProfileUpdate.value = Date.now()
      localStorage.setItem('profile_update_count', profileUpdateCount.value.toString())
      localStorage.setItem('last_profile_update', lastProfileUpdate.value.toString())
      
      successMessage.value = 'Profile updated successfully!'
      showSuccess.value = true
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
      
    } else {
      throw new Error(result.error || 'Failed to update profile')
    }
    
  } catch (err) {
    console.error('❌ Profile update failed:', err)
    errorMessage.value = err.message || 'Failed to update profile. Please try again.'
    showError.value = true
  } finally {
    isUpdatingProfile.value = false
  }
}

// Update password using Supabase auth
async function updatePassword() {
  console.log('🚀 updatePassword function called')
  console.log('🔍 Password valid:', isPasswordValid.value)
  console.log('🔍 New password length:', newPassword.value.length)
  console.log('🔍 Passwords match:', newPassword.value === confirmPassword.value)
  
  if (!isPasswordValid.value) {
    console.warn('❌ Password validation failed:', {
      newPasswordLength: newPassword.value.length,
      passwordsMatch: newPassword.value === confirmPassword.value,
      hasComplexity: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?])/.test(newPassword.value)
    })
    errorMessage.value = 'Password validation failed. Please check requirements.'
    showError.value = true
    return
  }
  
  // Clear previous messages
  showError.value = false
  showSuccess.value = false
  
  console.log('🔍 Account prop exists:', !!props.account)
  console.log('🔍 UpdatePassword method exists:', !!props.account?.updatePassword)
  console.log('🔍 Account methods:', Object.keys(props.account || {}))
  
  try {
    isUpdatingPassword.value = true
    console.log('🔄 Setting isUpdatingPassword to true')
    
    // Check if updatePassword method exists
    if (!props.account?.updatePassword) {
      throw new Error('Password update method not available on account store')
    }
    
    console.log('📞 About to call account store updatePassword...')
    
    // Use account store's updatePassword method
    const result = await props.account.updatePassword(newPassword.value)
    
    console.log('📋 Password update result received:', result)
    
    if (!result || !result.success) {
      const errorMsg = result?.error || 'Unknown error occurred'
      console.error('❌ Password update failed:', errorMsg)
      throw new Error(errorMsg)
    }
    
    console.log('✅ Password update completed successfully')
    
    // Clear password fields
    newPassword.value = ''
    confirmPassword.value = ''
    showPasswordSection.value = false
    
    successMessage.value = 'Password updated successfully!'
    showSuccess.value = true
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      showSuccess.value = false
    }, 5000)
    
  } catch (err) {
    console.error('❌ Password update exception caught:', err)
    console.error('Exception details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    })
    errorMessage.value = `Password update failed: ${err.message}`
    showError.value = true
  } finally {
    console.log('🔄 Setting isUpdatingPassword to false')
    isUpdatingPassword.value = false
  }
}

// Toggle password section
function togglePasswordSection() {
  showPasswordSection.value = !showPasswordSection.value
  if (!showPasswordSection.value) {
    // Clear password fields when hiding
    newPassword.value = ''
    confirmPassword.value = ''
  }
}

// Validate password strength
function validatePassword(password) {
  const errors = []
  
  if (password.length < 12) {
    errors.push('At least 12 characters')
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('One lowercase letter')
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('One uppercase letter')
  }
  if (!/(?=.*\d)/.test(password)) {
    errors.push('One number')
  }
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?])/.test(password)) {
    errors.push('One special character')
  }
  
  return errors
}

const passwordErrors = computed(() => {
  if (!newPassword.value) return []
  return validatePassword(newPassword.value)
})

const passwordsMatch = computed(() => {
  if (!newPassword.value || !confirmPassword.value) return true
  return newPassword.value === confirmPassword.value
})
</script>

<template>      
      <ul class="list">

            <div v-if="showSuccess" class="message success">
      {{ successMessage }}
    </div>
    
    <!-- Error Message -->
    <div v-if="showError" class="message error">
      {{ errorMessage }}
    </div>

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
      
      <li v-if="isUpdatingProfile" class="loading-text">
        Updating profile...
      </li>
    </ul>
    
        <ul class="list">
          <InputPassword 
            placeholder="New password"
            v-model="newPassword"
            label="Change password"
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

        <li v-if="isUpdatingPassword" class="loading-text">
          Updating password...
        </li>
        

        </ul>

    
    <!-- Rate Limit Warning -->
    <div v-if="profileUpdateCount >= 2" class="rate-limit-warning">
      ⚠️ You have {{ MAX_UPDATES_PER_WINDOW - profileUpdateCount }} profile updates remaining in the next minute.
    </div>
</template>

<style scoped>
ul.list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg) 0 0 0;
}
</style>