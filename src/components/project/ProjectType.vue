<script setup>
import { ref, computed } from 'vue'
import { useAccountStore } from '@/stores/account'

const accountStore = useAccountStore()
const emit = defineEmits(['project-type-selected'])

const projectTypes = [
  {
    id: 'music-artist',
    name: 'Music Artist',
    description: 'Solo artist, band, or musical group',
    icon: '🎤',
    features: ['Releases & Albums', 'Show Dates', 'Merchandise', 'Fan Links']
  },
  {
    id: 'label',
    name: 'Label',
    description: 'Record label or music company',
    icon: '🏷️',
    features: ['Artist Roster', 'Label Releases', 'Distribution', 'Contacts']
  },
  {
    id: 'promoter',
    name: 'Promoter',
    description: 'Event promoter or booking agency',
    icon: '📢',
    features: ['Event Portfolio', 'Artist Booking', 'Venue Network', 'Promotion']
  },
  {
    id: 'venue',
    name: 'Venue',
    description: 'Concert hall, club, or event space',
    icon: '🏛️',
    features: ['Event Calendar', 'Capacity Info', 'Technical Specs', 'Booking']
  },
  {
    id: 'festival',
    name: 'Festival',
    description: 'Music festival or multi-day event',
    icon: '🎪',
    features: ['Lineup & Stages', 'Ticketing', 'Schedule', 'Sponsors']
  }
]

const selectedType = ref(null)

// Computed property for dynamic title based on account status AND project count
const pageTitle = computed(() => {
  return accountStore.status === 'NewAccount' && accountStore.userProjects.length === 0
    ? 'Create a project' 
    : 'Create a new project'
})

function selectType(type) {
  selectedType.value = type
  emit('project-type-selected', type)
}
</script>

<template>
  <ul class="list">
    <li class="header">
      <h2>{{ pageTitle }}</h2>
      <p>Select a type of project</p>
    </li>
    
    <li
      v-for="type in projectTypes"
      :key="type.id"
      class="item"
      :class="{ selected: selectedType?.id === type.id }"
      @click="selectType(type)"
    >
      <div class="icon">{{ type.icon }}</div>
      <div class="content">
        <h3>{{ type.name }}</h3>
        <p>{{ type.description }}</p>
      </div>

    </li>
  </ul>
</template>

<style scoped>
ul.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-rg);
  padding: var(--space-md);

  > li.header {
    text-align: center;
    padding: var(--space-lg);

    h2 {
      margin: 0 0 var(--space-sm) 0;
      font-size: var(--font-lg);
      color: var(--text-primary);
    }
    p {
        font-family: 'mono';
        font-size: var(--font-sm);
        text-transform: uppercase;
        color: var(--details);
      }
  }

  li.item {
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
      }
    }
  }
}
</style>