<!-- AccountAuth - Duplicated from AccountStatus with different props -->
<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import AlertIcon from '@/assets/icons/AlertIcon.vue'
import SettingsIcon from '@/assets/icons/SettingsIcon.vue'
import ProjectsIcon from '@/assets/icons/ProjectsIcon.vue'

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['updating', 'success', 'error'].includes(value)
  }
})

const isVisible = ref(true)

const currentIcon = computed(() => {
  switch (props.type) {
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

function startAutoHide() {
  if (props.type === 'updating') return
  
  const hideDelay = props.type === 'success' ? 3000 : 5000
  setTimeout(() => {
    isVisible.value = false
  }, hideDelay)
}

onMounted(() => {
  startAutoHide()
})

watch(() => props.message, () => {
  isVisible.value = true
  startAutoHide()
})

watch(() => props.type, () => {
  isVisible.value = true
  startAutoHide()
})
</script>

<template>
  <transition name="status-fade" appear>
    <li v-if="isVisible" :class="['alert', type]">
      <component :is="currentIcon" />
      <p>{{ message }}</p>
    </li>
  </transition>
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

/* Transition animations - same pattern as SectionTitle */
.status-fade-enter-active {
  transition: all var(--transition-smooth);
}

.status-fade-leave-active {
  transition: all var(--transition-smooth);
}

.status-fade-enter-from {
  opacity: 0;
  transform: translateY(0.25em);
}

.status-fade-leave-to {
  opacity: 0;
  transform: translateY(-0.25em);
}
</style>