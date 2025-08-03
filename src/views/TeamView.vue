<script setup>
import { ref, computed } from 'vue'
import SectionTitle from '@/components/global/SectionTitle.vue'
import CollaboratorAdd from '@/components/collaborator/CollaboratorAdd.vue'
import CollaboratorsList from '@/components/collaborator/CollaboratorsList.vue'

const props = defineProps({
  userStore: {
    type: Object,
    required: true
  }
})

const showModal = ref(false)

// Just use the data that's already loaded
const projects = computed(() => props.userStore.projects || [])
const invitations = computed(() => props.userStore.invitations || [])

async function addCollaborator(collaboratorData) {
  const { name, email, selectedProjects } = collaboratorData
  
  try {
    console.log('🔄 Adding collaborator...', { name, email, projects: selectedProjects })
    // TODO: Add real API call to user store
    // const result = await props.userStore.inviteCollaborator({ name, email, selectedProjects })
    console.log('✅ Collaborator added:', { name, email, projects: selectedProjects })
  } catch (error) {
    console.error('❌ Failed to add collaborator:', error)
  }
}

async function updateCollaborator(collaboratorId, collaboratorData) {
  const { name, email, selectedProjects } = collaboratorData
  
  try {
    console.log('🔄 Updating collaborator...', { collaboratorId, name, email, projects: selectedProjects })
    // TODO: Add real API call to user store
    // const result = await props.userStore.updateCollaborator(collaboratorId, { name, email, selectedProjects })
    console.log('✅ Collaborator updated:', { name, email, projects: selectedProjects })
  } catch (error) {
    console.error('❌ Failed to update collaborator:', error)
  }
}

async function removeCollaborator(collaboratorId) {
  try {
    console.log('🔄 Removing collaborator...', collaboratorId)
    // TODO: Add real API call to user store
    // const result = await props.userStore.removeCollaborator(collaboratorId)
    console.log('✅ Collaborator removed:', collaboratorId)
  } catch (error) {
    console.error('❌ Failed to remove collaborator:', error)
  }
}

function closeModal() {
  showModal.value = false
}

// Clear current project when entering TeamView
props.userStore.clearCurrentProject()
</script>

<template>
  <ul class="content">
    <SectionTitle
      title="Team members"
      buttonLabel="Add member"
      @action="showModal = true"
    />
    
    <CollaboratorsList
      :projects="projects"
      :invitations="invitations"
      :user-store="userStore"
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