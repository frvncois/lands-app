<script setup lang="ts">
interface Props {
  label?: string
  error?: string
  hint?: string
  required?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="flex items-center gap-1 text-xs text-muted-foreground tracking-wide">
      {{ label }}
      <span v-if="required" class="text-destructive">*</span>
    </label>
    <slot />
    <p v-if="hint && !error" class="text-xs text-muted-foreground">
      {{ hint }}
    </p>
    <p v-if="error" class="text-xs text-destructive">
      {{ error }}
    </p>
  </div>
</template>
