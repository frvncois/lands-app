<script setup>
import { themes } from '@/components/theme/ThemeList.js'

const props = defineProps(['project'])

const selectTheme = (theme) => {
  console.log('🎨 Selecting theme:', theme.title, 'ID:', theme.id)
  
  // Store the theme ID for persistence
  props.project.design.themeId = theme.id
  
  // Also store the theme object for immediate use (will be lost on refresh)
  props.project.design.theme = theme
  
  console.log('🎨 Stored theme ID:', props.project.design.themeId)
}

const allThemes = themes
</script>

<template>
  <ul class="themes" v-if="props.project">
    <li
      v-for="theme in allThemes"
      :key="theme.id"
      class="item"
      @click="selectTheme(theme)"
      :class="['activate', { active: props.project.design.theme?.id === theme.id || props.project.design.themeId === theme.id }]"
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
    }
  }
}
</style>