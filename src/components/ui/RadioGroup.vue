<script setup lang="ts">
import { provide, computed, toRef } from 'vue'

interface Props {
  modelValue?: string
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'vertical',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Provide value and update function to children
provide('radioGroupValue', computed(() => props.modelValue))
provide('radioGroupUpdate', (value: string) => {
  if (!props.disabled) {
    emit('update:modelValue', value)
  }
})
provide('radioGroupDisabled', toRef(props, 'disabled'))
</script>

<script lang="ts">
import RadioGroupItem from './RadioGroupItem.vue'
import RadioGroupOption from './RadioGroupOption.vue'

export default {
  Item: RadioGroupItem,
  Option: RadioGroupOption,
}
</script>

<template>
  <div
    role="radiogroup"
    :class="[
      'grid gap-2',
      orientation === 'horizontal' ? 'grid-flow-col auto-cols-fr' : 'grid-flow-row',
    ]"
  >
    <slot />
  </div>
</template>
