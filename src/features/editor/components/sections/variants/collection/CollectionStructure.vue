<script setup lang="ts">
import { computed } from 'vue'
import { sortByPosition } from '@/shared/lib/position'
import type { Section } from '@/features/sections/types'
import type { Collection } from '@/features/sections/types/collection'

const props = defineProps<{ section: Section }>()
const collections = computed<Collection[]>(() => sortByPosition((props.section.content as any)?.collections ?? []))
const variant = computed(() => props.section.style_variant)
const gridClass = computed(() => {
  if (variant.value === 'list') return 'flex flex-col divide-y'
  if (variant.value === 'cards') return 'grid grid-cols-2 gap-8'
  return 'grid grid-cols-3 gap-8'
})
</script>

<template>
  <div v-for="col in collections" :key="col.id" class="max-w-5xl mx-auto py-8 space-y-8">
    <h2 class="text-4xl font-semibold" style="color: var(--theme-main)">{{ col.title }}</h2>

    <!-- List layout -->
    <ul v-if="variant === 'list'" :class="gridClass">
      <li v-for="item in sortByPosition(col.items)" :key="item.id" class="flex gap-4 py-3">
        <div class="h-14 w-20 shrink-0 overflow-hidden" style="background: var(--theme-main); opacity: 0.15">
          <img v-if="item.media_url" :src="item.media_url" class="w-full h-full object-cover" style="opacity: 100%" />
        </div>
        <div>
          <h3 class="text-base font-medium" style="color: var(--theme-main)">{{ item.title }}</h3>
          <p v-if="item.description" class="text-xs mt-1" style="color: var(--theme-main); opacity: 0.5">{{ item.description }}</p>
        </div>
      </li>
    </ul>

    <!-- Grid / Cards layout -->
    <ul v-else :class="gridClass">
      <li
        v-for="item in sortByPosition(col.items)"
        :key="item.id"
        class="flex flex-col gap-2 pb-4"
        style="border-color: var(--theme-main)"
      >
        <div
          class="overflow-hidden rounded-xl"
          :class="variant === 'cards' ? 'aspect-video' : 'flex-1 aspect-square'"
          style="background: var(--theme-main)"
        >
          <img v-if="item.media_url" :src="item.media_url" class="w-full h-full object-cover" />
        </div>
        <div>
          <h3 class="text-2xl font-medium" style="color: var(--theme-main)">{{ item.title }}</h3>
          <p v-if="item.subtitle" class="text-sm" style="color: var(--theme-main); opacity: 0.5">{{ item.subtitle }}</p>
        </div>
      </li>
    </ul>
  </div>
  <p v-if="collections.length === 0" class="text-sm text-gray-400 px-6 py-4">No collections yet</p>
</template>
