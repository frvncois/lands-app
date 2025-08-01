<script setup>
import { ref } from 'vue'
import { useProjectStore } from '@/stores/projects'
import { useRouter } from 'vue-router'
import ButtonMain from '@/components/button/ButtonMain.vue'
import ButtonMore from '@/components/button/ButtonMore.vue'

const projectStore = useProjectStore()
const router = useRouter()
const isDeleting = ref(null) // Track which project is being deleted

function editProject(id) {
  router.push({ name: 'project', params: { id } })
}

async function handleMoreAction(projectId, { action, label }) {
  switch (action) {
    case 'view-live':
      // Open live URL - you'll need to get the project's URL
      const project = projectStore.projects.find(p => p.id === projectId)
      if (project && project.settings.url) {
        window.open(`https://${project.settings.url}`, '_blank')
      } else {
        console.log('No live URL configured for project:', project?.name)
      }
      break
    case 'analytics':
      // No action for now
      console.log('Analytics clicked for project:', projectId)
      break
    case 'duplicate':
      // Duplicate project
      await duplicateProject(projectId)
      break
    case 'delete':
      // Delete project with confirmation
      await deleteProject(projectId)
      break
  }
}

async function duplicateProject(id) {
  const project = projectStore.projects.find(p => p.id === id)
  if (!project) {
    console.error('Project not found for duplication:', id)
    return
  }

  // FIXED: Use the project store's create function to properly duplicate
  try {
    console.log('🔄 Duplicating project:', project.name)
    
    const duplicateName = `${project.name} (Copy)`
    const result = await projectStore.create(duplicateName, project.design?.theme, project.projectType)
    
    if (result.success) {
      console.log('✅ Project duplicated successfully')
      
      // Apply the original project's data to the duplicate
      const newProject = projectStore.projects.find(p => p.id === result.projectId)
      if (newProject) {
        // Copy over the content
        newProject.description = project.description
        newProject.links = [...project.links]
        newProject.socials = [...project.socials]
        newProject.posts = [...project.posts]
        newProject.releases = [...project.releases]
        newProject.shows = [...project.shows]
        newProject.merch = [...project.merch]
        newProject.design = { ...project.design }
        newProject.settings = { 
          ...project.settings, 
          published: false, // Don't publish the copy
          url: '' // Clear the URL
        }
        
        console.log('✅ Content copied to duplicate project')
      }
    } else {
      console.error('❌ Failed to duplicate project:', result.error)
      alert('Failed to duplicate project: ' + result.error)
    }
  } catch (error) {
    console.error('❌ Error duplicating project:', error)
    alert('Error duplicating project: ' + error.message)
  }
}

// FIXED: Proper delete function that uses the project store
async function deleteProject(id) {
  const project = projectStore.projects.find(p => p.id === id)
  if (!project) {
    console.error('Project not found for deletion:', id)
    return
  }

  // Show confirmation dialog
  const confirmed = confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)
  
  if (!confirmed) {
    console.log('🚫 Project deletion cancelled by user')
    return
  }

  isDeleting.value = id
  
  try {
    console.log('🗑️ Deleting project:', project.name, 'ID:', id)
    
    // FIXED: Use the project store's delete function to properly delete from database
    const result = await projectStore.deleteProject(id)
    
    if (result.success) {
      console.log('✅ Project deleted successfully')
      // The project store will handle removing it from the local array
    } else {
      console.error('❌ Failed to delete project:', result.error)
      alert('Failed to delete project: ' + result.error)
    }
  } catch (error) {
    console.error('❌ Error deleting project:', error)
    alert('Error deleting project: ' + error.message)
  } finally {
    isDeleting.value = null
  }
}

// Menu items for the dropdown
const menuItems = [
  { label: 'View Live', action: 'view-live' },
  { label: 'Analytics', action: 'analytics' },
  { label: 'Duplicate', action: 'duplicate' },
  { label: 'Delete', action: 'delete' }
]

// Helper function to format relative time
function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  
  const diffInDays = Math.floor(diffInSeconds / 86400)
  if (diffInDays < 30) return `${diffInDays} days ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  
  return `${Math.floor(diffInDays / 365)} years ago`
}

// Helper function to get publication status
function getPublicationStatus(project) {
  return project.settings?.published ? 'Published' : 'Draft'
}

// Helper function to get project URL
function getProjectUrl(project) {
  if (project.settings?.customDomain) {
    return project.settings.customDomain
  }
  if (project.url_slug) {
    return `lands.app/${project.url_slug}`
  }
  return `lands.app/${project.name.toLowerCase().replace(/\s+/g, '-')}`
}
</script>

<template>
  <ul class="list" v-if="projectStore.projects.length">
    <li v-for="project in projectStore.projects" :key="project.id" :class="{ deleting: isDeleting === project.id }">
      <div class="cover">
        <img src="@/assets/demo.webp"/>
        <!-- Show deleting overlay -->
        <div v-if="isDeleting === project.id" class="deleting-overlay">
          <span>Deleting...</span>
        </div>
      </div>
      <div class="content">
        <div>
          <h3>{{ project.name }}</h3>
          <h4>{{ getProjectUrl(project) }}</h4>
        </div>
        <ButtonMain 
          label="Edit" 
          buttonStyle="light" 
          :disabled="isDeleting === project.id"
          @click="editProject(project.id)"
        />
      </div>
      <div class="details">
        <label :class="{ active: project.settings?.published }">
          {{ getPublicationStatus(project) }}
        </label>
        <label>Updated {{ formatRelativeTime(project.updated_at) }}</label>
        <ButtonMore 
          :menuItems="menuItems" 
          :disabled="isDeleting === project.id"
          @action="(actionData) => handleMoreAction(project.id, actionData)"
        />
      </div>
    </li>
  </ul>
  <ul class="empty" v-else>
    <li>
      <div class="empty-state">
        <h3>No projects yet</h3>
        <p>Create your first project to get started</p>
      </div>
    </li>
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
      transition: all var(--transition-smooth);
      background: var(--card);
      position: relative;
      
      &.deleting {
        opacity: 0.6;
        pointer-events: none;
      }
      
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
        
        .deleting-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 500;
          z-index: 10;
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
        
        label {
          font-size: var(--font-sm);
          color: var(--details);
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          
          &.active {
            background: var(--success);
            color: white;
            border-color: var(--success);
          }
        }
      }
    }
  }
  
  > .empty {
    margin-top: var(--space-lg);
    
    .empty-state {
      text-align: center;
      padding: var(--space-xl);
      
      h3 {
        margin-bottom: var(--space-md);
        color: var(--text);
      }
      
      p {
        color: var(--details);
        font-size: var(--font-sm);
      }
    }
  }
}
</style>