<!-- SectionTitle: Reusable page title component with minimal dependencies -->
<script setup>
import { ref, onBeforeUnmount, onErrorCaptured } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ButtonMain from '@/components/button/ButtonMain.vue'
import ProjectsDropdown from '@/components/project/ProjectsDropdown.vue'
import ProjectCreate from '@/components/project/ProjectCreate.vue'

const props = defineProps({
  title: String,
  buttonLabel: String,
  buttonAfter: String,
  buttonStyle: String,
  showDropdown: {
    type: Boolean,
    default: false
  },
  projects: {
    type: Array,
    default: () => []
  },
  currentProjectId: {
    type: [String, Number],
    default: null
  },
  userProfile: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['action', 'project-created', 'dropdown-action', 'edit-project', 'create-project'])

const router = useRouter()
const route = useRoute()
const isLeaving = ref(false)
const showCreateModal = ref(false)
const componentError = ref(null)

onErrorCaptured((error, instance, info) => {
  componentError.value = `SectionTitle error: ${error.message}`
  return false
})

function handleDropdownAction(actionData) {
  if (actionData.action === 'create-project') {
    showCreateModal.value = true
    componentError.value = null
  }
  emit('dropdown-action', actionData)
}

function closeCreateModal() {
  showCreateModal.value = false
}

function handleProjectCreated(event) {
  showCreateModal.value = false
  emit('project-created', event)
}

let unsubscribe = null

if (typeof window !== 'undefined') {
  unsubscribe = router.beforeEach(async (to, from) => {
    if (from.name && to.name !== from.name) {
      isLeaving.value = true
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  })
}

onBeforeUnmount(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<template>
  <ul class="title">
    <li>
      <transition name="title-fade" mode="out-in" appear>
        <h1 :key="isLeaving ? 'leaving' : (title || 'empty')">
          {{ isLeaving ? '' : (title || '') }}
        </h1>
      </transition>
    </li>
    <li>
      <ProjectsDropdown 
        v-if="showDropdown" 
        :projects="projects"
        :currentProjectId="currentProjectId"
        @action="handleDropdownAction" 
        @edit-project="(id) => $emit('edit-project', id)"
        @create-project="() => $emit('create-project')"
      />
      <ButtonMain
        v-else
        :label="buttonLabel"
        :after="buttonAfter"
        :buttonStyle="buttonStyle"
        @click="$emit('action')"
      />
    </li>
  </ul>
  <ProjectCreate
    v-if="showCreateModal"
    v-bind="userProfile"
    @project-created="handleProjectCreated"
    @cancel="closeCreateModal"
  />
</template>

<style scoped>
ul.title {
  display: flex;
  justify-content: space-between;
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border);
  position: relative;
  h1 {
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