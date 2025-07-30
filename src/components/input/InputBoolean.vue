<script setup>
const props = defineProps([
  'label',
  'details',
  'modelValue'
])
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <li>
    <div class="title">
      <h3>{{ props.label }}</h3>
      <p>{{ props.details }}</p>
    </div>
    
    <label class="toggle">
      <input
        type="checkbox"
        :checked="props.modelValue"
        @change="emit('update:modelValue', $event.target.checked)"
      />
      <span class="slider"></span>
    </label>
  </li>
</template>

<style scoped>
li {
  display: flex;
  gap: var(--space-rg);
  align-items: flex-start;
  justify-content: space-between;

  > label {
    border: unset;
  }
  
  > .title {
    display: flex;
    gap: var(--space-sm);
    flex-direction: column;
    flex: 0.75;
    
    > p {
      font-size: var(--font-sm);
      color: var(--details);
    }
  }
}

/* Toggle Switch Styles */
.toggle {
  position: relative;
  display: inline-block;
  width: 2.5em;
  height: 1.5em;
  cursor: pointer;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--false);
  border-radius: var(--radius-md);
  transition: all var(--transition-smooth);
  border: 1px solid var(--false-border);
}

.slider:before {
  position: absolute;
  content: "";
  width: 1.5em;
  height: 1.5em;
  left: 0.125em;
  bottom: 0.125em;
  background-color: var(--toggle);
  border-radius: 50%;
  transition: all var(--transition-smooth);
}


/* Active state */
input:checked + .slider {
  background-color: var(--true);
  border: 1px solid var(--true-border);
}

input:checked + .slider:before {
  transform: translateX(2.125em);
} 
/* Disabled state */
input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>