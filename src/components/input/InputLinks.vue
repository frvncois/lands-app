<script setup>
const model = defineModel()
defineProps({ label: String })

import ButtonSubmit from '@/components/button/ButtonMain.vue'

function add() {
  model.value.push({ title: '', url: '' })
}

function remove(index) {
  model.value.splice(index, 1)
}
</script>

<template>
  <li>
    <div>
      <label>{{ label }}</label>
      <ButtonSubmit label="Add Link" @click="add" />
    </div>
    <div v-for="(item, i) in model" :key="i">
      <input v-model="item.title" placeholder="Link title" />
      <input v-model="item.url" placeholder="URL" />
      <ButtonSubmit label="×" @click="remove(i)" />
    </div>
  </li>
</template>


<style scoped>
li {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: stretch;
  > div {
    display: flex;
    gap: var(--space-sm);
    justify-content: space-between;
    align-items: center;
    > input {
      padding: var(--space-rg) var(--space-xs);
      border: 0;
      border-bottom: 1px solid var(--border);
      border-radius: unset;
      &:focus {
        border-bottom: 1px solid var(--light);
      }
    }
  }
}
</style>
