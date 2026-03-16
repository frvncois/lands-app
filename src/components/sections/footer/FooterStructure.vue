<script setup lang="ts">
import type { Section, FooterContent } from '@/types/section'

const props = defineProps<{ section: Section }>()
const c = props.section.content as FooterContent | null
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-1 gap-2 justify-between items-end border-b py-4 px-6" style="border-color: var(--theme-main)">
      <h1 class="text-2xl font-semibold" style="color: var(--theme-main)">{{ c?.title }}</h1>
      <h2 class="text-2xl" style="color: var(--theme-main); opacity: 0.5">{{ c?.subtitle }}</h2>
    </div>
    <div v-if="c?.buttons?.length" class="flex flex-wrap items-center gap-6 px-6 py-4">
      <a
        v-for="btn in c.buttons"
        :key="btn.id"
        :href="btn.url || '#'"
        class="text-sm transition-opacity hover:opacity-60"
        style="color: var(--theme-main)"
      >
        {{ btn.label }}
      </a>
    </div>
  </div>
</template>
