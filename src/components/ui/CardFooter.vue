<script setup lang="ts">
interface Props {
  borderTop?: boolean
  padded?: boolean
}

withDefaults(defineProps<Props>(), {
  borderTop: true,
  padded: true,
})
</script>

<template>
  <div
    :class="[
      borderTop ? 'border-t border-border' : '',
      padded ? 'p-5' : '',
    ]"
  >
    <slot />
  </div>
</template>
