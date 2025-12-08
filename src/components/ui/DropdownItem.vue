<script setup lang="ts">
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
        ? 'text-destructive hover:bg-destructive/10'
        : 'text-foreground hover:bg-muted/25',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]"
    :disabled="disabled"
    @click="emit('click')"
  >
    <i v-if="icon" :class="['lni', icon, 'text-sm']"></i>
    <slot />
  </button>
</template>
