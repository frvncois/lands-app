<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/ui/Icon.vue'

defineProps<{
  title: string
  icon?: string
  defaultOpen?: boolean
}>()

const isOpen = ref(true)
</script>

<template>
  <div class="border-b border-border">
    <button
      class="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-accent/30 transition-colors"
      @click="isOpen = !isOpen"
    >
      <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
        <Icon v-if="icon" :name="icon" :size="14" class="text-muted-foreground" />
        {{ title }}
      </span>
      <Icon name="chevron-down" class="text-xs text-muted-foreground transition-transform" />
    </button>
    <div v-if="isOpen" class="px-4 pb-4 space-y-3">
      <slot />
    </div>
  </div>
</template>
