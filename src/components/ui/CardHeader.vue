<script setup lang="ts">
import Icon from './Icon.vue'

interface Props {
  title?: string
  subtitle?: string
  icon?: string
  borderBottom?: boolean
  button?: string
}

const props = withDefaults(defineProps<Props>(), {
  borderBottom: true,
})

const emit = defineEmits<{
  buttonClick: []
}>()
</script>

<template>
  <div
    :class="[
      'px-5 py-5',
      borderBottom ? 'border-border' : '',
    ]"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-5">
        <slot name="icon">
          <span v-if="icon" class="text-muted-foreground bg-accent/50 p-3 rounded-lg flex items-center justify-center">
            <Icon :name="icon" :size="20" />
          </span>
        </slot>
        <div v-if="title || $slots.title">
          <slot name="title">
            <h2 class="text-foreground font-mono text-xs tracking-wide">{{ title }}</h2>
          </slot>
          <slot name="subtitle">
            <p v-if="subtitle" class="text-xs text-muted-foreground mt-0.5">{{ subtitle }}</p>
          </slot>
        </div>
        <slot v-else />
      </div>
      <slot name="action">
        <button
          v-if="props.button"
          type="button"
          class="text-xs text-primary hover:text-primary/80 transition-colors"
          @click="emit('buttonClick')"
        >
          {{ props.button }}
        </button>
      </slot>
    </div>
  </div>
</template>
