<script setup>
import { ref, watch } from 'vue'
import DesignThemes from '@/components/design/DesignThemes.vue'
import ButtonSubmit from '@/components/button/ButtonMain.vue'

const props = defineProps(['projectData'])
const emit = defineEmits(['project-data-updated', 'create-project'])

const tempProject = ref({
  design: {
    theme: props.projectData?.design?.theme || null
  }
})

function handleCreateProject() {
  const finalProjectData = {
    ...props.projectData,
    design: tempProject.value.design
  }
  
  emit('create-project', finalProjectData)
}

// Emit data updates to parent when theme changes
function updateProjectData() {
  const projectData = {
    ...props.projectData,
    design: tempProject.value.design
  }
  
  emit('project-data-updated', projectData)
}

// Watch for theme changes and emit updates
watch(() => tempProject.value.design.theme, updateProjectData)

// Get project type info for display
function getProjectTypeInfo() {
  const type = props.projectData?.selectedType
  if (!type) return { name: 'Project', icon: '📁' }
  
  return {
    name: type.name,
    icon: type.icon
  }
}

// Check if we can create the project
function canCreateProject() {
  return props.projectData?.name?.trim().length > 0
}

// Get summary of what will be created
function getProjectSummary() {
  const data = props.projectData
  const summary = []
  
  if (data?.name) {
    summary.push(`Project: ${data.name}`)
  }
  
  if (data?.fetchedData?.releases?.length > 0) {
    summary.push(`${data.fetchedData.releases.length} releases`)
  }
  
  if (data?.fetchedData?.socials?.length > 0) {
    summary.push(`${data.fetchedData.socials.length} social links`)
  }
  
  if (tempProject.value.design.theme) {
    summary.push(`Theme: ${tempProject.value.design.theme}`)
  }
  
  return summary
}
</script>

<template>
  <ul class="list">
    
    <!-- Project Summary -->
    <li class="header">
      <h2>Choose a layout</h2>
      <p>Select a layout type. You will be able to set your design options or change the layout type later</p>
    </li>
    
    <DesignThemes :project="tempProject" />
    
    <li class="actions">
      <ButtonSubmit 
        :label="projectData?.fetchedData ? 'Create Project with Data' : 'Create Project'"
        :buttonStyle="canCreateProject() ? 'light' : 'disabled'"
        :disabled="!canCreateProject()"
        @click="handleCreateProject" 
      />
    </li>
  </ul>
</template>
<style scoped>
ul.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  text-align: center;
  justify-content: center;
  padding: var(--space-lg);
  li.header {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      text-align: center;
      justify-content: center;
      align-items: center;
        p {
        font-family: 'mono';
        font-size: var(--font-sm);
        text-transform: uppercase;
        color: var(--details);
        max-width: 40ch;
      }
  }
}

</style>