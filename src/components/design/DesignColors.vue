<script setup>
import { ref } from 'vue'
import InputColor from '@/components/input/InputColor.vue'
import ColorsIcon from '@/assets/icons/ColorsIcon.vue'

const props = defineProps(['project'])
const isExpanded = ref(false)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <ul class="item" :class="{ expanded: isExpanded }">
    <li @click="toggleExpand">
      <div class="icon">
        <ColorsIcon/>
      </div>
      <div class="content">
        <h3>Colors</h3>
        <p>Set your color palette</p>
      </div>
      <div class="actions">
        <button>{{ isExpanded ? '−' : '+' }}</button>
      </div>
    </li>
    
    <!-- Second LI - Expandable content -->
    <li v-if="isExpanded" class="expandable-content">
      <ul class="form">
        <InputColor
          label="Background Color"
          description="Main background color for your theme"
          v-model="project.design.backgroundColor"
        />
        <InputColor
          label="Accent Color"
          description="Primary color for links and highlights"
          v-model="project.design.accentColor"
        />
        <InputColor
          label="Text Color"
          description="Main text color for readability"
          v-model="project.design.textColor"
        />
      </ul>
    </li>
  </ul>
</template>

<style scoped>
ul.item {
  display: flex;
  flex-direction: column;
  padding: var(--space-rg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  transition: all var(--transition-smooth);
  background: var(--card);
  box-shadow: var(--shadow-sm);

  &:hover {
      background: var(--dark-hover);
      transform: scale(1.01);
      border: 1px solid var(--focus);
  }
  
  
  &.expanded {
    border-color: var(--active-border);
    background-color:  var(--dark-hover);
    box-shadow: var(--shadow-md);
      transform: scale(1.01);
  }

  li {
    display: grid;
    grid-template-columns: 0.15fr 1fr 0.15fr;
    align-items: center;
    gap: var(--space-rg);
    cursor: pointer;
    
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
      > .actions > button {
        transform: rotate(90deg);
      }
    }
  }

  /* Expandable content styling */
  li.expandable-content {
    grid-template-columns: 1fr;
    cursor: default;
    padding: 1em;
  }
}

.color-inputs {
  display: flex;
  flex-direction: column;
  gap: 1em;
  width: 100%;
}

.color-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5em 0;
  
  input[type="color"] {
    width: 3em;
    height: 2.5em;
    border: 1px solid var(--border);
    border-radius: 0.5em;
    cursor: pointer;
    background: none;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: var(--focus);
      transform: scale(1.05);
    }
    
    &:focus {
      outline: none;
      border-color: var(--focus);
      box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
    }
  }
}
</style>