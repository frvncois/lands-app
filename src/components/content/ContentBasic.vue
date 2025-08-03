<!-- src/components/content/ContentBasic.vue -->
<script setup>
import { toRef, onMounted } from 'vue'
import InputText from '@/components/input/InputText.vue'
import InputTextarea from '@/components/input/InputTextarea.vue'
import InputNormal from '@/components/input/InputNormal.vue'
import InputUpload from '@/components/input/InputUpload.vue'
import InputLinks from '@/components/input/InputLinks.vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['button-config'])

// Use toRef to maintain reactivity
const projectRef = toRef(props, 'project')

// No save button needed - auto-saves to localStorage
function setupButtonConfig() {
  emit('button-config', {
    title: '',
    action: null
  })
}

onMounted(() => {
  setupButtonConfig()
})
</script>

<template>
  <ul class="form" v-if="projectRef">
    <ul class="items">
      <InputText
        label="Project Title"
        placeholder="Your project name"
        v-model="projectRef.name"
      />
      <InputUpload
        label="Cover Image"
        v-model="projectRef.coverImage"
      />
    </ul>
    
    <ul class="items">
      <InputTextarea
        label="Introduction"
        placeholder="Describe your project..."
        v-model="projectRef.description"
      />
      <InputNormal
        label="Location"
        placeholder="City, Country or Studio location"
        v-model="projectRef.location"
      />
    </ul>
    
    <ul class="items">
      <InputLinks
        label="Contacts"
        titlePlaceholder="Contact title"
        urlPlaceholder="website, email or tel"
        v-model="projectRef.contacts"
      />
    </ul>
    
    <ul class="items">
      <InputLinks
        label="Social Links"
        titlePlaceholder="Platform name"
        urlPlaceholder="Profile URL or handle"
        v-model="projectRef.socialLinks"
      />
    </ul>
  </ul>
</template>

<style scoped>
ul.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

ul.items {
  padding-bottom: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.error-state {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
}
</style>