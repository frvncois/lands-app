<script setup>
import AlertIcon from '@/assets/icons/AlertIcon.vue';
defineProps({
  message: String,
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['updating', 'success', 'error'].includes(value)
  }
})
</script>

<template>
  <li :class="['alert', type]">
    <AlertIcon/>
    <p>{{ message }}</p>
  </li>
</template>

<style scoped>
li.alert {
  display: flex;
  gap: var(--space-md);
  align-items: center;
  padding: var(--space-md);
  text-align: center;
  border-radius: var(--radius-md);
  border: 1px solid;
}

li.alert p {
  font-size: var(--font-sm);
  font-family: 'mono';
  text-transform: uppercase;
  margin: 0;
}

li.alert svg {
  transition: color var(--transition-smooth);
}

/* Success state */
li.alert.success {
  background: var(--success);
  border-color: var(--success-border);
  color: var(--success-text);
}

li.alert.success svg {
  color: var(--success-border);
}

/* Error state */
li.alert.error {
  background: var(--error);
  border-color: var(--error-border);
  color: var(--error-text);
}

li.alert.error svg {
  color: var(--error-border);
}

/* Updating state */
li.alert.updating {
  background: var(--info);
  border-color: var(--info-border);
  color: var(--info-text);
}

li.alert.updating svg {
  color: var(--info-border);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>