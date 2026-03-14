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
  <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
    <!-- Media -->
    <div class="rounded-xl overflow-hidden bg-gray-200 aspect-video" :class="reversed ? 'md:order-2' : 'md:order-1'">
      <img v-if="c?.media_type === 'image' && c.media_url" :src="c.media_url" class="w-full h-full object-cover" />
      <div v-else-if="c?.media_type === 'image'" class="w-full h-full flex items-center justify-center text-xs text-gray-400">Image</div>
      <iframe v-else-if="embedUrl" :src="embedUrl" class="w-full h-full" frameborder="0" allowfullscreen />
      <div v-else class="w-full h-full flex items-center justify-center text-xs text-gray-400">Video</div>
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-4" :class="reversed ? 'md:order-1' : 'md:order-2'">
      <div class="flex flex-col gap-2">
        <p v-if="c?.subtitle" class="text-xs font-medium uppercase tracking-widest text-gray-400">{{ c.subtitle }}</p>
        <h2 v-if="c?.title" class="text-4xl font-medium text-gray-900">{{ c.title }}</h2>
        <p v-if="c?.body" class="text-sm text-gray-500 leading-relaxed">{{ c.body }}</p>
      </div>
      <div v-if="c?.buttons?.length" class="flex flex-wrap gap-2">
        <a
          v-for="btn in c.buttons"
          :key="btn.id"
          :href="btn.url || '#'"
          class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
        >
          {{ btn.label }}
        </a>
      </div>
    </div>
  </div>
</template>
