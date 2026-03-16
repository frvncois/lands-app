<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import ContentEditor from '../editor/content/ContentEditor.vue'

const props = defineProps<{ modelValue: string; title?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; close: [] }>()

const localValue = ref(props.modelValue)
watch(() => props.modelValue, (val) => { localValue.value = val })

function save() {
  emit('update:modelValue', localValue.value)
  emit('close')
}

function cancel() {
  localValue.value = props.modelValue
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="cancel" />
      <div class="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col" style="max-height: 85vh">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p class="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-0.5">Content editor</p>
            <h2 class="text-sm font-semibold text-gray-900 truncate max-w-xs">{{ title || 'Untitled' }}</h2>
          </div>
          <div class="flex items-center gap-2">
            <BaseButton variant="outline" size="sm" @click="cancel">Cancel</BaseButton>
            <BaseButton variant="solid" size="sm" @click="save">Save</BaseButton>
          </div>
        </div>

        <!-- Editor -->
        <div class="overflow-y-auto flex-1">
          <ContentEditor v-model="localValue" />
        </div>

      </div>
    </div>
  </Teleport>
</template>
