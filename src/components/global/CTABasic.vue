<script setup>
import ButtonMain from '@/components/button/ButtonMain.vue'

// Define props for customization
const props = defineProps({
  title: {
    type: String,
    default: 'Need a custom theme?'
  },
  description: {
    type: String,
    default: 'We can build custom theme for you'
  },
  buttonLabel: {
    type: String,
    default: 'Learn more'
  },
  buttonStyle: {
    type: String,
    default: 'dark'
  }
})

// Define emits for button click handling
const emit = defineEmits(['click', 'action'])

function handleButtonClick() {
  emit('click')
  emit('action')
}
</script>

<template>
  <li class="cta">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <ButtonMain 
      :label="buttonLabel" 
      :buttonStyle="buttonStyle"
      @click="handleButtonClick"
    />
  </li>
</template>

<style scoped>
.cta {
  display: flex;
  flex-direction: column;
  padding: var(--space-lg);
  gap: var(--space-rg);
  align-items: center;
  text-align: center;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: var(--cta);
  box-shadow: var(--shadow-sm);
  margin-top: var(--space-lg);


  > p {
    margin: 0;
    font-family: 'mono';
    text-transform: uppercase;
    font-size: var(--font-sm);
    color: var(--details);
    max-width: 40ch;
    line-height: 1.4;
  }
}
</style>