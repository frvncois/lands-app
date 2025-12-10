<script setup lang="ts">
import Icon from './Icon.vue'

interface Props {
  icon?: string
  shortcut?: string
  destructive?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  destructive: false,
  disabled: false,
})

const emit = defineEmits<{
  click: []
}>()

function handleClick() {
  emit('click')
}
</script>

<template>
  <button
    :class="[
      'w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer',
      destructive
        ? 'text-destructive hover:bg-destructive/10'
        : 'text-foreground hover:bg-muted/25',
      disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <Icon v-if="icon" :name="icon" :size="14" class="w-4" />
    <span class="flex-1 text-left"><slot /></span>
    <span v-if="shortcut" class="text-[10px] text-muted-foreground font-mono">{{ shortcut }}</span>
  </button>
</template>
