<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'

  import SectionTitle from '@/components/global/SectionTitle.vue'
  import NavTab from '@/components/global/NavTab.vue'


  const route = useRoute()


  const activeTab = ref('analytics')

  const tabItems = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'audience', label: 'Audience' }
  ]

  function handleTabChange(tabId) {
    activeTab.value = tabId
  }
</script>

<template>
  <ul class="content">
    <li>
      <SectionTitle
        title="Integrations"
        buttonLabel="Need help?"
        buttonStyle="dark"
        @action="showModal = true"
      />
    </li>
    
    <li>
      <NavTab 
        :items="tabItems" 
        :activeTab="activeTab" 
        @tab-change="handleTabChange" 
      />
    </li>

    <li v-if="activeTab === 'analytics'">
      123
    </li>

    <li v-if="activeTab === 'audience'">
      234
    </li>
  </ul>
</template>