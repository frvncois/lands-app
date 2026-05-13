<script setup lang="ts">
import { computed } from 'vue'
import type { Section } from '@/types/section'

const props = defineProps<{ section: Section }>()
const c = computed(() => props.section.type === 'content_media' ? props.section.content : null)

function getVideoEmbed(url: string): { type: 'iframe' | 'video'; src: string } | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${yt[1]}` }
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) return { type: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1&muted=1&loop=1&background=1` }
  return { type: 'video', src: url }
}

const videoEmbed = computed(() => c.value?.media_type === 'video' ? getVideoEmbed(c.value.media_url) : null)
</script>

<template>
  <div class="flex flex-col p-8 gap-8">
        <!-- Content -->
    <div class="flex flex-col gap-16">
      <div class="flex flex-col gap-8">
        <div class="space-y-2">
          <p v-if="c?.subtitle" class="text-xs font-medium uppercase tracking-widest text-gray-400">{{ c.subtitle }}</p>
          <h2 v-if="c?.title" class="text-4xl font-semibold text-gray-900">{{ c.title }}</h2>
        </div>
        <p v-if="c?.body" class="text-sm leading-relaxed max-w-[70ch]" style="color: var(--theme-main); opacity: 0.5">{{ c.body }}</p>
        <div v-if="c?.buttons?.length" class="flex flex-wrap gap-4">
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
    <!-- Media -->
    <div class="rounded-md overflow-hidden bg-gray-200 aspect-video">
      <img v-if="c?.media_type === 'image' && c.media_url" :src="c.media_url" class="w-full h-full object-cover" />
      <div v-else-if="c?.media_type === 'image'" class="w-full h-full flex items-center justify-center text-xs text-gray-400">Image</div>
      <iframe v-else-if="videoEmbed?.type === 'iframe'" :src="videoEmbed.src" class="w-full h-full pointer-events-none" frameborder="0" allow="autoplay; fullscreen" allowfullscreen />
      <video v-else-if="videoEmbed?.type === 'video'" :src="videoEmbed.src" class="w-full h-full object-cover" autoplay muted loop playsinline />
      <div v-else class="w-full h-full flex items-center justify-center text-xs text-gray-400">Media</div>
    </div>


  </div>
</template>
