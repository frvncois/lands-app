<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useProjectStore } from '@/stores/projects'

  import SectionTitle from '@/components/global/SectionTitle.vue'
  import NavTab from '@/components/global/NavTab.vue'

  import ContentList from '@/components/content/ContentList.vue'
  import IntegrationsList from '@/components/integrations/IntegrationsList.vue'
  import DesignList from '@/components/design/DesignList.vue'
  import SettingProject from '@/components/project/ProjectSetting.vue'

  const route = useRoute()
  const projectStore = useProjectStore()

  onMounted(() => {
    projectStore.setCurrentProject(Number(route.params.id))
  })

  const project = computed(() => projectStore.currentProject)
  const activeTab = ref('general')

  const tabItems = [
    { id: 'general', label: 'General' },
    { id: 'design', label: 'Design' },
    { id: 'settings', label: 'Settings' }
  ]

  function handleTabChange(tabId) {
    activeTab.value = tabId
  }
</script>

<template>
  <ul class="content" v-if="project">
    <li>
      <SectionTitle
        title="Edit Project"
      />
    </li>
    
    <li>
      <NavTab 
        :items="tabItems" 
        :activeTab="activeTab" 
        @tab-change="handleTabChange" 
      />
    </li>

    <li v-if="activeTab === 'general'">
      <ContentList :project="project" />
      <IntegrationsList :project="project" />
    </li>

    <li v-if="activeTab === 'design'">
      <DesignList :project="project" />
    </li>

    <li v-if="activeTab === 'settings'">
      <SettingProject :project="project" />
    </li>
  </ul>
</template>