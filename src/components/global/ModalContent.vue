// src/components/global/ModalContent.vue - Add provide to script setup

<script setup>
import { ref, watch, onMounted, provide, inject } from 'vue'
import ButtonMain from '../button/ButtonMain.vue'
import InputNormal from '@/components/input/InputNormal.vue'
import InputUpload from '@/components/input/InputUpload.vue'
import InputTextarea from '@/components/input/InputTextarea.vue'
import InputSelect from '@/components/input/InputSelect.vue'
import InputBoolean from '@/components/input/InputBoolean.vue'
import InputDate from '@/components/input/InputDate.vue'
import InputLinks from '@/components/input/InputLinks.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  inputs: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['input', 'delete', 'save', 'cancel'])

// Try to get projectId from parent and provide it to children
const projectId = inject('projectId', null)
if (projectId) {
  provide('projectId', projectId)
}

// Component mapping
const inputComponents = {
  text: InputNormal,
  upload: InputUpload,
  textarea: InputTextarea,
  links: InputLinks,
  select: InputSelect,
  boolean: InputBoolean,
  date: InputDate
}

// Local reactive data
const localData = ref({})

// Initialize local data on mount
onMounted(() => {
  localData.value = { ...props.item }
  console.log('📝 ModalContent: Initialized with item data')
  if (projectId) {
    console.log('📝 ModalContent: Provided projectId to children:', projectId)
  }
})

// Watch for external item changes
watch(() => props.item, (newItem) => {
  localData.value = { ...newItem }
}, { deep: true })

// Watch local changes and sync back to parent
watch(localData, (newData) => {
  Object.assign(props.item, newData)
  emit('input')
}, { deep: true })

// Field update handler
function handleFieldUpdate(field, value) {
  localData.value[field] = value
}

// Action handlers
function handleSave() {
  emit('save')
}

function handleDelete() {
  emit('delete')
}

function handleCancel() {
  emit('cancel')
}

// Get component by type
function getInputComponent(type) {
  return inputComponents[type] || InputNormal
}
</script>

<template>
  <ul class="item">
    <li class="form">
      <component
        v-for="input in inputs"
        :key="input.field"
        :is="getInputComponent(input.type)"
        :label="input.label"
        :details="input.details"
        :placeholder="input.placeholder"
        :modelValue="localData[input.field]"
        @update:modelValue="(value) => handleFieldUpdate(input.field, value)"
        :options="input.options"
      />
    </li>
    <li class="actions">
      <ButtonMain
        @click="handleDelete"
        label="Delete"
        buttonStyle="remove"
      />
      <ButtonMain
        @click="handleSave"
        label="Save"
        buttonStyle="light"
      />
    </li>
  </ul>
</template>

<style scoped>
ul.item {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--card);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

li.form {
  padding: var(--space-md);
  gap: var(--space-md);
  display: flex;
  flex-direction: column;
}

li.actions {
  display: flex;
  border-top: 1px solid var(--border);
  padding: var(--space-md);
  background: var(--nav);
}
</style>