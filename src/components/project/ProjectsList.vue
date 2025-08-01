<!-- ProjectsList: Secure project listing with optimized operations -->
<script setup>
import { ref, computed, onErrorCaptured } from 'vue'
import { useProjectStore } from '@/stores/projects'
import { useRouter } from 'vue-router'
import ButtonMain from '@/components/button/ButtonMain.vue'
import ButtonMore from '@/components/button/ButtonMore.vue'
import AccountStatus from '@/components/alert/AccountStatus.vue'
import { formatRelativeTime } from '@/utils/time.js'

const projectStore = useProjectStore()
const router = useRouter()
const isDeleting = ref(null)
const operationError = ref(null)

const projects = computed(() => projectStore.projects || [])
const hasProjects = computed(() => projects.value.length > 0)

onErrorCaptured((error, instance, info) => {
  operationError.value = `Operation failed: ${error.message}`
  isDeleting.value = null
  return false
})

function editProject(id) {
  if (!id) return
  router.push({ name: 'project', params: { id } })
}

async function handleMoreAction(projectId, { action }) {
  if (!projectId) return
  
  operationError.value = null
  
  try {
    switch (action) {
      case 'view-live':
        await handleViewLive(projectId)
        break
      case 'analytics':
        break
      case 'duplicate':
        await duplicateProject(projectId)
        break
      case 'delete':
        await deleteProject(projectId)
        break
    }
  } catch (error) {
    operationError.value = error.message
  }
}

async function handleViewLive(projectId) {
  const project = projects.value.find(p => p.id === projectId)
  if (!project) throw new Error('Project not found')
  
  if (project.settings?.url) {
    window.open(`https://${project.settings.url}`, '_blank')
  } else {
    throw new Error('No live URL configured')
  }
}

async function duplicateProject(id) {
  const project = projects.value.find(p => p.id === id)
  if (!project) throw new Error('Project not found')
  
  const duplicateName = `${project.name} (Copy)`
  const result = await projectStore.create(duplicateName, project.design?.theme, project.projectType)
  
  if (!result.success) {
    throw new Error(result.error || 'Duplication failed')
  }
  
  // Copy project data securely
  const newProject = projects.value.find(p => p.id === result.projectId)
  if (newProject) {
    Object.assign(newProject, {
      description: project.description,
      links: [...(project.links || [])],
      socials: [...(project.socials || [])],
      posts: [...(project.posts || [])],
      releases: [...(project.releases || [])],
      shows: [...(project.shows || [])],
      merch: [...(project.merch || [])],
      design: { ...project.design },
      settings: { 
        ...project.settings, 
        published: false,
        url: ''
      }
    })
  }
}

async function deleteProject(id) {
  const project = projects.value.find(p => p.id === id)
  if (!project) throw new Error('Project not found')
  
  const confirmed = confirm(`Delete "${project.name}"? This cannot be undone.`)
  if (!confirmed) return
  
  isDeleting.value = id
  
  try {
    const result = await projectStore.deleteProject(id)
    if (!result.success) {
      throw new Error(result.error || 'Deletion failed')
    }
  } finally {
    isDeleting.value = null
  }
}

const menuItems = [
  { label: 'View Live', action: 'view-live' },
  { label: 'Analytics', action: 'analytics' },
  { label: 'Duplicate', action: 'duplicate' },
  { label: 'Delete', action: 'delete' }
]

const getPublicationStatus = (project) => project.settings?.published ? 'Published' : 'Draft'

const getProjectUrl = (project) => {
  if (project.settings?.customDomain) return project.settings.customDomain
  if (project.url_slug) return `lands.app/${project.url_slug}`
  return `lands.app/${project.name.toLowerCase().replace(/\s+/g, '-')}`
}
</script>

<template>
  <AccountStatus v-if="operationError" :message="operationError" type="error" />
  <ul class="list" v-if="hasProjects">
    <li v-for="project in projects" :key="project.id" :class="['project', { deleting: isDeleting === project.id }]">
      <div class="cover">
        <img src="@/assets/demo.webp"/>
        <div v-if="isDeleting === project.id" class="deleting">
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
  <li class="empty" v-else>
      <p>No projects yet</p>
  </li>
</template>

<style scoped>
li.project {
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
    
    .deleting {
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
  }
}

</style>