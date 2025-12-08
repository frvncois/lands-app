<script setup lang="ts">
interface Props {
  padded?: boolean
}

withDefaults(defineProps<Props>(), {
  padded: true,
})
</script>

<template>
  <div :class="padded ? 'p-5' : ''">
    <slot />
  </div>
</template>
