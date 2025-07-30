<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ButtonMain from '@/components/button/ButtonMain.vue'
import ProjectsDropdown from '@/components/project/ProjectsDropdown.vue'
import ProjectCreate from '@/components/project/ProjectCreate.vue'

const props = defineProps({
  title: String,
  buttonLabel: String,
  buttonAfter: String,
  buttonStyle: String
})

defineEmits(['action'])

const router = useRouter()
const route = useRoute()
const isLeaving = ref(false)
const showCreateModal = ref(false)

// Check if current route starts with /projects/
const showProjectsDropdown = computed(() => {
  return route.path.startsWith('/projects/')
})

function handleDropdownAction(actionData) {
  if (actionData.action === 'create-project') {
    // Show the ProjectCreate modal directly
    showCreateModal.value = true
  }
}

function closeCreateModal() {
  showCreateModal.value = false
}

function handleProjectCreated() {
  showCreateModal.value = false
  // Navigate to home page after project creation
  router.push('/')
}

// Intercept navigation to allow exit animation
const unsubscribe = router.beforeEach(async (to, from) => {
  if (from.name && to.name !== from.name) {
    isLeaving.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
  }
})

onBeforeUnmount(() => {
  unsubscribe()
})
</script>

<template>
  <ul>
    <li>
      <transition name="title-fade" mode="out-in" appear>
        <h1 :key="isLeaving ? 'leaving' : (title || 'empty')">
          {{ isLeaving ? '' : (title || '') }}
        </h1>
      </transition>
    </li>
    <li>
      <!-- Show ProjectsDropdown if route starts with /projects/ -->
      <ProjectsDropdown v-if="showProjectsDropdown" @action="handleDropdownAction" />
      
      <!-- Show ButtonMain for all other routes -->
      <ButtonMain
        v-else
        :label="buttonLabel"
        :after="buttonAfter"
        :buttonStyle="buttonStyle"
        @click="$emit('action')"
      />
    </li>
  </ul>

  <!-- ProjectCreate Modal -->
  <ProjectCreate
    v-if="showCreateModal"
    @project-created="handleProjectCreated"
    @cancel="closeCreateModal"
  />
</template>

<style scoped>
ul {
  display: flex;
  justify-content: space-between;
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border);
  position: relative;

  & h1 {
    font-size: var(--font-md);
    line-height: 1.25;
  }
}

.title-fade-enter-active {
  transition: all var(--transition-smooth);
}

.title-fade-leave-active {
  transition: all var(--transition-smooth);
}

.title-fade-enter-from {
  opacity: 0;
  transform: translateY(0.25em);
}

.title-fade-leave-to {
  opacity: 0;
  transform: translateY(-0.25em);
}
</style>