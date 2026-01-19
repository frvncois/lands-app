<script setup lang="ts">
import Icon from './Icon.vue'

interface Props {
  icon?: string
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
</script>

<template>
  <button
    :class="[
      'w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer',
      destructive
        ? 'text-destructive hover:bg-destructive/25'
        : 'text-foreground hover:bg-accent/75',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]"
    :disabled="disabled"
    @click="emit('click')"
  >
    <Icon
      v-if="icon"
      :name="icon"
      :size="14"
    />
    <slot />
  </button>
</template>
