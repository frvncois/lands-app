<!-- ProjectsDropdown: Secure project navigation dropdown with optimized data flow -->
<script setup>
import { computed, onErrorCaptured } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ButtonMain from '@/components/button/ButtonMain.vue'

const props = defineProps({
  projects: {
    type: Array,
    default: () => []
  },
  currentProjectId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['action', 'edit-project', 'create-project'])

const router = useRouter()
const route = useRoute()

onErrorCaptured((error, instance, info) => {
  return false
})

const currentProject = computed(() => {
  if (!props.currentProjectId || !props.projects.length) return null
  const projectId = props.currentProjectId
  let project = props.projects.find(p => p.id === projectId)
  if (!project && /^\d+$/.test(String(projectId))) {
    project = props.projects.find(p => p.id === Number(projectId))
  }
  return project
})

const validProjects = computed(() => {
  return props.projects.filter(project => 
    project && 
    project.id && 
    project.name && 
    typeof project.name === 'string'
  )
})

function editProject(id) {
  if (!id) return
  try {
    router.push(`/projects/${id}`)
    emit('edit-project', id)
  } catch (error) {
  }
}

function createNewProject() {
  try {
    router.push('/')
    emit('create-project')
  } catch (error) {
  }
}

function handleAction(actionType, data = null) {
  emit('action', { action: actionType, data })
}
</script>

<template>
  <ul class="dropdown">
    <ul class="menu">
      <li v-if="currentProject" class="current">
        <ButtonMain 
          :label="currentProject.name" 
          buttonStyle="none" 
          @click="editProject(currentProject.id)"
        />
      </li>
      <li v-for="project in validProjects" :key="project.id" class="projects">
        <div class="details">
          <h3>{{ project.name }}</h3>
        </div>
        <ButtonMain 
          label="Edit" 
          buttonStyle="light" 
          @click="editProject(project.id)"
        />
      </li>
      <li class="actions">
        <ButtonMain 
          label="Create new project" 
          buttonStyle="light" 
          @click="createNewProject"
        />
      </li>
    </ul>
  </ul>
</template>

<style scoped>
ul.dropdown {
  position: absolute;
  margin-left: auto;
  z-index: 3;
  right: 0;
  display: flex;
  flex-direction: column;
  border-bottom: unset;
  padding-bottom: unset;
  border-radius: var(--radius-md);
  max-height: 2em;
  transition: all var(--transition-smooth);
  backdrop-filter: blur(1em);
  background: var(--dark);
  cursor: pointer;
}

ul.dropdown:hover {
  max-height: 500px;
  box-shadow: 0 1em 1.5em -0.5em rgba(22, 22, 22, 0.759);
}

ul.menu {
  position: relative;
  right: 0;
  z-index: 1000;
  overflow: hidden;
  width: 15em;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-smooth);
  gap: var(--space-sm);
}

ul.menu li.current {
  text-transform: uppercase;
}

ul.menu > li.projects {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-rg);
  margin: 0 var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

ul.menu > li.actions {
  display: flex;
  margin: 0 var(--space-sm) var(--space-sm);
  border-radius: var(--radius-rg);
}

ul.menu > li.actions > button {
  flex: 1;
}
</style>