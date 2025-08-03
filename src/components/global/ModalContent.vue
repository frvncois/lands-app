<script setup>
import { ref, watch, onMounted } from 'vue'
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

const emit = defineEmits(['input', 'delete', 'save'])

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

// Create LOCAL reactive copies of the data
const localData = ref({})

// Initialize local data when component mounts
onMounted(() => {
  console.log('🔄 ModalContent: Initializing local data from item:', props.item)
  
  // Create a local copy of all the data
  localData.value = { ...props.item }
  
  console.log('✅ ModalContent: Local data initialized:', localData.value)
})

// Watch for external changes to the item
watch(() => props.item, (newItem) => {
  console.log('🔄 ModalContent: Item changed externally:', newItem)
  localData.value = { ...newItem }
}, { deep: true })

// Watch local data changes and emit them back to parent
watch(localData, (newData) => {
  console.log('📝 ModalContent: Local data changed:', newData)
  
  // Update the original item with our local changes
  Object.assign(props.item, newData)
  
  // Emit the input event to notify parent
  emit('input')
}, { deep: true })

function handleFieldUpdate(field, value) {
  console.log(`📝 ModalContent: Field ${field} updated to:`, value)
  localData.value[field] = value
}

function handleSave() {
  console.log('💾 ModalContent: Save button clicked')
  emit('save')
}

function handleDelete() {
  console.log('🗑️ ModalContent: Delete button clicked')
  emit('delete')
}

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
  padding: var(--space-rg);
  background: var(--nav);
}
</style>