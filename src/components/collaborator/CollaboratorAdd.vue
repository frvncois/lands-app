<!-- CollaboratorAdd.vue - Props-based approach with global alerts -->
// CollaboratorAdd.vue - Updated script section only
<script setup>
import { ref, computed, watch } from 'vue'
import InputAuth from '@/components/input/InputAuth.vue'
import InputEmail from '@/components/input/InputEmail.vue'
import InputBoolean from '@/components/input/InputBoolean.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'
import { useAlertStore } from '@/stores/alert.js'

const props = defineProps({
  projects: {
    type: Array,
    required: true
  },
  userStore: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add', 'close'])

const alertStore = useAlertStore()

// Form data
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const selectedProjects = ref({})

// Email validation and user check states
const emailValidation = ref({
  isValid: false,
  isChecking: false,
  userExists: false,
  existingUser: null,
  message: ''
})

// Loading states
const isAdding = ref(false)

// Computed full name
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`.trim()
})

// Initialize project selection
function initializeProjectSelection() {
  selectedProjects.value = {}
  props.projects.forEach(project => {
    selectedProjects.value[project.id] = false
  })
}

// Watch email changes for real-time validation and user checking
watch(email, async (newEmail) => {
  if (!newEmail || !newEmail.includes('@')) {
    emailValidation.value = {
      isValid: false,
      isChecking: false,
      userExists: false,
      existingUser: null,
      message: ''
    }
    return
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(newEmail)) {
    emailValidation.value = {
      isValid: false,
      isChecking: false,
      userExists: false,
      existingUser: null,
      message: 'Invalid email format'
    }
    return
  }

  // Check if user exists in database
  emailValidation.value.isChecking = true
  
  try {
    const result = await props.userStore.checkUserExists(newEmail)
    
    if (result.success) {
      if (result.exists) {
        emailValidation.value = {
          isValid: true,
          isChecking: false,
          userExists: true,
          existingUser: result.user,
          message: `Will invite existing user: ${result.user.name || result.user.email}`
        }
      } else {
        emailValidation.value = {
          isValid: true,
          isChecking: false,
          userExists: false,
          existingUser: null,
          message: 'Will send invitation to create account'
        }
      }
    } else {
      emailValidation.value = {
        isValid: false,
        isChecking: false,
        userExists: false,
        existingUser: null,
        message: result.error || 'Could not verify email'
      }
    }
  } catch (error) {
    console.error('Email check error:', error)
    emailValidation.value = {
      isValid: false,
      isChecking: false,
      userExists: false,
      existingUser: null,
      message: 'Error checking email'
    }
  }
}, { debounce: 500 })

// Form validation
const canSubmit = computed(() => {
  const hasValidEmail = emailValidation.value.isValid && !emailValidation.value.isChecking
  const hasName = firstName.value.trim() && lastName.value.trim()
  const hasSelectedProjects = Object.values(selectedProjects.value).some(selected => selected)
  
  return hasValidEmail && hasName && hasSelectedProjects && !isAdding.value
})

async function addCollaborator() {
  if (!canSubmit.value) {
    alertStore.showError('Please fill all required fields and select at least one project')
    return
  }

  isAdding.value = true
  alertStore.clearAlert()

  try {
    console.log('🔄 Adding collaborator...', {
      email: email.value,
      name: fullName.value,
      selectedProjects: selectedProjects.value,
      userExists: emailValidation.value.userExists
    })

    const result = await props.userStore.inviteCollaborator({
      email: email.value,
      name: fullName.value,
      selectedProjects: selectedProjects.value
    })

    if (result.success) {
      const message = emailValidation.value.userExists 
        ? `✅ Invitation sent to ${emailValidation.value.existingUser.name || email.value}`
        : `✅ Invitation sent to ${email.value} (new user)`
      
      alertStore.showSuccess(message)
      
      // Emit the add event for parent component
      emit('add', {
        email: email.value,
        name: fullName.value,
        selectedProjects: selectedProjects.value
      })
      
      // Reset form
      firstName.value = ''
      lastName.value = ''
      email.value = ''
      initializeProjectSelection()
      
      // Close modal
      emit('close')
    } else {
      throw new Error(result.error || 'Failed to invite collaborator')
    }
  } catch (error) {
    console.error('Add collaborator error:', error)
    alertStore.showError(error.message || 'Failed to add collaborator. Please try again.')
  } finally {
    isAdding.value = false
  }
}

function handleCancel() {
  alertStore.clearAlert()
  emit('close')
}

// Initialize on mount
initializeProjectSelection()
</script>


<template>
  <ul class="modal" @click="emit('close')">
    <li class="content" @click.stop>
      <ul class="form">
        <li class="header">
          <h1>Add Collaborator</h1>
          <p>Invite collaborator to work on your project</p>
        </li>
        <label>Send invite to</label>
        <InputAuth
          label="First Name"
          placeholder="First Name"
          v-model="firstName"
          :disabled="isAdding"
        />
        <InputAuth
          label="Last Name"
          placeholder="Last name"
          v-model="lastName"
          :disabled="isAdding"
        />
        <InputEmail
          label="Email"
          placeholder="Enter email address"
          v-model="email"
          :disabled="isAdding"
        />
        <li class="status" v-if="email && email.includes('@')">
          <div v-if="emailValidation.isChecking" class="loading">
            <p>Checking email...</p>
          </div>
          <div v-else-if="emailValidation.isValid && emailValidation.userExists" class="success">
            <p>✅ {{ emailValidation.message }}</p>
          </div>
          <div v-else-if="emailValidation.isValid && !emailValidation.userExists" class="warning">
            <p>ℹ️ {{ emailValidation.message }}</p>
          </div>
          <div v-else-if="!emailValidation.isValid && emailValidation.message" class="error">
            <p>❌ {{ emailValidation.message }}</p>
          </div>
        </li>

      </ul>
      <ul class="form">
        <label>Assign to</label>
        <InputBoolean
          v-for="project in projects"
          :key="project.id"
          :label="project.name"
          v-model="selectedProjects[project.id]"
          :disabled="isAdding"
        />
        <li class="empty" v-if="projects.length === 0">
          <p>No projects available. Collaborator will be added without project assignment.</p>
        </li>
      </ul>
      <ul class="actions">
        <ButtonMain 
          label="Cancel" 
          buttonStyle="dark" 
          @click="handleCancel"
          :disabled="isAdding"
        />
        <ButtonMain 
          :label="isAdding ? 'Adding...' : 'Add'" 
          buttonStyle="light" 
          @click="addCollaborator"
          :disabled="!canSubmit"
        />
      </ul>
    </li>
  </ul>
</template>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
.header {
  padding: var(--space-lg) 0;
  border-bottom: 1px solid var(--border);
}
.form {
  padding: 0 var(--space-lg);
}
.actions {
  padding: var(--space-md);
  border-top: 1px solid var(--border);
  background-color: var(--nav);
}
</style>