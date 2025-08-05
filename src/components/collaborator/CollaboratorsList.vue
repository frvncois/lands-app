<!-- Fixed CollaboratorsList.vue - Show pending invitations -->
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

// Function to generate initials from collaborator name
function getInitials(collaborator) {
  if (!collaborator.name) return '??'
  
  const nameParts = collaborator.name.trim().split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts[1] || ''
  
  const firstInitial = firstName.charAt(0).toUpperCase()
  const lastInitial = lastName.charAt(0).toUpperCase()
  
  return firstInitial + lastInitial
}

// ✅ NEW: Get status display for collaborator
function getStatusDisplay(collaborator) {
  const status = collaborator.status || 'pending'
  
  switch (status) {
    case 'pending':
      return { text: 'Pending', class: 'pending' }
    case 'accepted':
      return { text: 'Active', class: 'active' }
    case 'declined':
      return { text: 'Invitation', class: 'declined' }
    default:
      return { text: 'Unknown status', class: 'unknown' }
  }
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
    <li v-for="collaborator in filteredCollaborators" :key="collaborator.accountId" class="item">
      <div class="icon">
        {{ getInitials(collaborator) }}
      </div>
      <div class="content">
          <h3>{{ collaborator.name }}</h3>
          <p>{{ collaborator.email }}</p>
        </div>
          
        <div class="actions">
          <label :class="getStatusDisplay(collaborator).class">
            {{ getStatusDisplay(collaborator).text }}
          </label>
          <ButtonMain
            label="Edit"
            buttonStyle="light"
            @click="editCollaborator(collaborator)"
          />
      </div>
    </li>
    
  </ul>
  
  <li v-else class="empty">
    <p>No team members yet</p>
  </li>

  <!-- Edit Modal -->
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

  li.item {
    display: grid;
    grid-template-columns: 0.15fr 1fr 0.15fr;
    align-items: center;
    gap: var(--space-rg);
    padding: var(--space-rg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    transition: all var(--transition-smooth);
    background: var(--card);
    box-shadow: var(--shadow-md);

    > .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      font-family: 'mono';
      font-size: var(--font-sm);
      color: var(--light);
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
      align-items: center;
      gap: var(--space-md);
      margin-right: var(--space-rg);

      > label {
        &.pending {
          background: var(--warning);
          color: var(--warning-txt);
          border: 1px solid var(--warning-border);
        }
      }
    }
  }
}
</style>