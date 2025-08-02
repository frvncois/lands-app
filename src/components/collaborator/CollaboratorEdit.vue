<!-- CollaboratorEdit.vue - Props-based approach -->
<script setup>
import { ref, onMounted } from 'vue'
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

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const selectedProjects = ref({})

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

function updateCollaborator() {
  // Get selected project IDs from the boolean object
  const selectedProjectIds = Object.keys(selectedProjects.value)
    .filter(projectId => selectedProjects.value[projectId])

  // Combine first and last name
  const fullName = `${firstName.value.trim()} ${lastName.value.trim()}`.trim()

  console.log('Update collaborator called', {
    name: fullName,
    email: email.value,
    projects: selectedProjectIds,
    projectsLength: selectedProjectIds.length
  })

  if (fullName.trim() && email.value.trim()) {
    emit('update', props.collaborator.accountId, {
      name: fullName,
      email: email.value,
      selectedProjects: selectedProjectIds
    })
  } else {
    console.log('Validation failed', {
      hasName: !!fullName.trim(),
      hasEmail: !!email.value.trim()
    })
  }
}

function removeCollaborator() {
  if (confirm('Are you sure you want to remove this collaborator?')) {
    emit('remove', props.collaborator.accountId)
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
        />
        <InputAuth
          label="Last Name"
          placeholder="Last name"
          v-model="lastName"
        />
        <InputEmail
          label="Email"
          placeholder="Enter email address"
          v-model="email"
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
        />
        <p v-if="projects.length === 0">No projects available. Collaborator will be added without project assignment.</p>
      </ul>
      <ul class="actions">
        <ButtonMain label="Remove" buttonStyle="remove" @click="removeCollaborator" />
        <ButtonMain label="Cancel" buttonStyle="dark" @click="emit('close')" />
        <ButtonMain label="Update" buttonStyle="light" @click="updateCollaborator" />
      </ul>
    </li>
  </ul>
</template>

<style scoped>
ul.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(1em);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  > li.content {
    background: var(--card);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    width: 33vw;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }
}
</style>