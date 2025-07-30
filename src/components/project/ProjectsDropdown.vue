<script setup>
import { computed } from 'vue'
import { useProjectStore } from '@/stores/projects'
import { useRouter, useRoute } from 'vue-router'
import ButtonMain from '@/components/button/ButtonMain.vue'

const projectStore = useProjectStore()
const router = useRouter()
const route = useRoute()
const emit = defineEmits(['action'])

// Get current project based on route
const currentProject = computed(() => {
  const projectId = Number(route.params.id)
  return projectStore.projects.find(p => p.id === projectId)
})

async function editProject(id) {
  // Force router to reload the route by using replace
  await router.replace(`/projects/${id}`)
  // Update the store to ensure it's in sync
  projectStore.setCurrentProject(id)
}

function createNewProject() {
  // Navigate to home page
  router.push('/')
}
</script>

<template>
  <ul class="dropdown">
    <ul class="menu">
      <li v-if="currentProject" class="current">
        <ButtonMain :label="currentProject.name" buttonStyle="none" @click="editProject(currentProject.id)"/>
      </li>
      <li v-for="project in projectStore.projects" :key="project.id" class="projects">
        <div class="details">
          <h3>{{ project.name }}</h3>
        </div>
        <ButtonMain label="Edit" buttonStyle="light" @click="editProject(project.id)"/>
      </li>
      <li class="actions">
        <ButtonMain label="Create new project" buttonStyle="light" @click="createNewProject"/>
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

  &:hover {
    max-height: 500px;
    box-shadow: 0 1em 1.5em -0.5em rgba(22, 22, 22, 0.759);
  }
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

  li.current {
    text-transform: uppercase;
  }

  > li.projects {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-rg);
    margin: 0 var(--space-sm);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
  }

  > li.actions {
    display: flex;
    margin: 0 var(--space-sm) var(--space-sm);
    border-radius: var(--radius-rg);

    > button {
      flex: 1;
    }
  }
}
</style>