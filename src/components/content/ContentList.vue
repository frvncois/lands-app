<script setup>
import { ref, computed, toRef } from 'vue'
import { contentComponents } from '@/data/content.js'
import ContentBasic from '@/components/content/ContentBasic.vue'
import ContentLinks from '@/components/content/ContentLinks.vue'
import ContentPosts from '@/components/content/ContentPosts.vue'
import ContentReleases from '@/components/content/ContentReleases.vue'
import ContentShows from '@/components/content/ContentShows.vue'
import ContentMerch from '@/components/content/ContentMerch.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'
import IntegrationsList from '@/components/integrations/IntegrationsList.vue'
import CTABasic from '@/components/global/CTABasic.vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  userStore: {
    type: Object,
    required: true
  }
})

// Create reactive reference to project data
const projectRef = toRef(props, 'project')

// UI state management
const currentView = ref('overview')
const selectedContent = ref(null)
const buttonConfig = ref({ title: '', action: null })

// Component mapping for dynamic imports
const componentMap = {
  ContentBasic,
  ContentLinks,
  ContentPosts,
  ContentReleases,
  ContentShows,
  ContentMerch
}

// Computed properties for data validation
const validProject = computed(() => {
  return projectRef.value && typeof projectRef.value === 'object'
})

const projectData = computed(() => {
  if (!validProject.value) return null
  return {
    ...projectRef.value,
    // Ensure content arrays exist
    links: projectRef.value.links || [],
    socials: projectRef.value.socials || [],
    posts: projectRef.value.posts || [],
    releases: projectRef.value.releases || [],
    shows: projectRef.value.shows || [],
    merch: projectRef.value.merch || []
  }
})

// Content selection and navigation
function selectContent(content) {
  if (!content || !validProject.value) return
  
  selectedContent.value = content
  currentView.value = content.id
  buttonConfig.value = { title: '', action: null }
  
  console.log('📝 Selected content:', content.name)
}

function goBackToOverview() {
  currentView.value = 'overview'
  selectedContent.value = null
  buttonConfig.value = { title: '', action: null }
  
  console.log('🔙 Returned to content overview')
}

function getCurrentComponent() {
  if (!selectedContent.value || !validProject.value) return null
  return componentMap[selectedContent.value.component]
}

// Event handlers
function handleButtonConfig(config) {
  if (!config || typeof config !== 'object') return
  
  buttonConfig.value = {
    title: config.title || '',
    action: config.action || null,
    buttonStyle: config.buttonStyle || 'light'
  }
  
  console.log('⚙️ Button config updated:', config.title)
}

function handleCloseModal() {
  goBackToOverview()
}

// Auto-save project data to the store when changes occur
async function saveProjectData() {
  if (!props.userStore || !validProject.value) return
  
  try {
    const result = await props.userStore.updateProject(projectRef.value.id, projectData.value)
    if (result.success) {
      console.log('✅ Project data auto-saved')
    } else {
      console.error('❌ Failed to save project:', result.error)
    }
  } catch (error) {
    console.error('❌ Error saving project:', error)
  }
}

// Content data validation
function getContentData(contentId) {
  if (!validProject.value || !contentId) return []
  
  const dataKey = contentComponents.find(c => c.id === contentId)?.dataKey
  if (!dataKey) return null
  
  return projectData.value[dataKey] || []
}

// Get count of items for each content type
function getContentCount(contentId) {
  const data = getContentData(contentId)
  return Array.isArray(data) ? data.length : 0
}
</script>

<template>
  <ul class="list" v-if="currentView === 'overview' && validProject">
    <ul class="items">
      <label>Content</label>
      <li
        v-for="content in contentComponents"
        :key="content.id"
        @click="selectContent(content)"
        class="item"
      >
        <div class="icon">
          <component :is="content.icon" />
        </div>
        <div class="content">
          <h3>{{ content.name }}</h3>
          <p>{{ content.description }}</p>
        </div>
        <div class="actions">
          <button>→</button>
        </div>
      </li>
    </ul>
    
    <IntegrationsList 
      :project="projectData" 
      :user-store="userStore"
      v-if="validProject"
    />

    <li>
      <CTABasic 
        title="Need a custom integration?"
        description="Contact our team for custom solutions"
        buttonLabel="Contact us"
        buttonStyle="light"
      />
    </li>
  </ul>

  <!-- Individual content type view -->
  <ul class="list" v-else-if="currentView !== 'overview' && selectedContent && validProject">
    <li class="actions">  
      <div class="title">
        <button @click="goBackToOverview">←</button>
        <h3>{{ selectedContent?.name }}</h3>
      </div>
      <div v-if="buttonConfig.title && buttonConfig.action" class="action">
      <ButtonMain 
        :label="buttonConfig.title"
        :button-style="buttonConfig.buttonStyle"
        @click="buttonConfig.action"
      />
      </div>
    </li>
    

      <component 
        :is="getCurrentComponent()"
        :project="projectData"
        :user-store="userStore"
        @button-config="handleButtonConfig"
        @close-modal="handleCloseModal"
        @save-project="saveProjectData"
      />
  </ul>

  <!-- Error state -->
  <div v-else class="error-state">
    <p>Unable to load content. Please try again.</p>
    <ButtonMain 
      label="Back to Overview"
      button-style="light"
      @click="goBackToOverview"
    />
  </div>
</template>



<style scoped>

ul.list {
  & li.item {
    display: grid;
    grid-template-columns: 0.15fr 1fr 0.15fr;
    align-items: center;
    gap: var(--space-rg);
    cursor: pointer;
    padding: var(--space-rg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    transition: all var(--transition-smooth);
    background: var(--card);
    box-shadow: 0 0 0.25em 0em var(--dark);
    
    > .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    
    > .content {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      
      > p {
        color: var(--details);
        font-size: var(--font-sm);
        font-family: 'mono';
        text-transform: uppercase;
        transition: all var(--transition-smooth);
      }
    }
    
    > .actions {
      display: flex;
      justify-content: flex-end;
      margin-right: var(--space-md);
      
      > button {
        font-size: var(--font-rg);
        transition: all var(--transition-smooth);
      }
    }
    
    &:hover {
      background: var(--dark-hover);
      transform: scale(1.01);
      border-color: var(--focus);
      
      > .actions > button {
        transform: translateX(0.25em);
      }

      > .content > p {
        color: var(--light);
      }
    }
  }
  > li.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  > .title {
    display: flex;
    gap: var(--space-rg);
  }
  }

}
</style>