<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String,
    default: '#ffffff'
  }
})

const emit = defineEmits(['update:modelValue'])

const isExpanded = ref(false)
const hexInput = ref('')
const colorPicker = ref(null)
const isDragging = ref(false)

// Current color value
const currentColor = computed(() => props.modelValue || '#ffffff')

// Initialize hex input with current value
watch(() => props.modelValue, (newValue) => {
  hexInput.value = newValue || '#ffffff'
}, { immediate: true })

function togglePicker() {
  isExpanded.value = !isExpanded.value
}

function closePicker() {
  isExpanded.value = false
}

// Handle hex input changes
function updateFromHex() {
  let hex = hexInput.value
  
  // Add # if missing
  if (!hex.startsWith('#')) {
    hex = '#' + hex
  }
  
  // Validate hex format
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    emit('update:modelValue', hex)
  }
}

// Handle color picker interaction
function handleColorPickerClick(event) {
  if (!colorPicker.value) return
  
  const rect = colorPicker.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // Calculate hue from x position (0-360)
  const hue = Math.floor((x / rect.width) * 360)
  
  // Calculate saturation and lightness from y position
  const saturation = 100 - Math.floor((y / rect.height) * 100)
  const lightness = 50 // Keep lightness at 50% for vibrant colors
  
  // Convert HSL to HEX
  const hex = hslToHex(hue, saturation, lightness)
  hexInput.value = hex
  emit('update:modelValue', hex)
}

function handleMouseDown(event) {
  isDragging.value = true
  handleColorPickerClick(event)
}

function handleMouseMove(event) {
  if (isDragging.value) {
    handleColorPickerClick(event)
  }
}

function handleMouseUp() {
  isDragging.value = false
}

// Convert HSL to HEX
function hslToHex(h, s, l) {
  l /= 100
  const a = s * Math.min(l, 1 - l) / 100
  const f = n => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// Close picker when clicking outside
function handleClickOutside(event) {
  if (!event.target.closest('.color-picker-container')) {
    closePicker()
  }
}

// Add/remove global click listener
watch(isExpanded, (expanded) => {
  if (expanded) {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  } else {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
})
</script>

<template>
  <div class="color-picker-container">
    <div class="color-picker-header">
      <div class="label-section">
        <label>{{ label }}</label>
        <p v-if="description">{{ description }}</p>
      </div>
      <div class="color-display">
        <span 
          class="color-swatch" 
          :style="{ backgroundColor: currentColor }"
          @click="togglePicker"
        ></span>
      </div>
    </div>

    <!-- Expandable color picker -->
    <div v-if="isExpanded" class="color-picker-content">
      <!-- Color gradient map -->
      <div 
        ref="colorPicker"
        class="color-gradient"
        @mousedown="handleMouseDown"
      >
        <div class="hue-gradient"></div>
        <div class="saturation-overlay"></div>
      </div>

      <!-- Hex input -->
      <div class="hex-input-container">
        <label for="hex-input">HEX</label>
        <input 
          id="hex-input"
          v-model="hexInput"
          type="text"
          placeholder="#ffffff"
          @input="updateFromHex"
          @blur="updateFromHex"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-picker-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
}

.color-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.label-section {
  flex: 1;
}

.label-section label {
  display: block;
  margin-bottom: 0.25rem;
}

.label-section p {
    font-size: var(--font-sm);
}

.color-display {
  flex-shrink: 0;
}

.color-swatch {
  display: block;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: 2px solid var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.color-swatch:hover {
  border-color: var(--accent-color, #007acc);
  transform: scale(1.05);
}

.color-picker-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  animation: expandIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.color-gradient {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 0.5rem;
  cursor: crosshair;
  overflow: hidden;
  border: 1px solid var(--border);
}

.hue-gradient {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    #ff0000 0%,
    #ffff00 16.66%,
    #00ff00 33.33%,
    #00ffff 50%,
    #0000ff 66.66%,
    #ff00ff 83.33%,
    #ff0000 100%
  );
}

.saturation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0) 50%,
    rgba(0, 0, 0, 0) 50%,
    rgba(0, 0, 0, 1) 100%
  );
  pointer-events: none;
}

.hex-input-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.hex-input-container label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  min-width: 2rem;
}

.hex-input-container input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  transition: border-color 0.2s ease;
}

.hex-input-container input:focus {
  outline: none;
  border-color: var(--accent-color, #007acc);
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
}

.hex-input-container input::placeholder {
  color: var(--text-secondary);
  opacity: 0.5;
}

@keyframes expandIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    max-height: 300px;
  }
}

/* Prevent text selection while dragging */
.color-gradient {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>