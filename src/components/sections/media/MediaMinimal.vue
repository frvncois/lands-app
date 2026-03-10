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
  <div class="px-6 py-4">
    <div class="rounded-xl overflow-hidden bg-gray-100 aspect-video">
      <img v-if="media?.media_type === 'image' && media.url" :src="media.url" class="w-full h-full object-cover" />
      <div v-else-if="media?.media_type === 'image'" class="w-full h-full flex items-center justify-center text-xs text-gray-400">Image</div>
      <iframe v-else-if="embedUrl" :src="embedUrl" class="w-full h-full" frameborder="0" allowfullscreen />
      <div v-else class="w-full h-full flex items-center justify-center text-xs text-gray-400">Video</div>
    </div>
    <p v-if="media?.caption" class="mt-2 text-xs text-gray-400">{{ media.caption }}</p>
  </div>
</template>
