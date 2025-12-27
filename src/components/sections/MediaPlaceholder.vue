<script setup lang="ts">
/**
 * MEDIA PLACEHOLDER
 *
 * SINGLE SOURCE OF TRUTH for all empty media fields.
 * Canvas-only - does not affect published storefront.
 *
 * RULES:
 * - Light background
 * - Centered image icon ONLY (no text)
 * - Same visual across ALL sections
 * - Respects borderRadius from styles
 */

const props = defineProps<{
  /** Whether placeholder should be shown (editable mode only) */
  show: boolean
  /** Border radius in pixels */
  borderRadius?: number
  /** Custom class for sizing (default: aspect-video) */
  class?: string
}>()
</script>

<template>
  <div
    v-show="show"
    class="flex items-center justify-center bg-[var(--color-secondary)]"
    :class="props.class || 'w-full h-full'"
  >
    <!-- Icon only, no text -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="text-[var(--color-muted)]"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  </div>
</template>
