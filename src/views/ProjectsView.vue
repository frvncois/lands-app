<script setup>
import { ref, onMounted, watch, computed, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountStore } from '@/stores/account'
import { useProjectStore } from '@/stores/projects'
import SectionTitle from '@/components/global/SectionTitle.vue'
import ProjectsList from '@/components/project/ProjectsList.vue'
import ProjectCreate from '@/components/project/ProjectCreate.vue'
import AccountStatus from '@/components/alert/AccountStatus.vue'

const router = useRouter()
const accountStore = useAccountStore()
const projectStore = useProjectStore()
const showModal = ref(false)
const componentError = ref(null)
const isLoading = ref(true)

const isAuthenticated = computed(() => accountStore.isAuthenticated)
const projects = computed(() => projectStore.projects || [])
const hasProjects = computed(() => projects.value.length > 0)

onErrorCaptured((error, instance, info) => {
  componentError.value = `Projects error: ${error.message}`
  return false
})

const projectCreateProps = computed(() => ({
  userId: accountStore.user?.id,
  userProfile: {
    firstName: accountStore.profile?.first_name,
    lastName: accountStore.profile?.last_name
  }
}))

function openCreateModal() {
  if (!isAuthenticated.value) {
    router.push('/')
    return
  }
  showModal.value = true
  componentError.value = null
}

function closeModal() {
  showModal.value = false
}

function handleProjectCreated() {
  closeModal()
}

onMounted(async () => {
  // Clear current project when entering ProjectsView
  projectStore.clearCurrentProject()
  console.log('🧹 ProjectsView mounted, current project cleared')
  
  if (!isAuthenticated.value) {
    router.push('/')
    return
  }

  try {
    if (!projectStore.projects?.length && accountStore.profile?.id) {
      await accountStore.loadUserData()
    }
    if (accountStore.shouldShowCreateModal) {
      openCreateModal()
    }
  } catch (error) {
    componentError.value = 'Failed to load projects'
  } finally {
    isLoading.value = false
  }
})

watch(() => accountStore.shouldShowCreateModal, (shouldShow) => {
  if (shouldShow && !showModal.value && isAuthenticated.value) {
    openCreateModal()
  }
})
</script>

<template>
  <ul class="content">
    <SectionTitle
      title="Projects"
      :buttonLabel="showModal ? 'Cancel' : 'Create project'"
      :buttonStyle="showModal ? 'dark' : 'light'"
      @action="showModal ? closeModal() : openCreateModal()"
    />
    
    <AccountStatus v-if="isLoading" message="Loading projects..." type="updating" />
    <AccountStatus v-else-if="componentError" :message="componentError" type="error" />
    <AccountStatus v-else-if="!isAuthenticated" message="Authentication required" type="error" />
    
    <template v-else>
      <ProjectsList v-if="!showModal" />
      <ProjectCreate
        v-if="showModal"
        v-bind="projectCreateProps"
        @project-created="handleProjectCreated"
        @cancel="closeModal"
      />
    </template>
  </ul>
</template>