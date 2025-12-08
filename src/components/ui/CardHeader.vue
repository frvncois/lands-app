<script setup lang="ts">
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
      <div class="flex items-center gap-3">
        <slot name="icon">
          <i v-if="icon" :class="['lni', icon, 'text-muted-foreground bg-accent/50 p-1.5 rounded-lg']" />
        </slot>
        <div v-if="title || $slots.title">
          <slot name="title">
            <h2 class="text-xxs font-mono uppercase text-foreground tracking-wide">{{ title }}</h2>
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
