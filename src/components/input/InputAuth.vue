<template>
 <div class="input">
   <input
     :placeholder="placeholder"
     type="text"
     v-model="model"
     :maxlength="maxLength"
     @input="handleInput"
     @paste="handlePaste"
   />
 </div>
</template>

<script setup>
import { watch } from 'vue'

const model = defineModel()

const props = defineProps({
 placeholder: String,
 maxLength: {
   type: Number,
   default: 50
 }
})


function sanitizeName(value) {
  if (typeof value !== 'string') return ''
  
  return value
    .replace(/[<>'"&]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/[^a-zA-ZÀ-ÿĀ-žА-я\s\-']/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, props.maxLength)
}

function handleInput(e) {
  const sanitized = sanitizeName(e.target.value)
  if (sanitized !== e.target.value) {
    model.value = sanitized
    e.target.value = sanitized
  }
}

function handlePaste(e) {
  e.preventDefault()
  const pastedText = (e.clipboardData || window.clipboardData).getData('text')
  const sanitized = sanitizeName(pastedText)
  model.value = sanitized
}

watch(model, (newValue) => {
  if (newValue && typeof newValue === 'string') {
    const sanitized = sanitizeName(newValue)
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