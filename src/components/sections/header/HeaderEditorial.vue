<script setup lang="ts">
import { computed } from 'vue'
import { useLandStore } from '@/stores/land'
import type { Section, HeaderContent, HeaderSettings } from '@/types/section'

const props = defineProps<{ section: Section }>()
const landStore = useLandStore()
const content = computed(() => props.section.content as HeaderContent | null)
const settings = computed(() => props.section.settings_json as HeaderSettings)
</script>

<template>
  <div class="px-6 pt-12 pb-10 flex flex-col gap-6">
    <!-- Cover image full-width if set -->
    <div v-if="settings.cover_media_type === 'image' && settings.cover_media_value" class="w-full h-40 overflow-hidden rounded-lg -mx-0">
      <img :src="settings.cover_media_value" class="w-full h-full object-cover" />
    </div>

    <!-- Divider + meta row -->
    <div class="flex items-center gap-4">
      <img
        v-if="landStore.activeLand?.avatar_image"
        :src="landStore.activeLand.avatar_image"
        class="h-10 w-10 rounded-full object-cover grayscale"
      />
      <div v-else class="h-10 w-10 rounded-full bg-gray-200" />
      <p v-if="content?.subtitle" class="text-xs uppercase tracking-widest text-gray-400">
        {{ content.subtitle }}
      </p>
    </div>

    <!-- Large editorial title -->
    <h1 class="text-4xl font-bold leading-tight" style="color: var(--theme-main)">
      {{ content?.title || landStore.activeLand?.title }}
    </h1>

    <div class="w-12 h-px" style="background: var(--theme-accent)" />
  </div>
</template>
