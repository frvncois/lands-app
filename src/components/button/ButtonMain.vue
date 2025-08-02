<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  after: String,
  buttonStyle: {
    type: String,
    default: 'light',
    validator: (value) => ['light', 'dark', 'remove', 'disabled', 'none', 'inactive'].includes(value)
  }
})

defineEmits(['click'])

const afterContent = computed(() => props.after ? `"${props.after}"` : '""')
</script>

<template>
  <button
    v-if="props.label"
    :class="['button', props.buttonStyle]"
    @click="$emit('click')"
    :disabled="props.buttonStyle === 'inactive'"
  >
    {{ label }}
  </button>
</template>

<style scoped>
button {
  padding: var(--space-rg) var(--space-md);
  white-space: nowrap;
  transition:
    background var(--transition-smooth),
    box-shadow var(--transition-smooth);
  
  &:after {
    content: v-bind(afterContent);
  }
  
  &.light {
    background: var(--light);
    color: var(--dark);
    border: 1px solid var(--light);
    
    &:hover {
      background: var(--light-hover);
      box-shadow: var(--shadow-md-hover);
    }
  }
  
  &.dark {
    background-color: transparent;
    color: var(--light);
    border: 1px solid var(--border);
    
    &:hover {
      background: var(--dark-hover);
    }
  }

  &.remove {
    background: var(--remove);
    color: var(--remove-txt);
    border: 1px solid var(--remove-border);
    margin-left: 0;
    margin-right: auto;
    &:hover {
      background: var(--remove-hover);
    }
  }
  
  &.disabled {
    background-color: var(--disabled);
    color: var(--details);
    border: 1px solid var(--border);
    cursor: not-allowed;
    
    &:hover {
      background-color: var(--inactive);
    }
  }
  

}
</style>