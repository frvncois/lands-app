<script setup lang="ts">
import { computed } from 'vue'
import { sortByPosition } from '@/lib/utils/position'
import type { Section } from '@/types/section'
import type { Collection } from '@/types/collection'

const props = defineProps<{ section: Section }>()
const collections = computed<Collection[]>(() => sortByPosition((props.section.content as any)?.collections ?? []))
const variant = computed(() => props.section.style_variant)
</script>

<template>
  <div class="px-6 py-8 flex flex-col gap-10">
    <div v-for="col in collections" :key="col.id">
      <div class="mb-5 flex flex-col gap-1">
        <h3 class="text-lg font-bold" style="color: var(--theme-main)">{{ col.title }}</h3>
        <div class="w-8 h-px" style="background: var(--theme-accent)" />
        <p v-if="col.description" class="text-xs text-gray-400 mt-1">{{ col.description }}</p>
      </div>

      <!-- Grid / Cards layout -->
      <ul v-if="variant === 'grid' || variant === 'cards'" :class="variant === 'cards' ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-3 gap-6'">
        <li v-for="item in sortByPosition(col.items)" :key="item.id" class="flex flex-col gap-2">
          <div class="aspect-video overflow-hidden rounded-sm bg-gray-200">
            <img v-if="item.media_url" :src="item.media_url" class="w-full h-full object-cover" />
          </div>
          <div>
            <p class="text-sm font-medium" style="color: var(--theme-main)">{{ item.title }}</p>
            <p v-if="item.description" class="text-xs text-gray-400 mt-0.5 line-clamp-2">{{ item.description }}</p>
          </div>
        </li>
      </ul>

      <!-- List layout (default for editorial) -->
      <div v-else class="flex flex-col divide-y divide-gray-100">
        <div
          v-for="item in sortByPosition(col.items)"
          :key="item.id"
          class="flex gap-4 py-4"
        >
          <img v-if="item.media_url" :src="item.media_url" class="h-16 w-24 object-cover rounded-sm shrink-0" />
          <div class="flex-1 min-w-0 flex flex-col justify-center gap-1">
            <p class="text-sm font-medium" style="color: var(--theme-main)">{{ item.title }}</p>
            <p v-if="item.description" class="text-xs text-gray-400 line-clamp-2">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
    <p v-if="collections.length === 0" class="text-sm text-gray-400">No collections yet</p>
  </div>
</template>
