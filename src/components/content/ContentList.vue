<script setup>
import { ref } from 'vue'
import { contentComponents } from '@/data/content.js'
import ContentBasic from '@/components/content/ContentBasic.vue'
import ContentLinks from '@/components/content/ContentLinks.vue'
import ContentPosts from '@/components/content/ContentPosts.vue'
import ContentReleases from '@/components/content/ContentReleases.vue'
import ContentShows from '@/components/content/ContentShows.vue'
import ContentMerch from '@/components/content/ContentMerch.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'
import IntegrationsList from '@/components/integrations/IntegrationsList.vue'

const props = defineProps(['project'])
const currentView = ref('overview')
const selectedContent = ref(null)
const buttonConfig = ref({ title: '', action: null })

const componentMap = {
  ContentBasic,
  ContentLinks,
  ContentPosts,
  ContentReleases,
  ContentShows,
  ContentMerch
}

function selectContent(content) {
  selectedContent.value = content
  currentView.value = content.id
  buttonConfig.value = { title: '', action: null }
}

function goBackToOverview() {
  currentView.value = 'overview'
  selectedContent.value = null
  buttonConfig.value = { title: '', action: null }
}

function getCurrentComponent() {
  if (!selectedContent.value) return null
  return componentMap[selectedContent.value.component]
}

function handleButtonConfig(config) {
  buttonConfig.value = config
}

function handleCloseModal() {
  goBackToOverview()
}
</script>

<template>
  <ul class="list" v-if="currentView === 'overview'">
    <ul class="items">
      <label>Content</label>
      <li
        v-for="content in contentComponents"
        :key="content.id"
        @click="selectContent(content)"
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
    <IntegrationsList :project="project" v-if="currentView === 'overview'"/>
  </ul>
  <ul class="form" v-if="currentView !== 'overview'">
    <li class="title">
      <div>
        <button @click="goBackToOverview">←</button>
        <h3>{{ selectedContent?.name }}</h3>
      </div>
      <ButtonMain
        v-if="buttonConfig.title && buttonConfig.action"
        :label="buttonConfig.title"
        @click="buttonConfig.action"
      />
    </li>
    <li class="content">
      <component
        :is="getCurrentComponent()"
        :project="project"
        @button-config="handleButtonConfig"
        @close-modal="handleCloseModal"
        v-if="getCurrentComponent()"
      />
    </li>
  </ul>
</template>

<style scoped>


ul.list {
  li {
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
}

.modal {
  gap: var(--space-md);
  padding: var(--space-md) 0;
  
  > .title {
    display: flex;
    justify-content: space-between;
    
    > div {
      display: flex;
      gap: var(--space-md);
      align-items: center;
      
      > h3 {
        font-size: 1em;
      }
    }
  }
}
</style>