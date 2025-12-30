<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  target: string // CSS selector
}>()

const targetRect = ref<DOMRect | null>(null)
const padding = 8 // Padding around highlighted element

function updatePosition() {
  const element = document.querySelector(props.target)
  if (element) {
    targetRect.value = element.getBoundingClientRect()
  } else {
    targetRect.value = null
  }
}

// Wait for target element to exist
function waitForElement() {
  const observer = new MutationObserver(() => {
    const element = document.querySelector(props.target)
    if (element) {
      updatePosition()
      observer.disconnect()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // Initial check
  updatePosition()

  // Cleanup after 5 seconds if element still not found
  setTimeout(() => observer.disconnect(), 5000)
}

onMounted(() => {
  waitForElement()
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
})

onUnmounted(() => {
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})

watch(() => props.target, () => {
  waitForElement()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="targetRect"
      class="fixed inset-0 pointer-events-none transition-opacity duration-300"
      style="z-index: 10000;"
    >
      <!-- Semi-transparent overlay with cutout -->
      <svg
        class="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="tour-spotlight">
            <!-- White background (visible) -->
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <!-- Black cutout (transparent) -->
            <rect
              :x="targetRect.x - padding"
              :y="targetRect.y - padding"
              :width="targetRect.width + padding * 2"
              :height="targetRect.height + padding * 2"
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <!-- Overlay with mask -->
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.5)"
          mask="url(#tour-spotlight)"
        />
      </svg>

      <!-- Highlight ring -->
      <div
        class="absolute border-2 border-primary rounded-lg pointer-events-none transition-all duration-300"
        :style="{
          left: `${targetRect.x - padding}px`,
          top: `${targetRect.y - padding}px`,
          width: `${targetRect.width + padding * 2}px`,
          height: `${targetRect.height + padding * 2}px`,
        }"
      />
    </div>
  </Teleport>
</template>
