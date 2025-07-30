<template>
 <div class="input">
   <input
     :placeholder="placeholder"
     type="email"
     v-model="model"
     autocomplete="email"
     spellcheck="false"
     autocorrect="off"
     autocapitalize="off"
     maxlength="254"
     pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}"
     @input="handleInput"
   />
 </div>
</template>

<script setup>
import { watch } from 'vue'

const model = defineModel()
defineProps({ placeholder: String })

function sanitizeEmail(value) {
  if (typeof value !== 'string') return ''
  
  return value
    .toLowerCase()
    .replace(/[<>'"]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/[^\w@.-]/g, '')
    .slice(0, 254)
}

function handleInput(e) {
  const sanitized = sanitizeEmail(e.target.value)
  if (sanitized !== e.target.value) {
    model.value = sanitized
    e.target.value = sanitized
  }
}

watch(model, (newValue) => {
  if (newValue && typeof newValue === 'string') {
    const sanitized = sanitizeEmail(newValue)
    if (sanitized !== newValue) {
      model.value = sanitized
    }
  }
})
</script>

<style scoped>
.input {
  display: flex;
  flex-direction: column;
}
</style>