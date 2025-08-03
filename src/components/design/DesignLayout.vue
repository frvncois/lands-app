<script setup>
import { ref } from 'vue'
import InputSelect from '@/components/input/InputSelect.vue'
import FontsIcon from '@/assets/icons/FontsIcon.vue'

const props = defineProps(['project'])

const isExpanded = ref(false)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

// Google Fonts options
const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Ubuntu', label: 'Ubuntu' }
]
</script>

<template>
  <ul class="item">
    <li @click="toggleExpand">
      <div class="icon">
        <FontsIcon/>
      </div>
      <div class="content">
        <h3>Layout</h3>
        <p>Customize layout options</p>
      </div>
      <div class="actions">
        <button>{{ isExpanded ? '−' : '+' }}</button>
      </div>
    </li>
    
    <!-- Second LI - Expandable content -->
    <li v-if="isExpanded" class="expandable-content">
      <div class="font-inputs">
        <InputSelect
          label="Title Font"
          description="Font for headings and titles"
          :options="fontOptions"
          v-model="project.design.titleFont"
        />
        
        <InputSelect
          label="Text Font"
          description="Font for body text and paragraphs"
          :options="fontOptions"
          v-model="project.design.textFont"
        />
      </div>
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
    background-color: var(--dark-hover);
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
        transform: translateX(0.25em);
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

.font-inputs {
  display: flex;
  flex-direction: column;
  gap: 1em;
  width: 100%;
}
</style>