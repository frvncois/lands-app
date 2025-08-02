<!-- CollaboratorEdit.vue - Props-based approach with global alerts -->
<script setup>
import { ref, onMounted } from 'vue'
import { useAlertStore } from '@/stores/alert'
import InputAuth from '@/components/input/InputAuth.vue'
import InputEmail from '@/components/input/InputEmail.vue'
import InputBoolean from '@/components/input/InputBoolean.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'

const props = defineProps({
  collaborator: {
    type: Object,
    required: true
  },
  projects: {
    type: Array,
    required: true
  },
  getProjectsByCollaborator: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update', 'remove', 'close'])

// Import alert store
const alertStore = useAlertStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const selectedProjects = ref({})
const isUpdating = ref(false)
const isRemoving = ref(false)

// Initialize selectedProjects when component mounts
function initializeProjectSelection() {
  const newSelection = {}
  const collaboratorProjects = props.getProjectsByCollaborator(props.collaborator.accountId)
  
  props.projects.forEach(project => {
    newSelection[project.id] = collaboratorProjects.includes(project.id)
  })
  selectedProjects.value = newSelection
}

onMounted(() => {
  // Split the name into first and last name
  const fullName = props.collaborator.name || ''
  const nameParts = fullName.trim().split(' ')
  firstName.value = nameParts[0] || ''
  lastName.value = nameParts.slice(1).join(' ') || ''
  
  email.value = props.collaborator.email || ''
  initializeProjectSelection()
})

async function updateCollaborator() {
  // Validation
  const fullName = `${firstName.value.trim()} ${lastName.value.trim()}`.trim()
  
  if (!fullName.trim() || !email.value.trim()) {
    alertStore.showError('Please fill in all required fields')
    return
  }

  // Get selected project IDs from the boolean object
  const selectedProjectIds = Object.keys(selectedProjects.value)
    .filter(projectId => selectedProjects.value[projectId])

  isUpdating.value = true
  
  // Show updating alert
  alertStore.showUpdating('Updating collaborator...')

  try {
    // Simulate async operation with proper delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Emit the update event to parent component
    emit('update', props.collaborator.accountId, {
      name: fullName,
      email: email.value,
      selectedProjects: selectedProjectIds
    })

    // Show success alert and close modal immediately
    alertStore.showSuccess('Collaborator updated successfully!')
    emit('close')

  } catch (error) {
    console.error('Update collaborator error:', error)
    alertStore.showError('Failed to update collaborator. Please try again.')
  } finally {
    isUpdating.value = false
  }
}

async function removeCollaborator() {
  if (!confirm('Are you sure you want to remove this collaborator?')) {
    return
  }

  isRemoving.value = true
  
  // Show updating alert
  alertStore.showUpdating('Removing collaborator...')

  try {
    // Simulate async operation with proper delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Emit the remove event to parent component
    emit('remove', props.collaborator.accountId)
    
    // Show success alert and close modal immediately
    alertStore.showSuccess('Collaborator removed successfully!')
    emit('close')

  } catch (error) {
    console.error('Remove collaborator error:', error)
    alertStore.showError('Failed to remove collaborator. Please try again.')
  } finally {
    isRemoving.value = false
  }
}
</script>

<template>
  <ul class="modal" @click="emit('close')">
    <li class="content" @click.stop>
      <ul class="form">
        <li class="header">
          <h1>Edit Collaborator</h1>
          <p>Update collaborator information and project assignments</p>
        </li>
        <label>Update details</label>
        <InputAuth
          label="First Name"
          placeholder="First Name"
          v-model="firstName"
          :disabled="isUpdating || isRemoving"
        />
        <InputAuth
          label="Last Name"
          placeholder="Last name"
          v-model="lastName"
          :disabled="isUpdating || isRemoving"
        />
        <InputEmail
          label="Email"
          placeholder="Enter email address"
          v-model="email"
          :disabled="isUpdating || isRemoving"
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
          :disabled="isUpdating || isRemoving"
        />
        <li class="empty" v-if="projects.length === 0">
        <p>No projects available. Collaborator will be added without project assignment.</p>
        </li>
      </ul>
      <ul class="actions">
        <ButtonMain 
          label="Remove" 
          buttonStyle="remove" 
          @click="removeCollaborator"
          :disabled="isUpdating || isRemoving"
        />
        <ButtonMain 
          label="Cancel" 
          buttonStyle="dark" 
          @click="emit('close')"
          :disabled="isUpdating || isRemoving"
        />
        <ButtonMain 
          label="Update" 
          buttonStyle="light" 
          @click="updateCollaborator"
          :disabled="isUpdating || isRemoving"
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