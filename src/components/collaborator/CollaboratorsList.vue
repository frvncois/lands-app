<script setup>
import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/projects'
import { useTeamStore } from '@/stores/team'
import CollaboratorEdit from '@/components/collaborator/CollaboratorEdit.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'

const props = defineProps(['projectId'])
const projectStore = useProjectStore()
const teamStore = useTeamStore()

const editingCollaborator = ref(null)
const showEditModal = ref(false)

const collaborators = computed(() => {
  if (props.projectId) {
    const accountIds = teamStore.getCollaboratorsByProject(props.projectId)
    return accountIds.map(accountId => ({
      accountId,
      ...teamStore.getAccountInfo(accountId)
    }))
  } else {
    return teamStore.getAllCollaborators()
  }
})

function getProjectNames(accountId) {
  const projects = teamStore.getProjectsByCollaborator(accountId)
  return projects.map(projectId =>
    projectStore.projects.find(p => p.id === projectId)?.name
  ).filter(Boolean).join(', ')
}

function editCollaborator(collaborator) {
  editingCollaborator.value = collaborator
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingCollaborator.value = null
}
</script>

<template>
  <ul class="list" v-if="collaborators.length">
    <label>Active collaborator</label>
    <li v-for="collaborator in collaborators" :key="collaborator.accountId">
      <div class="icon"></div>
      <div class="content">
        {{ collaborator.name }}
        <p>{{ collaborator.email }}</p>
      </div>
      <div class="actions">
      <ButtonMain label="Edit" @click="editCollaborator(collaborator)"/>
      </div>
    </li>
  </ul>
  <ul class="empty" v-else><p>No team members yet</p></ul>

  <CollaboratorEdit 
    v-if="showEditModal && editingCollaborator" 
    :collaborator="editingCollaborator"
    @close="closeEditModal" 
  />
</template>

<style scoped>
ul.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-rg);
  padding: var(--space-lg) 0;
  
  li {
    display: grid;
    grid-template-columns: 0.15fr 1fr 0.15fr;
    align-items: center;
    gap: var(--space-rg);
    cursor: pointer;
    padding: var(--space-rg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    transition: all var(--transition-smooth);
    background: var(--card);
    
    > .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    
    > .content {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      
      > p {
        color: var(--details);
        font-size: var(--font-sm);
        font-family: 'mono';
        text-transform: uppercase;
        transition: all var(--transition-smooth);
      }
    }
    
    > .actions {
      display: flex;
      justify-content: flex-end;
      margin-right: var(--space-md);
    }
    
    &:hover {
      background: var(--dark-hover);
      border-color: var(--focus);

      > .content > p {
        color: var(--light);
      }
    }
  }
}
</style>