<script setup>
import { ref, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projects'
import { useTeamStore } from '@/stores/team'

import SectionTitle from '@/components/global/SectionTitle.vue'

import CollaboratorAdd from '@/components/collaborator/CollaboratorAdd.vue'
import CollaboratorsList from '@/components/collaborator/CollaboratorsList.vue'

const projectStore = useProjectStore()
const teamStore = useTeamStore()
const showModal = ref(false)

onMounted(() => {
  projectStore.setCurrentProject(null)
})
</script>

<template>
<ul class="content">
    <SectionTitle
      title="Team members"
      buttonLabel="Add member"
      @action="showModal = true"
    />
      <CollaboratorsList />
      <CollaboratorAdd v-if="showModal" @close="showModal = false" />
</ul>
</template>