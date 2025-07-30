<template>
  <button class="button-submit" @click="$emit('click')">
    {{ label }}
  </button>
</template>

<script setup>
  defineProps({ label: String })
  defineEmits(['click'])
</script>