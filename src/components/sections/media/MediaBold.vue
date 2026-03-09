<script setup lang="ts">
import { computed } from 'vue'
import { sortByPosition } from '@/lib/utils/position'
import type { Section, MediaContent } from '@/types/section'

const props = defineProps<{ section: Section }>()
const items = computed(() => sortByPosition((props.section.content as MediaContent | null)?.items ?? []))
const featured = computed(() => items.value[0] ?? null)
const rest = computed(() => items.value.slice(1))
</script>

<template>
  <div class="flex flex-col gap-2 py-4">
    <!-- Featured first item full-width -->
    <div v-if="featured" class="w-full aspect-video overflow-hidden" style="background: var(--theme-surface)">
      <img v-if="featured.media_type === 'image'" :src="featured.url" class="w-full h-full object-cover" />
      <div v-else class="flex items-center justify-center h-full text-sm font-bold" style="color: var(--theme-main)">Video</div>
    </div>
    <p v-if="featured?.caption" class="px-6 text-xs font-medium" style="color: var(--theme-accent)">{{ featured.caption }}</p>

    <!-- Rest in 3-col row -->
    <div v-if="rest.length" class="px-6 grid grid-cols-3 gap-2 pt-1">
      <div v-for="item in rest" :key="item.id" class="aspect-square overflow-hidden rounded-sm" style="background: var(--theme-surface)">
        <img v-if="item.media_type === 'image'" :src="item.url" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</template>
