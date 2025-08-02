<template>
  <ul class="form">
    <li class="header">
      <h1>{{ pageTitle }}</h1>
      <p>{{ subtitle }}</p>
    </li>
    <li
      v-for="option in options"
      :key="option.id"
      class="item"
      :class="{ checked: modelValue.includes(option.id) }"
      @click="toggleSelection(option.id)"
    >
      <div class="content">
        <h3>{{ option.name }}</h3>
        <p>{{ option.description }}</p>
      </div>
      <label class="toggle">
        <input
          type="checkbox"
          :checked="modelValue.includes(option.id)"
          @change="toggleSelection(option.id)"
          @click.stop
        />
        <span class="slider"></span>
      </label>
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({
  pageTitle: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

function toggleSelection(optionId) {
  const currentSelection = [...props.modelValue]
  const index = currentSelection.indexOf(optionId)
  
  if (index > -1) {
    currentSelection.splice(index, 1)
  } else {
    currentSelection.push(optionId)
  }
  
  emit('update:modelValue', currentSelection)
}
</script>

<style scoped>
li.item {
  display: grid;
  grid-template-columns: 1fr 0.15fr;
  align-items: center;
  gap: var(--space-rg);
  cursor: pointer;
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  transition: all var(--transition-smooth);
  background: var(--card);

  > .toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 2.5em;
    height: 1.5em;
    cursor: pointer;
    border: unset;
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

  &.checked {
    border-color: var(--focus);
    background: var(--selected, var(--card));
  }
}

/* Toggle Switch Styles */
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