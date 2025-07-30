<script setup>
import { computed } from 'vue'
import ButtonMain from '../button/ButtonMain.vue'
import InputNormal from '@/components/input/InputNormal.vue'
import InputUpload from '@/components/input/InputUpload.vue'
import InputTextarea from '@/components/input/InputTextarea.vue'
import InputSelect from '@/components/input/InputSelect.vue'
import InputBoolean from '@/components/input/InputBoolean.vue'
import InputDate from '@/components/input/InputDate.vue'
import InputLinks from '@/components/input/InputLinks.vue'
import { formatRelativeTime } from '@/utils/time.js'

const props = defineProps({
  // The current item being edited
  item: {
    type: Object,
    required: true
  },
  // Array of input configurations
  inputs: {
    type: Array,
    required: true
  },
  // Whether to show timestamps
  showTimestamps: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['input', 'delete', 'save'])

// Component mapping for different input types
const inputComponents = {
  text: InputNormal,
  upload: InputUpload,
  textarea: InputTextarea,
  links: InputLinks,
  select: InputSelect,
  boolean: InputBoolean,
  date: InputDate
}

function handleInput() {
  emit('input')
}

function handleDelete() {
  emit('delete')
}

function handleSave() {
  emit('save')
}

function getInputComponent(type) {
  return inputComponents[type] || InputNormal
}

const showDetails = computed(() => {
  return props.showTimestamps && props.item.saved && (props.item.createdAt || props.item.updatedAt)
})
</script>

<template>
  <ul class="modal">
    <!-- Dynamic Input Fields -->
    <component
      v-for="input in inputs"
      :key="input.field"
      :is="getInputComponent(input.type)"
      :label="input.label"
      :details="input.details"
      :placeholder="input.placeholder"
      v-model="item[input.field]"
      :options="input.options"
      @input="handleInput"
    />
    
    <!-- Timestamps & Delete -->
    <div v-if="showDetails" class="details">
      <div class="timestamps">
        <label v-if="!item.updatedAt && item.createdAt">
          Created {{ formatRelativeTime(item.createdAt) }}
        </label>
        <label v-if="item.updatedAt">
          Updated {{ formatRelativeTime(item.updatedAt) }}
        </label>
      </div>
      
      <div class="actions">
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
      </div>
    </div>
  </ul>
</template>

<style scoped>
ul.modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--card);
  position: relative;

  > li {
    padding: var(--space-rg);
  }
}

.details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--details);
  padding: var(--space-rg);
  border-top: 1px solid var(--border);
}

.timestamps {
  display: flex;
  gap: var(--space-sm);
}

.actions {
  display: flex;
  gap: var(--space-sm);
}
</style>