<script setup lang="ts">
import { computed } from 'vue'
import type { Section, MediaContent } from '@/types/section'

const props = defineProps<{ section: Section }>()
const media = computed(() => props.section.content as MediaContent | null)

function getEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return null
}

const embedUrl = computed(() => media.value?.media_type === 'video' ? getEmbedUrl(media.value.url) : null)
</script>

<template>
  <div class="w-full aspect-video overflow-hidden" style="background: var(--theme-surface)">
    <img v-if="media?.media_type === 'image' && media.url" :src="media.url" class="w-full h-full object-cover" />
    <div v-else-if="media?.media_type === 'image'" class="w-full h-full flex items-center justify-center text-sm font-bold" style="color: var(--theme-main)">Image</div>
    <iframe v-else-if="embedUrl" :src="embedUrl" class="w-full h-full" frameborder="0" allowfullscreen />
    <div v-else class="w-full h-full flex items-center justify-center text-sm font-bold" style="color: var(--theme-main)">Video</div>
  </div>
  <p v-if="media?.caption" class="px-6 py-2 text-xs font-medium" style="color: var(--theme-accent)">{{ media.caption }}</p>
</template>
