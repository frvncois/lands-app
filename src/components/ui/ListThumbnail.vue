<script setup lang="ts">
interface Props {
  initial?: string
  src?: string
  alt?: string
  icon?: string
}

defineProps<Props>()
</script>

<template>
  <div class="w-15 h-15 rounded-xl bg-foreground flex items-center justify-center shrink-0">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover rounded-lg"
    />
    <i
      v-else-if="icon"
      :class="['lni', icon, 'text-lg text-accent']"
    />
    <span
      v-else-if="initial"
      class="text-accent"
    >
      {{ initial }}
    </span>
    <slot v-else />
  </div>
</template>
