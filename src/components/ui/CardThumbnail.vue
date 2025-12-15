<script setup lang="ts">
import Icon from './Icon.vue'

interface Props {
  src?: string
  alt?: string
  aspectRatio?: 'video' | 'square' | '4/3' | '3/2'
  rounded?: boolean
}

withDefaults(defineProps<Props>(), {
  aspectRatio: 'video',
  rounded: true,
})

const aspectRatioClasses = {
  'video': 'aspect-video',
  'square': 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
}
</script>

<template>
  <div
    class="relative bg-muted flex items-center overflow-hidden m-3.5 mb-0 justify-center"
    :class="[
      aspectRatioClasses[aspectRatio],
      rounded ? 'rounded-xl' : '',
    ]"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt || ''"
      class="w-full h-full object-cover"
    />
    <slot v-else name="placeholder">
      <div class="flex flex-col items-center gap-2 text-muted-foreground">
        <Icon name="photos" class="text-3xl" />
        <span class="text-xs">No preview</span>
      </div>
    </slot>
    <slot name="overlay" />
  </div>
</template>
