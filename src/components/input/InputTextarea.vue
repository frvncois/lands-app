<template>
  <li>
    <label>
      {{ label }}
      </label>
    <textarea type="text" v-model="model" />
    </li>
</template>

<script setup>
  const model = defineModel()
  defineProps({ label: String })
</script>

<style scoped>
li {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: stretch;
   textarea {
    flex-grow: 1;
    display: flex;
  }
}
</style>