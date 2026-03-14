<script setup lang="ts">
import { computed } from 'vue'
import type { Section, HeaderContent, HeaderSettings } from '@/types/section'

const props = defineProps<{ section: Section }>()
const content = computed(() => props.section.content as HeaderContent | null)
const settings = computed(() => props.section.settings_json as HeaderSettings)
</script>

<template>
  <div class="flex flex-col p-10">
    <div class="relative h-[40em] overflow-hidden rounded-4xl" style="background: var(--theme-accent)">
      <img v-if="settings.cover_media_value" :src="settings.cover_media_value" class="absolute inset-0 w-full h-full object-cover" />
    </div>
    <div class="flex-1 space-y-4 py-8">
      <img v-if="content?.logo" :src="content.logo" class="h-8 w-auto object-contain object-left mb-2" />
      <h1 class="text-8xl font-bold leading-none" style="color: var(--theme-main)">{{ content?.title }}</h1>
      <h2 class="text-2xl" style="color: var(--theme-main); opacity: 0.5">{{ content?.subtitle }}</h2>
    </div>
  </div>
</template>
