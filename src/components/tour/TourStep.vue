<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { TourStep } from '@/lib/tour-steps'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  step: TourStep
  stepNumber: number
  totalSteps: number
  isLastStep: boolean
}>()

const emit = defineEmits<{
  next: []
  skip: []
}>()

const popoverRef = ref<HTMLElement | null>(null)
const popoverStyle = ref<Record<string, string>>({})
const arrowStyle = ref<Record<string, string>>({})
const isVisible = ref(false)
const isMounted = ref(false)

const gap = 12 // Gap between popover and target

function updatePosition() {
  const targetElement = document.querySelector(props.step.target)
  if (!targetElement) {
    return
  }

  // Wait for popover to be mounted
  if (!popoverRef.value) {
    return
  }

  const targetRect = targetElement.getBoundingClientRect()
  const popoverRect = popoverRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let top = 0
  let left = 0
  let arrowPosition = ''

  // Calculate position based on placement
  switch (props.step.placement) {
    case 'top':
      top = targetRect.top - popoverRect.height - gap
      left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2
      arrowPosition = 'bottom'
      break
    case 'bottom':
      top = targetRect.bottom + gap
      left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2
      arrowPosition = 'top'
      break
    case 'left':
      top = targetRect.top + targetRect.height / 2 - popoverRect.height / 2
      left = targetRect.left - popoverRect.width - gap
      arrowPosition = 'right'
      break
    case 'right':
      top = targetRect.top + targetRect.height / 2 - popoverRect.height / 2
      left = targetRect.right + gap
      arrowPosition = 'left'
      break
  }

  // Keep popover within viewport bounds
  if (left < 16) left = 16
  if (left + popoverRect.width > viewportWidth - 16) {
    left = viewportWidth - popoverRect.width - 16
  }
  if (top < 16) top = 16
  if (top + popoverRect.height > viewportHeight - 16) {
    top = viewportHeight - popoverRect.height - 16
  }

  popoverStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }

  // Arrow positioning
  const arrowSize = 8
  switch (arrowPosition) {
    case 'top':
      arrowStyle.value = {
        top: `-${arrowSize}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: `${arrowSize}px solid transparent`,
        borderRight: `${arrowSize}px solid transparent`,
        borderBottom: `${arrowSize}px solid hsl(var(--card))`,
      }
      break
    case 'bottom':
      arrowStyle.value = {
        bottom: `-${arrowSize}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: `${arrowSize}px solid transparent`,
        borderRight: `${arrowSize}px solid transparent`,
        borderTop: `${arrowSize}px solid hsl(var(--card))`,
      }
      break
    case 'left':
      arrowStyle.value = {
        left: `-${arrowSize}px`,
        top: '50%',
        transform: 'translateY(-50%)',
        borderTop: `${arrowSize}px solid transparent`,
        borderBottom: `${arrowSize}px solid transparent`,
        borderRight: `${arrowSize}px solid hsl(var(--card))`,
      }
      break
    case 'right':
      arrowStyle.value = {
        right: `-${arrowSize}px`,
        top: '50%',
        transform: 'translateY(-50%)',
        borderTop: `${arrowSize}px solid transparent`,
        borderBottom: `${arrowSize}px solid transparent`,
        borderLeft: `${arrowSize}px solid hsl(var(--card))`,
      }
      break
  }

  isVisible.value = true
}

// Wait for target element to exist
function waitForElement() {
  const observer = new MutationObserver(() => {
    const element = document.querySelector(props.step.target)
    if (element) {
      // Small delay to ensure layout is stable
      setTimeout(updatePosition, 100)
      observer.disconnect()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // Initial check
  const element = document.querySelector(props.step.target)
  if (element) {
    setTimeout(updatePosition, 100)
  }

  // Cleanup after 5 seconds if element still not found
  setTimeout(() => observer.disconnect(), 5000)
}

onMounted(() => {
  isMounted.value = true
  // Wait a tick for the popover to render
  setTimeout(() => {
    waitForElement()
  }, 50)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
})

onUnmounted(() => {
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})

watch(() => props.step, () => {
  isVisible.value = false
  setTimeout(() => {
    waitForElement()
  }, 50)
})

const progressText = computed(() => `${props.stepNumber}/${props.totalSteps}`)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isMounted"
      ref="popoverRef"
      class="fixed bg-card border border-border rounded-lg shadow-2xl p-5 w-80 transition-opacity duration-300"
      :class="{ 'opacity-0 pointer-events-none': !isVisible }"
      :style="popoverStyle"
      style="z-index: 10001;"
    >
      <!-- Arrow -->
      <div
        class="absolute w-0 h-0"
        :style="arrowStyle"
      />

      <!-- Content -->
      <div class="space-y-3">
        <!-- Header -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <h3 class="text-base font-semibold text-foreground">
              {{ step.title }}
            </h3>
          </div>
          <div class="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
            {{ progressText }}
          </div>
        </div>

        <!-- Description -->
        <p class="text-sm text-muted-foreground leading-relaxed">
          {{ step.description }}
        </p>

        <!-- Actions -->
        <div class="flex items-center justify-between gap-3 pt-2">
          <button
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            @click="emit('skip')"
          >
            Skip tour
          </button>
          <Button
            size="sm"
            @click="emit('next')"
          >
            {{ isLastStep ? 'Get Started' : 'Next' }}
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
