<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  password: string
}>()

const requirements = computed(() => [
  {
    label: 'At least 8 characters',
    met: props.password.length >= 8,
  },
  {
    label: 'Contains a number',
    met: /\d/.test(props.password),
  },
  {
    label: 'Contains a lowercase letter',
    met: /[a-z]/.test(props.password),
  },
  {
    label: 'Contains an uppercase letter',
    met: /[A-Z]/.test(props.password),
  },
])

const allMet = computed(() => requirements.value.every(r => r.met))
const anyStarted = computed(() => props.password.length > 0)

defineExpose({
  allMet,
  requirements,
})
</script>

<template>
  <div
    v-if="anyStarted"
    class="p-3 rounded-lg border transition-colors"
    :class="allMet ? 'bg-success/5 border-success/30' : 'bg-muted/50 border-border'"
  >
    <p class="text-xs font-medium text-muted-foreground mb-2">
      Password requirements
    </p>
    <ul class="space-y-1.5">
      <li
        v-for="req in requirements"
        :key="req.label"
        class="flex items-center gap-2 text-xs transition-colors"
        :class="req.met ? 'text-success' : 'text-muted-foreground'"
      >
        <svg
          v-if="req.met"
          class="w-3.5 h-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <svg
          v-else
          class="w-3.5 h-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke-width="2"
          />
        </svg>
        {{ req.label }}
      </li>
    </ul>
  </div>
</template>
