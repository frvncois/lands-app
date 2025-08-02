<!-- CollaboratorAdd.vue - Props-based approach with global alerts -->
<script setup>
import { ref, onMounted } from 'vue'
import { useAlertStore } from '@/stores/alert'
import InputAuth from '@/components/input/InputAuth.vue'
import InputEmail from '@/components/input/InputEmail.vue'
import InputBoolean from '@/components/input/InputBoolean.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'

const props = defineProps({
  projects: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['add', 'close'])

// Import alert store
const alertStore = useAlertStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const selectedProjects = ref({})
const isAdding = ref(false)

// Initialize selectedProjects when component mounts
function initializeProjectSelection() {
  const newSelection = {}
  props.projects.forEach(project => {
    newSelection[project.id] = false
  })
  selectedProjects.value = newSelection
}

onMounted(() => {
  initializeProjectSelection()
})

async function addCollaborator() {
  // Validation
  const fullName = `${firstName.value.trim()} ${lastName.value.trim()}`.trim()
  
  if (!fullName.trim() || !email.value.trim()) {
    alertStore.showError('Please fill in all required fields')
    return
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value.trim())) {
    alertStore.showError('Please enter a valid email address')
    return
  }

  // Get selected project IDs from the boolean object
  const selectedProjectIds = Object.keys(selectedProjects.value)
    .filter(projectId => selectedProjects.value[projectId])

  isAdding.value = true
  
  // Show updating alert
  alertStore.showUpdating('Adding collaborator...')

  try {
    // Simulate async operation with proper delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Emit to parent with collaborator data
    emit('add', {
      name: fullName,
      email: email.value.trim(),
      selectedProjects: selectedProjectIds
    })

    // Show success alert
    alertStore.showSuccess('Collaborator added successfully!')
    
    // Reset form
    firstName.value = ''
    lastName.value = ''
    email.value = ''
    initializeProjectSelection()
    
    // Close modal immediately
    emit('close')

  } catch (error) {
    console.error('Add collaborator error:', error)
    alertStore.showError('Failed to add collaborator. Please try again.')
  } finally {
    isAdding.value = false
  }
}

function handleCancel() {
  // Clear any alerts when canceling
  alertStore.clearAlert()
  emit('close')
}
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
      </ul>
      <ul class="form">
        <label>Assign to</label>
        <InputBoolean
          v-for="project in projects"
          :key="project.id"
          :label="project.name"
          :details="project.description || 'Project'"
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
          label="Add" 
          buttonStyle="light" 
          @click="addCollaborator"
          :disabled="isAdding"
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