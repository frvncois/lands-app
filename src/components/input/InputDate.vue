<template>
    <li>
      <label>{{ label }}</label>
      <input :placeholder="placeholder" type="text" v-model="model" />
      <p>{{ details }}</p>
    </li>
</template>

<script setup>
const model = defineModel()
defineProps({
  label: String,
  details: String,
  placeholder: String
})
</script>

<style scoped>
li {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: stretch;
   input {
    flex-grow: 1;
    display: flex;
  }
  p {
    font-size: var(--font-sm);
    font-family: 'mono';
    text-transform: uppercase;
    text-align: right;
    color: var(--details);
  }
}
</style>