<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

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
  console.log('Toggle picker:', isExpanded.value) // Debug
}

function closePicker() {
  isExpanded.value = false
  console.log('Close picker') // Debug
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
  event.preventDefault()
  isDragging.value = true
  handleColorPickerClick(event)
}

function handleMouseMove(event) {
  if (isDragging.value) {
    event.preventDefault()
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
  // Check if click is outside the entire color picker container
  const pickerContainer = event.target.closest('.color-picker-container')
  if (!pickerContainer) {
    closePicker()
  }
}

// Cleanup function
function cleanup() {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// Add/remove global click listener
watch(isExpanded, (expanded) => {
  if (expanded) {
    // Add small delay to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }, 100)
  } else {
    cleanup()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  cleanup()
})
</script>

<template>
    <ul class="type" :class="{ expanded: isExpanded }">
      <li class="header" @click.stop="togglePicker">
        <label>{{ label }}</label>
        <span 
          class="swatch" 
          :style="{ backgroundColor: currentColor }"
        ></span>
      </li>

      <!-- Expandable color picker -->
      <li v-show="isExpanded" class="content">
        <!-- Color gradient map -->
        <div 
          ref="colorPicker"
          class="color-gradient"
          @mousedown="handleMouseDown"
          @click.stop
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
            @click.stop
          />
        </div>
      </li>
    </ul>
</template>

<style scoped>
.color-picker-container {
  position: relative;
}

.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: var(--space-rg);
}

.type {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--type);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-smooth);
  &:hover {
    border: 1px solid var(--focus);
  }
}

.type.expanded {
  border-color: var(--focus);
  box-shadow: var(--shadow-md);
}

.swatch {
  width: 1em;
  height: 1em;
  border-radius: 50%;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: var(--transition-smooth);
  flex-shrink: 0;
}

.swatch:hover {
  border-color: var(--focus);
  transform: scale(1.05);
}

.content {
  display: flex;
  flex-direction: column;
  gap: var(--space-rg);
  padding: var(--space-rg);
  border-top: 1px solid var(--border);
  animation: expandIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.color-gradient {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: var(--radius-rg);
  cursor: crosshair;
  overflow: hidden;
  border: 1px solid var(--border);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
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
  gap: var(--space-sm);
}



.hex-input-container input {
  flex: 1;
  padding: var(--space-sm) var(--space-rg);
  border: 1px solid var(--border);
  border-radius: var(--radius-rg);
  background: var(--bg);
  color: var(--light);
  font-family: 'mono';
  transition: border-color var(--transition-smooth);
}

.hex-input-container input:focus {
  outline: none;
  border-color: var(--focus);
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
}

.hex-input-container input::placeholder {
  color: var(--details);
  opacity: 0.5;
}

@keyframes expandIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 300px;
  }
}
</style>