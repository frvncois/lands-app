<script setup lang="ts">
import Button from './Button.vue'
import Icon from './Icon.vue'

interface Props {
  title: string
  description?: string
  button?: string
  buttonIcon?: string
}

defineProps<Props>()

const emit = defineEmits<{
  buttonClick: []
}>()
</script>

<template>
  <div class="flex items-center justify-between mb-10">
    <div>
      <h1 class="text-2xl text-foreground">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="text-xxs font-mono uppercase text-muted-foreground tracking-wide"
      >
        {{ description }}
      </p>
    </div>
    <div
      v-if="$slots.actions || button"
      class="flex items-center gap-3"
    >
      <slot name="actions">
        <Button
          v-if="button"
          size="md"
          @click="emit('buttonClick')"
        >
          <Icon
            v-if="buttonIcon"
            :name="buttonIcon"
            :size="14"
          />
          {{ button }}
        </Button>
      </slot>
    </div>
  </div>
</template>
