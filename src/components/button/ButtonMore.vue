<template>
  <ul class="dropdown">
    <button class="more" @click="toggleDropdown">
      <span class="dots">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>
    
    <ul v-if="showDropdown" class="menu">
      <li v-for="(item, index) in menuItems" :key="index">
        <button @click="handleAction(item.action, item.label)">
          {{ item.label }}
        </button>
      </li>
    </ul>
</ul>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  menuItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['action'])

const showDropdown = ref(false)

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function handleAction(action, label) {
  emit('action', { action, label })
  showDropdown.value = false
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
  if (!event.target.closest('.dropdown')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
ul.dropdown {
  position: relative;
  margin-left: auto;
  display: flex;
  > button {
    &.more {
      background: none;
      border: none;
      cursor: pointer;
      height: 2.5em;
      width: 2.5em;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      transition: background var(--transition-smooth);
      &:hover {
        background: var(--dark-hover);
      }
      > .dots {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      }
      > .dots span {
        width: 2px;
        height: 2px;
        background-color: var(--details);
        border-radius: 50%;
        display: block;
      }
    }
  }
}

ul.menu {
  position: absolute;
  top: -1em;
  right: -12.5em;
  margin-top: var(--space-sm);
  background: var(--dark);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  z-index: 2;
  min-width: 10em;
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  & button {
    padding: var(--space-sm) var(--space-rg);
    width: 100%;
    text-align: left;
    &:hover {
      background: var(--light);
      color: var(--dark);
    }
  }
}
</style>