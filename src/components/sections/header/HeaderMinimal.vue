<script setup lang="ts">
import { computed } from 'vue'
import type { Section, HeaderContent, HeaderSettings } from '@/types/section'

const props = defineProps<{ section: Section }>()
const content = computed(() => props.section.content as HeaderContent | null)
const settings = computed(() => props.section.settings_json as HeaderSettings)
</script>

<template>
  <div class="flex flex-col">
    <div class="relative h-[40em] overflow-hidden" style="background: var(--theme-accent)">
      <img
        v-if="settings.cover_media_value"
        :src="settings.cover_media_value"
        class="absolute inset-0 w-full h-full object-cover"
      />
    </div>
    <div class="flex flex-1 gap-2 justify-between items-end border-b py-4 px-6">
      <h1 class="text-2xl font-semibold" style="color: var(--theme-main)">{{ content?.title }}</h1>
      <h2 class="text-2xl" style="color: var(--theme-main); opacity: 0.5">{{ content?.subtitle }}</h2>
    </div>
  </div>
</template>
