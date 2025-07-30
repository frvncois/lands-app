<template>
  <li>
    <label>{{ label }}</label>
    <select v-model="model">
      <option value="" disabled>{{ placeholder }}</option>
      <option 
        v-for="option in options" 
        :key="option.value" 
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <p>{{ details }}</p>
  </li>
</template>

<script setup>
const model = defineModel()

defineProps({
  label: String,
  details: String,
  placeholder: {
    type: String,
    default: 'Select an option'
  },
  options: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
li {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: stretch;

  select {
    flex-grow: 1;
    display: flex;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg);
    color: var(--text-primary);
    font-size: var(--font-md);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--focus);
    }

    &:focus {
      outline: none;
      border-color: var(--focus);
      box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
    }

    option {
      background: var(--bg);
      color: var(--text-primary);
      padding: 0.5rem;
    }

    option:disabled {
      color: var(--text-secondary);
      opacity: 0.6;
    }
  }

  p {
    font-size: var(--font-sm);
    font-family: 'mono';
    text-transform: uppercase;
    text-align: right;
    color: var(--details);
  }
}
</style>