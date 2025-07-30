<script setup>
import { onMounted } from 'vue'
import InputNormal from '@/components/input/InputNormal.vue'
import InputTextarea from '@/components/input/InputTextarea.vue'
import InputUpload from '@/components/input/InputUpload.vue'
import InputLinks from '@/components/input/InputLinks.vue'

const props = defineProps(['project'])
const emit = defineEmits(['button-config'])

function initializeFields() {
  if (!props.project.contacts) {
    props.project.contacts = []
  }
  if (!props.project.socialLinks) {
    props.project.socialLinks = []
  }
  if (!props.project.coverImage) {
    props.project.coverImage = ''
  }
  if (!props.project.location) {
    props.project.location = ''
  }
}

function setupButtonConfig() {
  emit('button-config', {
    title: '',
    action: null
  })
}

onMounted(() => {
  initializeFields()
  setupButtonConfig()
})
</script>

<template>
  <ul class="form">
    <ul class="items">
    <InputNormal 
      label="Project Title" 
      placeholder="Your project name"
      v-model="project.name" 
    />

    <InputUpload 
      label="Cover Image" 
      placeholder="Project cover image"
      v-model="project.coverImage" 
    />
    </ul>
    <ul class="items">
      <InputTextarea 
        label="Introduction" 
        placeholder="Describe your project..."
        v-model="project.description" 
      />
      <InputNormal 
      label="Location" 
      placeholder="City, Country or Studio location"
      v-model="project.location" 
    />
    </ul>
    
    <InputLinks 
      label="Contacts" 
      v-model="project.contacts" 
    />
    
    <InputLinks 
      label="Social Links" 
      v-model="project.socialLinks" 
    />
  </ul>
</template>

<style scoped>
ul.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
ul.items{
  padding-bottom: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  border-bottom: 1px solid var(--border);
}
</style>