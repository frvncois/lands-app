<script setup lang="ts">
import { computed } from 'vue'
import { useLandStore } from '@/stores/land'
import { useThemeStore } from '@/stores/theme'
import { getContrastColor } from '@/lib/utils/color'
import type { Section } from '@/types/section'

const props = defineProps<{ section: Section }>()
const c = computed(() => props.section.type === 'footer' ? props.section.content : null)
const s = computed(() => props.section.type === 'footer' ? props.section.settings_json : null)

const landStore = useLandStore()
const themeStore = useThemeStore()
const projectName = computed(() => landStore.activeLand?.title ?? '')

const textColor = computed(() => {
  const accent = themeStore.theme?.color_accent
  if (!accent) return 'color-mix(in srgb, var(--theme-accent) 15%, white)'
  const isLight = getContrastColor(accent) === 'black'
  return isLight
    ? 'color-mix(in srgb, var(--theme-accent) 50%, black)'
    : 'color-mix(in srgb, var(--theme-accent) 15%, white)'
})
</script>

<template>
  <div
    class="mx-auto mt-16 overflow-hidden relative"
    style="background-color: var(--theme-accent); min-height: 280px"
  >
    <!-- Optional cover image -->
    <img
      v-if="s?.cover_media_value"
      :src="s.cover_media_value"
      class="absolute inset-0 w-full h-full object-cover opacity-20"
    />

    <!-- Content -->
    <div class="relative flex flex-col justify-between h-full p-14" style="min-height: 280px">

      <!-- Top: name / logo -->
      <p class="text-xs uppercase tracking-widest font-medium opacity-60" :style="{ color: textColor }">
        {{ projectName }}
      </p>

      <!-- Bottom row: title+subtitle left, links right -->
      <div class="flex items-end justify-between gap-8 mt-auto pt-12">
        <div class="flex flex-col gap-1">
          <h2 class="text-4xl font-bold leading-tight" :style="{ color: textColor }">
            {{ c?.title || '[ Footer title ]' }}
          </h2>
          <p v-if="c?.subtitle" class="text-sm opacity-60" :style="{ color: textColor }">
            {{ c.subtitle }}
          </p>
        </div>

        <!-- Links -->
        <div v-if="c?.buttons?.length" class="flex flex-wrap gap-x-6 gap-y-2 justify-end shrink-0">
          <a
            v-for="btn in c.buttons"
            :key="btn.id"
            :href="btn.url || '#'"
            class="text-sm font-medium transition-opacity hover:opacity-60"
            :style="{ color: textColor }"
          >
            {{ btn.label }}
          </a>
        </div>
      </div>

    </div>
  </div>

  <!-- Legal bar -->
  <div
    class="mx-auto flex items-center justify-between px-10 py-4 gap-4"
    style="background-color: color-mix(in srgb, var(--theme-accent) 85%, black)"
  >
    <div class="flex items-center gap-6">
      <a href="#" class="text-xs transition-opacity hover:opacity-80" :style="{ color: textColor, opacity: '0.5' }">Privacy Policy</a>
      <a href="#" class="text-xs transition-opacity hover:opacity-80" :style="{ color: textColor, opacity: '0.5' }">Terms & Conditions</a>
    </div>
    <a
      href="https://lands.app"
      target="_blank"
      class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-opacity hover:opacity-80"
      :style="{ backgroundColor: `color-mix(in srgb, ${textColor} 10%, transparent)` }"
    >
      <span class="text-[10px] uppercase tracking-widest" :style="{ color: textColor, opacity: '0.5' }">Made with</span>
      <span class="text-[10px] font-bold uppercase tracking-widest" :style="{ color: textColor }">Lands</span>
    </a>
  </div>
</template>
