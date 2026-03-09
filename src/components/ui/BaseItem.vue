<script setup lang="ts">
import type { FunctionalComponent } from 'vue'
import BaseButton from './BaseButton.vue'

const props = withDefaults(defineProps<{
  icon?: FunctionalComponent
  title: string
  description?: string
  action?: string
  clickable?: boolean
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
  clickable: false,
})

defineEmits<{ action: []; click: [] }>()

const sizes = {
  sm: { wrap: 'gap-2 p-2', icon: 'h-7 w-7 rounded-md', iconSize: 'h-3.5 w-3.5', title: 'text-xs', description: 'text-xs' },
  md: { wrap: 'gap-2 p-2', icon: 'h-9 w-9 rounded-lg', iconSize: 'h-4 w-4', title: 'text-sm', description: 'text-xs' },
  lg: { wrap: 'gap-3 p-3', icon: 'h-11 w-11 rounded-xl', iconSize: 'h-5 w-5', title: 'text-base', description: 'text-sm' },
}
</script>

<template>
  <component
    :is="clickable ? 'button' : 'div'"
    class="flex items-center rounded-xl border border-gray-200 w-full text-left"
    :class="[sizes[size].wrap, clickable && 'hover:shadow-md/2 hover:scale-101 transition cursor-pointer']"
    @click="clickable && $emit('click')"
  >
    <div v-if="icon" class="shrink-0 flex items-center justify-center bg-gray-100" :class="sizes[size].icon">
      <component :is="icon" class="text-gray-600" :class="sizes[size].iconSize" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="font-medium text-gray-900 truncate" :class="sizes[size].title">{{ title }}</p>
      <p v-if="description" class="text-gray-400 truncate" :class="sizes[size].description">{{ description }}</p>
    </div>
    <BaseButton v-if="action" size="sm" variant="outline" @click.stop="$emit('action')">
      {{ action }}
    </BaseButton>
  </component>
</template>
