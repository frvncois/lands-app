<!-- CollaboratorsList.vue - Props-based approach -->
<script setup>
import { ref, computed } from 'vue'
import CollaboratorEdit from '@/components/collaborator/CollaboratorEdit.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'

const props = defineProps({
  collaborators: {
    type: Array,
    required: true
  },
  projects: {
    type: Array,
    required: true
  },
  getProjectsByCollaborator: {
    type: Function,
    required: true
  },
  projectId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update', 'remove'])

const editingCollaborator = ref(null)
const showEditModal = ref(false)

// Filter collaborators by project if projectId is provided
const filteredCollaborators = computed(() => {
  if (props.projectId) {
    return props.collaborators.filter(collaborator => {
      const collaboratorProjects = props.getProjectsByCollaborator(collaborator.accountId)
      return collaboratorProjects.includes(props.projectId)
    })
  }
  return props.collaborators
})

function getProjectNames(accountId) {
  const projectIds = props.getProjectsByCollaborator(accountId)
  return projectIds.map(projectId =>
    props.projects.find(p => p.id === projectId)?.name
  ).filter(Boolean).join(', ')
}

function editCollaborator(collaborator) {
  editingCollaborator.value = collaborator
  showEditModal.value = true
}

function handleUpdate(collaboratorId, collaboratorData) {
  emit('update', collaboratorId, collaboratorData)
  closeEditModal()
}

function handleRemove(collaboratorId) {
  emit('remove', collaboratorId)
  closeEditModal()
}

function closeEditModal() {
  showEditModal.value = false
  editingCollaborator.value = null
}
</script>

<template>
  <ul class="list" v-if="filteredCollaborators.length">
    <label>Active collaborator</label>
    <li v-for="collaborator in filteredCollaborators" :key="collaborator.accountId">
      <div class="icon"></div>
      <div class="content">
        {{ collaborator.name }}
        <p>{{ collaborator.email }}</p>
        <p v-if="!projectId" class="projects">{{ getProjectNames(collaborator.accountId) }}</p>
      </div>
      <div class="actions">
        <ButtonMain label="Edit" @click="editCollaborator(collaborator)"/>
      </div>
    </li>
  </ul>
  <ul class="empty" v-else>
    <p>No team members yet</p>
  </ul>

  <CollaboratorEdit
    v-if="showEditModal && editingCollaborator"
    :collaborator="editingCollaborator"
    :projects="projects"
    :get-projects-by-collaborator="getProjectsByCollaborator"
    @update="handleUpdate"
    @remove="handleRemove"
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

      > p.projects {
        color: var(--text-secondary);
        text-transform: none;
        font-family: inherit;
      }
    }

    > .actions {
      display: flex;
      justify-content: flex-end;
      margin-right: var(--space-md);
    }
  }
}
</style>