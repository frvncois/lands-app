<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@/components/ui'

const props = defineProps<{
  options: readonly { value: string; label: string }[]
  modelValue: string | undefined
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const option = props.options.find(opt => opt.value === props.modelValue)
  return option?.label ?? props.placeholder ?? 'Select...'
})

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function select(value: string) {
  emit('update:modelValue', value)
  close()
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative min-w-30">
    <!-- Trigger button -->
    <button
      type="button"
      class="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer text-left"
      @click="toggle"
    >
      <span class="truncate">{{ selectedLabel }}</span>
      <Icon
        name="chevron-down"
        :size="10"
        class="text-muted-foreground shrink-0 transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown menu -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute top-full left-0 right-0 mt-1 bg-popover backdrop-blur-sm p-1 border border-border/75 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto origin-top"
      >
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          class="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition-colors cursor-pointer text-left"
          :class="[
            opt.value === modelValue
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-accent/75'
          ]"
          @click="select(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>
