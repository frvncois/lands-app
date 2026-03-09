<script setup lang="ts">
import type { Section, FooterContent, FooterSettings } from '@/types/section'

const props = defineProps<{ section: Section }>()
const c = props.section.content as FooterContent | null
const s = props.section.settings_json as FooterSettings
</script>

<template>
  <div class="flex flex-col p-10">
    <div class="relative h-[40em] overflow-hidden rounded-4xl" style="background: var(--theme-accent)">
      <img v-if="s?.cover_media_value" :src="s.cover_media_value" class="absolute inset-0 w-full h-full object-cover" />
    </div>
    <div class="flex flex-1 gap-2 justify-between items-end py-4">
      <h1 class="text-2xl font-semibold" style="color: var(--theme-main)">{{ c?.title }}</h1>
      <h2 class="text-2xl" style="color: var(--theme-main); opacity: 0.5">{{ c?.subtitle }}</h2>
    </div>
  </div>
</template>
