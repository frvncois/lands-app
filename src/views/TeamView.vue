<template>
  <ul class="content">
    <SectionTitle
      title="Team members"
      buttonLabel="Add member"
      @action="showModal = true"
    />
    
    <CollaboratorsList
      :projects="projects"
      :collaborators="collaborators"
      :get-projects-by-collaborator="userStore.getProjectsByCollaborator"
      @update="updateCollaborator"
      @remove="removeCollaborator"
    />
    
    <CollaboratorAdd
      v-if="showModal"
      :projects="projects"
      :user-store="userStore"
      @add="addCollaborator"
      @close="closeModal"
    />
  </ul>
</template>
// Fixed TeamView.vue - Show pending invitations in collaborators list

<script setup>
import { ref, computed } from 'vue'
import SectionTitle from '@/components/global/SectionTitle.vue'
import CollaboratorAdd from '@/components/collaborator/CollaboratorAdd.vue'
import CollaboratorsList from '@/components/collaborator/CollaboratorsList.vue'
import { useAlertStore } from '@/stores/alert.js'

const props = defineProps({
  userStore: {
    type: Object,
    required: true
  }
})

const alertStore = useAlertStore()
const showModal = ref(false)

// Use the data that's already loaded
const projects = computed(() => props.userStore.projects || [])
const invitations = computed(() => props.userStore.invitations || [])

// ✅ FIXED: Transform invitations to collaborators format and include status
const collaborators = computed(() => {
  return invitations.value.map(invitation => ({
    accountId: invitation.id,
    name: invitation.name || `${invitation.first_name || ''} ${invitation.last_name || ''}`.trim(),
    email: invitation.email,
    status: invitation.status || 'pending', // ✅ Include status from invitation
    project_ids: invitation.project_ids || [], // ✅ Include project IDs for filtering
  }))
})

// ✅ FIXED: Update getProjectsByCollaborator to work with new structure
function getProjectsByCollaborator(accountId) {
  const collaborator = collaborators.value.find(c => c.accountId === accountId)
  return collaborator?.project_ids || []
}

// Add collaborator - parent handles API call
async function addCollaborator(collaboratorData) {
  const { name, email, selectedProjects } = collaboratorData
  
  try {
    console.log('🔄 Adding collaborator...', { name, email, projects: selectedProjects })
    
    const result = await props.userStore.inviteCollaborator({ 
      email, 
      name, 
      selectedProjects 
    })
    
    if (result.success) {
      console.log('✅ Collaborator added successfully')
      alertStore.showSuccess(`Collaborator ${name} invited successfully`)
      
      // Close modal after successful API call
      closeModal()
    } else {
      throw new Error(result.error || 'Failed to add collaborator')
    }
  } catch (error) {
    console.error('❌ Failed to add collaborator:', error)
    alertStore.showError(error.message || 'Failed to add collaborator')
  }
}

// Update collaborator - using real API
async function updateCollaborator(collaboratorId, collaboratorData) {
  const { name, email, selectedProjects } = collaboratorData
  
  try {
    console.log('🔄 Updating collaborator...', { collaboratorId, name, email, projects: selectedProjects })
    
    const result = await props.userStore.updateCollaboratorInvitation(collaboratorId, { 
      email, 
      name, 
      selectedProjects 
    })
    
    if (result.success) {
      console.log('✅ Collaborator updated successfully')
      alertStore.showSuccess(`Collaborator ${name} updated successfully`)
    } else {
      throw new Error(result.error || 'Failed to update collaborator')
    }
  } catch (error) {
    console.error('❌ Failed to update collaborator:', error)
    alertStore.showError(error.message || 'Failed to update collaborator')
  }
}

// Remove collaborator - using real API  
async function removeCollaborator(collaboratorId) {
  try {
    console.log('🔄 Removing collaborator...', collaboratorId)
    
    const result = await props.userStore.removeCollaboratorInvitation(collaboratorId)
    
    if (result.success) {
      console.log('✅ Collaborator removed successfully')
      alertStore.showSuccess('Collaborator removed successfully')
    } else {
      throw new Error(result.error || 'Failed to remove collaborator')
    }
  } catch (error) {
    console.error('❌ Failed to remove collaborator:', error)
    alertStore.showError(error.message || 'Failed to remove collaborator')
  }
}

function closeModal() {
  showModal.value = false
}

// Clear current project when entering TeamView
props.userStore.clearCurrentProject()
</script>