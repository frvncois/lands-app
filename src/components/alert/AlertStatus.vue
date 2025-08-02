<!-- AlertStatus - Global alert component -->
<script setup>
import { computed } from 'vue'
import { useAlertStore } from '@/stores/alert'

import AlertIcon from '@/assets/icons/AlertIcon.vue'
import SettingsIcon from '@/assets/icons/SettingsIcon.vue'
import ProjectsIcon from '@/assets/icons/ProjectsIcon.vue'

const alertStore = useAlertStore()

const currentIcon = computed(() => {
  switch (alertStore.type) {
    case 'updating':
      return SettingsIcon
    case 'success':
      return ProjectsIcon
    case 'error':
      return AlertIcon
    default:
      return AlertIcon
  }
})
</script>

<template>
  <transition name="alert-fade" appear>
    <div v-if="alertStore.isVisible" class="alert-container">
      <li :class="['alert', alertStore.type]">
        <component :is="currentIcon" />
        <p>{{ alertStore.message }}</p>
      </li>
    </div>
  </transition>
</template>

<style scoped>
.alert-container {
  position: fixed;
  top: var(--space-lg);
  right: var(--space-lg);
  z-index: 1000;
  pointer-events: none;
}

li.alert {
  display: flex;
  gap: var(--space-md);
  align-items: center;
  padding: var(--space-md);
  text-align: center;
  border-radius: var(--radius-md);
  border: 1px solid;
  pointer-events: auto;
  min-width: 250px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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

/* Transition animations */
.alert-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.alert-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.alert-fade-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.alert-fade-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}
</style>