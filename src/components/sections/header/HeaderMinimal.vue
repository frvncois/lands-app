<script setup lang="ts">
import { computed } from 'vue'
import type { Section, HeaderContent, HeaderSettings } from '@/types/section'
import { useLandStore } from '@/stores/land'

const props = defineProps<{ section: Section }>()
const content = computed(() => props.section.content as HeaderContent | null)
const settings = computed(() => props.section.settings_json as HeaderSettings)
const landStore = useLandStore()
const projectTitle = computed(() => landStore.activeLand?.title)

const coverVideo = computed(() => {
  const url = settings.value.cover_media_value
  if (!url || settings.value.cover_media_type !== 'video') return null

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) {
    const id = ytMatch[1]
    return { type: 'iframe', src: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0` }
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1&background=1` }
  }

  // Direct file
  return { type: 'video', src: url }
})
</script>

<template>
  <div class="flex flex-col p-8 gap-8">
    <div class="flex flex-col justify-between h-[40em]">
      <div class="flex justify-between">
        <div>
          <img v-if="content?.logo" :src="content.logo" class="h-8 w-auto object-contain object-left" />
          <span v-else-if="projectTitle" class="text-sm font-semibold uppercase tracking-widest" style="color: var(--theme-main); opacity: 0.6">{{ projectTitle }}</span>
        </div>
        <div>
          <div v-if="content?.buttons?.length" class="flex items-center gap-4">
            <a
              v-for="btn in content.buttons"
              :key="btn.id"
              :href="btn.url || '#'"
              class="text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-60"
              style="color: var(--theme-main)"
            >{{ btn.label }}</a>
          </div>
        </div>
      </div>
      <div class="space-y-6">
        <h1 class="text-8xl font-semibold max-w-[15ch] leading-22" style="color: var(--theme-main)">{{ content?.title }}</h1>
        <p class="max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">{{ content?.description }}</p>
      </div>
    </div>
    <div class="relative h-[40em] overflow-hidden rounded-md" style="background: var(--theme-accent)">
      <img v-if="settings.cover_media_value && settings.cover_media_type !== 'video'" :src="settings.cover_media_value" class="absolute inset-0 w-full h-full object-cover" />
      <template v-else-if="coverVideo">
        <iframe v-if="coverVideo.type === 'iframe'" :src="coverVideo.src" class="absolute inset-0 w-full h-full" style="transform: scale(1.5)" frameborder="0" allow="autoplay; fullscreen" allowfullscreen />
        <video v-else :src="coverVideo.src" class="absolute inset-0 w-full h-full object-cover" autoplay muted loop playsinline />
      </template>
    </div>
  </div>
</template>
