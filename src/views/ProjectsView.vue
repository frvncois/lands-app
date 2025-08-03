<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SectionTitle from '@/components/global/SectionTitle.vue'
import ProjectsList from '@/components/project/ProjectsList.vue'
import ProjectCreate from '@/components/project/ProjectCreate.vue'

const props = defineProps({
  userStore: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const showModal = ref(false)

// Just use the data that's already loaded by App.vue
const isAuthenticated = computed(() => props.userStore.isAuthenticated)
const projects = computed(() => props.userStore.projects || [])

const projectCreateProps = computed(() => ({
  userId: props.userStore.user?.id,
  userProfile: {
    firstName: props.userStore.profile?.first_name,
    lastName: props.userStore.profile?.last_name
  }
}))

function openCreateModal() {
  if (!isAuthenticated.value) {
    router.push('/')
    return
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function handleProjectCreated() {
  closeModal()
  // No need to reload - data is already reactive!
}

// Clear current project when entering ProjectsView
props.userStore.clearCurrentProject()
</script>

<template>
  <ul class="content">
    <SectionTitle
      title="Projects"
      :buttonLabel="showModal ? 'Cancel' : 'Create project'"
      :buttonStyle="showModal ? 'dark' : 'light'"
      @action="showModal ? closeModal() : openCreateModal()"
    />
    
    <template v-if="isAuthenticated">
      <ProjectsList 
        v-if="!showModal" 
        :projects="projects"
        :user-store="userStore"
      />
      <ProjectCreate
        v-if="showModal"
        v-bind="projectCreateProps"
        :user-store="userStore"
        @project-created="handleProjectCreated"
        @cancel="closeModal"
      />
    </template>
  </ul>
</template>