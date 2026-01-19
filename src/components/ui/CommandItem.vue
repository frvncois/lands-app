<script setup lang="ts">
import Icon from './Icon.vue'

interface Props {
  icon?: string
  shortcut?: string[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  select: []
}>()

function handleClick() {
  if (!props.disabled) {
    emit('select')
  }
}
</script>

<template>
  <button
    type="button"
    class="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-left transition-colors"
    :class="disabled
      ? 'text-muted-foreground cursor-not-allowed opacity-50'
      : 'text-foreground hover:bg-accent/50'"
    :disabled="disabled"
    @click="handleClick"
  >
    <Icon
      v-if="icon"
      :name="icon"
      :size="16"
      class="text-muted-foreground"
    />
    <span class="flex-1">
      <slot />
    </span>
    <span
      v-if="shortcut"
      class="flex items-center gap-0.5"
    >
      <kbd
        v-for="key in shortcut"
        :key="key"
        class="px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border"
      >
        {{ key }}
      </kbd>
    </span>
  </button>
</template>
