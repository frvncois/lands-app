<script setup>
import { computed } from 'vue'
import { themes } from '@/components/theme/ThemeList.js'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  userStore: {
    type: Object,
    default: null
  }
})

// Ensure design object exists
const projectDesign = computed(() => {
  if (!props.project.design) {
    props.project.design = {}
  }
  return props.project.design
})

const selectTheme = (theme) => {
  console.log('🎨 Selecting theme:', theme.title, 'ID:', theme.id)
  
  // Ensure design object exists before setting properties
  if (!props.project.design) {
    props.project.design = {}
  }
  
  // Store the theme ID for persistence
  props.project.design.themeId = theme.id
  
  // Also store the theme object for immediate use (will be lost on refresh)
  props.project.design.theme = theme
  
  console.log('🎨 Theme stored in user.js store')
  
  // Optional: Save to localStorage for drafts
  saveToLocalStorage(theme)
}

function saveToLocalStorage(theme) {
  try {
    const projectId = props.project.id
    if (!projectId) return
    
    const draftKey = `project_draft_${projectId}`
    const existingDraft = localStorage.getItem(draftKey)
    
    let draftData = {}
    if (existingDraft) {
      draftData = JSON.parse(existingDraft)
    }
    
    // Update design in draft
    draftData.design = {
      ...draftData.design,
      themeId: theme.id,
      theme: theme
    }
    
    draftData.lastModified = new Date().toISOString()
    
    localStorage.setItem(draftKey, JSON.stringify(draftData))
    console.log('💾 Theme saved to localStorage (not database)')
  } catch (error) {
    console.error('❌ Error saving to localStorage:', error)
  }
}

// Get current selected theme ID safely
const currentThemeId = computed(() => {
  return projectDesign.value?.themeId || projectDesign.value?.theme?.id || null
})

const allThemes = themes
</script>

<template>
  <ul class="themes" v-if="props.project">
    <li
      v-for="theme in allThemes"
      :key="theme.id"
      class="item"
      @click="selectTheme(theme)"
      :class="['activate', { active: currentThemeId === theme.id }]"
    >
      <div class="icon">
        <component :is="theme.icon"/>
      </div>
      <div class="details">
        <label>{{ theme.title }}</label>
      </div>
    </li>
  </ul>
</template>

<style scoped>
ul.themes {
  display: flex;
  flex-direction: row;
  gap: var(--space-rg);
  padding: var(--space-lg) 0;

  li.item {
    display: flex;
    flex-direction: column;
    gap: var(--space-rg);
    cursor: pointer;
    padding: var(--space-rg);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    transition: all var(--transition-smooth);
    background: var(--card);
    aspect-ratio: 1;
    flex: 1;
    text-align: center;
    box-shadow: var(--shadow-sm);

    .icon {
      border-radius: var(--radius-rg);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      overflow: hidden;
      aspect-ratio: 1;
    }

    &.active {
      background: var(--active);
      border-color: var(--active-border);

      &:hover {
        background: var(--active);
        border-color: var(--active-border);
      }
    }

    &:hover {
      background: var(--dark-hover);
      border-color: var(--focus);
      box-shadow: var(--shadow-md);
    }
  }
}
</style>