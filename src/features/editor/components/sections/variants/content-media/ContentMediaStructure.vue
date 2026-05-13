<script setup lang="ts">
import { computed } from 'vue'
import { PhotoIcon } from '@heroicons/vue/24/outline'
import type { Section } from '@/features/sections/types'

const props = defineProps<{ section: Section }>()
const c = computed(() => props.section.type === 'content_media' ? props.section.content : null)
const reversed = computed(() => props.section.style_variant === 'reversed')

</script>

<template>
  <div class="py-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
    <!-- Media -->
    <div
      class="rounded-xl overflow-hidden aspect-square"
      :class="reversed ? 'md:order-2' : 'md:order-1'"
      :style="{ background: 'color-mix(in srgb, var(--theme-accent) 8%, transparent)' }"
    >
      <img v-if="c?.media_type === 'image' && c.media_url" :src="c.media_url" class="w-full h-full object-cover" />
      <div v-else-if="c?.media_type === 'image'" class="w-full h-full flex items-center justify-center">
        <PhotoIcon class="h-8 w-8 opacity-20" style="color: var(--theme-accent)" />
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-4" :class="reversed ? 'md:order-1' : 'md:order-2'">
      <div class="flex flex-col gap-2">
        <p v-if="c?.subtitle" class="text-xs uppercase tracking-widest" style="color: var(--theme-main)">{{ c.subtitle }}</p>
        <h2 v-if="c?.title" class="text-4xl font-medium" style="color: var(--theme-main)">{{ c.title }}</h2>
        <p v-if="c?.body" class="text-sm leading-relaxed opacity-60" style="color: var(--theme-main)">{{ c.body }}</p>
      </div>
      <div v-if="c?.buttons?.length" class="flex flex-wrap gap-2">
        <a
          v-for="btn in c.buttons"
          :key="btn.id"
          :href="btn.url || '#'"
          class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl border transition-colors"
          style="border-color: var(--theme-accent); color: var(--theme-accent)"
        >
          {{ btn.label }}
        </a>
      </div>
    </div>
  </div>
</template>
