<script setup lang="ts">
import { computed } from 'vue'
import type { Section } from '@/types/section'
import { useThemeStore } from '@/stores/theme'
import { getContrastColor } from '@/lib/utils/color'

const props = defineProps<{ section: Section }>()
const c = computed(() => props.section.type === 'campaign' ? props.section.content : null)
const settings = computed(() => props.section.type === 'campaign' ? props.section.settings_json : null)

const themeStore = useThemeStore()

// Returns a tinted version of the accent: light tint for dark accents, dark shade for light accents
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
    class="max-w-5xl mx-auto p-24 my-16 rounded-2xl text-center space-y-6"
    style="background-color: var(--theme-accent)" 
  >
    <div class="space-y-3">
      <h1 class="text-8xl leading-none tracking-tight" :style="{ color: textColor }">{{ c?.title }}</h1>
      <p v-if="c?.description" class="text-sm leading-relaxed max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">{{ c.description }}</p>
    </div>

    <div class="flex flex-col items-center gap-3 max-w-sm mx-auto">
      <input
        v-if="settings?.show_name_field"
        type="text"
        placeholder="Your name"
        class="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
        :style="{ borderColor: `color-mix(in srgb, ${textColor} 30%, transparent)`, color: textColor, background: 'transparent' }"
      />
      <input
        type="email"
        :placeholder="c?.placeholder || 'your@email.com'"
        class="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
        :style="{ borderColor: `color-mix(in srgb, ${textColor} 30%, transparent)`, color: textColor, background: 'transparent' }"
      />
      <button
        class="w-full px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
        :style="{ backgroundColor: textColor, color: 'var(--theme-accent)' }"
      >
        {{ c?.button_label || 'Subscribe' }}
      </button>
    </div>
  </div>
</template>
