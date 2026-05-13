<script setup lang="ts">

const props = withDefaults(defineProps<{
  label: string
  description?: string
  modelValue?: boolean
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})

defineEmits<{ 'update:modelValue': [value: boolean] }>()

const sizes = {
  sm: { label: 'text-xs', description: 'text-xs', toggle: 'w-7 h-4', knob: 'h-3 w-3', active: 'translate-x-3' },
  md: { label: 'text-xs', description: 'text-xs', toggle: 'w-9 h-5', knob: 'h-4 w-4', active: 'translate-x-4' },
  lg: { label: 'text-sm', description: 'text-xs', toggle: 'w-11 h-6', knob: 'h-5 w-5', active: 'translate-x-5' },
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <p class="text-gray-700" :class="sizes[size].label">{{ label }}</p>
        <p v-if="description" class="text-gray-400" :class="sizes[size].description">{{ description }}</p>
      </div>
      <button
        class="relative rounded-full transition-colors shrink-0"
        :class="[sizes[size].toggle, modelValue ? 'bg-gray-900' : 'bg-gray-200']"
        @click="$emit('update:modelValue', !modelValue)"
      >
        <span
          class="absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform"
          :class="[sizes[size].knob, modelValue ? sizes[size].active : '']"
        />
      </button>
    </div>
    <div
      v-if="$slots.default"
      class="overflow-hidden"
      :style="modelValue
        ? { maxHeight: '200px', opacity: '1', transition: 'max-height 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.45s ease' }
        : { maxHeight: '0px',   opacity: '0', transition: 'max-height 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease' }"
    >
      <div class="pt-3">
        <slot />
      </div>
    </div>
  </div>
</template>
