<script setup lang="ts">
import { Icon } from '@/components/ui'

defineProps<{
  position: number
}>()

defineEmits<{
  add: [position: number]
}>()
</script>

<template>
  <div
    class="group h-2 flex items-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
    @click.stop="$emit('add', position)"
  >
    <div class="flex-1 h-px bg-primary/40 group-hover:bg-primary/60 transition-colors" />
    <div class="w-4 h-4 rounded-full bg-primary/40 group-hover:bg-primary/60 flex items-center justify-center transition-colors">
      <Icon name="plus" :size="10" class="text-primary-foreground" />
    </div>
    <div class="flex-1 h-px bg-primary/40 group-hover:bg-primary/60 transition-colors" />
  </div>
</template>
