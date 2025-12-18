<script setup lang="ts">
import Icon from '@/components/ui/Icon.vue'

defineProps<{
  title: string
  icon?: string
}>()
</script>

<template>
  <div class="border-b border-border">
    <div class="flex items-center w-full px-4 py-3">
      <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
        <Icon v-if="icon" :name="icon" :size="14" class="text-muted-foreground" />
        {{ title }}
      </span>
    </div>
    <div class="px-4 pb-4 space-y-3">
      <slot />
    </div>
  </div>
</template>
