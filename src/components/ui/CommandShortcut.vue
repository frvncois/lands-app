<script setup lang="ts">
interface Props {
  keys: string[]
}

defineProps<Props>()
</script>

<template>
  <span class="flex items-center gap-0.5">
    <kbd
      v-for="key in keys"
      :key="key"
      class="px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border"
    >
      {{ key }}
    </kbd>
  </span>
</template>
