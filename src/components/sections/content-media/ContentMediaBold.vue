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
  <div class="grid grid-cols-1 md:grid-cols-2" style="background: var(--theme-surface)">
    <!-- Media -->
    <div class="aspect-video overflow-hidden" :class="reversed ? 'md:order-2' : 'md:order-1'" style="background: var(--theme-main)">
      <img v-if="c?.media_type === 'image' && c.media_url" :src="c.media_url" class="w-full h-full object-cover" />
      <div v-else-if="c?.media_type === 'image'" class="w-full h-full flex items-center justify-center text-sm" style="color: var(--theme-surface)">Image</div>
      <iframe v-else-if="embedUrl" :src="embedUrl" class="w-full h-full" frameborder="0" allowfullscreen />
      <div v-else class="w-full h-full flex items-center justify-center text-sm" style="color: var(--theme-surface)">Video</div>
    </div>

    <!-- Content -->
    <div class="flex flex-col justify-center gap-5 p-8" :class="reversed ? 'md:order-1' : 'md:order-2'">
      <div class="flex flex-col gap-2">
        <p v-if="c?.subtitle" class="text-xs font-bold uppercase tracking-widest" style="color: var(--theme-accent)">{{ c.subtitle }}</p>
        <h2 v-if="c?.title" class="text-3xl font-black leading-tight" style="color: var(--theme-main)">{{ c.title }}</h2>
        <p v-if="c?.body" class="text-sm leading-relaxed" style="color: var(--theme-main); opacity: 0.7">{{ c.body }}</p>
      </div>
      <div v-if="c?.buttons?.length" class="flex flex-wrap gap-2">
        <a
          v-for="btn in c.buttons"
          :key="btn.id"
          :href="btn.url || '#'"
          class="inline-flex items-center px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-80"
          style="background: var(--theme-main); color: var(--theme-surface)"
        >
          {{ btn.label }}
        </a>
      </div>
    </div>
  </div>
</template>
