<script setup lang="ts">
interface Props {
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: 'No results found.',
})
</script>

<template>
  <div class="py-6 text-center">
    <p class="text-sm text-muted-foreground">
      <slot>{{ text }}</slot>
    </p>
  </div>
</template>
