<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['project-type-selected'])

const selectedType = ref(null)

const projectTypes = [
  {
    id: 'music-artist',
    name: 'Music Artist',
    description: 'Band, musician, or music artist',
    icon: '🎵'
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Company, startup, or business',
    icon: '🏢'
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Personal portfolio or showcase',
    icon: '👤'
  },
  {
    id: 'event',
    name: 'Event',
    description: 'Conference, meetup, or event',
    icon: '📅'
  }
]

const pageTitle = computed(() => {
  return selectedType.value 
    ? 'Create a project' 
    : 'Create a new project'
})

function selectType(type) {
  selectedType.value = type
  emit('project-type-selected', type)
}
</script>

<template>
  <ul class="form">
    <li class="header">
      <h2>{{ pageTitle }}</h2>
      <p>Select a type of project</p>
    </li>
    <ul class="items">
      <li
        v-for="type in projectTypes"
        :key="type.id"
        class="item"
        :class="{ active: selectedType?.id === type.id }"
        @click="selectType(type)"
      >
        <div class="icon">{{ type.icon }}</div>
        <div class="content">
          <h3>{{ type.name }}</h3>
          <p>{{ type.description }}</p>
        </div>
      </li>
    </ul>
  </ul>
</template>

<style scoped>
ul.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);

  > li.header {
    padding-bottom: var(--space-lg);
    border-bottom: 1px solid var(--border);
  }

  li.item {
    display: grid;
    grid-template-columns: 0.15fr 1fr;
    align-items: center;
    gap: var(--space-rg);
    cursor: pointer;
    padding: var(--space-rg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
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
        transition: color var(--transition-smooth);
      }
    }

    &.active {
      background: var(--active);
      border-color: var(--active-border);

      > .content > p {
        color: var(--light);
      }

      &:hover {
        background: var(--active);
        border-color: var(--active-border);
      }
    }

    &:hover {
      background: var(--dark-hover);
      transform: scale(1.01);
      border-color: var(--focus);
      box-shadow: var(--shadow-md);

      > .content > p {
        color: var(--light);
      }
    }
  }
}
</style>