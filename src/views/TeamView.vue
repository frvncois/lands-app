<!-- TeamView.vue - Centralized store management -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projects'
import { useTeamStore } from '@/stores/team'
import SectionTitle from '@/components/global/SectionTitle.vue'
import CollaboratorAdd from '@/components/collaborator/CollaboratorAdd.vue'
import CollaboratorsList from '@/components/collaborator/CollaboratorsList.vue'

const projectStore = useProjectStore()
const teamStore = useTeamStore()
const showModal = ref(false)

// Computed data to pass down to children
const collaborators = computed(() => teamStore.getAllCollaborators())
const projects = computed(() => projectStore.projects)

// Team management functions
function addCollaborator(collaboratorData) {
  const { name, email, selectedProjects } = collaboratorData
  
  // Create account ID
  const accountId = `acc_${Date.now()}`
  
  // Add to projects if any selected
  if (selectedProjects && selectedProjects.length > 0) {
    selectedProjects.forEach(projectId => {
      teamStore.addCollaboratorToProject(projectId, accountId)
    })
  }
  
  // Add account info
  teamStore.addAccountInfo(accountId, { name, email })
  
  console.log('Collaborator added:', { name, email, projects: selectedProjects })
}

function updateCollaborator(collaboratorId, collaboratorData) {
  const { name, email, selectedProjects } = collaboratorData
  
  // Update account info
  teamStore.addAccountInfo(collaboratorId, { name, email })
  
  // Get current projects and update
  const currentProjects = teamStore.getProjectsByCollaborator(collaboratorId)
  
  // Remove from projects not selected
  currentProjects.forEach(projectId => {
    if (!selectedProjects.includes(projectId)) {
      teamStore.removeCollaboratorFromProject(projectId, collaboratorId)
    }
  })
  
  // Add to newly selected projects
  selectedProjects.forEach(projectId => {
    if (!currentProjects.includes(projectId)) {
      teamStore.addCollaboratorToProject(projectId, collaboratorId)
    }
  })
  
  console.log('Collaborator updated:', { name, email, projects: selectedProjects })
}

function removeCollaborator(collaboratorId) {
  // Remove from all projects
  const projects = teamStore.getProjectsByCollaborator(collaboratorId)
  projects.forEach(projectId => {
    teamStore.removeCollaboratorFromProject(projectId, collaboratorId)
  })
  
  // Remove account info
  teamStore.removeAccountInfo(collaboratorId)
  
  console.log('Collaborator removed:', collaboratorId)
}

function getProjectsByCollaborator(collaboratorId) {
  return teamStore.getProjectsByCollaborator(collaboratorId)
}

function closeModal() {
  showModal.value = false
}

onMounted(() => {
  projectStore.setCurrentProject(null)
})
</script>

<template>
  <ul class="content">
    <SectionTitle
      title="Team members"
      buttonLabel="Add member"
      @action="showModal = true"
    />
    
    <CollaboratorsList 
      :collaborators="collaborators"
      :projects="projects"
      :get-projects-by-collaborator="getProjectsByCollaborator"
      @update="updateCollaborator"
      @remove="removeCollaborator"
    />
    
    <CollaboratorAdd 
      v-if="showModal" 
      :projects="projects"
      @add="addCollaborator"
      @close="closeModal" 
    />
  </ul>
</template>