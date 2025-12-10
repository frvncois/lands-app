<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
  placeholder?: string
  multiline?: boolean
  type?: 'text' | 'number' | 'url' | 'email'
  suffix?: string
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
    class="w-full px-2.5 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/25 focus:bg-background transition-colors resize-none"
    rows="3"
    @input="handleInput"
  />
  <div v-else class="flex w-full">
    <input
      :type="type || 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      class="w-full px-2.5 py-1.5 text-xs bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/25 focus:bg-background transition-colors"
      :class="[
        suffix ? 'rounded-l-lg border-r-0' : 'rounded-lg'
      ]"
      @input="handleInput"
    />
    <span
      v-if="suffix"
      class="inline-flex items-center px-2 border border-border bg-muted/25 text-muted-foreground font-mono uppercase text-[10px] rounded-r-lg"
    >
      {{ suffix }}
    </span>
  </div>
</template>
