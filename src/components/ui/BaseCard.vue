<script setup lang="ts">
import type { FunctionalComponent } from 'vue'

withDefaults(defineProps<{
  icon?: FunctionalComponent
  title: string
  description?: string
  variant?: 'default' | 'spaced'
}>(), { variant: 'default' })
</script>

<template>
  <div
    class="flex flex-col rounded-xl overflow-hidden"
    :class="variant === 'spaced' ? 'bg-gray-50' : 'border border-gray-200'"
  >

    <!-- Header -->
    <div class="flex items-center gap-2" :class="variant === 'spaced' ? 'p-4' : 'p-2'">
      <div v-if="icon" class="shrink-0 flex items-center justify-center h-7 w-7 rounded-md bg-gray-900 text-gray-100">
        <component :is="icon" class="h-3.5 w-3.5" />
      </div>
      <p class="text-sm font-medium text-gray-900">{{ title }}</p>
      <div v-if="$slots['header-action']" class="ml-auto">
        <slot name="header-action" />
      </div>
    </div>

    <!-- Content -->
    <div v-if="description || $slots.default" class="text-xs text-gray-400 leading-relaxed" :class="variant === 'spaced' ? 'px-4 pb-4' : 'p-2'">
      <slot>{{ description }}</slot>
    </div>

    <!-- Actions -->
    <div v-if="$slots.actions" class="flex items-center gap-2 border-gray-100" :class="variant === 'spaced' ? 'px-4 pb-4' : 'p-2'">
      <slot name="actions" />
    </div>

  </div>
</template>
