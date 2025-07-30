<script setup>
import { useProjectStore } from '@/stores/projects'
import { useRouter } from 'vue-router'
import ButtonMain from '@/components/button/ButtonMain.vue'
import ButtonMore from '@/components/button/ButtonMore.vue'

const projectStore = useProjectStore()
const router = useRouter()

function editProject(id) {
  router.push({ name: 'project', params: { id } })
}

function handleMoreAction(projectId, { action, label }) {
  switch (action) {
    case 'view-live':
      // Open live URL - you'll need to get the project's URL
      const project = projectStore.projects.find(p => p.id === projectId)
      if (project && project.settings.url) {
        window.open(project.settings.url, '_blank')
      }
      break
    case 'analytics':
      // No action for now
      console.log('Analytics clicked for project:', projectId)
      break
    case 'duplicate':
      // Duplicate project
      duplicateProject(projectId)
      break
    case 'delete':
      // Delete project
      deleteProject(projectId)
      break
  }
}

function duplicateProject(id) {
  const project = projectStore.projects.find(p => p.id === id)
  if (project) {
    const newProject = {
      ...project,
      id: Date.now(),
      name: `${project.name} (Copy)`,
      settings: {
        ...project.settings,
        published: false,
        url: ''
      }
    }
    projectStore.projects.push(newProject)
  }
}

function deleteProject(id) {
  if (confirm('Are you sure you want to delete this project?')) {
    const index = projectStore.projects.findIndex(p => p.id === id)
    if (index > -1) {
      projectStore.projects.splice(index, 1)
    }
  }
}

// Menu items for the dropdown
const menuItems = [
  { label: 'View Live', action: 'view-live' },
  { label: 'Analytics', action: 'analytics' },
  { label: 'Duplicate', action: 'duplicate' },
  { label: 'Delete', action: 'delete' }
]
</script>

<template>
  <ul class="list" v-if="projectStore.projects.length">
    <li v-for="project in projectStore.projects" :key="project.id">
      <div class="cover">
        <img src="@/assets/demo.webp"/>
      </div>
      <div class="content">
        <div>
          <h3>{{ project.name }}</h3>
          <h4>lands.app/{{ project.name }}</h4>
        </div>
        <ButtonMain label="Edit" buttonStyle="light" @click="editProject(project.id)"/>
      </div>
      <div class="details">
        <label class="active">Published</label>
        <label>Updated 12 days ago</label>
        <ButtonMore 
          :menuItems="menuItems" 
          @action="(actionData) => handleMoreAction(project.id, actionData)"
        />
      </div>
    </li>
  </ul>
  <ul class="empty" v-else>
    <p>No projects yet</p>
  </ul>
</template>

<style scoped>
ul {
  > .list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg) 0;
    
    li {
      display: flex;
      flex-direction: column;
      border-radius: var(--radius-md);
      gap: var(--space-md);
      border: 1px solid var(--border);
      transition: background-color var(--transition-smooth);
        background: var(--card);
      
      & .cover {
        aspect-ratio: 16 / 9;
        border-radius: var(--radius-rg);
        border: 1px solid var(--border);
        margin: var(--space-rg) var(--space-rg) 0 var(--space-rg);
        overflow: hidden;
        position: relative;
        
        > img {
          position: absolute;
          height: 100%;
          width: 100%;
          object-fit: cover;
        }
      }
      
      & .content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 var(--space-rg);
        
        > div {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          
          > h4 {
            font-size: var(--font-sm);
            font-family: 'mono';
            text-transform: uppercase;
            color: var(--details);
          }
        }
      }
      
      & .details {
        border-top: 1px solid var(--border);
        padding: var(--space-sm) var(--space-rg);
        border-bottom-left-radius: var(--radius-md);
        border-bottom-right-radius: var(--radius-md);
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: var(--space-sm);
        position: relative;
      }
    }
  }
  > .empty {
    margin-top: var(--space-lg);
  }
}
</style>