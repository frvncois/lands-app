<script setup lang="ts">
import { computed } from 'vue'
import type { Section, ContentMediaContent } from '@/types/section'

const props = defineProps<{ section: Section }>()
const c = computed(() => props.section.content as ContentMediaContent | null)
const reversed = computed(() => props.section.style_variant === 'reversed')

function getEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return null
}

const embedUrl = computed(() => c.value?.media_type === 'video' ? getEmbedUrl(c.value.media_url) : null)
</script>

<template>
  <div class="px-6 py-10" :class="reversed ? 'flex flex-col-reverse gap-6' : 'flex flex-col gap-6'">
    <!-- Media full-width -->
    <div class="w-full aspect-video overflow-hidden rounded-sm bg-gray-200">
      <img v-if="c?.media_type === 'image' && c.media_url" :src="c.media_url" class="w-full h-full object-cover" />
      <div v-else-if="c?.media_type === 'image'" class="w-full h-full flex items-center justify-center text-xs text-gray-400">Image</div>
      <iframe v-else-if="embedUrl" :src="embedUrl" class="w-full h-full" frameborder="0" allowfullscreen />
      <div v-else class="w-full h-full flex items-center justify-center text-xs text-gray-400">Video</div>
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-4 max-w-xl">
      <div class="flex flex-col gap-1">
        <p v-if="c?.subtitle" class="text-xs tracking-widest uppercase text-gray-400">{{ c.subtitle }}</p>
        <h2 v-if="c?.title" class="text-3xl font-serif leading-snug" style="color: var(--theme-main)">{{ c.title }}</h2>
        <p v-if="c?.body" class="text-sm text-gray-500 leading-relaxed">{{ c.body }}</p>
      </div>
      <div v-if="c?.buttons?.length" class="flex flex-wrap gap-2">
        <a
          v-for="btn in c.buttons"
          :key="btn.id"
          :href="btn.url || '#'"
          class="inline-flex items-center px-4 py-2 text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-60"
          style="color: var(--theme-main)"
        >
          {{ btn.label }} →
        </a>
      </div>
    </div>
  </div>
</template>
