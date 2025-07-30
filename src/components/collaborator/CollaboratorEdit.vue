<script setup>
import { ref, onMounted } from 'vue'
import InputNormal from '@/components/input/InputNormal.vue'
import ButtonSubmit from '@/components/button/ButtonMain.vue'
import { useProjectStore } from '@/stores/projects'
import { useTeamStore } from '@/stores/team'

const props = defineProps(['collaborator'])
const emit = defineEmits(['close'])
const projectStore = useProjectStore()
const teamStore = useTeamStore()

const name = ref('')
const email = ref('')
const selectedProjects = ref([])

onMounted(() => {
  name.value = props.collaborator.name
  email.value = props.collaborator.email
  selectedProjects.value = teamStore.getProjectsByCollaborator(props.collaborator.accountId)
})

function updateCollaborator() {
  // Update account info
  teamStore.addAccountInfo(props.collaborator.accountId, {
    name: name.value,
    email: email.value
  })
  
  // Get current projects and update
  const currentProjects = teamStore.getProjectsByCollaborator(props.collaborator.accountId)
  
  // Remove from projects not selected
  currentProjects.forEach(projectId => {
    if (!selectedProjects.value.includes(projectId)) {
      teamStore.removeCollaboratorFromProject(projectId, props.collaborator.accountId)
    }
  })
  
  // Add to newly selected projects
  selectedProjects.value.forEach(projectId => {
    teamStore.addCollaboratorToProject(projectId, props.collaborator.accountId)
  })
  
  emit('close')
}

function removeCollaborator() {
  if (confirm('Are you sure you want to remove this collaborator?')) {
    // Remove from all projects
    const projects = teamStore.getProjectsByCollaborator(props.collaborator.accountId)
    projects.forEach(projectId => {
      teamStore.removeCollaboratorFromProject(projectId, props.collaborator.accountId)
    })
    
    // Remove account info
    teamStore.removeAccountInfo(props.collaborator.accountId)
    emit('close')
  }
}
</script>

<template>
  <ul class="modal">
    <li class="content">
      <div class="header">
        <h2>Edit member</h2>
      </div>
      <div class="form">
        <InputNormal label="Name" v-model="name" />
        <InputNormal label="Email" type="email" v-model="email" />
        
        <div>
          <label>Assigned to</label>
          <div v-for="project in projectStore.projects" :key="project.id">
              <input 
                type="checkbox" 
                :value="project.id" 
                v-model="selectedProjects"
              />
              {{ project.name }}
          </div>
        </div>
      </div>
      <div class="actions">
        <ButtonSubmit label="Update" @click="updateCollaborator" />
        <button @click="removeCollaborator" style="background: red; color: white;">Remove</button>
        <button @click="emit('close')">Cancel</button>
      </div>
    </li>
  </ul>
</template>



<style scoped>
ul.modal {
  position: fixed;
  overflow: scroll;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  background-color: var(--modal);
  backdrop-filter: blur(1em);

  & li.content {
    width: 35vw;
    border-radius: var(--radius-lg);
    background-color: var(--bg);
    display: flex;
    flex-direction: column;
    > .header {
      padding: var(--space-lg);
    }
    > .form {
      padding: 0 var(--space-lg);
      gap: var(--space-md);
      display: flex;
      flex-direction: column;
    }
    > .actions {
      display: flex;
      justify-content: center;
      border-top: 1px solid var(--border);
      padding: var(--space-md) var(--space-lg);
    }
  }
}
</style>