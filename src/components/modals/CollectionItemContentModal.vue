<script setup lang="ts">
import { ref, watch } from 'vue'
import ContentEditor from '../editor/content/ContentEditor.vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; close: [] }>()

const localValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => { localValue.value = val })
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" @click="emit('close')" />
      <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <h2 class="text-sm font-semibold text-gray-900">Content</h2>
          <BaseButton variant="outline" size="xs" @click="emit('close')">Done</BaseButton>
        </div>
        <!-- Editor -->
        <div class="p-4 overflow-y-auto">
          <ContentEditor
            v-model="localValue"
            @update:modelValue="emit('update:modelValue', $event)"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>
