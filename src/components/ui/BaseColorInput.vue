<script setup lang="ts">
import { ref, nextTick } from 'vue'
import BaseColorPicker from './BaseColorPicker.vue'

const props = withDefaults(defineProps<{
  label: string
  modelValue?: string
}>(), {
  modelValue: '#000000',
})

const emit = defineEmits<{ 'update:modelValue': [color: string] }>()

const open = ref(false)
const pickerStyle = ref({ top: '0px', left: '0px' })
const triggerRef = ref<HTMLButtonElement | null>(null)

async function toggle() {
  if (open.value) { open.value = false; return }
  await nextTick()
  const rect = triggerRef.value?.getBoundingClientRect()
  if (rect) {
    pickerStyle.value = {
      top: `${rect.bottom + 6}px`,
      left: `${rect.right - 176}px`,
    }
  }
  open.value = true
}

function select(color: string) {
  emit('update:modelValue', color)
  open.value = false
}
</script>

<template>
  <div class="relative flex items-center justify-between py-1.5">
    <span class="text-sm text-gray-700">{{ label }}</span>
    <button
      ref="triggerRef"
      class="h-6 w-6 rounded-md border border-black/10 hover:scale-110 transition-transform"
      :style="{ backgroundColor: modelValue }"
      @click="toggle"
    />

    <Teleport to="body">
      <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />
      <Transition name="modal-grow">
        <div v-if="open" class="fixed z-50" :style="pickerStyle">
          <BaseColorPicker @select="select" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
