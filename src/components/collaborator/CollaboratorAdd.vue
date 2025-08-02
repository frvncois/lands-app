<!-- CollaboratorAdd.vue - Props-based approach -->
<script setup>
import { ref, onMounted } from 'vue'
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

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const selectedProjects = ref({})

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

function addCollaborator() {
  // Get selected project IDs from the boolean object
  const selectedProjectIds = Object.keys(selectedProjects.value)
    .filter(projectId => selectedProjects.value[projectId])

  // Combine first and last name
  const fullName = `${firstName.value.trim()} ${lastName.value.trim()}`.trim()

  console.log('Add collaborator called', {
    name: fullName,
    email: email.value,
    projects: selectedProjectIds,
    projectsLength: selectedProjectIds.length
  })

  if (fullName.trim() && email.value.trim()) {
    // Emit to parent with collaborator data
    emit('add', {
      name: fullName,
      email: email.value,
      selectedProjects: selectedProjectIds
    })

    // Reset form
    firstName.value = ''
    lastName.value = ''
    email.value = ''
    initializeProjectSelection()
    emit('close')
  } else {
    console.log('Validation failed', {
      hasName: !!fullName.trim(),
      hasEmail: !!email.value.trim()
    })
  }
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
        <ButtonMain label="Cancel" buttonStyle="dark" @click="emit('close')" />
        <ButtonMain label="Add" buttonStyle="light" @click="addCollaborator" />
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