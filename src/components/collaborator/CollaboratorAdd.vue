<script setup>
import { ref } from 'vue'
import InputNormal from '@/components/input/InputNormal.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'
import { useProjectStore } from '@/stores/projects'
import { useTeamStore } from '@/stores/team'

const emit = defineEmits(['close'])
const projectStore = useProjectStore()
const teamStore = useTeamStore()
const name = ref('')
const email = ref('')
const selectedProjects = ref([])

function addCollaborator() {
  console.log('Add collaborator called', { 
    name: name.value, 
    email: email.value, 
    projects: selectedProjects.value,
    projectsLength: selectedProjects.value.length
  })
  
  if (name.value.trim() && email.value.trim()) {
    // Create a simple account ID (in real app, this would be from account creation)
    const accountId = `acc_${Date.now()}`
    
    if (selectedProjects.value && selectedProjects.value.length > 0) {
      selectedProjects.value.forEach(projectId => {
        teamStore.addCollaboratorToProject(projectId, accountId)
      })
    }
    
    teamStore.addAccountInfo(accountId, { name: name.value, email: email.value })
    
    name.value = ''
    email.value = ''
    selectedProjects.value = []
    
    emit('close')

  } else {
    console.log('Validation failed', {
      hasName: !!name.value.trim(),
      hasEmail: !!email.value.trim()
    })
  }
}
</script>

<template>
  <ul class="modal">
    <li class="content">
      <div class="header">
        <h2>Add Collaborator</h2>
      </div>
      <div class="form">
        <InputNormal 
          label="Name" 
          placeholder="Enter full name"
          v-model="name" 
        />
        <InputNormal 
          label="Email" 
          placeholder="Enter email address"
          v-model="email" 
        />
         <div class="projects">
          <label>Assign to project</label>
          <div v-if="projectStore.projects.length > 0">
            <div v-for="project in projectStore.projects" :key="project.id">
                <input
                  type="checkbox"
                  :value="project.id"
                  v-model="selectedProjects"
                />
                {{ project.name }}
            </div>
          </div>
          <p v-else>No projects available. Collaborator will be added without project assignment.</p>
        </div>
    </div>
    <div class="actions">
      <ButtonMain label="Add" buttonStyle="light" @click="addCollaborator" />
      <ButtonMain label="Cancel" buttonStyle="dark" @click="emit('close')" />
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