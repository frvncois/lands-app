<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
  placeholder?: string
  multiline?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <textarea
    v-if="multiline"
    :value="modelValue"
    :placeholder="placeholder"
    class="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
    rows="3"
    @input="handleInput"
  />
  <input
    v-else
    type="text"
    :value="modelValue"
    :placeholder="placeholder"
    class="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    @input="handleInput"
  />
</template>
