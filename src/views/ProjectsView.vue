<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAccountStore } from '@/stores/account'
import SectionTitle from '@/components/global/SectionTitle.vue'
import ProjectsList from '@/components/project/ProjectsList.vue'
import ProjectCreate from '@/components/project/ProjectCreate.vue'

const accountStore = useAccountStore()
const showModal = ref(false)

function openCreateModal() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function handleProjectCreated() {
  closeModal()
}

onMounted(() => {
  if (accountStore.shouldShowCreateModal) {
    openCreateModal()
  }
})

watch(() => accountStore.shouldShowCreateModal, (shouldShow) => {
  if (shouldShow && !showModal.value) {
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
    
    <ProjectsList v-if="!showModal" />
    
    <ProjectCreate
      v-if="showModal"
      @project-created="handleProjectCreated"
      @cancel="closeModal"
    />
  </ul>
</template>