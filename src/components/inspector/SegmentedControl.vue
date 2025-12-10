<script setup lang="ts">
import { Icon, Tooltip } from '@/components/ui'

defineProps<{
  options: readonly { value: string; label?: string; icon?: string }[]
  modelValue: string | undefined
  iconOnly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex p-1 bg-secondary rounded-md">
    <template v-for="option in options" :key="option.value">
      <!-- Icon only mode: wrap in Tooltip -->
      <Tooltip v-if="iconOnly && option.label" :text="option.label">
        <button
          class="flex items-center justify-center w-7 h-6 rounded transition-colors"
          :class="[
            modelValue === option.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          ]"
          @click="emit('update:modelValue', option.value)"
        >
          <Icon v-if="option.icon" :name="option.icon" :size="12" />
        </button>
      </Tooltip>
      <!-- Text mode or no label: no tooltip needed -->
      <button
        v-else
        class="flex items-center justify-center transition-colors"
        :class="[
          iconOnly ? 'w-7 h-6 rounded' : 'flex-1 px-2 py-1 text-xs font-medium rounded',
          modelValue === option.value
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        ]"
        @click="emit('update:modelValue', option.value)"
      >
        <Icon v-if="option.icon" :name="option.icon" :size="12" :class="iconOnly ? '' : 'mr-1'" />
        <span v-if="!iconOnly && option.label">{{ option.label }}</span>
      </button>
    </template>
  </div>
</template>
