<template>
 <div class="input">
   <input
     :placeholder="placeholder"
     :type="showPassword ? 'text' : 'password'"
     v-model="model"
     autocomplete="new-password"
     spellcheck="false"
     autocorrect="off"
     autocapitalize="off"
     @paste="handlePaste"
     @copy="handleCopy"
     @cut="handleCut"
     @input="handleInput"
   />
   <button
     type="button"
     class="toggle"
     @click="togglePassword"
     tabindex="-1"
   >
     <RevealIcon v-if="!showPassword" />
     <HideIcon v-if="showPassword" />
   </button>
 </div>
</template>

<script setup>
import { ref, onUnmounted, watch } from 'vue'
import HideIcon from '@/assets/icons/HideIcon.vue'
import RevealIcon from '@/assets/icons/RevealIcon.vue'

const model = defineModel()
defineProps({ placeholder: String })

const showPassword = ref(false)

// Sanitization function for passwords
function sanitizePassword(value) {
 if (typeof value !== 'string') return ''
 
 return value
   .replace(/[<>'"]/g, '')
   .replace(/javascript:/gi, '')
   .replace(/on\w+=/gi, '')
   .replace(/[^\x20-\x7E]/g, '')
   .slice(0, 128)
}

function handleInput(e) {
 const sanitized = sanitizePassword(e.target.value)
 if (sanitized !== e.target.value) {
   model.value = sanitized
   e.target.value = sanitized
 }
}

watch(model, (newValue) => {
 if (newValue && typeof newValue === 'string') {
   const sanitized = sanitizePassword(newValue)
   if (sanitized !== newValue) {
     model.value = sanitized
   }
 }
})

function togglePassword() {
 showPassword.value = !showPassword.value
 if (showPassword.value) {
   setTimeout(() => {
     showPassword.value = false
   }, 5000)
 }
}

function handlePaste(e) {
 e.preventDefault()
 console.warn('Paste operation blocked for security')
}

function handleCopy(e) {
 e.preventDefault()
 console.warn('Copy operation blocked for security')
}

function handleCut(e) {
 e.preventDefault()
 console.warn('Cut operation blocked for security')
}

onUnmounted(() => {
 if (model.value) {
   model.value = ''
 }
})
</script>

<style scoped>
.input {
 display: flex;
 flex-direction: column;
 position: relative;
 justify-content: center;
}

.toggle {
 position: absolute;
 cursor: pointer;
 right: var(--space-md);
 top: 0;
 bottom: 0;
 
 > svg {
   height: var(--height-md);
   color: var(--details);
   transition: color var(--transition-smooth);
   
   &:hover {
     color: var(--light);
   }
 }
}
</style>