<script setup lang="ts">
import { ref } from 'vue'

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
        <i v-if="icon" :class="['lni', icon, 'text-sm text-muted-foreground']"></i>
        {{ title }}
      </span>
      <i
        class="lni lni-chevron-down text-xs text-muted-foreground transition-transform"
        :class="isOpen ? '' : '-rotate-90'"
      ></i>
    </button>
    <div v-if="isOpen" class="px-4 pb-4 space-y-3">
      <slot />
    </div>
  </div>
</template>
